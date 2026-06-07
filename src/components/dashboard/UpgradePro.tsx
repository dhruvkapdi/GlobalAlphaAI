import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Check, X, Zap, Crown, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    icon: Sparkles,
    accent: 'from-muted to-muted/40',
    features: ['Global market overview', 'Basic AI signals', '5 watchlist items', 'Daily news digest'],
    cta: 'Current plan',
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$29',
    cadence: '/month',
    icon: Zap,
    accent: 'from-primary/30 to-accent/20',
    highlighted: true,
    features: ['Unlimited AI signals', 'Advanced candlestick analysis', 'Real-time alerts', 'Unlimited watchlists', 'Sector & sentiment heatmaps', 'Priority data refresh'],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact us',
    icon: Building2,
    accent: 'from-amber-500/20 to-orange-500/10',
    features: ['Everything in Pro', 'API & data exports', 'Custom AI models', 'Dedicated support', 'Team workspaces', 'SLA & compliance'],
    cta: 'Contact sales',
  },
];

export const UpgradeProDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-border/40">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-accent" />
          <DialogTitle className="text-2xl">Unlock Global Alpha AI Pro</DialogTitle>
        </div>
        <DialogDescription>
          Get institutional-grade AI signals, advanced charts and unlimited alerts.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {plans.map(p => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.name}
              whileHover={{ y: -3 }}
              className={cn(
                'relative rounded-xl border p-5 bg-gradient-to-br',
                p.accent,
                p.highlighted ? 'border-primary/50 shadow-[0_0_30px_-10px_hsl(var(--primary))]' : 'border-border/40'
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-2 right-4 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Most popular
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4" />
                <span className="font-semibold">{p.name}</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-xs text-muted-foreground ml-1">{p.cadence}</span>
              </div>
              <ul className="space-y-2 mb-5 min-h-[160px]">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                disabled={p.disabled}
                variant={p.highlighted ? 'default' : 'outline'}
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                {p.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>
      <p className="text-[10px] text-center text-muted-foreground mt-2">
        Open-source preview · Payment integration coming soon
      </p>
    </DialogContent>
  </Dialog>
);

export const LockedPremiumCard = ({ title, description }: { title: string; description: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-transparent p-5 cursor-pointer group"
        onClick={() => setOpen(true)}
      >
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lock className="h-4 w-4 text-accent" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-accent">Pro feature</span>
            </div>
            <Crown className="h-4 w-4 text-accent" />
          </div>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{description}</p>
          <Button size="sm" className="w-full h-8 text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Zap className="h-3 w-3 mr-1" /> Upgrade to unlock
          </Button>
        </div>
      </motion.div>
      <UpgradeProDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
