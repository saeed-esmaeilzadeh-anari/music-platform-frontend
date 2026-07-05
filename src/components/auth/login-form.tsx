"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormValues } from "@/lib/validators";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { FormInput } from "@/components/ui/form-input";
import { PasswordInput } from "@/components/ui/password-input";

import { useLogin } from "@/hooks/use-auth";

export function LoginForm() {
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Email */}

        {/* Password */}

        {/* Button */}
      </form>
    </Form>
  );
}
