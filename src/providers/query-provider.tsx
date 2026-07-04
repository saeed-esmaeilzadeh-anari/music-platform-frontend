"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtool";
import { makeQueryClient } from "@/lib/config/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in TanStack QueryClientProvider.
 * useState ensures one QueryClient per component lifetime (no SSR leakage).
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Lazy initial state: client is created once and never replaced
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
