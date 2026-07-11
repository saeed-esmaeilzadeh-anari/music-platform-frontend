"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/lib/constants";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Role gate for admin-only routes.
 * Must be used inside ProtectedRoute (or after authentication is confirmed)
 * so it doesn't race with the auth hydration cycle.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    // Only redirect once we're sure the user is loaded and not an admin.
    if (isAuthenticated && !isAdmin) {
      router.replace(ROUTES.BROWSE);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
