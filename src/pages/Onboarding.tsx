import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Bitcoin, DollarSign, Wheat, Layers, Globe,
  Shield, Scale, Flame, Zap, Clock, Calendar, Brain, ArrowRight, Check, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useProfile } from '@/hooks/useProfile';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { cn } from '@/lib/utils';

const INTERESTS = [
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
  { id: 'forex', label: 'Forex', icon: DollarSign },
  { id: 'commodities', label: 'Commodities', icon: Wheat },
  { id: 'etfs', label: 'ETFs', icon: Layers },
  { id: 'global', label: 'Global Markets', icon: Globe },
];

const RISKS = [
  { id: 'conservative', label: 'Conservative', desc: 'Capital preservation, low volatility', icon: Shield },
  { id: 'balanced', label: 'Balanced', desc: 'Steady growth with measured risk', icon: Scale },
  { id: 'aggressive', label: 'Aggressive', desc: 'High growth, high volatility tolerance', icon: Flame },
] as const;

const STYLES = [
  { id: 'day', label: 'Day Trading', desc: 'Intraday momentum and scalping', icon: Zap },
  { id: 'swing', label: 'Swing Trading', desc: 'Multi-day to multi-week positions', icon: Clock },
  { id: 'long', label: 'Long-term Investing', desc: 'Buy-and-hold conviction plays', icon: Calendar },
  { id: 'ai-assisted', label: 'AI-assisted', desc: 'Let Global Alpha AI guide decisions', icon: Brain },
] as const;

const FAVORITES = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'BTC', 'ETH', 'SPY', 'QQQ', 'GLD'];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const { prefs, update } = useUserPreferences();
  const { data: profile } = useProfile();

  const toggle = (key: 'interests' | 'favorites', val: string) => {
    const list = prefs[key];
    update({ [key]: list.includes(val) ? list.filter(x => x !== val) : [...list, val] } as any);
  };

  const next = () => setStep(s => Math.min(s + 1, 5));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2200));
    update({ onboardedAt: new Date().toISOString() });
    navigate('/dashboard');
  };

  const canProceed = () => {
    if (step === 1) return prefs.interests.length > 0;
    if (step === 2) return !!prefs.risk;
    if (step === 3) return !!prefs.style;
    if (step === 4) return prefs.favorites.length > 0;
    return true;
  };

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AmbientBackground variant="hero" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-16 min-h-screen flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">Personalization</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">Step {step + 1} of {totalSteps}</span>
          </div>
          <div className="h-1 rounded-full bg-card/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {/* Step 0 — Welcome */}
              {step === 0 && (
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className="inline-flex h-20 w-20 rounded-3xl gradient-bg items-center justify-center shadow-2xl shadow-primary/40 mb-6"
                  >
                    <Zap className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Welcome{profile?.first_name ? `, ${profile.first_name}` : ''} to <span className="gradient-text">Global Alpha AI</span>
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                    Let's tailor your AI market intelligence terminal to your goals and trading style. This takes about 60 seconds.
                  </p>
                </div>
              )}

              {/* Step 1 — Interests */}
              {step === 1 && (
                <StepWrapper title="What markets interest you?" subtitle="Pick all that apply — we'll prioritize signals from these.">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INTERESTS.map(({ id, label, icon: Icon }) => {
                      const active = prefs.interests.includes(id);
                      return (
                        <SelectCard key={id} active={active} onClick={() => toggle('interests', id)}>
                          <Icon className={cn('h-6 w-6 mb-2', active ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="text-sm font-medium">{label}</span>
                        </SelectCard>
                      );
                    })}
                  </div>
                </StepWrapper>
              )}

              {/* Step 2 — Risk */}
              {step === 2 && (
                <StepWrapper title="What's your risk profile?" subtitle="This calibrates how AI signals are filtered and ranked.">
                  <div className="space-y-2">
                    {RISKS.map(({ id, label, desc, icon: Icon }) => {
                      const active = prefs.risk === id;
                      return (
                        <SelectCard key={id} active={active} onClick={() => update({ risk: id })} row>
                          <Icon className={cn('h-6 w-6 flex-shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          {active && <Check className="h-4 w-4 text-primary" />}
                        </SelectCard>
                      );
                    })}
                  </div>
                </StepWrapper>
              )}

              {/* Step 3 — Style */}
              {step === 3 && (
                <StepWrapper title="What's your trading style?" subtitle="We'll surface horizons that match how you trade.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {STYLES.map(({ id, label, desc, icon: Icon }) => {
                      const active = prefs.style === id;
                      return (
                        <SelectCard key={id} active={active} onClick={() => update({ style: id })}>
                          <Icon className={cn('h-6 w-6 mb-2', active ? 'text-primary' : 'text-muted-foreground')} />
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </SelectCard>
                      );
                    })}
                  </div>
                </StepWrapper>
              )}

              {/* Step 4 — Favorites */}
              {step === 4 && (
                <StepWrapper title="Pick your favorite assets" subtitle="Add at least one. You can always edit these later.">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {FAVORITES.map(t => {
                      const active = prefs.favorites.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggle('favorites', t)}
                          className={cn(
                            'font-mono text-sm px-4 py-2 rounded-xl border transition-all',
                            active
                              ? 'bg-primary/15 border-primary/50 text-primary shadow-[0_0_20px_-4px_hsl(var(--glow-primary)/0.4)]'
                              : 'bg-card/40 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </StepWrapper>
              )}

              {/* Step 5 — Generate */}
              {step === 5 && (
                <div className="text-center py-10">
                  {!generating ? (
                    <>
                      <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center mb-5 border border-primary/30">
                        <Check className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3">You're all set</h2>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Global Alpha AI will now personalize your terminal with signals matched to your interests, risk profile, and style.
                      </p>
                      <Button onClick={finish} size="lg" className="gradient-bg shadow-lg shadow-primary/40">
                        Generate my dashboard <Sparkles className="h-4 w-4 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="inline-flex h-20 w-20 rounded-3xl gradient-bg items-center justify-center shadow-2xl shadow-primary/50"
                      >
                        <Brain className="h-10 w-10 text-primary-foreground" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Calibrating AI models…</h2>
                        <motion.p
                          key={Date.now()}
                          className="text-sm text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Analyzing {prefs.favorites.length} assets across {prefs.interests.length} markets
                        </motion.p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!generating && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/30">
            <Button variant="ghost" onClick={back} disabled={step === 0} className="text-muted-foreground">
              Back
            </Button>
            <button
              onClick={() => { update({ onboardedAt: new Date().toISOString() }); navigate('/dashboard'); }}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            {step < 5 ? (
              <Button onClick={next} disabled={!canProceed()} className="gradient-bg">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : <div className="w-20" />}
          </div>
        )}
      </div>
    </div>
  );
};

const StepWrapper = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <div>
    <div className="text-center mb-6">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </div>
);

const SelectCard = ({ active, onClick, children, row = false }: { active: boolean; onClick: () => void; children: React.ReactNode; row?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      'relative p-4 rounded-xl border transition-all duration-300 group',
      row ? 'flex items-center gap-4 w-full' : 'flex flex-col items-center text-center',
      active
        ? 'bg-primary/10 border-primary/50 shadow-[0_0_24px_-6px_hsl(var(--glow-primary)/0.5)]'
        : 'bg-card/40 border-border/40 hover:bg-card/70 hover:border-primary/30'
    )}
  >
    {children}
  </button>
);

export default Onboarding;
