import { Stock, MarketIndex, ForexPair, NewsItem, Prediction } from '@/types/market';

export const trendingStocks: Stock[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: 875.28, change: 32.15, changePercent: 3.81, volume: '52.3M', marketCap: '$2.16T', sector: 'Semiconductors', country: 'US', sentiment: 'bullish', recommendation: 'buy' },
  { ticker: 'AAPL', name: 'Apple Inc', price: 189.84, change: 2.31, changePercent: 1.23, volume: '48.1M', marketCap: '$2.95T', sector: 'Technology', country: 'US', sentiment: 'bullish', recommendation: 'hold' },
  { ticker: 'TSLA', name: 'Tesla Inc', price: 248.42, change: -8.56, changePercent: -3.33, volume: '98.7M', marketCap: '$790B', sector: 'Automotive', country: 'US', sentiment: 'bearish', recommendation: 'sell' },
  { ticker: 'MSFT', name: 'Microsoft Corp', price: 415.56, change: 3.22, changePercent: 0.78, volume: '22.4M', marketCap: '$3.09T', sector: 'Technology', country: 'US', sentiment: 'bullish', recommendation: 'buy' },
  { ticker: 'META', name: 'Meta Platforms', price: 505.68, change: 12.44, changePercent: 2.52, volume: '18.6M', marketCap: '$1.29T', sector: 'Technology', country: 'US', sentiment: 'bullish', recommendation: 'buy' },
  { ticker: 'AMZN', name: 'Amazon.com', price: 185.07, change: -1.23, changePercent: -0.66, volume: '35.8M', marketCap: '$1.92T', sector: 'E-commerce', country: 'US', sentiment: 'neutral', recommendation: 'hold' },
  { ticker: 'GOOGL', name: 'Alphabet Inc', price: 157.32, change: 4.18, changePercent: 2.73, volume: '25.1M', marketCap: '$1.95T', sector: 'Technology', country: 'US', sentiment: 'bullish', recommendation: 'buy' },
  { ticker: 'TSM', name: 'TSMC', price: 148.92, change: 5.67, changePercent: 3.96, volume: '15.3M', marketCap: '$772B', sector: 'Semiconductors', country: 'TW', sentiment: 'bullish', recommendation: 'buy' },
];

export const marketIndices: MarketIndex[] = [
  { name: 'S&P 500', value: 5234.18, change: 44.91, changePercent: 0.87, country: 'US' },
  { name: 'NASDAQ', value: 16399.52, change: 184.76, changePercent: 1.14, country: 'US' },
  { name: 'Dow Jones', value: 39512.84, change: 125.69, changePercent: 0.32, country: 'US' },
  { name: 'FTSE 100', value: 7930.96, change: -12.34, changePercent: -0.16, country: 'GB' },
  { name: 'Nikkei 225', value: 39910.82, change: 218.45, changePercent: 0.55, country: 'JP' },
  { name: 'DAX', value: 18039.65, change: 89.12, changePercent: 0.50, country: 'DE' },
  { name: 'Hang Seng', value: 16725.86, change: -185.32, changePercent: -1.10, country: 'HK' },
  { name: 'SENSEX', value: 73876.82, change: 456.23, changePercent: 0.62, country: 'IN' },
  { name: 'ASX 200', value: 7749.00, change: 28.50, changePercent: 0.37, country: 'AU' },
  { name: 'CAC 40', value: 8048.09, change: 35.67, changePercent: 0.45, country: 'FR' },
  { name: 'KOSPI', value: 2687.44, change: 42.18, changePercent: 1.59, country: 'KR' },
  { name: 'Bovespa', value: 128450.12, change: -892.34, changePercent: -0.69, country: 'BR' },
];

