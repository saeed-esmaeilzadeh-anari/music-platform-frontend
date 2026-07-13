"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { getAccessToken } from "@/lib/api/http-client";
import { ROUTES } from "@/lib/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Client-side auth guard.
 *
 * Renders nothing until we know auth state, then either renders children
 * (authenticated) or redirects to /login (not authenticated).
 *
 * Works alongside the http-client's 401 interceptor:
 * - http-client handles expired access tokens → silently refreshes or redirects
 * - ProtectedRoute handles the case where a user navigates directly to a
 *   protected URL with no token at all (fresh session, cleared storage, etc.)
 *
 * Placement: wrap the (app) layout so every app route inherits protection
 * without each page needing to re-implement the check.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Check both Zustand state (hydrated from persist) AND the raw token.
  // This covers the edge case where the store says authenticated but
  // localStorage was cleared in another tab.
  const hasToken = typeof window !== "undefined" && !!getAccessToken();
  const isAuthed = isAuthenticated || hasToken;

  useEffect(() => {
    if (!isAuthed) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthed, router]);

  if (!isAuthed) {
    // Return null while redirecting — avoids a flash of protected content.
    return null;
  }

  return <>{children}</>;
}
