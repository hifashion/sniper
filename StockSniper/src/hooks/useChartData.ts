import { useQuery } from '@tanstack/react-query';
import { fetchChartData } from '../services/yahooFinance';
import { ChartInterval, ChartRange } from '../types';

export function useChartData(
  symbol: string,
  interval: ChartInterval,
  range: ChartRange,
  refetchInterval = 30000,
) {
  return useQuery({
    queryKey: ['chart', symbol, interval, range],
    queryFn: () => fetchChartData(symbol, interval, range),
    refetchInterval,
    enabled: !!symbol,
    staleTime: 15000,
  });
}
