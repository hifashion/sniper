import { useQuery } from '@tanstack/react-query';
import { fetchQuotes } from '../services/yahooFinance';

export function useQuotes(symbols: string[], refetchInterval = 10000) {
  return useQuery({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: () => fetchQuotes(symbols),
    refetchInterval,
    enabled: symbols.length > 0,
    staleTime: 5000,
  });
}
