import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  value: number; // 0-100 (0 extreme fear, 100 extreme greed)
  label?: string;
  title?: string;
}

export const FearGreedMeter = ({ value, label, title = 'Fear & Greed' }: Props) => {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180 - 90;

  const status =
    clamped < 20 ? { text: 'Extreme Fear', color: 'text-destructive' } :
    clamped < 40 ? { text: 'Fear', color: 'text-warning' } :
    clamped < 60 ? { text: 'Neutral', color: 'text-muted-foreground' } :
    clamped < 80 ? { text: 'Greed', color: 'text-success' } :
                   { text: 'Extreme Greed', color: 'text-success' };

  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="fgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="50%" stopColor="hsl(var(--warning))" />
              <stop offset="100%" stopColor="hsl(var(--success))" />
            </linearGradient>
          </defs>
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#fgGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
          <motion.line
            x1="100" y1="90" x2="100" y2="25"
            stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"
            style={{ transformOrigin: '100px 90px' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          />
          <circle cx="100" cy="90" r="6" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="2" />
        </svg>
      </div>
      <p className="font-mono text-2xl font-bold mt-1">{clamped}</p>
      <p className={cn('text-[11px] font-semibold', status.color)}>{label || status.text}</p>
    </div>
  );
};
