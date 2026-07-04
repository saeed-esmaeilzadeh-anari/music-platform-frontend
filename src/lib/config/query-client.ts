import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/utils";

/**
 * Factory — called once per app mount inside QueryProvider.
 * Keeping this as a function (not a module-level singleton) prevents
 * state leaking across Next.js server requests in SSR scenarios.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't re-fetch on every window focus in a music app where focus
        // changes constantly (player, browser, mobile)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // 2-minute stale time as the default baseline
        staleTime: 1000 * 60 * 2,
        // Retry once, but never retry 401/403 (auth errors) or 404 (not found)
        retry: (failureCount, error) => {
          if (failureCount >= 1) return false;
          if (isApiError(error)) {
            const status = (error as { response?: { status?: number } })
              .response?.status;
            if (status === 401 || status === 403 || status === 404)
              return false;
          }
          return true;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
