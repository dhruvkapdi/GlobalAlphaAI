import { useMarketIndices } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MarketTicker = () => {
  const { data: indices = [] } = useMarketIndices();
  const items = indices.length > 0 ? [...indices, ...indices] : [];
  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <div className="ticker-scroll flex items-center gap-10 whitespace-nowrap">
        {items.map((idx, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground/90 text-[13px]">{idx.name}</span>
            <span className="font-mono text-[13px] text-foreground/80">
              {idx.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className={cn(
              'flex items-center gap-0.5 font-mono text-[12px] font-semibold',
              idx.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {idx.changePercent >= 0
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
            </span>
            <span className="text-white/10">|</span>
          </div>
        ))}
      </div>
    </div>
  );
};
