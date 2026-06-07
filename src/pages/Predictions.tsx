import { useState, useEffect, useCallback } from 'react';
import { Target, Brain, Search, RefreshCw, TrendingUp, TrendingDown, Minus, Loader2, X, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CandlestickChart } from '@/components/ui/CandlestickChart';
import { useStockSearch } from '@/hooks/useMarketData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { StockRecord } from '@/services/marketService';

interface PredictionCard {
  id: string;
  entity: string;
  entityType: string;
  prediction: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  reasoning: string;
  currentPrice: number;
  targetPrice: number;
  bullish: number;
  bearish: number;
  createdAt: string;
  ticker: string;
  countryIso?: string;
}

const Predictions = () => {
  const [predictions, setPredictions] = useState<PredictionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<StockRecord[]>([]);

  const { data: searchResults = [], isLoading: searching } = useStockSearch(searchQuery);

  // Load existing predictions
  useEffect(() => {
    loadPredictions();
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentStockSearches');
    if (saved) setRecentSearches(JSON.parse(saved).slice(0, 8));
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const cards: PredictionCard[] = data.map(p => ({
          id: p.id,
          entity: p.ticker,
          ticker: p.ticker,
          entityType: p.country_iso ? 'stock' : 'index',
          prediction: p.bullish_probability > 55 ? 'Bullish' : p.bullish_probability < 45 ? 'Bearish' : 'Neutral',
          confidence: p.confidence,
          reasoning: p.ai_summary,
          currentPrice: p.current_price,
          targetPrice: p.target_price,
          bullish: p.bullish_probability,
          bearish: p.bearish_probability,
          createdAt: p.created_at,
          countryIso: p.country_iso || undefined,
        }));
        setPredictions(cards);
        if (!selectedPrediction) setSelectedPrediction(cards[0]);
      }
    } catch (e) {
      console.error('Failed to load predictions:', e);
    } finally {
      setLoading(false);
    }
  };

  const generateForStock = useCallback(async (stock: StockRecord) => {
    setGenerating(stock.symbol);
    // Save to recent searches
    setRecentSearches(prev => {
      const updated = [stock, ...prev.filter(s => s.symbol !== stock.symbol)].slice(0, 8);
      localStorage.setItem('recentStockSearches', JSON.stringify(updated));
      return updated;
    });
    setShowSearchResults(false);
    setSearchQuery('');

    try {
      const { data } = await supabase.functions.invoke('generate-prediction', {
        body: JSON.stringify({
          ticker: stock.symbol,
          country_iso: stock.country,
          timeframe: '3 months',
        }),
      });

      if (data?.prediction) {
        const p = data.prediction;
        const card: PredictionCard = {
          id: p.id || `gen-${Date.now()}`,
          entity: `${stock.name} (${stock.symbol})`,
          ticker: stock.symbol,
          entityType: 'stock',
          prediction: p.bullish_probability > 55 ? 'Bullish' : p.bullish_probability < 45 ? 'Bearish' : 'Neutral',
          confidence: p.confidence,
          reasoning: p.ai_summary,
          currentPrice: p.current_price,
          targetPrice: p.target_price,
          bullish: p.bullish_probability,
          bearish: p.bearish_probability,
          createdAt: p.created_at || new Date().toISOString(),
          countryIso: stock.country,
        };
        setPredictions(prev => [card, ...prev.filter(x => x.ticker !== stock.symbol)]);
        setSelectedPrediction(card);
      }
    } catch (e) {
      console.error('Failed to generate prediction:', e);
    } finally {
      setGenerating(null);
    }
  }, []);

  const active = selectedPrediction || predictions[0];

  const predictionIcon = (pred: string) => {
    if (pred === 'Bullish') return <TrendingUp className="h-3.5 w-3.5 text-success" />;
    if (pred === 'Bearish') return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-warning" />;
  };

  const predictionColor = (pred: string) => {
    if (pred === 'Bullish') return 'text-success bg-success/10 border-success/20';
    if (pred === 'Bearish') return 'text-destructive bg-destructive/10 border-destructive/20';
    return 'text-warning bg-warning/10 border-warning/20';
  };

  const exchangeFlags: Record<string, string> = {
    US: '🇺🇸', IN: '🇮🇳', GB: '🇬🇧', JP: '🇯🇵', DE: '🇩🇪', CN: '🇨🇳',
    HK: '🇭🇰', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', CA: '🇨🇦', CH: '🇨🇭',
    BR: '🇧🇷', SA: '🇸🇦', TW: '🇹🇼', SG: '🇸🇬', NL: '🇳🇱', ES: '🇪🇸',
    MX: '🇲🇽', ZA: '🇿🇦', ID: '🇮🇩', TH: '🇹🇭',
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" /> AI Predictions
            </h1>
            <p className="text-muted-foreground text-sm">Search any stock globally and get AI-powered predictions</p>
          </div>
        </div>

        {/* Stock Search */}
        <GlassCard className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search any stock — AAPL, Reliance, Tata Motors, Samsung..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              className="pl-10 h-11 bg-card/60 border-border/50 text-sm"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No stocks found for "{searchQuery}"</div>
                ) : (
                  searchResults.map(stock => (
                    <button
                      key={stock.id}
                      onClick={() => generateForStock(stock)}
                      disabled={generating === stock.symbol}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors text-left border-b border-border/10 last:border-0"
                    >
                      <span className="text-lg">{exchangeFlags[stock.country] || '🌍'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{stock.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{stock.exchange}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{stock.sector}</span>
                      {generating === stock.symbol && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !showSearchResults && (
            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> Recent
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map(stock => (
                  <button
                    key={stock.symbol}
                    onClick={() => generateForStock(stock)}
                    disabled={generating !== null}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-border/30 bg-card/30 hover:bg-primary/10 hover:border-primary/20 transition-colors flex items-center gap-1.5"
                  >
                    <span>{exchangeFlags[stock.country] || '🌍'}</span>
                    <span className="font-medium">{stock.symbol}</span>
                    {generating === stock.symbol && <Loader2 className="h-3 w-3 animate-spin" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Prediction cards grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : predictions.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {predictions.slice(0, 18).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPrediction(p)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all hover:scale-[1.02]',
                  active?.id === p.id ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-card/40 border-border/30 hover:border-border/50'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {predictionIcon(p.prediction)}
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', predictionColor(p.prediction))}>{p.prediction}</span>
                </div>
                <p className="text-xs font-semibold line-clamp-1">{p.entity}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">Conf.</span>
                  <span className="text-xs font-mono font-bold">{p.confidence.toFixed(0)}%</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <Target className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-semibold mb-1">No predictions yet</h3>
            <p className="text-xs text-muted-foreground">Search for any stock above to generate AI predictions</p>
          </GlassCard>
        )}

        {/* Detail view */}
        {active && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <GlassCard className="lg:col-span-2 p-5" glow="primary">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">{active.entity} — Price Chart</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">OHLC candlestick • AI confidence {active.confidence.toFixed(0)}%</p>
                </div>
                <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold', predictionColor(active.prediction))}>
                  {predictionIcon(active.prediction)}
                  {active.prediction}
                </div>
              </div>
              <CandlestickChart data={[]} height={300} basePrice={active?.currentPrice} ticker={active?.stock} />
            </GlassCard>

            <div className="space-y-4">
              <GlassCard className="p-4">
                <h4 className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Summary</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Current</span><span className="font-mono font-bold text-sm">${active.currentPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Target</span><span className="font-mono font-bold text-sm text-primary">${active.targetPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Upside</span>
                    <span className={cn('font-mono font-bold text-sm', active.targetPrice > active.currentPrice ? 'text-success' : 'text-destructive')}>
                      {((active.targetPrice / active.currentPrice - 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <h4 className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Probability</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-success font-medium">Bullish</span><span className="font-mono">{active.bullish.toFixed(1)}%</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-success rounded-full transition-all" style={{ width: `${active.bullish}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-destructive font-medium">Bearish</span><span className="font-mono">{active.bearish.toFixed(1)}%</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${active.bearish}%` }} /></div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <h4 className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Confidence</h4>
                <RiskMeter level={active.confidence} />
              </GlassCard>

              <GlassCard className="p-4">
                <h4 className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Brain className="h-3 w-3 text-accent" /> AI Analysis
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{active.reasoning}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-2">Generated {new Date(active.createdAt).toLocaleDateString()}</p>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Stats */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{predictions.filter(p => p.prediction === 'Bullish').length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Bullish Signals</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{predictions.filter(p => p.prediction === 'Bearish').length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Bearish Signals</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{predictions.filter(p => p.prediction === 'Neutral').length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Neutral</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold">{(predictions.reduce((s, p) => s + p.confidence, 0) / (predictions.length || 1)).toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground mt-1">Avg Confidence</p>
            </GlassCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Predictions;
