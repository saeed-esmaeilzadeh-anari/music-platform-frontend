'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import Link from 'next/link';

import { loginSchema, type LoginFormValues } from '@/lib/validators';
import { useLogin } from '@/hooks/use-auth';
import { extractApiError } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

import { FormField, FormInput, FormError } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ApiErrorAlert } from '@/components/ui/api-error-alert';

export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const rememberMeId = useId();

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',          // validate on blur, not on every keystroke
  });

  // Surface the API-level error (wrong credentials, suspended account, etc.)
  const apiError = loginMutation.error ? extractApiError(loginMutation.error) : null;

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-label="Sign in form"
    >
      {/* API-level error — shown above the fields */}
      {apiError && (
        <ApiErrorAlert message={apiError} />
      )}

      {/* Email */}
      <FormField
        label="Email"
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
          {...register('email')}
        />
        <FormError message={errors.email?.message} />
      </FormField>

      {/* Password */}
      <FormField
        label="Password"
        error={errors.password?.message}
        required
        id={passwordId}
      >
        <PasswordInput
          id={passwordId}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormError message={errors.password?.message} />
      </FormField>

      {/* Remember me + Forgot password row */}
      <div className="flex items-center justify-between">
        <Checkbox
          id={rememberMeId}
          label="Remember me"
          defaultChecked
        />
        <Link
          href="/forgot-password"
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="xl"
        className="w-full"
        loading={isSubmitting || loginMutation.isPending}
        disabled={isSubmitting || loginMutation.isPending}
      >
        Sign in
      </Button>

      {/* Demo credentials hint — useful during development */}
      {process.env.NODE_ENV === 'development' && (
        <p className="text-center text-xs text-muted-foreground/50">
          Dev: artist@musicstream.dev / Artist@12345
        </p>
      )}
    </form>
  );
}
