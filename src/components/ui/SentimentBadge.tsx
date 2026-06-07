import { Sentiment } from '@/types/market';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: Sentiment;
  size?: 'sm' | 'md' | 'lg';
}

export const SentimentBadge = ({ sentiment, size = 'md' }: SentimentBadgeProps) => {
  const config = {
    bullish: { label: 'Bullish', icon: TrendingUp, className: 'bg-success/10 text-success border-success/20' },
    bearish: { label: 'Bearish', icon: TrendingDown, className: 'bg-destructive/10 text-destructive border-destructive/20' },
    neutral: { label: 'Neutral', icon: Minus, className: 'bg-warning/10 text-warning border-warning/20' },
  }[sentiment];

  const sizeClass = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  }[size];

  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center rounded-full border font-medium', config.className, sizeClass)}>
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      {config.label}
    </span>
  );
};
