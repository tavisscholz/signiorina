import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

/**
 * Form primitives with visible labels, hints and error text wired to inputs via
 * aria-describedby. Errors use Fig Skin + an icon-free text prefix (never color alone).
 */

const control =
  "w-full rounded-xl border bg-paper px-4 py-3 text-[1rem] text-espresso placeholder:text-muted/70 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fig";

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

interface FieldShellProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, hint, error, required, optional, className, children }: FieldShellProps) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.95rem] font-medium text-espresso">
        {label}
        {required ? <span className="text-fig" aria-hidden="true"> *</span> : null}
        {optional ? <span className="ml-1.5 text-[0.82rem] font-normal text-muted">(optional)</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-[0.85rem] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-[0.88rem] font-medium leading-snug text-fig" role="alert">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
};

export function TextField({ id, label, hint, error, optional, required, wrapperClassName, className, ...rest }: InputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={clsx(control, error ? "border-fig" : "border-line-strong", className)}
        {...rest}
      />
    </FieldShell>
  );
}

type TextAreaProps = Omit<ComponentProps<"textarea">, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
};

export function TextAreaField({ id, label, hint, error, optional, required, wrapperClassName, className, ...rest }: TextAreaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={clsx(control, "min-h-28 resize-y", error ? "border-fig" : "border-line-strong", className)}
        {...rest}
      />
    </FieldShell>
  );
}

type SelectProps = Omit<ComponentProps<"select">, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
  children: ReactNode;
};

export function SelectField({ id, label, hint, error, optional, required, wrapperClassName, className, children, ...rest }: SelectProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={clsx(control, "appearance-none pr-11", error ? "border-fig" : "border-line-strong", className)}
          {...rest}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-olive"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </FieldShell>
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "id" | "type"> & {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function Checkbox({ id, label, description, className, ...rest }: CheckboxProps) {
  return (
    <div className={clsx("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-1 size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-line-strong bg-paper transition-colors checked:border-olive checked:bg-olive checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23f2e8d5%22%20stroke-width=%222.4%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><path%20d=%22m5%2012.5%204.2%204.2L19%207%22/></svg>')] checked:bg-center checked:bg-no-repeat"
        {...rest}
      />
      <label htmlFor={id} className="cursor-pointer text-[0.97rem] leading-snug">
        <span className="font-medium">{label}</span>
        {description ? (
          <span id={`${id}-desc`} className="mt-0.5 block text-[0.86rem] text-muted">
            {description}
          </span>
        ) : null}
      </label>
    </div>
  );
}

export function Fieldset({ legend, hint, children, className }: { legend: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <fieldset className={clsx("min-w-0", className)}>
      <legend className="mb-1 text-[0.95rem] font-medium text-espresso">{legend}</legend>
      {hint ? <p className="mb-3 text-[0.85rem] text-muted">{hint}</p> : null}
      {children}
    </fieldset>
  );
}