export const forexPairs: ForexPair[] = [
  { pair: 'EUR/USD', rate: 1.0892, change: 0.0023, changePercent: 0.21, chartData: [1.085, 1.086, 1.087, 1.089, 1.088, 1.090, 1.089] },
  { pair: 'GBP/USD', rate: 1.2715, change: -0.0018, changePercent: -0.14, chartData: [1.274, 1.273, 1.272, 1.271, 1.272, 1.271, 1.272] },
  { pair: 'USD/JPY', rate: 149.52, change: 0.34, changePercent: 0.23, chartData: [149.1, 149.3, 149.5, 149.4, 149.6, 149.5, 149.5] },
  { pair: 'USD/CHF', rate: 0.8812, change: -0.0012, changePercent: -0.14, chartData: [0.883, 0.882, 0.881, 0.882, 0.881, 0.882, 0.881] },
  { pair: 'AUD/USD', rate: 0.6534, change: 0.0045, changePercent: 0.69, chartData: [0.649, 0.650, 0.651, 0.652, 0.653, 0.653, 0.653] },
  { pair: 'USD/CAD', rate: 1.3542, change: -0.0028, changePercent: -0.21, chartData: [1.357, 1.356, 1.355, 1.354, 1.354, 1.355, 1.354] },
  { pair: 'USD/INR', rate: 83.21, change: 0.08, changePercent: 0.10, chartData: [83.1, 83.15, 83.18, 83.20, 83.19, 83.21, 83.21] },
  { pair: 'USD/CNY', rate: 7.24, change: 0.02, changePercent: 0.28, chartData: [7.22, 7.23, 7.23, 7.24, 7.23, 7.24, 7.24] },
];

export const newsItems: NewsItem[] = [
  { id: '1', title: 'NVIDIA Surpasses Apple as World\'s Second Most Valuable Company', source: 'Bloomberg', timestamp: '2h ago', sentiment: 'bullish', summary: 'NVIDIA market cap crosses $2.2 trillion on AI chip demand surge.', category: 'Technology' },
  { id: '2', title: 'Fed Minutes Show Officials in No Rush to Cut Rates', source: 'Reuters', timestamp: '3h ago', sentiment: 'bearish', summary: 'Federal Reserve officials emphasized data-dependent approach to rate decisions.', category: 'Economy' },
  { id: '3', title: 'China Property Crisis Deepens as Country Garden Defaults', source: 'FT', timestamp: '4h ago', sentiment: 'bearish', summary: 'Property sector stress continues to weigh on Chinese economic recovery.', category: 'Real Estate' },
  { id: '4', title: 'Indian Markets Hit All-Time High on Strong GDP Data', source: 'Economic Times', timestamp: '5h ago', sentiment: 'bullish', summary: 'SENSEX breaches 74,000 mark as India reports 6.7% GDP growth.', category: 'Markets' },
  { id: '5', title: 'Bitcoin ETFs See Record $1B Daily Inflow', source: 'CoinDesk', timestamp: '6h ago', sentiment: 'bullish', summary: 'Institutional adoption accelerates with spot Bitcoin ETF demand surging.', category: 'Crypto' },
  { id: '6', title: 'European Auto Makers Warn on Chinese EV Competition', source: 'FT', timestamp: '7h ago', sentiment: 'bearish', summary: 'VW and BMW executives flag intensifying competition from BYD and other Chinese EV makers.', category: 'Automotive' },
  { id: '7', title: 'Global Oil Prices Rise on OPEC+ Supply Cut Extension', source: 'Reuters', timestamp: '8h ago', sentiment: 'neutral', summary: 'Brent crude climbs above $82 as OPEC+ extends production cuts through Q2.', category: 'Commodities' },
  { id: '8', title: 'Japan\'s Nikkei 225 Breaks 40-Year Record High', source: 'Nikkei', timestamp: '10h ago', sentiment: 'bullish', summary: 'Japanese equities at historic levels driven by weak yen and corporate reforms.', category: 'Markets' },
];

