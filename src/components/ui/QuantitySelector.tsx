"use client";

import clsx from "clsx";
import { useId } from "react";

import { IconMinus, IconPlus } from "@/components/ui/Icons";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Visible or screen-reader label, e.g. "Boxes" or "Guests". */
  label: string;
  showLabel?: boolean;
  size?: "md" | "lg";
  className?: string;
  /** Describes the item for assistive tech, e.g. "Box for Two". */
  itemName?: string;
}

/** Accessible stepper: native number input flanked by labelled buttons. */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  label,
  showLabel = false,
  size = "md",
  className,
  itemName,
}: Props) {
  const id = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? Math.round(n) : min));
  const btn =
    "grid place-items-center text-olive transition-colors hover:bg-olive hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-olive";
  const h = size === "lg" ? "h-14" : "h-11";
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={clsx("label-caps text-muted", !showLabel && "sr-only")}>
        {label}
        {itemName ? <span className="sr-only"> for {itemName}</span> : null}
      </label>
      <div className={clsx("inline-flex items-stretch overflow-hidden rounded-full border border-line-strong bg-paper", h)}>
        <button
          type="button"
          className={clsx(btn, size === "lg" ? "w-14" : "w-11")}
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}${itemName ? ` for ${itemName}` : ""}`}
        >
          <IconMinus size={16} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-14 border-x border-line bg-transparent text-center tabular text-[1.05rem] [appearance:textfield] focus:outline-none focus-visible:bg-cream [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          className={clsx(btn, size === "lg" ? "w-14" : "w-11")}
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}${itemName ? ` for ${itemName}` : ""}`}
        >
          <IconPlus size={16} />
        </button>
      </div>
    </div>
  );
}
