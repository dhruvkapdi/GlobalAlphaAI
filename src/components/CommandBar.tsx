import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, BarChart3, Brain, TrendingUp, ArrowRightLeft,
  Newspaper, Settings, LayoutDashboard, Target
} from 'lucide-react';
import { countries } from '@/data/countries';
import { trendingStocks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const pages = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, type: 'page' },
  { path: '/globe', label: 'Globe Explorer', icon: Globe, type: 'page' },
  { path: '/ai-insights', label: 'AI Insights', icon: Brain, type: 'page' },
  { path: '/predictions', label: 'Predictions', icon: Target, type: 'page' },
  { path: '/markets', label: 'Global Markets', icon: BarChart3, type: 'page' },
  { path: '/exchange', label: 'Exchange Rates', icon: ArrowRightLeft, type: 'page' },
  { path: '/news', label: 'News & Sentiment', icon: Newspaper, type: 'page' },
  { path: '/settings', label: 'Settings', icon: Settings, type: 'page' },
];

interface CommandBarProps {
  open: boolean;
  onClose: () => void;
}

export const CommandBar = ({ open, onClose }: CommandBarProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { pages: pages.slice(0, 4), countries: [], stocks: [] };
    const q = query.toLowerCase();
    return {
      pages: pages.filter(p => p.label.toLowerCase().includes(q)),
      countries: countries.filter(c => c.name.toLowerCase().includes(q) || c.iso.toLowerCase().includes(q)).slice(0, 5),
      stocks: trendingStocks.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 5),
    };
  }, [query]);

  const handleSelect = (type: string, value: string) => {
    if (type === 'page') navigate(value);
    else if (type === 'country') navigate('/globe');
    else if (type === 'stock') navigate('/predictions');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
          >
            <div className="rounded-2xl shadow-2xl overflow-hidden" style={{background: "rgba(10,14,35,0.95)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.1)"}}>                
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search stocks, countries, pages..."
                  className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-slate-500"
                />
                <kbd className="text-[9px] text-muted-foreground/50 border border-border/30 rounded px-1.5 py-0.5">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-auto p-2 space-y-2" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.1) transparent"}}>
                {results.pages.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-semibold px-2 py-1">Pages</div>
                    {results.pages.map(p => (
                      <button
                        key={p.path}
                        onClick={() => handleSelect('page', p.path)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/[0.07] transition-colors text-left text-slate-300"
                      >
                        <p.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.countries.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-semibold px-2 py-1">Countries</div>
                    {results.countries.map(c => (
                      <button
                        key={c.iso}
                        onClick={() => handleSelect('country', c.iso)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/[0.07] transition-colors text-left text-slate-300"
                      >
                        <span className="text-base">{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{c.iso}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.stocks.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-semibold px-2 py-1">Stocks</div>
                    {results.stocks.map(s => (
                      <button
                        key={s.ticker}
                        onClick={() => handleSelect('stock', s.ticker)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/[0.07] transition-colors text-left text-slate-300"
                      >
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{s.ticker}</span>
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className={cn('text-xs font-mono ml-auto', s.changePercent >= 0 ? 'text-success' : 'text-destructive')}>
                          {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!results.pages.length && !results.countries.length && !results.stocks.length && (
                  <div className="text-center py-8 text-slate-500 text-sm">No results found</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
