import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "light" | "outline-light" | "text" | "fig";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full label-caps transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-soft)] disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-olive text-cream hover:bg-olive-deep shadow-[0_10px_24px_-16px_rgb(36_35_31/0.8)]",
  secondary: "border border-olive/70 text-olive hover:bg-olive hover:text-cream",
  light: "bg-cream text-olive hover:bg-paper",
  "outline-light": "border border-cream/60 text-cream hover:bg-cream hover:text-olive",
  fig: "bg-fig text-cream hover:bg-fig-soft",
  text: "text-olive underline decoration-olive/40 underline-offset-[6px] hover:decoration-olive rounded-none px-0",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-[0.68rem]",
  md: "min-h-12 px-6",
  lg: "min-h-14 px-8",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function buttonClasses({ variant = "primary", size = "md", className }: Omit<CommonProps, "children">) {
  return cn(base, variants[variant], variant !== "text" && sizes[size], className);
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
