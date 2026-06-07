import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Eye, BarChart3, Zap, RefreshCw, Clock, Trash2, Activity, Sparkles, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { SentimentBadge } from '@/components/ui/SentimentBadge';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarketIndices, useTrendingStocks, usePortfolioData,
  useSectorHeatmap, useNews, useMarketSentiment, useLastUpdated,
  usePredictions,
} from '@/hooks/useMarketData';
import { useUserWatchlist, useRemoveFromWatchlist } from '@/hooks/useUserWatchlist';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { HeroTicker } from '@/components/dashboard/HeroTicker';
import { FearGreedMeter } from '@/components/dashboard/FearGreedMeter';
import { AISignalCard } from '@/components/dashboard/AISignalCard';
import { MarketHeatmap } from '@/components/dashboard/MarketHeatmap';
import { AIInsightsFeed } from '@/components/dashboard/AIInsightsFeed';
import { LockedPremiumCard } from '@/components/dashboard/UpgradePro';
import { PersonalGreeting } from '@/components/dashboard/PersonalGreeting';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } };

const Dashboard = () => {
  const qc = useQueryClient();
  const { data: indices = [], isLoading: loadingIndices } = useMarketIndices();
  const { data: trendingStocks = [], isLoading: loadingStocks } = useTrendingStocks();
  const { data: portfolioData = [], isLoading: loadingPortfolio } = usePortfolioData();
  const { data: sectorHeatmap = [], isLoading: loadingSectors } = useSectorHeatmap();
  const { data: newsItems = [], isLoading: loadingNews } = useNews();
  const { data: sentiment, isLoading: loadingSentiment } = useMarketSentiment();
  const { data: lastUpdated } = useLastUpdated();
  const { data: watchlistItems = [], isLoading: loadingWatchlist } = useUserWatchlist();
  const { data: predictions = [], isLoading: loadingPreds } = usePredictions();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const topGainers = trendingStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);
  const upCount = indices.filter(i => i.changePercent > 0).length;
  const breadth = indices.length > 0 ? (upCount / indices.length) * 100 : 50;
  const fearGreed = Math.round((breadth * 0.6) + ((sentiment?.confidence || 50) * 0.4));
  const volatility = indices.length > 0
    ? indices.reduce((sum, i) => sum + Math.abs(i.changePercent), 0) / indices.length
    : 0;
  const volPct = Math.min(100, Math.round(volatility * 20));
  const updatedLabel = lastUpdated
    ? `Updated ${formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}`
    : 'Updated just now';

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['market-indices'] });
    qc.invalidateQueries({ queryKey: ['market-sentiment'] });
    qc.invalidateQueries({ queryKey: ['sector-heatmap'] });
    qc.invalidateQueries({ queryKey: ['last-updated'] });
  };

  return (
    <AppLayout>
      <div className="space-y-0">

        {/* ===== HERO SECTION — Earth globe + title ===== */}
        <section className="relative min-h-[480px] flex flex-col items-center justify-center text-center px-4 py-12 overflow-hidden">
          {/* Subtle top glow rim matching the globe */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          </div>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-blue-400 font-semibold">Global Alpha AI</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 text-white leading-none"
          >
            Live Market{' '}
            <span className="gradient-text">Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
            className="text-slate-400 text-base md:text-lg max-w-lg mb-8"
          >
            Real-time signals across global equities, crypto and commodities
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="w-full max-w-lg mb-8"
          >
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-white/[0.08] transition-all shadow-lg shadow-black/20 group"
            >
              <Search className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span className="flex-1 text-left text-[14px]">Search symbol or company</span>
              <div className="flex items-center gap-1">
                <kbd className="text-[10px] border border-white/[0.1] rounded px-1.5 py-0.5 bg-white/[0.04] font-mono text-slate-500">⌘</kbd>
                <kbd className="text-[10px] border border-white/[0.1] rounded px-1.5 py-0.5 bg-white/[0.04] font-mono text-slate-500">K</kbd>
              </div>
            </button>
          </motion.div>

          {/* Live / Updated status */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-1.5 text-[12px] text-emerald-400">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              Live
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="h-3 w-3" />
              {updatedLabel}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </motion.div>
        </section>

        {/* ===== HERO TICKER CARDS ===== */}
        <motion.div
          variants={container} initial="hidden" animate="show"
          className="px-4 md:px-6 space-y-5 max-w-[1600px] mx-auto w-full"
        >
          <motion.div variants={item}>
            <HeroTicker />
          </motion.div>

          {/* ===== 3 MARKET METRICS ===== */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Sentiment */}
            <div className="space-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-full border border-blue-500/40 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold">AI Sentiment</span>
              </div>
              {loadingSentiment ? <Skeleton className="h-12 w-full bg-white/[0.05]" /> : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-white">{sentiment?.label || 'Neutral'}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {sentiment?.confidence || 50}% confidence • {(sentiment?.signals || 0).toLocaleString()} signals
                    </p>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sentiment?.confidence || 50}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      />
                    </div>
                  </div>
                  <SentimentBadge sentiment={(sentiment?.label?.toLowerCase() as any) || 'neutral'} />
                </div>
              )}
            </div>

            {/* Fear & Greed */}
            <div className="space-card p-5 flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-2">Fear & Greed</p>
              {loadingSentiment || loadingIndices
                ? <Skeleton className="h-24 w-32 bg-white/[0.05]" />
                : <FearGreedMeter value={fearGreed} />
              }
            </div>

            {/* Volatility Index */}
            <div className="space-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-yellow-400" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold">Volatility Index</span>
              </div>
              {loadingIndices ? <Skeleton className="h-16 w-full bg-white/[0.05]" /> : (
                <>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-white font-mono">
                      {volatility.toFixed(2)}<span className="text-sm text-slate-500 ml-1">%</span>
                    </p>
                    <span className={cn(
                      'text-[11px] font-bold px-3 py-1 rounded-full border',
                      volPct < 30
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : volPct < 60
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    )}>
                      {volPct < 30 ? 'Calm' : volPct < 60 ? 'Active' : 'Turbulent'}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${volPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', volPct < 30 ? 'bg-emerald-500' : volPct < 60 ? 'bg-yellow-500' : 'bg-red-500')}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Avg absolute move across {indices.length} indices</p>
                </>
              )}
            </div>
          </motion.div>

          {/* ===== AI SIGNALS ===== */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>AI Signals</span>
                <span className="text-[11px] font-normal text-slate-500">Premium model predictions</span>
              </h3>
              <Button asChild variant="ghost" size="sm" className="h-7 text-[12px] text-blue-400 hover:text-blue-300">
                <Link to="/predictions">View all →</Link>
              </Button>
            </div>
            {loadingPreds ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl bg-white/[0.04]" />)}
              </div>
            ) : predictions.length === 0 ? (
              <div className="space-card p-8 text-center">
                <Sparkles className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">No active AI signals yet. Generate one from the Predictions page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {predictions.slice(0, 5).map(p => (
                  <AISignalCard
                    key={p.stock}
                    ticker={p.stock}
                    bullishProbability={p.bullishProbability}
                    bearishProbability={p.bearishProbability}
                    confidence={p.confidence}
                    timeframe={p.timeframe}
                    targetPrice={p.targetPrice}
                    currentPrice={p.currentPrice}
                    aiSummary={p.aiSummary}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* ===== HEATMAP + AI FEED ===== */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                  <Zap className="h-4 w-4 text-yellow-400" /> Market Heatmap
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live · gainers &amp; losers
                </span>
              </div>
              {loadingStocks
                ? <div className="grid grid-cols-2 md:grid-cols-6 gap-2">{[...Array(12)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl bg-white/[0.04]" />)}</div>
                : <MarketHeatmap stocks={trendingStocks} />
              }
            </GlassCard>

            <GlassCard glow="accent" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-purple-400" /> AI Intelligence
                </h3>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <AIInsightsFeed
                indices={indices}
                stocks={trendingStocks}
                news={newsItems}
                sentimentLabel={sentiment?.label}
                fearGreed={fearGreed}
                volatility={volatility}
              />
            </GlassCard>
          </motion.div>

          {/* ===== LOCKED PRO ===== */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <LockedPremiumCard title="Advanced Technical Analysis" description="RSI, MACD, support/resistance, and AI-generated probability zones on every chart." />
            <LockedPremiumCard title="Real-Time Price Alerts" description="Push, email and SMS alerts when AI signals or price thresholds trigger across your watchlist." />
            <LockedPremiumCard title="Portfolio AI Optimizer" description="AI-driven allocation suggestions with risk-adjusted scoring tailored to your goals." />
          </motion.div>

          {/* ===== GLOBAL INDICES GRID ===== */}
          <motion.div variants={item}>
            <GlassCard className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
                <BarChart3 className="h-4 w-4 text-blue-400" /> Global Market Indices
              </h3>
              {loadingIndices ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg bg-white/[0.04]" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {indices.map(idx => (
                    <div key={idx.name} className={cn(
                      'p-3 rounded-xl border transition-all hover:-translate-y-0.5',
                      idx.changePercent >= 0
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    )}>
                      <p className="text-[10px] text-slate-500 truncate">{idx.name}</p>
                      <p className="font-mono font-bold text-sm mt-0.5 text-white">{idx.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {idx.changePercent >= 0
                          ? <TrendingUp className="h-3 w-3 text-emerald-400" />
                          : <TrendingDown className="h-3 w-3 text-red-400" />}
                        <span className={cn('font-mono text-[11px] font-semibold', idx.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* ===== CHARTS ===== */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white">Portfolio Performance</h3>
                <div className="flex gap-1">
                  {['1W', '1M', '3M', '1Y'].map(t => (
                    <button key={t} className={cn('px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
                      t === '1Y' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                    )}>{t}</button>
                  ))}
                </div>
              </div>
              {loadingPortfolio
                ? <Skeleton className="h-[220px] w-full rounded-lg bg-white/[0.04]" />
                : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(221, 83%, 60%)" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(221, 83%, 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(148,163,184,0.5)" fontSize={11} tickLine={false} />
                      <YAxis stroke="rgba(148,163,184,0.5)" fontSize={11} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 40%, 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: 'white' }} />
                      <Area type="monotone" dataKey="value" stroke="hsl(221, 83%, 60%)" fill="url(#portfolioGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )
              }
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="font-bold text-sm mb-4 text-white">Sector Performance</h3>
              {loadingSectors
                ? <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-5 w-full bg-white/[0.04]" />)}</div>
                : (
                  <div className="space-y-3">
                    {sectorHeatmap.map((sector: any) => (
                      <div key={sector.name} className="flex items-center justify-between gap-2">
                        <span className="text-[12px] text-slate-400 truncate max-w-[100px]">{sector.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', sector.change >= 0 ? 'bg-emerald-500' : 'bg-red-500')}
                              style={{ width: `${Math.min(Math.abs(sector.change) * 20, 100)}%` }}
                            />
                          </div>
                          <span className={cn('text-[11px] font-mono font-semibold w-14 text-right', sector.change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </GlassCard>
          </motion.div>

          {/* ===== BOTTOM ROW ===== */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Top Gainers
              </h3>
              {loadingStocks
                ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/[0.04]" />)}</div>
                : topGainers.length === 0
                  ? <p className="text-[12px] text-slate-500 py-4 text-center">No gainers today</p>
                  : (
                    <div className="space-y-2">
                      {topGainers.map(s => (
                        <div key={s.ticker} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                          <div>
                            <span className="font-mono font-bold text-[13px] text-white">{s.ticker}</span>
                            <p className="text-[10px] text-slate-500">{s.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-[13px] text-white">${s.price.toFixed(2)}</span>
                            <p className="text-[11px] text-emerald-400 font-mono font-semibold">+{s.changePercent.toFixed(2)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              }
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
                <Eye className="h-4 w-4 text-blue-400" /> Watchlist
              </h3>
              {loadingWatchlist
                ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/[0.04]" />)}</div>
                : watchlistItems.length === 0
                  ? <p className="text-[12px] text-slate-500 py-4 text-center">Your watchlist is empty.</p>
                  : (
                    <div className="space-y-2">
                      {watchlistItems.slice(0, 5).map((w: any) => (
                        <div key={w.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                          <div className="flex items-center gap-2">
                            {w.alert_enabled && <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                            <div>
                              <span className="font-mono font-bold text-[13px] text-white">{w.ticker}</span>
                              <p className="text-[10px] text-slate-500">{w.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromWatchlist.mutate(w.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
              }
            </GlassCard>

            <GlassCard glow="accent" className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
                <Brain className="h-4 w-4 text-purple-400" /> AI Recommendations
              </h3>
              {loadingStocks
                ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/[0.04]" />)}</div>
                : (
                  <div className="space-y-2">
                    {trendingStocks.slice(0, 4).map(s => (
                      <div key={s.ticker} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                        <div>
                          <span className="font-mono font-bold text-[13px] text-white">{s.ticker}</span>
                          <p className="text-[10px] text-slate-500">{s.sector}</p>
                        </div>
                        <span className={cn(
                          'text-[11px] font-bold px-2.5 py-1 rounded-full border',
                          s.recommendation === 'buy' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                          s.recommendation === 'sell' && 'bg-red-500/10 text-red-400 border-red-500/20',
                          s.recommendation === 'hold' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                        )}>
                          {s.recommendation?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              }
            </GlassCard>
          </motion.div>

          {/* ===== NEWS ===== */}
          <motion.div variants={item} className="pb-8">
            <GlassCard className="p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
                <BarChart3 className="h-4 w-4 text-slate-400" /> Latest Market News
              </h3>
              {loadingNews
                ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg bg-white/[0.04]" />)}</div>
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {newsItems.slice(0, 4).map(n => (
                      <div key={n.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/25 hover:bg-white/[0.05] transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <SentimentBadge sentiment={n.sentiment} size="sm" />
                          <span className="text-[10px] text-slate-600">{n.timestamp}</span>
                        </div>
                        <p className="text-[12px] font-medium text-slate-300 line-clamp-2 leading-relaxed">{n.title}</p>
                        <p className="text-[10px] text-slate-600 mt-1.5">{n.source}</p>
                      </div>
                    ))}
                  </div>
                )
              }
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
