import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeProDialog } from '@/components/dashboard/UpgradePro';
import { cn } from '@/lib/utils';

interface PremiumLockProps {
  children: ReactNode;
  title?: string;
  description?: string;
  blur?: boolean;
  className?: string;
  /** force lock even if user is pro (preview mode) */
  force?: boolean;
}

export const PremiumLock = ({
  children,
  title = 'Pro feature',
  description = 'Upgrade to unlock institutional-grade analytics.',
  blur = true,
  className,
  force = false,
}: PremiumLockProps) => {
  const { isPro } = useSubscription();
  const [open, setOpen] = useState(false);

  if (isPro && !force) return <>{children}</>;

  return (
    <>
      <div className={cn('relative overflow-hidden rounded-2xl', className)}>
        <div className={cn('pointer-events-none select-none', blur && 'blur-md opacity-40 saturate-50')}>
          {children}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-background/70 via-background/50 to-transparent backdrop-blur-sm"
        >
          <div className="h-12 w-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mb-3 shadow-[0_0_30px_-5px_hsl(var(--accent))]">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-accent mb-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> Pro feature
          </span>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground mb-3 max-w-xs">{description}</p>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="h-8 text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
          >
            <Zap className="h-3 w-3 mr-1" /> Upgrade to Pro
          </Button>
        </motion.div>
      </div>
      <UpgradeProDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
