/**
 * Market data service layer.
 * Uses edge functions → Supabase cache → local fallback.
 */
import { supabase } from '@/integrations/supabase/client';
import { countries as localCountries } from '@/data/countries';
import {
  trendingStocks, marketIndices as mockIndices, forexPairs as mockForex,
  newsItems as mockNews, predictions as mockPredictions,
  portfolioData, commodities, cryptoData
} from '@/data/mockData';
import type { Country, Stock, MarketIndex, ForexPair, NewsItem, Prediction } from '@/types/market';

// ─── Edge Function Caller ───
async function callEdgeFunction(name: string, body?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body: body ? JSON.stringify(body) : undefined,
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn(`Edge function ${name} failed, using fallback:`, e);
    return null;
  }
}

// ─── Countries ───
export async function fetchCountries(): Promise<Country[]> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');
    
    if (error || !data || data.length === 0) {
      return localCountries;
    }
    
    return data.map(row => ({
      iso: row.iso,
      name: row.name,
      flag: row.flag,
      lat: row.lat,
      lng: row.lng,
      region: row.region,
      continent: row.continent,
      capital: row.capital,
      currency: row.currency,
      currencySymbol: row.currency_symbol,
      classification: row.classification as Country['classification'],
      primaryExchange: row.primary_exchange,
      primaryIndex: row.primary_index,
      marketStatus: row.market_status as Country['marketStatus'],
      timezone: row.timezone,
      exchangeRateUSD: row.exchange_rate_usd,
      gdpGrowth: row.gdp_growth,
      inflation: row.inflation,
      interestRate: row.interest_rate,
      topSectors: row.top_sectors || [],
      topCompanies: (row.top_companies as any[]) || [],
      aiSentiment: row.ai_sentiment as Country['aiSentiment'],
      riskLevel: row.risk_level as Country['riskLevel'],
      volatilityLevel: row.volatility_level,
      opportunityScore: row.opportunity_score,
      economicIndicators: (row.economic_indicators as any[]) || [],
      aiSummary: row.ai_summary,
      chartData: generateChartData(1000, 20, 0.5),
    }));
  } catch {
    return localCountries;
  }
}

// ─── Market Indices (edge function → cache → mock) ───
export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  const { data: cached } = await supabase
    .from('market_snapshots')
    .select('*')
    .eq('data_type', 'index')
    .order('fetched_at', { ascending: false })
    .limit(20);

  if (cached && cached.length > 0) {
    return cached.map(row => ({
      name: row.name,
      value: row.value,
      change: row.change_value,
      changePercent: row.change_percent,
      country: (row.metadata as any)?.country || '',
    }));
  }

  // Try edge function
  const result = await callEdgeFunction('fetch-market-data');
  if (result?.data) {
    return result.data.map((row: any) => ({
      name: row.name,
      value: row.value,
      change: row.change_value,
      changePercent: row.change_percent,
      country: row.metadata?.country || '',
    }));
  }

  return mockIndices;
}

// ─── Sector Performance (from market_snapshots) ───
export async function fetchSectorHeatmap(): Promise<{ name: string; change: number; size: number }[]> {
  const { data: cached } = await supabase
    .from('market_snapshots')
    .select('*')
    .eq('data_type', 'sector')
    .order('fetched_at', { ascending: false })
    .limit(20);

  if (cached && cached.length > 0) {
    return cached.map(row => ({
      name: row.name,
      change: row.change_percent,
      size: 10 + Math.abs(row.change_percent) * 5,
    }));
  }

  // Trigger edge function to populate
  await callEdgeFunction('fetch-market-data');

  // Retry
  const { data: fresh } = await supabase
    .from('market_snapshots')
    .select('*')
    .eq('data_type', 'sector')
    .order('fetched_at', { ascending: false })
    .limit(20);

  if (fresh && fresh.length > 0) {
    return fresh.map(row => ({
      name: row.name,
      change: row.change_percent,
      size: 10 + Math.abs(row.change_percent) * 5,
    }));
  }

  return [
    { name: 'Technology', change: 2.45, size: 35 },
    { name: 'Healthcare', change: 0.82, size: 15 },
    { name: 'Financials', change: -0.34, size: 20 },
    { name: 'Energy', change: 1.56, size: 12 },
    { name: 'Consumer', change: -0.91, size: 10 },
    { name: 'Industrials', change: 0.45, size: 8 },
  ];
}

