import { useQuery } from '@tanstack/react-query';
import { RoundData } from '../types/api';
import { api } from '../lib/api';

export function useRound() {
  return useQuery<RoundData>({
    queryKey: ['round'],
    queryFn: () => api.getCurrentRound(),
    refetchInterval: 8000, // Poll every 8 seconds
    refetchOnWindowFocus: true,
  });
}

