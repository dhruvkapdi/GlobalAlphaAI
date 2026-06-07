import { Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  tier?: 'pro' | 'enterprise';
  size?: 'sm' | 'md';
  className?: string;
}

export const PremiumBadge = ({ tier = 'pro', size = 'sm', className }: PremiumBadgeProps) => {
  const Icon = tier === 'enterprise' ? Crown : Sparkles;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-widest',
        'bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-accent/30 text-accent',
        'shadow-[0_0_18px_-4px_hsl(var(--accent))]',
        size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {tier === 'enterprise' ? 'Enterprise' : 'Pro'}
    </span>
  );
};
