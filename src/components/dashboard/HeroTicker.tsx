import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, BarChart3, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMarketIndices, useCryptoData, useCommodities, useTrendingStocks } from '@/hooks/useMarketData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

interface TickerItem {
  symbol: string;
  name: string;
  value: number;
  changePercent: number;
  change?: number;
  icon: any;
  iconColor: string;
  iconBg: string;
  format: 'currency' | 'number';
}

export const HeroTicker = () => {
  const { data: indices = [], isLoading: li } = useMarketIndices();
  const { data: crypto = [], isLoading: lc } = useCryptoData(1);
  const { data: commodities = [], isLoading: lcom } = useCommodities();
  const { data: stocks = [], isLoading: ls } = useTrendingStocks();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const loading = li || lc || lcom;

  const findIndex = (q: string) => indices.find(i => i.name?.toLowerCase().includes(q.toLowerCase()));
  const findCrypto = (s: string) => crypto.find((c: any) => c.symbol?.toUpperCase() === s.toUpperCase());
  const findCommodity = (s: string) => commodities.find((c: any) => c.ticker?.toUpperCase() === s.toUpperCase() || c.name?.toLowerCase().includes(s.toLowerCase()));

  const btc = findCrypto('BTC');
  const eth = findCrypto('ETH');
  const spy = findIndex('S&P') || findIndex('SPX');
  const ndx = findIndex('NASDAQ') || findIndex('NDX');
  const gold = findCommodity('GOLD') || findCommodity('XAU');

  // Build items list combining all sources
  const items: TickerItem[] = [
    ...(stocks.filter(s => s.price > 0).slice(0, 5).map(s => ({
      symbol: s.ticker,
      name: s.name,
      value: s.price,
      changePercent: s.changePercent,
      change: s.change,
      icon: BarChart3,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
      format: 'currency' as const,
    }))),
    btc && { symbol: 'BTC', name: 'Bitcoin', value: btc.price, changePercent: btc.change24h, icon: Bitcoin, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/15', format: 'currency' as const },
    eth && { symbol: 'ETH', name: 'Ethereum', value: eth.price, changePercent: eth.change24h, icon: Coins, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/15', format: 'currency' as const },
    spy && { symbol: 'S&P 500', name: 'S&P 500', value: spy.value, changePercent: spy.changePercent, icon: BarChart3, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/15', format: 'number' as const },
    ndx && { symbol: 'NASDAQ', name: 'Nasdaq 100', value: ndx.value, changePercent: ndx.changePercent, icon: TrendingUp, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/15', format: 'number' as const },
    gold && { symbol: 'GOLD', name: 'Gold (XAU)', value: (gold as any).price ?? 0, changePercent: (gold as any).change ?? 0, icon: DollarSign, iconColor: 'text-yellow-400', iconBg: 'bg-yellow-500/15', format: 'currency' as const },
  ].filter(Boolean) as TickerItem[];

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const by = 280;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -by : by, behavior: 'smooth' });
    setTimeout(() => {
      if (!scrollRef.current) return;
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(scrollRef.current.scrollLeft + scrollRef.current.clientWidth < scrollRef.current.scrollWidth - 4);
    }, 300);
  };

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.04]" />)}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll left button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-8 w-8 rounded-full bg-[hsl(222,40%,12%)] border border-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white shadow-lg transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={e => {
          const t = e.currentTarget;
          setCanScrollLeft(t.scrollLeft > 0);
          setCanScrollRight(t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
        }}
      >
        {items.map((it, idx) => {
          const positive = it.changePercent >= 0;
          const Icon = it.icon;
          return (
            <motion.div
              key={`${it.symbol}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                'relative flex-shrink-0 w-[200px] rounded-2xl border p-4 cursor-default transition-all duration-200 group overflow-hidden',
                'bg-[hsl(222,40%,8%)/0.8] backdrop-blur-xl',
                positive
                  ? 'border-emerald-500/20 hover:border-emerald-500/40'
                  : 'border-red-500/15 hover:border-red-500/30',
              )}
              style={{
                boxShadow: positive
                  ? '0 4px 24px -8px rgba(52, 211, 153, 0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                  : '0 4px 24px -8px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Hover glow */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl',
                positive ? 'bg-emerald-500/[0.04]' : 'bg-red-500/[0.04]'
              )} />

              <div className="relative z-10">
                {/* Header: icon + symbol + change badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', it.iconBg)}>
                      <Icon className={cn('h-4 w-4', it.iconColor)} />
                    </div>
                    <div>
                      <p className="font-bold text-[13px] text-white leading-tight">{it.symbol}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[80px]">{it.name}</p>
                    </div>
                  </div>
                </div>

                {/* Mini chart line placeholder */}
                <div className={cn('h-8 mb-2 opacity-60')}>
                  <svg viewBox="0 0 80 30" className="w-full h-full">
                    <polyline
                      points={positive
                        ? "0,25 15,20 30,22 45,14 60,10 80,5"
                        : "0,5 15,10 30,8 45,14 60,18 80,25"}
                      fill="none"
                      stroke={positive ? '#34d399' : '#f87171'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Price */}
                <p className="font-mono font-bold text-xl text-white leading-none">
                  {it.format === 'currency' && '$'}
                  {it.value >= 1000
                    ? it.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : it.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>

                {/* Change */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {positive ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                  <span className={cn('font-mono text-[12px] font-semibold', positive ? 'text-emerald-400' : 'text-red-400')}>
                    {it.change !== undefined && `${positive ? '+' : ''}$${Math.abs(it.change).toFixed(2)} `}
                    {positive ? '+' : ''}{it.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll right button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-8 w-8 rounded-full bg-[hsl(222,40%,12%)] border border-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white shadow-lg transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
