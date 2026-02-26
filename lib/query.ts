import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min — data considered fresh, no refetch
      gcTime: 5 * 60_000, // 5 min — keep in memory after unmount
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
