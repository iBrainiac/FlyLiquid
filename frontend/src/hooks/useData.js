import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Poll every 5 seconds to catch blockchain updates (Indexer latency)
const REFRESH_INTERVAL = 5000;

export function usePortfolio(address) {
  return useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => api.getPortfolio(address),
    enabled: !!address, // Only fetch if address exists
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useMarket() {
  return useQuery({
    queryKey: ['market'],
    queryFn: () => api.getListings(),
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicket(id),
    enabled: !!id,
    refetchInterval: REFRESH_INTERVAL,
  });
}