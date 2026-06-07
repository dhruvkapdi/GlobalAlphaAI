export type MarketClassification = 'developed' | 'emerging' | 'frontier' | 'limited';
export type Sentiment = 'bullish' | 'bearish' | 'neutral';
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type Recommendation = 'buy' | 'sell' | 'hold';

export interface Country {
  iso: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  region: string;
  continent: string;
  capital: string;
  currency: string;
  currencySymbol: string;
  classification: MarketClassification;
  primaryExchange: string;
  primaryIndex: string;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  timezone: string;
  exchangeRateUSD: number;
  gdpGrowth: number;
  inflation: number;
  interestRate: number;
  topSectors: string[];
  topCompanies: { name: string; ticker: string; change: number }[];
  aiSentiment: Sentiment;
  riskLevel: RiskLevel;
  volatilityLevel: number; // 0-100
  opportunityScore: number; // 0-100
  economicIndicators: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
  aiSummary: string;
  chartData: { date: string; value: number }[];
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  sector: string;
  country: string;
  sentiment: Sentiment;
  recommendation: Recommendation;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  country: string;
}

export interface ForexPair {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  chartData: number[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  sentiment: Sentiment;
  summary: string;
  category: string;
}

export interface Prediction {
  stock: string;
  timeframe: string;
  bullishProbability: number;
  bearishProbability: number;
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  aiSummary: string;
}