// ─── Forex (from forex_rates table → edge function → mock) ───
export async function fetchForexPairs(): Promise<ForexPair[]> {
  const majorPairs = [
    { symbol: 'EUR/USD', target: 'EUR', invert: true },
    { symbol: 'GBP/USD', target: 'GBP', invert: true },
    { symbol: 'USD/JPY', target: 'JPY', invert: false },
    { symbol: 'USD/CHF', target: 'CHF', invert: false },
    { symbol: 'AUD/USD', target: 'AUD', invert: true },
    { symbol: 'USD/CAD', target: 'CAD', invert: false },
    { symbol: 'USD/INR', target: 'INR', invert: false },
    { symbol: 'USD/CNY', target: 'CNY', invert: false },
    { symbol: 'NZD/USD', target: 'NZD', invert: true },
    { symbol: 'USD/BRL', target: 'BRL', invert: false },
  ];

  const targets = majorPairs.map(p => p.target);
  
  // Fetch from forex_rates table (real data, no timestamp filter)
  let { data: rates } = await supabase
    .from('forex_rates')
    .select('*')
    .eq('base_currency', 'USD')
    .in('target_currency', targets);

  if (!rates || rates.length === 0) {
    // Trigger refresh and retry
    await callEdgeFunction('fetch-forex-rates');
    const { data: fresh } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('base_currency', 'USD')
      .in('target_currency', targets);
    rates = fresh;
  }

  if (rates && rates.length > 0) {
    const rateMap = new Map(rates.map(r => [r.target_currency, r.rate]));
    return majorPairs.map(p => {
      const rawRate = rateMap.get(p.target) ?? 0;
      const displayRate = p.invert && rawRate > 0 ? 1 / rawRate : rawRate;
      return {
        pair: p.symbol,
        rate: Math.round(displayRate * 10000) / 10000,
        change: 0,
        changePercent: (Math.random() - 0.5) * 0.4,
        chartData: Array.from({ length: 20 }, () => displayRate + (Math.random() - 0.5) * displayRate * 0.005),
      };
    });
  }

  return mockForex;
}

// ─── News (edge function → cache → mock) ───
export async function fetchNews(): Promise<NewsItem[]> {
  const { data: cached } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(30);

  if (cached && cached.length > 0) {
    return cached.map(row => ({
      id: row.id,
      title: row.title,
      source: row.source,
      timestamp: row.published_at,
      sentiment: row.sentiment as NewsItem['sentiment'],
      summary: row.summary,
      category: row.category,
    }));
  }

  const result = await callEdgeFunction('fetch-news');
  if (result?.data) {
    return result.data.map((row: any, i: number) => ({
      id: row.id || `news-${i}`,
      title: row.title,
      source: row.source,
      timestamp: row.published_at,
      sentiment: row.sentiment as NewsItem['sentiment'],
      summary: row.summary,
      category: row.category,
    }));
  }

  return mockNews;
}

// ─── AI Summary (edge function) ───
export async function generateAISummary(prompt: string, userId?: string): Promise<{ text: string; metadata: any }> {
  const result = await callEdgeFunction('generate-ai-summary', { prompt, user_id: userId });
  if (result?.text) return result;
  return {
    text: `Analysis for "${prompt}": Based on current market conditions, we observe mixed signals across global markets. Monitor key indicators for positioning.`,
    metadata: { type: 'fallback' },
  };
}

// ─── Predictions (edge function) ───
export async function generatePrediction(ticker: string, countryIso?: string, timeframe?: string): Promise<Prediction> {
  const result = await callEdgeFunction('generate-prediction', { ticker, country_iso: countryIso, timeframe });
  if (result?.prediction) {
    const p = result.prediction;
    return {
      stock: p.ticker,
      timeframe: p.timeframe,
      bullishProbability: p.bullish_probability,
      bearishProbability: p.bearish_probability,
      confidence: p.confidence,
      targetPrice: p.target_price,
      currentPrice: p.current_price,
      aiSummary: p.ai_summary,
    };
  }
  return mockPredictions[0];
}

// ─── Stocks (from Supabase) ───
export interface StockRecord {
  id: string;
  symbol: string;
  name: string;
  country: string;
  exchange: string;
  sector: string;
  currency: string;
}

export async function searchStocks(query: string): Promise<StockRecord[]> {
  if (!query || query.length < 1) return [];
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
      .order('symbol')
      .limit(20);
    if (error || !data) return [];
    return data as StockRecord[];
  } catch {
    return [];
  }
}

export async function fetchTrendingStocks(): Promise<Stock[]> {
  try {
    const { data } = await supabase
      .from('stocks')
      .select('*')
      .order('symbol')
      .limit(20);
    if (data && data.length > 0) {
      // Merge DB metadata with mock prices (DB doesn't store live prices)
      return data.map((s: any) => {
        const mock = trendingStocks.find(m => m.ticker === s.symbol);
        return {
          ticker: s.symbol,
          name: s.name || mock?.name || s.symbol,
          price: mock?.price ?? (Math.random() * 200 + 50),
          change: mock?.change ?? (Math.random() * 10 - 5),
          changePercent: mock?.changePercent ?? (Math.random() * 4 - 2),
          volume: mock?.volume || '10M',
          marketCap: mock?.marketCap || '',
          sector: s.sector || mock?.sector || 'Technology',
          country: s.country || mock?.country || 'US',
          sentiment: mock?.sentiment || 'neutral' as const,
          recommendation: mock?.recommendation || 'hold' as const,
        };
      });
    }
  } catch {}
  return trendingStocks;
}

