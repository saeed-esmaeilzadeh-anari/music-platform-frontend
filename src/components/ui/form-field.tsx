"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/index";

// ─── Label ────────────────────────────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-destructive" aria-hidden>
          *
        </span>
      )}
    </label>
  )
);
FormLabel.displayName = "FormLabel";

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, error, leftIcon, rightElement, type = "text", ...props },
    ref
  ) => (
    <div className="relative">
      {leftIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          // Base
          "w-full rounded-md border bg-input px-3.5 py-2.5 text-sm text-foreground",
          "placeholder:text-muted-foreground/60",
          // Transition
          "transition-colors duration-150",
          // Focus
          "outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
          // Normal border
          "border-border",
          // Error state
          error && "border-destructive focus:ring-destructive",
          // Icon padding
          leftIcon && "pl-10",
          rightElement && "pr-10",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
          {rightElement}
        </div>
      )}
    </div>
  )
);
FormInput.displayName = "FormInput";

// ─── Error message ────────────────────────────────────────────────────────────

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn(
        "mt-1.5 flex items-center gap-1.5 text-xs text-destructive",
        className
      )}
    >
      <span aria-hidden className="shrink-0 text-[10px]">
        ●
      </span>
      {message}
    </p>
  );
}

// ─── Field (label + input + error composed together) ─────────────────────────

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  // Forwarded to label htmlFor — auto-generated if omitted
  id?: string;
}

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
  id,
}: FormFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={cn("space-y-0", className)}>
      <FormLabel htmlFor={fieldId} required={required}>
        {label}
      </FormLabel>
      {/* Clone the child to inject id + aria-describedby */}
      <div>{children}</div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
      <FormError message={error} />
    </div>
  );
}
