"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { usersService } from "@/services/users.service";
import { getAccessToken } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/constants/query-keys";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider hydrates the Zustand auth store from the server on mount.
 *
 * Strategy:
 * 1. If no access token in localStorage → skip (user is guest)
 * 2. If token exists → call GET /users/me
 *    - On success → sync user into Zustand store
 *    - On 401     → http-client's interceptor already attempts token refresh;
 *                   if refresh also fails it clears tokens and redirects /login
 *
 * This runs exactly once per page load. Route-level protection is handled
 * separately by ProtectedRoute / AdminRoute guards.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, isAuthenticated } = useAuthStore();

  const hasToken = typeof window !== "undefined" && !!getAccessToken();

  const { data: user } = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => usersService.getMe(),
    enabled: hasToken,
    staleTime: 0, // always fresh on mount
    retry: false, // http-client handles 401 → redirect; don't mask failures
  });

  useEffect(() => {
    if (user) {
      setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    }
  }, [user, setUser]);

  return <>{children}</>;
}
