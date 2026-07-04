/**
 * Zustand Auth Store
 * Holds the authenticated user identity (from UserSummary in AuthResponse).
 * Tokens are stored in localStorage (managed by http-client.ts).
 * This store is hydrated on app boot from the /users/me endpoint via TanStack Query.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Role, UserSummary } from "@/types";
import { clearTokens, setTokens } from "@/lib/api/http-client";

interface AuthState {
  user: UserSummary | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserSummary | null) => void;
  login: (user: UserSummary, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (role: Role | Role[]) => boolean;
  isArtist: () => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "auth/setUser"),

        login: (user, accessToken, refreshToken) => {
          setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true }, false, "auth/login");
        },

        logout: () => {
          clearTokens();
          set({ user: null, isAuthenticated: false }, false, "auth/logout");
        },

        hasRole: (role) => {
          const { user } = get();
          if (!user) return false;
          if (Array.isArray(role)) return role.includes(user.role);
          return user.role === role;
        },

        isArtist: () => {
          const { user } = get();
          return user?.role === "ARTIST";
        },

        isAdmin: () => {
          const { user } = get();
          return user?.role === "ADMIN";
        },

        isModerator: () => {
          const { user } = get();
          return user?.role === "MODERATOR" || user?.role === "ADMIN";
        },
      }),
      {
        name: "ms-auth",
        // Only persist user info, not actions
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);
