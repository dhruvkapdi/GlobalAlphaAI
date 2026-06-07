import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, Sunrise, Coffee } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface Props {
  sentiment?: string;
  fearGreed: number;
  volatility: number;
  topGainer?: { ticker: string; changePercent: number } | null;
}

const greetingFor = (h: number) => {
  if (h < 5) return { text: 'Working late', Icon: Moon };
  if (h < 12) return { text: 'Good morning', Icon: Sunrise };
  if (h < 17) return { text: 'Good afternoon', Icon: Sun };
  if (h < 21) return { text: 'Good evening', Icon: Coffee };
  return { text: 'Good night', Icon: Moon };
};

export const PersonalGreeting = ({ sentiment, fearGreed, volatility, topGainer }: Props) => {
  const { data: profile } = useProfile();
  const { prefs } = useUserPreferences();
  const h = new Date().getHours();
  const { text, Icon } = greetingFor(h);
  const name = profile?.first_name || 'Investor';

  // Compose the daily AI briefing
  const tone = (sentiment || 'neutral').toLowerCase();
  const moodLine = tone.includes('bull')
    ? `Markets are leaning bullish with positive breadth and constructive sentiment.`
    : tone.includes('bear')
    ? `Markets are leaning bearish — risk appetite is muted and defensive sectors are firming.`
    : `Markets are mixed with no decisive directional bias from the AI model.`;

  const volLine = volatility > 2.5
    ? `Expect wider intraday swings — volatility is elevated at ${volatility.toFixed(2)}%.`
    : volatility < 0.8
    ? `Volatility is compressed at ${volatility.toFixed(2)}% — coiled tape often precedes breakouts.`
    : `Volatility sits at a normal ${volatility.toFixed(2)}% — trade size accordingly.`;

  const fgLine = fearGreed > 75
    ? `Fear & Greed at ${fearGreed} flags extreme greed — consider trimming into strength.`
    : fearGreed < 25
    ? `Fear & Greed at ${fearGreed} flags extreme fear — historically a contrarian buy zone.`
    : `Sentiment is balanced (F&G ${fearGreed}) with no extremes to fade.`;

  const gainerLine = topGainer
    ? `Today's standout: ${topGainer.ticker} +${topGainer.changePercent.toFixed(2)}%.`
    : '';

  const interestsLine = prefs.interests.length
    ? `Tracking ${prefs.interests.length} market${prefs.interests.length > 1 ? 's' : ''} aligned to your ${prefs.risk || 'balanced'} profile.`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 via-card/50 to-transparent backdrop-blur-2xl p-5 md:p-6"
    >
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-accent/15 blur-[100px]" />
      <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-primary/15 blur-[100px]" />
      <div className="relative flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {text}, <span className="gradient-text">{name}</span>
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 animate-pulse" /> AI Daily Brief
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {moodLine} {volLine} {fgLine} {gainerLine}
            {interestsLine && <> <span className="text-foreground/80">{interestsLine}</span></>}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
