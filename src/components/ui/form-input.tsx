"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, description, required, className, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>

        <Input
          ref={ref}
          id={id}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />

        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
