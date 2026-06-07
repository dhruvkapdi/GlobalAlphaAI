import { cn } from '@/lib/utils';

interface RiskMeterProps {
  level: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
}

export const RiskMeter = ({ level, label, size = 'md' }: RiskMeterProps) => {
  const getColor = (l: number) => {
    if (l < 25) return 'bg-success';
    if (l < 50) return 'bg-warning';
    if (l < 75) return 'bg-destructive/80';
    return 'bg-destructive';
  };

  return (
    <div className={cn('space-y-1', size === 'sm' ? 'w-20' : 'w-full')}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className={cn('rounded-full bg-muted overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-700', getColor(level))}
          style={{ width: `${level}%` }}
        />
      </div>
      {size === 'md' && <span className="text-xs font-mono text-muted-foreground">{level}/100</span>}
    </div>
  );
};
