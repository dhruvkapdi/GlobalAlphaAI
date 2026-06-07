import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Search, X, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { MiniChart } from '@/components/ui/MiniChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CandlestickChart } from '@/components/ui/CandlestickChart';
import { useMarketIndices, useForexPairs, useCryptoData, useCommodities } from '@/hooks/useMarketData';
import { CryptoAsset } from '@/services/marketService';
import { cn } from '@/lib/utils';

const tabs = ['Indices', 'Forex', 'Crypto', 'Commodities'];

const formatMarketCap = (val: number) => {
  if (!val) return '—';
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString()}`;
};

const formatVolume = (val: number) => {
  if (!val) return '—';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString()}`;
};

const GlobalMarkets = () => {
  const [activeTab, setActiveTab] = useState('Indices');
  const [cryptoPage, setCryptoPage] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null);
  const [cryptoSearch, setCryptoSearch] = useState('');

  const { data: marketIndices = [], isLoading: loadingIndices } = useMarketIndices();
  const { data: forexPairs = [], isLoading: loadingForex } = useForexPairs();
  const { data: cryptoData = [], isLoading: loadingCrypto } = useCryptoData(cryptoPage);
  const { data: commodities = [], isLoading: loadingCommodities } = useCommodities();

  const filteredCrypto = cryptoSearch
    ? cryptoData.filter((c: CryptoAsset) =>
        c.name?.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
        c.symbol?.toLowerCase().includes(cryptoSearch.toLowerCase())
      )
    : cryptoData;

  const isLoading = (activeTab === 'Indices' && loadingIndices) || (activeTab === 'Forex' && loadingForex) ||
    (activeTab === 'Crypto' && loadingCrypto) || (activeTab === 'Commodities' && loadingCommodities);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" /> Global Markets</h1>
          <p className="text-muted-foreground text-sm">Real-time data across indices, forex, crypto, and commodities</p>
        </div>

        <div className="flex gap-2 border-b border-border/50 pb-2">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === t ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : (
          <>
            {activeTab === 'Indices' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketIndices.map((idx: any) => (
                  <GlassCard key={idx.name} hover className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{idx.name}</h3>
                      <span className="text-[10px] text-muted-foreground">{idx.country}</span>
                    </div>
                    <div className="text-xl font-bold font-mono">{(idx.value ?? 0).toLocaleString()}</div>
                    <div className={cn('text-xs font-mono', (idx.changePercent ?? 0) >= 0 ? 'text-success' : 'text-destructive')}>
                      {(idx.changePercent ?? 0) >= 0 ? '+' : ''}{(idx.change ?? 0).toFixed(2)} ({(idx.changePercent ?? 0) >= 0 ? '+' : ''}{(idx.changePercent ?? 0).toFixed(2)}%)
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {activeTab === 'Forex' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {forexPairs.map((fx: any) => (
                  <GlassCard key={fx.pair} hover className="p-5">
                    <h3 className="font-semibold text-sm mb-1">{fx.pair}</h3>
                    <div className="text-xl font-bold font-mono">{(fx.rate ?? 0).toFixed(4)}</div>
                    <div className={cn('text-xs font-mono', (fx.changePercent ?? 0) >= 0 ? 'text-success' : 'text-destructive')}>
                      {(fx.changePercent ?? 0) >= 0 ? '+' : ''}{(fx.changePercent ?? 0).toFixed(2)}%
                    </div>
                    <div className="mt-2">
                      <MiniChart data={fx.chartData?.map((v: number, i: number) => ({ date: String(i), value: v })) || []} height={30} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {activeTab === 'Crypto' && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search any cryptocurrency..."
                    value={cryptoSearch}
                    onChange={e => setCryptoSearch(e.target.value)}
                    className="pl-10 bg-card/60 border-border/50"
                  />
                  {cryptoSearch && (
                    <button onClick={() => setCryptoSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCrypto.map((c: CryptoAsset) => (
                    <GlassCard key={c.id || c.symbol} hover className="p-4 cursor-pointer" onClick={() => setSelectedCrypto(c)}>
                      <div className="flex items-center gap-3 mb-3">
                        {c.image && <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full" />}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                          <span className="text-[10px] text-muted-foreground font-mono">{c.symbol}{c.rank ? ` #${c.rank}` : ''}</span>
                        </div>
                        <div className={cn('flex items-center gap-0.5 text-xs font-mono font-semibold',
                          (c.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {(c.change24h ?? 0) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(c.change24h ?? 0).toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-xl font-bold font-mono">${(c.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>MCap: {formatMarketCap(c.marketCap)}</span>
                        <span>Vol: {formatVolume(c.volume)}</span>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {/* Load More */}
                {!cryptoSearch && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => setCryptoPage(p => p + 1)} disabled={loadingCrypto}>
                      {loadingCrypto ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Load More Cryptocurrencies
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Commodities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commodities.map((c: any) => (
                  <GlassCard key={c.name} hover className="p-5">
                    <h3 className="font-semibold text-sm mb-1">{c.name}</h3>
                    <div className="text-xl font-bold font-mono">${(c.price ?? 0).toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">{c.unit}</span></div>
                    <div className={cn('text-xs font-mono', (c.change ?? 0) >= 0 ? 'text-success' : 'text-destructive')}>
                      {(c.change ?? 0) >= 0 ? '+' : ''}{(c.change ?? 0).toFixed(1)}%
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Crypto Detail Modal */}
      <Dialog open={!!selectedCrypto} onOpenChange={open => { if (!open) setSelectedCrypto(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCrypto?.image && <img src={selectedCrypto.image} alt="" className="w-8 h-8 rounded-full" />}
              {selectedCrypto?.name}
              <span className="text-muted-foreground font-mono text-sm">{selectedCrypto?.symbol}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedCrypto && <CryptoDetail crypto={selectedCrypto} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

const TIMEFRAME_DAYS: Record<string, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
const TIMEFRAME_KEYS = Object.keys(TIMEFRAME_DAYS);

const CryptoDetail = ({ crypto }: { crypto: CryptoAsset }) => {
  const [timeframe, setTimeframe] = useState('3M');
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const fetchChart = useCallback(async (tf: string) => {
    setChartLoading(true);
    try {
      const days = TIMEFRAME_DAYS[tf] || 90;
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto.id}/market_chart?vs_currency=usd&days=${days}`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      const prices: [number, number][] = json.prices || [];
      // Group prices into OHLC candles
      const interval = days <= 1 ? 1 : days <= 7 ? 4 : days <= 30 ? 24 : days <= 90 ? 48 : 72; // hours per candle
      const msPerCandle = interval * 3600000;
      const candles: any[] = [];
      let bucket: number[] = [];
      let bucketStart = prices[0]?.[0] || 0;

      for (const [ts, price] of prices) {
        if (ts - bucketStart > msPerCandle && bucket.length > 0) {
          candles.push({
            date: new Date(bucketStart).toISOString().split('T')[0],
            open: bucket[0],
            close: bucket[bucket.length - 1],
            high: Math.max(...bucket),
            low: Math.min(...bucket),
            volume: 0,
          });
          bucket = [price];
          bucketStart = ts;
        } else {
          bucket.push(price);
        }
      }
      if (bucket.length > 0) {
        candles.push({
          date: new Date(bucketStart).toISOString().split('T')[0],
          open: bucket[0],
          close: bucket[bucket.length - 1],
          high: Math.max(...bucket),
          low: Math.min(...bucket),
          volume: 0,
        });
      }
      setChartData(candles);
    } catch {
      // Fallback to generated data
      setChartData(generateFallbackCandles(crypto.price, TIMEFRAME_DAYS[tf] || 90));
    } finally {
      setChartLoading(false);
    }
  }, [crypto.id, crypto.price]);

  useEffect(() => {
    fetchChart(timeframe);
  }, [timeframe, fetchChart]);

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="flex items-end gap-4">
        <div className="text-3xl font-bold font-mono">${(crypto.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div className={cn('text-lg font-mono font-semibold flex items-center gap-1',
          (crypto.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'
        )}>
          {(crypto.change24h ?? 0) >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          {Math.abs(crypto.change24h ?? 0).toFixed(2)}%
          <span className="text-xs text-muted-foreground ml-1">24h</span>
        </div>
      </div>

      {/* Candlestick Chart with real timeframes */}
      <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
        {chartLoading ? (
          <div className="flex items-center justify-center" style={{ height: 350 }}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CandlestickChart data={chartData} height={350} />
        )}
        {/* Timeframe buttons */}
        <div className="flex items-center justify-center gap-1 mt-3 bg-muted/30 rounded-lg p-0.5 w-fit mx-auto">
          {TIMEFRAME_KEYS.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all',
                timeframe === tf ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Market Cap', value: formatMarketCap(crypto.marketCap) },
          { label: '24h Volume', value: formatVolume(crypto.volume) },
          { label: '24h High', value: crypto.high24h ? `$${crypto.high24h.toLocaleString()}` : '—' },
          { label: '24h Low', value: crypto.low24h ? `$${crypto.low24h.toLocaleString()}` : '—' },
          { label: 'Rank', value: crypto.rank ? `#${crypto.rank}` : '—' },
          { label: 'Circulating Supply', value: crypto.circulatingSupply ? `${(crypto.circulatingSupply / 1e6).toFixed(1)}M` : '—' },
          { label: 'All-Time High', value: crypto.ath ? `$${crypto.ath.toLocaleString()}` : '—' },
          { label: 'ATH Change', value: crypto.athChangePercent ? `${crypto.athChangePercent.toFixed(1)}%` : '—' },
        ].map(s => (
          <div key={s.label} className="bg-muted/10 rounded-xl p-3 border border-border/10">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className="text-sm font-bold font-mono mt-1">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function generateFallbackCandles(currentPrice: number, days: number) {
  const candles = [];
  let price = currentPrice * 0.95;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const volatility = price * 0.03;
    const open = price;
    const close = open + (Math.random() - 0.48) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    candles.push({ date: date.toISOString().split('T')[0], open, high, low, close, volume: 0 });
    price = close;
  }
  return candles;
}

export default GlobalMarkets;
