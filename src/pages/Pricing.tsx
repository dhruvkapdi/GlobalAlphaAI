import { motion } from 'framer-motion';
import { Check, X, Zap, Sparkles, Crown, Building2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useSubscription, PLAN_FEATURES, type PlanTier } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const tiers: {
  id: PlanTier;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  icon: any;
  features: { label: string; included: boolean }[];
  highlight?: boolean;
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'Explore global markets with core AI intelligence.',
    icon: Sparkles,
    features: [
      { label: 'Global market overview', included: true },
      { label: '5 watchlist items', included: true },
      { label: 'Basic AI signals', included: true },
      { label: 'Daily news digest', included: true },
      { label: 'Institutional AI signals', included: false },
      { label: 'Advanced sentiment analysis', included: false },
      { label: 'AI portfolio analyzer', included: false },
      { label: 'Macro intelligence reports', included: false },
      { label: 'Real-time alerts', included: false },
      { label: 'API access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    cadence: '/month',
    tagline: 'Institutional-grade AI for serious investors.',
    icon: Zap,
    highlight: true,
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Unlimited watchlist & alerts', included: true },
      { label: 'Institutional AI signals', included: true },
      { label: 'Advanced sentiment analysis', included: true },
      { label: 'AI portfolio analyzer', included: true },
      { label: 'Macro intelligence reports', included: true },
      { label: 'Real-time push alerts', included: true },
      { label: 'Priority data refresh', included: true },
      { label: 'Predictive analytics', included: true },
      { label: 'API access', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact us',
    tagline: 'For funds, family offices and trading desks.',
    icon: Building2,
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Dedicated AI compute', included: true },
      { label: 'Custom data feeds', included: true },
      { label: 'Team workspaces & SSO', included: true },
      { label: 'API & data exports', included: true },
      { label: 'Custom AI models', included: true },
      { label: 'White-label option', included: true },
      { label: 'Dedicated success manager', included: true },
      { label: '99.9% SLA', included: true },
      { label: 'Compliance & audit logs', included: true },
    ],
  },
];

export default function Pricing() {
  const { plan, setPlan } = useSubscription();

  const handleSelect = (tier: PlanTier) => {
    if (tier === plan) return;
    if (tier === 'enterprise') {
      toast({ title: 'Contact sales', description: 'Our team will reach out within 24 hours.' });
      return;
    }
    setPlan(tier);
    toast({
      title: tier === 'pro' ? '🎉 Welcome to Pro' : 'Switched to Free plan',
      description: tier === 'pro'
        ? 'All premium features unlocked across the platform.'
        : 'Premium features have been locked.',
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent mb-3"
          >
            <Sparkles className="h-2.5 w-2.5" /> Premium plans
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 gradient-text">Scale your edge</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            From curious investor to institutional desk — choose the intelligence layer that matches your strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            const current = tier.id === plan;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'relative rounded-2xl border p-6 flex flex-col',
                  tier.highlight
                    ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent shadow-[0_0_60px_-15px_hsl(var(--primary))]'
                    : 'border-white/[0.06] bg-card/40 backdrop-blur-xl'
                )}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-widest uppercase bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full shadow-lg">
                    Most popular
                  </span>
                )}
                {current && (
                  <span className="absolute top-4 right-4 text-[9px] font-semibold uppercase tracking-widest text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center',
                    tier.highlight ? 'bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30' : 'bg-foreground/[0.05]'
                  )}>
                    <Icon className={cn('h-4 w-4', tier.highlight ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  </div>
                  <span className="font-semibold text-lg">{tier.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{tier.tagline}</p>

                <div className="mb-5">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{tier.cadence}</span>
                </div>

                <Button
                  onClick={() => handleSelect(tier.id)}
                  disabled={current}
                  className={cn(
                    'w-full mb-5',
                    tier.highlight && !current && 'bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30 hover:opacity-90'
                  )}
                  variant={tier.highlight ? 'default' : 'outline'}
                  size="sm"
                >
                  {current
                    ? 'Current plan'
                    : tier.id === 'enterprise'
                      ? 'Contact sales'
                      : tier.id === 'free'
                        ? 'Downgrade'
                        : 'Upgrade to Pro'}
                </Button>

                <ul className="space-y-2.5 text-xs">
                  {tier.features.map(f => (
                    <li key={f.label} className={cn('flex items-start gap-2', !f.included && 'opacity-40')}>
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span className={cn(!f.included && 'line-through')}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[11px] text-muted-foreground/70">
            UI preview · Real payment processing is not enabled. Plan changes persist locally for demo purposes.
          </p>
        </div>

        {/* Comparison hint */}
        <div className="mt-8 glass-card p-5 text-xs flex items-start gap-3">
          <Crown className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Why Pro?</p>
            <p className="text-muted-foreground leading-relaxed">
              Pro members get the same AI signals used by quantitative funds — multi-factor sentiment, macro overlays,
              and real-time alert routing. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