// ─── Predictions list ───
export async function fetchPredictions(): Promise<Prediction[]> {
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (data && data.length > 0) {
    return data.map(p => ({
      stock: p.ticker,
      timeframe: p.timeframe,
      bullishProbability: p.bullish_probability,
      bearishProbability: p.bearish_probability,
      confidence: p.confidence,
      targetPrice: p.target_price,
      currentPrice: p.current_price,
      aiSummary: p.ai_summary,
    }));
  }
  return mockPredictions;
}

// ─── Watchlist (real Supabase) ───
export async function fetchWatchlist() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(w => ({
      id: w.id,
      ticker: w.ticker,
      name: w.name,
      change: 0,
      alert: w.alert_enabled,
      countryIso: w.country_iso,
    }));
  } catch {
    return [];
  }
}

// ─── Portfolio ───
export async function fetchPortfolioData() {
  return portfolioData;
}

// ─── Commodities & Crypto ───
export async function fetchCommodities() {
  return commodities;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  rank: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  ath: number;
  athChangePercent: number;
}

export async function fetchCryptoData(page = 1, perPage = 100): Promise<CryptoAsset[]> {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'uxdhoukjeayrxfdqvknq';
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/fetch-crypto?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.coins) return json.coins;
    }
  } catch (e) {
    console.warn('Crypto fetch failed:', e);
  }
  // Fallback
  return cryptoData.map(c => ({
    id: c.ticker.toLowerCase(),
    symbol: c.ticker,
    name: c.name,
    image: '',
    price: c.price,
    change24h: c.change,
    marketCap: 0,
    volume: 0,
    rank: 0,
    high24h: 0,
    low24h: 0,
    circulatingSupply: 0,
    ath: 0,
    athChangePercent: 0,
  }));
}

export async function searchCrypto(query: string): Promise<any[]> {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'uxdhoukjeayrxfdqvknq';
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/fetch-crypto?search=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    if (res.ok) {
      const json = await res.json();
      return json.coins || [];
    }
  } catch (e) {
    console.warn('Crypto search failed:', e);
  }
  return [];
}

// ─── Market Sentiment (derived from indices) ───
export async function fetchMarketSentiment(): Promise<{
  label: 'Bullish' | 'Neutral' | 'Bearish';
  confidence: number;
  signals: number;
  riskLevel: number;
}> {
  const indices = await fetchMarketIndices();
  const positive = indices.filter(i => i.changePercent > 0).length;
  const total = indices.length || 1;
  const ratio = positive / total;
  const avgChange = indices.reduce((sum, i) => sum + i.changePercent, 0) / total;

  let label: 'Bullish' | 'Neutral' | 'Bearish';
  let confidence: number;

  if (ratio >= 0.65 && avgChange > 0.3) {
    label = 'Bullish';
    confidence = Math.min(60 + ratio * 30, 95);
  } else if (ratio <= 0.35 && avgChange < -0.3) {
    label = 'Bearish';
    confidence = Math.min(60 + (1 - ratio) * 30, 95);
  } else {
    label = 'Neutral';
    confidence = 50 + Math.abs(0.5 - ratio) * 40;
  }

  const riskLevel = label === 'Bearish' ? 70 + (1 - ratio) * 20 : label === 'Neutral' ? 40 + Math.random() * 15 : 20 + ratio * 20;

  return {
    label,
    confidence: Math.round(confidence * 10) / 10,
    signals: indices.length * 1000 + Math.floor(Math.random() * 5000),
    riskLevel: Math.round(riskLevel),
  };
}

// ─── Last Updated Timestamp ───
export async function getLastUpdated(): Promise<string | null> {
  const { data } = await supabase
    .from('market_snapshots')
    .select('fetched_at')
    .eq('data_type', 'index')
    .order('fetched_at', { ascending: false })
    .limit(1);
  
  return data?.[0]?.fetched_at || null;
}

// Helper
function generateChartData(baseValue: number, volatility: number, trend: number) {
  const data: { date: string; value: number }[] = [];
  let value = baseValue;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value += (Math.random() - 0.5 + trend * 0.01) * volatility;
    value = Math.max(value * 0.8, value);
    data.push({ date: date.toISOString().split('T')[0], value: Math.round(value * 100) / 100 });
  }
  return data;
}
