'use client';

import { useState, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import Link from 'next/link';

import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { FormField, FormInput, FormError } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

// ─── Sent confirmation state ──────────────────────────────────────────────────

function SentState({ email }: { email: string }) {
  return (
    <div className="space-y-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <MailCheck className="h-7 w-7 text-primary" aria-hidden />
        </span>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If{' '}
          <span className="font-medium text-foreground">{email}</span>{' '}
          is linked to a Soundwave account, you&apos;ll receive a password reset link within a few minutes.
        </p>
      </div>

      {/* Hints */}
      <div className="rounded-md border border-border bg-secondary/50 px-4 py-3 text-left space-y-1.5">
        <p className="text-xs font-medium text-foreground">Didn&apos;t receive it?</p>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
          <li>Check your spam or junk folder</li>
          <li>Make sure the email address is correct</li>
          <li>Wait a few minutes and try again</li>
        </ul>
      </div>

      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to sign in
      </Link>
    </div>
  );
}

// ─── ForgotPasswordForm ───────────────────────────────────────────────────────

export function ForgotPasswordForm() {
  const emailId = useId();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    /**
     * The backend (NestJS AuthController) does not expose
     * POST /auth/forgot-password. When that endpoint exists, replace this
     * sleep with:
     *   await authService.forgotPassword({ email: values.email.trim().toLowerCase() })
     *
     * We always show the success state regardless of whether the email
     * exists — this prevents user enumeration attacks.
     */
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    setSentTo(values.email.trim().toLowerCase());
  };

  if (sentTo) {
    return <SentState email={sentTo} />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-label="Reset password form"
    >
      {/* Email */}
      <FormField label="Email address" error={errors.email?.message} required id={emailId}>
        <FormInput
          id={emailId}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          error={!!errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register('email')}
        />
        <FormError message={errors.email?.message} />
      </FormField>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="xl"
        className="w-full"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Send reset link
      </Button>

      {/* Back link */}
      <div className="text-center">
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}