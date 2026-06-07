import { useQuery } from '@tanstack/react-query';
import {
  fetchCountries,
  fetchTrendingStocks,
  fetchMarketIndices,
  fetchForexPairs,
  fetchNews,
  fetchPredictions,
  fetchWatchlist,
  fetchPortfolioData,
  fetchSectorHeatmap,
  fetchCommodities,
  fetchCryptoData,
  fetchMarketSentiment,
  getLastUpdated,
  generateAISummary,
  generatePrediction,
  searchStocks,
} from '@/services/marketService';

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrendingStocks() {
  return useQuery({
    queryKey: ['trending-stocks'],
    queryFn: fetchTrendingStocks,
    staleTime: 60 * 1000,
  });
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ['market-indices'],
    queryFn: fetchMarketIndices,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useForexPairs() {
  return useQuery({
    queryKey: ['forex-pairs'],
    queryFn: fetchForexPairs,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });
}

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

export function usePredictions() {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: fetchPredictions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    staleTime: 30 * 1000,
  });
}

export function usePortfolioData() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolioData,
    staleTime: 60 * 1000,
  });
}

export function useSectorHeatmap() {
  return useQuery({
    queryKey: ['sector-heatmap'],
    queryFn: fetchSectorHeatmap,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useCommodities() {
  return useQuery({
    queryKey: ['commodities'],
    queryFn: fetchCommodities,
    staleTime: 60 * 1000,
  });
}

export function useCryptoData(page = 1) {
  return useQuery({
    queryKey: ['crypto', page],
    queryFn: () => fetchCryptoData(page),
    staleTime: 60 * 1000,
  });
}

export function useMarketSentiment() {
  return useQuery({
    queryKey: ['market-sentiment'],
    queryFn: fetchMarketSentiment,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLastUpdated() {
  return useQuery({
    queryKey: ['last-updated'],
    queryFn: getLastUpdated,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['stock-search', query],
    queryFn: () => searchStocks(query),
    enabled: query.length >= 1,
    staleTime: 30 * 1000,
  });
}

// Re-export service functions for direct use
export { generateAISummary, generatePrediction, searchStocks };
