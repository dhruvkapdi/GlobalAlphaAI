import { supabase } from '@/integrations/supabase/client';

export interface ForexRate {
  base_currency: string;
  target_currency: string;
  rate: number;
  last_updated: string;
}

/**
 * Fetch all forex rates from Supabase cache.
 * If cache is empty/stale, trigger the edge function first.
 */
export async function fetchForexRates(): Promise<ForexRate[]> {
  // Fetch all rates (no timestamp filter — the edge function refreshes periodically)
  const { data: cached } = await supabase
    .from('forex_rates')
    .select('*')
    .eq('base_currency', 'USD');

  if (cached && cached.length > 0) {
    // Check if data is stale (>2 hours) and trigger background refresh
    const lastUpdated = cached[0]?.last_updated;
    if (lastUpdated && Date.now() - new Date(lastUpdated).getTime() > 2 * 60 * 60 * 1000) {
      supabase.functions.invoke('fetch-forex-rates').catch(() => {});
    }
    return cached as ForexRate[];
  }

  // No data at all — trigger edge function
  try {
    await supabase.functions.invoke('fetch-forex-rates');
  } catch (e) {
    console.warn('Failed to invoke fetch-forex-rates:', e);
  }

  const { data } = await supabase
    .from('forex_rates')
    .select('*')
    .eq('base_currency', 'USD');

  return (data as ForexRate[]) || [];
}

/**
 * Get the exchange rate for a specific currency against USD.
 */
export function getRateForCurrency(rates: ForexRate[], currencyCode: string): number | null {
  const found = rates.find(r => r.target_currency === currencyCode);
  return found ? found.rate : null;
}
