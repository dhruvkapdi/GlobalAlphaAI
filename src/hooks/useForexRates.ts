import { useQuery } from '@tanstack/react-query';
import { fetchForexRates, getRateForCurrency, ForexRate } from '@/services/forexService';

export function useForexRates() {
  return useQuery({
    queryKey: ['forex-rates-real'],
    queryFn: fetchForexRates,
    staleTime: 30 * 60 * 1000, // 30 min
    refetchInterval: 30 * 60 * 1000,
  });
}

export function useForexRate(currencyCode: string) {
  const { data: rates = [], ...rest } = useForexRates();
  const rate = getRateForCurrency(rates, currencyCode);
  return { rate, ...rest };
}

export type { ForexRate };
