'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { getAccessToken } from '@/lib/api/http-client';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const ALLOWED_ROLES = new Set(['ADMIN', 'MODERATOR']);

/**
 * Gate for everything under /admin/**.
 * - No access token at all → redirect straight to /login.
 * - Token present but the hydrated user's role isn't ADMIN/MODERATOR →
 *   show a "not authorised" screen instead of the panel.
 * - While the user is still hydrating (AuthProvider's /users/me request
 *   hasn't resolved yet) we show a lightweight loading state rather than
 *   flashing a false "forbidden" screen.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    setHasToken(true);
  }, [router]);

  // Still checking for a token on mount
  if (hasToken === null) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background" dir="rtl">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          در حال بررسی دسترسی…
        </div>
      </div>
    );
  }

  // Token exists but the user profile hasn't hydrated into the store yet
  // (AuthProvider's /users/me request is still in flight) — keep showing a
  // neutral loading state rather than judging the (still-unknown) role.
  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background" dir="rtl">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          در حال بارگذاری اطلاعات کاربر…
        </div>
      </div>
    );
  }

  const role = user?.role;
  if (!role || !ALLOWED_ROLES.has(role)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center" dir="rtl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-foreground">دسترسی غیرمجاز</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            حساب کاربری شما اجازهٔ دسترسی به پنل مدیریت را ندارد. این بخش تنها برای مدیران و ناظران در دسترس است.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push(ROUTES.BROWSE)}>
          بازگشت به سایت
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
