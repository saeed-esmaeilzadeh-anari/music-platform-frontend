"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { getRefreshToken, clearTokens } from "@/lib/api/http-client";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants";

/**
 * LogoutScreen
 *
 * Navigating to /logout:
 * 1. Fires POST /auth/logout with the current refresh token
 *    (revokes THIS device's token on the server)
 * 2. If ?all=true is present → fires POST /auth/logout-all instead
 *    (revokes ALL sessions on the server)
 * 3. Clears tokens from localStorage
 * 4. Clears Zustand auth state
 * 5. Clears TanStack Query cache
 * 6. Redirects to /login
 *
 * This is intentionally a separate page (not just a button handler) so
 * logout can be triggered from links (email "sign out" links, shared
 * devices warning pages, etc.) without needing JS mutation hooks.
 */
export function LogoutScreen() {
  const searchParams = useSearchParams();
  const logoutAll = searchParams.get("all") === "true";
  const { logout } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();
  const didRun = useRef(false);

  useEffect(() => {
    // Guard against double-fire in React Strict Mode
    if (didRun.current) return;
    didRun.current = true;

    async function runLogout() {
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          if (logoutAll) {
            // POST /auth/logout-all — revoke every session for this user
            await authService.logoutAll();
          } else {
            // POST /auth/logout { refreshToken } — revoke this device only
            await authService.logout({ refreshToken });
          }
        }
      } catch {
        // Network failure or token already expired — still clear local state.
        // Never block the user from logging out because of a server error.
      } finally {
        clearTokens(); // localStorage: ms_access_token, ms_refresh_token
        logout(); // Zustand: user → null, isAuthenticated → false
        qc.clear(); // TanStack Query: evict all cached data
        router.replace(ROUTES.LOGIN);
      }
    }

    void runLogout();
  }, [logoutAll, logout, qc, router]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Animated icon */}
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border">
          <LogOut
            className="h-6 w-6 text-muted-foreground animate-pulse"
            aria-hidden
          />
        </span>

        {/* Spinner */}
        <svg
          className="h-5 w-5 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {logoutAll ? "Signing out everywhere…" : "Signing out…"}
          </p>
          <p className="text-xs text-muted-foreground">
            {logoutAll ? "Revoking all sessions" : "Revoking this session"}
          </p>
        </div>
      </div>
    </div>
  );
}
