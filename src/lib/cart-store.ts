"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartAddOn, CartLine, CheckoutDetails, DeliverySelection, DietaryId } from "@/lib/types";

/**
 * Guest cart, persisted in localStorage so it survives navigation and refresh.
 * Checkout contact details live in a separate sessionStorage store so personal
 * information doesn't linger on shared devices.
 */

export type NewLine = Omit<CartLine, "lineId">;

interface CartState {
  lines: CartLine[];
  delivery: DeliverySelection;
  drawerOpen: boolean;
  lastAdded?: { lineId: string; at: number };
  /** Line just added — shown as a confirmation when the drawer opens after adding. */
  justAdded?: string;
  addLine: (line: NewLine) => string;
  updateLine: (lineId: string, patch: Partial<NewLine>) => void;
  removeLine: (lineId: string) => void;
  setDelivery: (patch: Partial<DeliverySelection>) => void;
  resetSchedule: () => void;
  clear: () => void;
  /** Opens the drawer after an add (keeps the "added" confirmation). */
  openDrawer: () => void;
  /** Opens the drawer from the cart button (no confirmation line). */
  openCart: () => void;
  closeDrawer: () => void;
}

function sameConfig(a: NewLine, b: NewLine): boolean {
  const key = (l: NewLine) =>
    JSON.stringify({
      p: l.productId,
      v: l.variantId ?? null,
      d: [...l.dietary].sort(),
      a: [...l.addOns].sort((x, y) => x.addOnId.localeCompare(y.addOnId)),
      t: l.personalization?.trim() ?? "",
    });
  return key(a) === key(b);
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `l-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      delivery: {},
      drawerOpen: false,
      addLine: (line) => {
        const existing = get().lines.find((l) => sameConfig(l, line) && line.addOns.length === 0);
        if (existing) {
          set((s) => ({
            lines: s.lines.map((l) => (l.lineId === existing.lineId ? { ...l, quantity: l.quantity + line.quantity } : l)),
            lastAdded: { lineId: existing.lineId, at: Date.now() },
            justAdded: existing.lineId,
          }));
          return existing.lineId;
        }
        const lineId = newId();
        set((s) => ({ lines: [...s.lines, { ...line, lineId }], lastAdded: { lineId, at: Date.now() }, justAdded: lineId }));
        return lineId;
      },
      updateLine: (lineId, patch) =>
        set((s) => ({ lines: s.lines.map((l) => (l.lineId === lineId ? { ...l, ...patch } : l)) })),
      removeLine: (lineId) => set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),
      setDelivery: (patch) => set((s) => ({ delivery: { ...s.delivery, ...patch } })),
      resetSchedule: () => set((s) => ({ delivery: { ...s.delivery, date: undefined, windowId: undefined } })),
      clear: () => set({ lines: [], delivery: {}, lastAdded: undefined }),
      openDrawer: () => set({ drawerOpen: true }),
      openCart: () => set({ drawerOpen: true, justAdded: undefined }),
      closeDrawer: () => set({ drawerOpen: false, justAdded: undefined }),
    }),
    {
      name: "signiorina-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, delivery: s.delivery }),
      skipHydration: true,
    },
  ),
);

export const emptyDetails: CheckoutDetails = {
  customer: { firstName: "", lastName: "", email: "", phone: "", company: "" },
  recipientDifferent: false,
  recipient: { name: "", phone: "" },
  isGift: false,
  giftMessage: "",
  deliveryNotes: "",
};

interface DetailsState {
  details: CheckoutDetails;
  severeAllergy: boolean;
  setDetails: (patch: Partial<CheckoutDetails>) => void;
  setCustomer: (patch: Partial<CheckoutDetails["customer"]>) => void;
  setSevereAllergy: (value: boolean) => void;
  reset: () => void;
}

export const useCheckoutDetails = create<DetailsState>()(
  persist(
    (set) => ({
      details: emptyDetails,
      severeAllergy: false,
      setDetails: (patch) => set((s) => ({ details: { ...s.details, ...patch } })),
      setCustomer: (patch) => set((s) => ({ details: { ...s.details, customer: { ...s.details.customer, ...patch } } })),
      setSevereAllergy: (value) => set({ severeAllergy: value }),
      reset: () => set({ details: emptyDetails, severeAllergy: false }),
    }),
    {
      name: "signiorina-checkout",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);

export function toggleDietary(list: DietaryId[], id: DietaryId): DietaryId[] {
  return list.includes(id) ? list.filter((d) => d !== id) : [...list, id];
}

export function setAddOnQuantity(list: CartAddOn[], addOnId: string, quantity: number): CartAddOn[] {
  const rest = list.filter((a) => a.addOnId !== addOnId);
  return quantity > 0 ? [...rest, { addOnId, quantity }] : rest;
}
