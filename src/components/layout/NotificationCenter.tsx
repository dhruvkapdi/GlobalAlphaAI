import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, TrendingUp, TrendingDown, Brain, Sparkles, AlertTriangle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

type NotifType = 'ai' | 'market' | 'portfolio' | 'upgrade' | 'signal';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const SEED: Notif[] = [
  { id: '1', type: 'signal', title: 'NVDA momentum signal', body: 'AI Copilot flagged a bullish continuation pattern with 74% confidence.', time: '2m ago', read: false },
  { id: '2', type: 'market', title: 'S&P 500 +1.2%', body: 'Risk-on rotation as VIX drops below 14. Tech leading sectors.', time: '14m ago', read: false },
  { id: '3', type: 'portfolio', title: 'Portfolio volatility rose', body: 'Your 30D realized vol moved from 11% to 16%. Consider hedging.', time: '1h ago', read: false },
  { id: '4', type: 'ai', title: 'Daily brief ready', body: 'Macro: USD softening, EM equities outperforming. Open AI Copilot.', time: '3h ago', read: true },
  { id: '5', type: 'upgrade', title: 'Unlock Pro insights', body: 'You hit your free signal cap. Upgrade for unlimited AI analysis.', time: '1d ago', read: true },
];

const ICON: Record<NotifType, any> = {
  ai: Brain, market: TrendingUp, portfolio: TrendingDown, upgrade: Sparkles, signal: AlertTriangle,
};
const COLOR: Record<NotifType, string> = {
  ai: 'text-accent', market: 'text-success', portfolio: 'text-warning', upgrade: 'text-primary', signal: 'text-primary',
};

type Filter = 'all' | 'unread' | NotifType;

export const NotificationCenter = () => {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [filter, setFilter] = useState<Filter>('all');
  const unread = items.filter(i => !i.read).length;

  const filtered = items.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !i.read;
    return i.type === filter;
  });

  const markAll = () => setItems(prev => prev.map(i => ({ ...i, read: true })));
  const clearAll = () => setItems([]);
  const toggleRead = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, read: !i.read } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-1.5 rounded-md hover:bg-foreground/[0.05] text-muted-foreground hover:text-foreground transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--glow-primary)/0.9)]"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0 glass-card-strong border-white/[0.08] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[10px] text-muted-foreground">{unread} unread</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={markAll} disabled={!unread} className="text-[10px] px-2 py-1 rounded-md hover:bg-foreground/[0.05] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
              Mark all read
            </button>
            <button onClick={clearAll} className="text-[10px] px-2 py-1 rounded-md hover:bg-foreground/[0.05] text-muted-foreground hover:text-destructive transition-colors">
              Clear
            </button>
          </div>
        </div>

        <div className="px-2 pt-2 flex gap-1 overflow-x-auto">
          {(['all', 'unread', 'ai', 'signal', 'portfolio', 'market'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'text-[10px] capitalize px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap',
                filter === f
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-white/[0.06] text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                <Check className="h-5 w-5 mx-auto mb-2 opacity-50" />
                You're all caught up
              </div>
            ) : (
              filtered.map(n => {
                const Icon = ICON[n.type];
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
                    onClick={() => toggleRead(n.id)}
                    className={cn(
                      'group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1',
                      n.read ? 'hover:bg-foreground/[0.03]' : 'bg-primary/[0.04] hover:bg-primary/[0.07]'
                    )}
                  >
                    {!n.read && <span className="absolute left-1 top-4 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--glow-primary)/0.8)]" />}
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-foreground/[0.04]', COLOR[n.type])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.body}</p>
                      <p className="text-[9px] text-muted-foreground/70 mt-1 uppercase tracking-wider">{n.time}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-foreground/[0.05] text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Dismiss"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
