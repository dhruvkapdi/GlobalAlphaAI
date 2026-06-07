import { motion } from 'framer-motion';
import { Flame, TrendingDown } from 'lucide-react';
import type { Stock } from '@/types/market';
import { cn } from '@/lib/utils';

interface Props {
  stocks: Stock[];
}

export const MarketHeatmap = ({ stocks }: Props) => {
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.slice(0, 6);
  const losers = sorted.slice(-6).reverse();

  const tile = (s: Stock) => {
    const positive = s.changePercent >= 0;
    const intensity = Math.min(Math.abs(s.changePercent) / 8, 1);
    return (
      <motion.div
        key={s.ticker}
        whileHover={{ scale: 1.04, y: -2 }}
        className={cn(
          'relative rounded-xl p-3 border overflow-hidden cursor-default',
          positive ? 'border-success/30' : 'border-destructive/30'
        )}
        style={{
          backgroundColor: positive
            ? `hsl(var(--success) / ${0.08 + intensity * 0.22})`
            : `hsl(var(--destructive) / ${0.08 + intensity * 0.22})`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-sm">{s.ticker}</span>
          <span className={cn('text-[10px] font-mono font-semibold', positive ? 'text-success' : 'text-destructive')}>
            {positive ? '+' : ''}{s.changePercent.toFixed(2)}%
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.name}</p>
        <p className="font-mono text-xs mt-1">${s.price.toFixed(2)}</p>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-3.5 w-3.5 text-success" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Gainers</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{gainers.map(tile)}</div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Losers</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{losers.map(tile)}</div>
      </div>
    </div>
  );
};
