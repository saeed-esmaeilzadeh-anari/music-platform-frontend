"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { getAccessToken } from "@/lib/api/http-client";
import { ROUTES } from "@/lib/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = mounted && !!getAccessToken();
  const isAuthed = mounted && (isAuthenticated || hasToken);

  useEffect(() => {
    if (mounted && !isAuthed) {
      router.replace(ROUTES.LOGIN);
    }
  }, [mounted, isAuthed, router]);

  // Server + initial client render must be identical.
  if (!mounted) {
    return null;
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}