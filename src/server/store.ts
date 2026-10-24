import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import type { Booking, CorporateAccount, EventInquiry, Order } from "@/lib/types";

/**
 * Persistence adapter. This JSON-file implementation is for local development and
 * single-instance hosting. Swap `fileStore` for a database-backed implementation
 * (Postgres, etc.) with the same interface before running on serverless/multi-instance
 * hosting — bookings must be shared for capacity checks to hold.
 */
export interface DataStore {
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  saveOrder(order: Order): Promise<void>;
  updateOrder(id: string, patch: (order: Order) => Order): Promise<Order | undefined>;
  findOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  addInquiry(inquiry: EventInquiry): Promise<void>;
  listCorporateAccounts(): Promise<CorporateAccount[]>;
  /** Runs `fn` with exclusive access, so check-then-book can't interleave. */
  exclusive<T>(fn: () => Promise<T>): Promise<T>;
}

interface Snapshot {
  orders: Order[];
  inquiries: EventInquiry[];
  corporateAccounts: CorporateAccount[];
}

const EMPTY: Snapshot = { orders: [], inquiries: [], corporateAccounts: [] };

function dataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  // Read-only deploys (e.g. serverless) can only write to the OS temp dir.
  return process.env.VERCEL ? path.join(tmpdir(), "signiorina-data") : path.join(process.cwd(), ".data");
}

function createFileStore(): DataStore {
  const file = () => path.join(dataDir(), "store.json");
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<Snapshot> {
    try {
      const raw = await readFile(file(), "utf8");
      return { ...EMPTY, ...(JSON.parse(raw) as Snapshot) };
    } catch {
      return structuredClone(EMPTY);
    }
  }

  async function save(snapshot: Snapshot): Promise<void> {
    await mkdir(dataDir(), { recursive: true });
    const tmp = `${file()}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(snapshot, null, 2), "utf8");
    await rename(tmp, file());
  }

  function exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
  }

  // Re-entrant: calls made inside an exclusive block reuse the held lock.
  const lockContext = new AsyncLocalStorage<boolean>();
  const locked = <T>(fn: () => Promise<T>): Promise<T> =>
    lockContext.getStore() ? fn() : exclusive(() => lockContext.run(true, fn));

  return {
    listOrders: async () => (await load()).orders,
    getOrder: async (id) => (await load()).orders.find((o) => o.id === id),
    findOrderByPaymentIntent: async (pi) => (await load()).orders.find((o) => o.stripePaymentIntentId === pi),
    saveOrder: (order) =>
      locked(async () => {
        const s = await load();
        const i = s.orders.findIndex((o) => o.id === order.id);
        if (i >= 0) s.orders[i] = order;
        else s.orders.push(order);
        await save(s);
      }),
    updateOrder: (id, patch) =>
      locked(async () => {
        const s = await load();
        const i = s.orders.findIndex((o) => o.id === id);
        if (i < 0) return undefined;
        s.orders[i] = patch(s.orders[i]);
        await save(s);
        return s.orders[i];
      }),
    addInquiry: (inquiry) =>
      locked(async () => {
        const s = await load();
        s.inquiries.push(inquiry);
        await save(s);
      }),
    listCorporateAccounts: async () => (await load()).corporateAccounts,
    exclusive: (fn) => locked(fn),
  };
}

const globalStore = globalThis as unknown as { __signiorinaStore?: DataStore };
export const store: DataStore = globalStore.__signiorinaStore ?? (globalStore.__signiorinaStore = createFileStore());

/** Orders that currently hold delivery capacity. */
export function bookingsFrom(orders: Order[], now: Date, excludeOrderId?: string): Booking[] {
  return orders
    .filter((o) => o.id !== excludeOrderId)
    .filter(
      (o) =>
        o.status === "confirmed" ||
        o.status === "needs_attention" ||
        (o.status === "pending_payment" && o.holdExpiresAt !== undefined && new Date(o.holdExpiresAt) > now),
    )
    .map((o) => ({
      orderId: o.id,
      date: o.delivery.date,
      windowId: o.delivery.windowId,
      zoneId: o.delivery.zoneId,
      points: o.capacityPoints,
      corporate: o.corporate,
      productQuantities: o.items.reduce<Record<string, number>>((acc, item) => {
        acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
        return acc;
      }, {}),
    }));
}