export const predictions: Prediction[] = [
  { stock: 'NVDA', timeframe: '3 months', bullishProbability: 72, bearishProbability: 28, confidence: 85, targetPrice: 950, currentPrice: 875, aiSummary: 'Strong AI demand cycle supports continued growth. Data center revenue expected to surge.' },
  { stock: 'AAPL', timeframe: '3 months', bullishProbability: 58, bearishProbability: 42, confidence: 72, targetPrice: 205, currentPrice: 190, aiSummary: 'Vision Pro catalyst and services growth offset iPhone saturation concerns.' },
  { stock: 'TSLA', timeframe: '3 months', bullishProbability: 35, bearishProbability: 65, confidence: 68, targetPrice: 210, currentPrice: 248, aiSummary: 'Margin pressure from price cuts and increasing competition. Robotaxi timeline uncertain.' },
  { stock: 'MSFT', timeframe: '3 months', bullishProbability: 68, bearishProbability: 32, confidence: 80, targetPrice: 450, currentPrice: 416, aiSummary: 'Azure AI integration driving cloud growth. Copilot monetization expected to accelerate.' },
];

export const watchlist = [
  { ticker: 'AAPL', name: 'Apple', price: 189.84, change: 1.23, alert: false },
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.28, change: 3.81, alert: true },
  { ticker: 'TSLA', name: 'Tesla', price: 248.42, change: -3.33, alert: true },
  { ticker: 'MSFT', name: 'Microsoft', price: 415.56, change: 0.78, alert: false },
  { ticker: 'AMZN', name: 'Amazon', price: 185.07, change: -0.66, alert: false },
  { ticker: 'META', name: 'Meta', price: 505.68, change: 2.52, alert: false },
];

export const portfolioData = [
  { name: 'Jan', value: 42000 },
  { name: 'Feb', value: 44500 },
  { name: 'Mar', value: 43800 },
  { name: 'Apr', value: 46200 },
  { name: 'May', value: 48900 },
  { name: 'Jun', value: 47600 },
  { name: 'Jul', value: 51200 },
  { name: 'Aug', value: 53800 },
  { name: 'Sep', value: 52100 },
  { name: 'Oct', value: 55400 },
  { name: 'Nov', value: 58900 },
  { name: 'Dec', value: 62300 },
];

export const sectorHeatmap = [
  { name: 'Technology', change: 2.45, size: 35 },
  { name: 'Healthcare', change: 0.82, size: 15 },
  { name: 'Finance', change: -0.34, size: 20 },
  { name: 'Energy', change: 1.56, size: 12 },
  { name: 'Consumer', change: -0.91, size: 10 },
  { name: 'Industrial', change: 0.45, size: 8 },
];

export const aiSuggestedPrompts = [
  'What are the best AI stocks to buy now?',
  'Analyze NVIDIA\'s growth trajectory for 2024',
  'Compare emerging market ETFs performance',
  'What impact will Fed rate cuts have on tech stocks?',
  'Which sectors will outperform in a recession?',
  'Explain the risk of investing in Chinese tech stocks',
  'Best dividend stocks for passive income',
  'How will AI affect the semiconductor industry?',
];

export const commodities = [
  { name: 'Gold', price: 2178.40, change: 1.2, unit: '/oz' },
  { name: 'Silver', price: 24.85, change: 0.8, unit: '/oz' },
  { name: 'Brent Crude', price: 82.36, change: -0.5, unit: '/bbl' },
  { name: 'WTI Crude', price: 78.74, change: -0.3, unit: '/bbl' },
  { name: 'Natural Gas', price: 1.78, change: -2.1, unit: '/MMBtu' },
  { name: 'Copper', price: 4.21, change: 1.5, unit: '/lb' },
];

export const cryptoData = [
  { name: 'Bitcoin', ticker: 'BTC', price: 67842.50, change: 4.2, marketCap: '$1.33T' },
  { name: 'Ethereum', ticker: 'ETH', price: 3521.80, change: 2.8, marketCap: '$423B' },
  { name: 'Solana', ticker: 'SOL', price: 142.35, change: 6.1, marketCap: '$63B' },
  { name: 'BNB', ticker: 'BNB', price: 412.20, change: 1.5, marketCap: '$63B' },
];
