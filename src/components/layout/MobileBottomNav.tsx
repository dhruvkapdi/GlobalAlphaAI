import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Globe, Brain, Bookmark, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const items = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/globe', label: 'Globe', icon: Globe },
  { path: '/ai-insights', label: 'AI', icon: Brain },
  { path: '/markets', label: 'Markets', icon: BarChart3 },
  { path: '/watchlist', label: 'Saved', icon: Bookmark },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
      <div className="mx-auto max-w-md rounded-2xl border border-white/[0.08] bg-card/70 backdrop-blur-2xl shadow-2xl shadow-black/50 px-2 py-1.5">
        <div className="flex items-center justify-around relative">
          {items.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl flex-1 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    style={{ boxShadow: '0 0 16px -2px hsl(var(--glow-primary) / 0.45)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4 relative z-10" />
                <span className="text-[9px] font-medium relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
