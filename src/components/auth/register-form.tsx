"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, UserCircle } from "lucide-react";

import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import { useRegister } from "@/hooks/use-auth";
import { extractApiError } from "@/lib/utils/index";

import { FormField, FormInput, FormError } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { ApiErrorAlert } from "@/components/ui/api-error-alert";
import { Divider } from "@/components/ui/divider";
import { useLocale } from '@/providers/locale-provider';

export function RegisterForm() {
  const { t } = useLocale();
  const emailId = useId();
  const usernameId = useId();
  const firstNameId = useId();
  const lastNameId = useId();
  const passwordId = useId();
  const confirmId = useId();

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
    mode: "onBlur",
  });

  const apiError = registerMutation.error
    ? extractApiError(registerMutation.error)
    : null;

  const onSubmit = async (values: RegisterFormValues) => {
    const { confirmPassword, ...dto } = values;
    await registerMutation.mutateAsync({
      ...dto,
      email: dto.email.trim().toLowerCase(),
      username: dto.username.trim(),
      firstName: dto.firstName?.trim() || undefined,
      lastName: dto.lastName?.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
      aria-label="Create account form"
    >
      {/* API error */}
      {apiError && <ApiErrorAlert message={apiError} />}

      {/* Email */}
      <FormField
        label={t("forms.email")}
        error={errors.email?.message}
        required
        id={emailId}
      >
        <FormInput
          id={emailId}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          error={!!errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register("email")}
        />
        <FormError message={errors.email?.message} />
      </FormField>

      {/* Username */}
      <FormField
        label={t("forms.username")}
        error={errors.username?.message}
        required
        id={usernameId}
      >
        <FormInput
          id={usernameId}
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="janedoe"
          error={!!errors.username}
          leftIcon={<User className="h-4 w-4" />}
          {...register("username")}
        />
        <FormError message={errors.username?.message} />
      </FormField>

      {/* First + Last name — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label={t("forms.firstName")}
          error={errors.firstName?.message}
          id={firstNameId}
        >
          <FormInput
            id={firstNameId}
            type="text"
            autoComplete="given-name"
            placeholder={t("forms.firstNamePlaceholder")}
            error={!!errors.firstName}
            leftIcon={<UserCircle className="h-4 w-4" />}
            {...register("firstName")}
          />
          <FormError message={errors.firstName?.message} />
        </FormField>

        <FormField
          label={t("forms.lastName")}
          error={errors.lastName?.message}
          id={lastNameId}
        >
          <FormInput
            id={lastNameId}
            type="text"
            autoComplete="family-name"
            placeholder={t("forms.lastNamePlaceholder")}
            error={!!errors.lastName}
            {...register("lastName")}
          />
          <FormError message={errors.lastName?.message} />
        </FormField>
      </div>

      <Divider />

      {/* Password */}
      <FormField
        label={t("forms.password")}
        error={errors.password?.message}
        required
        id={passwordId}
      >
        <PasswordInput
          id={passwordId}
          autoComplete="new-password"
          placeholder={t("forms.passwordHint")}
          error={errors.password?.message}
          {...register("password")}
        />
        <FormError message={errors.password?.message} />
      </FormField>

      {/* Confirm password */}
      <FormField
        label={t("forms.confirmPassword")}
        error={errors.confirmPassword?.message}
        required
        id={confirmId}
      >
        <PasswordInput
          id={confirmId}
          autoComplete="new-password"
          placeholder={t("forms.confirmPasswordHint")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <FormError message={errors.confirmPassword?.message} />
      </FormField>

      {/* Password strength hints */}
      <PasswordStrengthHints password={watch("password")} />

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="xl"
        className="w-full mt-2"
        loading={isSubmitting || registerMutation.isPending}
        disabled={isSubmitting || registerMutation.isPending}
      >
        {t("forms.signUp")}
      </Button>

      <p className="text-center text-xs text-muted-foreground/60 leading-relaxed">
        {t("forms.terms")}
      </p>
    </form>
  );
}

// ─── Password strength indicator ─────────────────────────────────────────────

interface StrengthHintsProps {
  password: string;
}

function PasswordStrengthHints({ password }: StrengthHintsProps) {
  if (!password) return null;

  const checks = [
    { label: t("forms.atLeast8"), ok: password.length >= 8 },
    { label: t("forms.uppercase"), ok: /[A-Z]/.test(password) },
    { label: t("forms.lowercase"), ok: /[a-z]/.test(password) },
    { label: t("forms.number"), ok: /\d/.test(password) },
  ];

  const passCount = checks.filter((c) => c.ok).length;

  const barColor =
    passCount <= 1
      ? "bg-destructive"
      : passCount <= 2
      ? "bg-amber-500"
      : passCount <= 3
      ? "bg-yellow-400"
      : "bg-emerald-500";

  return (
    <div
      className="space-y-2.5"
      aria-live="polite"
      aria-label={t("forms.passwordStrength")}
    >
      {/* Segmented bar */}
      <div className="flex gap-1" aria-hidden>
        {checks.map((_, i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < passCount ? barColor : "bg-border",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Check list */}
      <ul className="space-y-1">
        {checks.map(({ label, ok }) => (
          <li
            key={label}
            className={[
              "flex items-center gap-2 text-xs transition-colors duration-200",
              ok ? "text-emerald-500" : "text-muted-foreground/60",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                ok
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-border text-muted-foreground/40",
              ].join(" ")}
              aria-hidden
            >
              {ok ? "✓" : "·"}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
