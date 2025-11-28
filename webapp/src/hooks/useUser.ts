import { useQuery } from '@tanstack/react-query';
import { UserStats } from '../types/api';
import { api } from '../lib/api';

export function useUser() {
  return useQuery<UserStats>({
    queryKey: ['user'],
    queryFn: () => api.getUserStats(),
    refetchInterval: 10000, // Poll every 10 seconds
    refetchOnWindowFocus: true,
  });
}

