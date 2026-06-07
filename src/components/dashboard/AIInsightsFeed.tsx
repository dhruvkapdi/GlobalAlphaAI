import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import type { MarketIndex, Stock, NewsItem } from '@/types/market';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  text: string;
  tone: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  time: string;
}

interface Props {
  indices: MarketIndex[];
  stocks: Stock[];
  news: NewsItem[];
  sentimentLabel?: string;
  fearGreed: number;
  volatility: number;
}

export const AIInsightsFeed = ({ indices, stocks, news, sentimentLabel, fearGreed, volatility }: Props) => {
  const insights: Insight[] = [];

  const upPct = indices.length ? (indices.filter(i => i.changePercent > 0).length / indices.length) * 100 : 50;
  if (upPct > 65) insights.push({ id: 'breadth-bull', text: `Broad-based rally: ${upPct.toFixed(0)}% of global indices trading positive.`, tone: 'bullish', impact: 'high', time: 'Just now' });
  else if (upPct < 35) insights.push({ id: 'breadth-bear', text: `Risk-off tone: only ${upPct.toFixed(0)}% of indices in the green.`, tone: 'bearish', impact: 'high', time: 'Just now' });

  if (volatility > 2.5) insights.push({ id: 'vol-high', text: `Volatility elevated at ${volatility.toFixed(2)}% avg move — expect wider intraday swings.`, tone: 'neutral', impact: 'medium', time: '2m ago' });
  else if (volatility < 0.8) insights.push({ id: 'vol-low', text: `Calm market regime detected — compressed volatility often precedes breakouts.`, tone: 'neutral', impact: 'low', time: '2m ago' });

  if (fearGreed > 75) insights.push({ id: 'fg-greed', text: `Fear & Greed at ${fearGreed} — extreme greed historically precedes mean reversion.`, tone: 'bearish', impact: 'medium', time: '5m ago' });
  else if (fearGreed < 25) insights.push({ id: 'fg-fear', text: `Fear & Greed at ${fearGreed} — extreme fear has historically been a contrarian buy signal.`, tone: 'bullish', impact: 'medium', time: '5m ago' });

  const topGainer = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  if (topGainer && topGainer.changePercent > 3) insights.push({ id: 'gain', text: `${topGainer.ticker} leading the tape +${topGainer.changePercent.toFixed(2)}% on ${topGainer.sector || 'sector'} momentum.`, tone: 'bullish', impact: 'medium', time: '8m ago' });

  const topLoser = [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];
  if (topLoser && topLoser.changePercent < -3) insights.push({ id: 'loss', text: `${topLoser.ticker} under pressure ${topLoser.changePercent.toFixed(2)}% — watch for support break.`, tone: 'bearish', impact: 'medium', time: '12m ago' });

  const recentNews = news[0];
  if (recentNews) insights.push({ id: 'news', text: `${recentNews.sentiment === 'bullish' ? '🟢' : recentNews.sentiment === 'bearish' ? '🔴' : '⚪'} ${recentNews.title.slice(0, 90)}${recentNews.title.length > 90 ? '…' : ''}`, tone: recentNews.sentiment, impact: 'low', time: recentNews.timestamp || '15m ago' });

  if (sentimentLabel) insights.push({ id: 'sentiment', text: `AI model reads market mood as ${sentimentLabel.toLowerCase()} based on cross-asset signals.`, tone: sentimentLabel.toLowerCase().includes('bull') ? 'bullish' : sentimentLabel.toLowerCase().includes('bear') ? 'bearish' : 'neutral', impact: 'low', time: '20m ago' });

  if (insights.length === 0) insights.push({ id: 'idle', text: 'Markets in equilibrium. AI scanning for emerging signals…', tone: 'neutral', impact: 'low', time: 'Now' });

  const toneIcon = (t: Insight['tone']) => t === 'bullish' ? TrendingUp : t === 'bearish' ? TrendingDown : Activity;
  const toneColor = (t: Insight['tone']) => t === 'bullish' ? 'text-success' : t === 'bearish' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="space-y-2">
      {insights.slice(0, 6).map((ins, i) => {
        const Icon = toneIcon(ins.tone);
        return (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex gap-3 p-3 rounded-lg border border-border/30 bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all"
          >
            <div className={cn('h-7 w-7 shrink-0 rounded-lg flex items-center justify-center bg-muted/40', toneColor(ins.tone))}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed">{ins.text}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-[9px] text-accent">
                  <Sparkles className="h-2.5 w-2.5" /> AI
                </span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] text-muted-foreground">{ins.time}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className={cn(
                  'text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                  ins.impact === 'high' ? 'bg-destructive/10 text-destructive' :
                  ins.impact === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                )}>{ins.impact}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
