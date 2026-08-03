"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils/index";

// ---------------- Form Provider ----------------

export function Form<T extends FieldValues>({
  ...props
}: React.ComponentProps<typeof FormProvider<T>>) {
  return <FormProvider {...props} />;
}

// ---------------- FormField ----------------

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

// ---------------- useFormField ----------------

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField must be used within FormField");
  }

  return {
    name: fieldContext.name,
    ...itemContext,
    ...fieldState,
  };
}

// ---------------- FormItem ----------------

const FormItemContext = React.createContext({});

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <FormItemContext.Provider value={{}}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

// ---------------- Label ----------------

export function FormLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { error, name } = useFormField();

  return (
    <label
      htmlFor={name}
      className={cn(error && "text-red-500", className)}
      {...props}
    />
  );
}

// ---------------- Control ----------------

export function FormControl({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

// ---------------- Message ----------------

export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useFormField();

  if (!error && !children) return null;

  return (
    <p className={cn("text-sm text-red-500", className)} {...props}>
      {children || error?.message}
    </p>
  );
}
