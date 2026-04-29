import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient — exported here to avoid circular imports.
 * Both App.tsx and AuthContext.tsx can safely import from this module.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,           // 30s before data is stale
      retry: (failureCount, error: any) => {
        // Never retry on 401/403/404
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
