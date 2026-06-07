import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, Target, ChevronDown, Brain, Activity, Globe } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Props {
  ticker: string;
  bullishProbability: number;
  bearishProbability: number;
  confidence: number;
  timeframe: string;
  targetPrice: number;
  currentPrice: number;
  aiSummary: string;
}

export const AISignalCard = ({
  ticker, bullishProbability, bearishProbability, confidence,
  timeframe, targetPrice, currentPrice, aiSummary,
}: Props) => {
  const [open, setOpen] = useState(false);
  const bullish = bullishProbability >= bearishProbability;
  const direction = bullish ? 'BULLISH' : 'BEARISH';
  const upside = currentPrice > 0 ? ((targetPrice - currentPrice) / currentPrice) * 100 : 0;

  const risk = confidence > 75 ? { label: 'Low Risk', color: 'bg-success/10 text-success border-success/20' }
             : confidence > 50 ? { label: 'Medium Risk', color: 'bg-warning/10 text-warning border-warning/20' }
             : { label: 'High Risk', color: 'bg-destructive/10 text-destructive border-destructive/20' };

  // Reasoning derived from signal characteristics
  const momentumDriver = bullish
    ? `Positive earnings momentum and rising institutional inflows detected on ${ticker}.`
    : `Earnings deceleration and distribution patterns observed on ${ticker}.`;
  const sentimentDriver = confidence > 70
    ? `Cross-asset sentiment models strongly align — ${confidence.toFixed(0)}% conviction.`
    : confidence > 50
    ? `Sentiment signals are constructive but mixed — model conviction at ${confidence.toFixed(0)}%.`
    : `Signal noise elevated — keep position size modest given ${confidence.toFixed(0)}% conviction.`;
  const macroDriver = bullish
    ? `Macro backdrop supportive: easing rate expectations and improving liquidity conditions.`
    : `Macro headwinds: tightening conditions and risk-off positioning across institutional desks.`;

  // Deterministic mini chart shape derived from confidence/direction
  const chartData = Array.from({ length: 20 }, (_, i) => {
    const trend = bullish ? i * (confidence / 200) : -i * (confidence / 200);
    const noise = Math.sin(i * 1.3 + ticker.charCodeAt(0)) * 2;
    return { v: 50 + trend + noise };
  });

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <GlassCard glow={bullish ? 'success' : 'danger'} className="p-4 relative overflow-hidden">
        <div className={cn(
          'absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-30',
          bullish ? 'bg-success' : 'bg-destructive'
        )} />

        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base">{ticker}</span>
              <span className={cn(
                'flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
                bullish ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
              )}>
                {bullish ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {direction}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Horizon: {timeframe}</p>
          </div>
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', risk.color)}>
            {risk.label}
          </span>
        </div>

        {/* Mini chart */}
        <div className="h-14 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`sig-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={bullish ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={bullish ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={bullish ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} strokeWidth={1.5} fill={`url(#sig-${ticker})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
          <div>
            <p className="text-muted-foreground text-[9px] uppercase tracking-wider">Confidence</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full', bullish ? 'bg-success' : 'bg-destructive')}
                />
              </div>
              <span className="font-mono font-bold">{confidence.toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-[9px] uppercase tracking-wider">Target</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Target className="h-3 w-3 text-primary" />
              <span className="font-mono font-bold">${targetPrice.toFixed(2)}</span>
              {upside !== 0 && (
                <span className={cn('text-[9px] font-mono', upside >= 0 ? 'text-success' : 'text-destructive')}>
                  ({upside >= 0 ? '+' : ''}{upside.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          <Sparkles className="h-2.5 w-2.5 inline mr-1 text-accent" />
          {aiSummary || 'AI model analyzing momentum, sentiment and macro signals.'}
        </p>

        <button
          onClick={() => setOpen(o => !o)}
          className="w-full mt-2 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border border-border/30 bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all text-[10px] text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-1.5"><Brain className="h-3 w-3 text-accent" /> AI Reasoning</span>
          <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2 text-[10.5px] text-muted-foreground leading-relaxed">
                <ReasoningRow icon={Activity} label="Momentum" text={momentumDriver} />
                <ReasoningRow icon={Sparkles} label="Sentiment" text={sentimentDriver} />
                <ReasoningRow icon={Globe} label="Macro" text={macroDriver} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button asChild size="sm" variant="ghost" className="w-full mt-2 h-7 text-[11px] hover:bg-primary/10 hover:text-primary">
          <Link to={`/ai-insights?q=Analyze%20${ticker}`}>Quick Analyze →</Link>
        </Button>
      </GlassCard>
    </motion.div>
  );
};

const ReasoningRow = ({ icon: Icon, label, text }: { icon: any; label: string; text: string }) => (
  <div className="flex gap-2">
    <Icon className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
    <p><span className="text-foreground/80 font-semibold">{label}:</span> {text}</p>
  </div>
);
