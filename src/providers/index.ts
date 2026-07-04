"use client";

import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";

interface RootProvidersProps {
  children: React.ReactNode;
}

/**
 * Compositor that wraps the entire application tree.
 * Ordering is deliberate:
 *   QueryProvider   — must be outermost so all children can use useQuery
 *   ToastProvider   — needs no deps, wraps early so anything can call useToast
 *   AuthProvider    — uses useQuery internally, so must be inside QueryProvider
 */
export function RootProviders({ children }: RootProvidersProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

// Re-export individual providers for cases where only a subset is needed
export { QueryProvider } from "./query-provider";
export { AuthProvider } from "./auth-provider";
export { ToastProvider, useToast } from "./toast-provider";
