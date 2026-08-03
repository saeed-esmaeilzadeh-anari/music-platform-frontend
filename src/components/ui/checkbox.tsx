"use client";

import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/index";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "group inline-flex cursor-pointer items-center gap-2.5",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          {/* Custom visual checkbox */}
          <span
            className={cn(
              "h-4 w-4 rounded-sm border border-border bg-input",
              "transition-colors duration-150",
              "peer-checked:border-primary peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-background"
            )}
          />
          <Check
            className="pointer-events-none absolute h-2.5 w-2.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity"
            aria-hidden
          />
        </span>
        {label && (
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
