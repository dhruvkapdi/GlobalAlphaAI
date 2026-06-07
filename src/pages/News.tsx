import { useState } from 'react';
import { Newspaper, Search, ExternalLink, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { SentimentBadge } from '@/components/ui/SentimentBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNews } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';

const categories = ['All', 'Markets', 'Technology', 'Economy', 'Crypto', 'Commodities'];
const sentimentFilters = ['All', 'Bullish', 'Bearish', 'Neutral'];

const News = () => {
  const { data: newsItems = [], isLoading } = useNews();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSentiment, setActiveSentiment] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = newsItems.filter((n: any) => {
    const matchCat = activeCategory === 'All' || n.category === activeCategory;
    const matchSent = activeSentiment === 'All' || n.sentiment === activeSentiment.toLowerCase();
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSent && matchSearch;
  });

  const sentimentCounts = {
    bullish: newsItems.filter((n: any) => n.sentiment === 'bullish').length,
    neutral: newsItems.filter((n: any) => n.sentiment === 'neutral').length,
    bearish: newsItems.filter((n: any) => n.sentiment === 'bearish').length,
  };
  const total = newsItems.length || 1;

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return ts;
    }
  };

  const sentimentIcon = (s: string) => {
    if (s === 'bullish') return <TrendingUp className="h-3 w-3 text-success" />;
    if (s === 'bearish') return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-warning" />;
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" /> News & Sentiment
            </h1>
            <p className="text-muted-foreground text-sm">AI-analyzed financial news with real-time sentiment scoring</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/60 border-border/50 h-9 text-sm" />
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GlassCard className="p-4 md:col-span-2">
            <h3 className="font-semibold text-sm mb-3">Overall Market Sentiment</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden flex">
                <div className="bg-success h-full transition-all" style={{ width: `${(sentimentCounts.bullish / total) * 100}%` }} />
                <div className="bg-warning h-full transition-all" style={{ width: `${(sentimentCounts.neutral / total) * 100}%` }} />
                <div className="bg-destructive h-full transition-all" style={{ width: `${(sentimentCounts.bearish / total) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-success font-mono">{Math.round((sentimentCounts.bullish / total) * 100)}% Bullish</span>
              <span className="text-warning font-mono">{Math.round((sentimentCounts.neutral / total) * 100)}% Neutral</span>
              <span className="text-destructive font-mono">{Math.round((sentimentCounts.bearish / total) * 100)}% Bearish</span>
            </div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{sentimentCounts.bullish}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Bullish Articles</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{sentimentCounts.bearish}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Bearish Articles</div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={cn('px-3 py-1.5 rounded-full text-xs transition-colors', activeCategory === c ? 'bg-primary/10 text-primary border border-primary/30 font-medium' : 'text-muted-foreground border border-border/40 hover:border-primary/20')}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {sentimentFilters.map(s => (
              <button key={s} onClick={() => setActiveSentiment(s)} className={cn('px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1', activeSentiment === s ? 'bg-primary/10 text-primary border border-primary/30 font-medium' : 'text-muted-foreground border border-border/40 hover:border-primary/20')}>
                {s !== 'All' && sentimentIcon(s.toLowerCase())}
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No articles match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((n: any) => (
              <GlassCard key={n.id} hover className="p-5 group">
                <div className="flex items-center gap-2 mb-3">
                  <SentimentBadge sentiment={n.sentiment} size="sm" />
                  <span className="text-[10px] text-muted-foreground font-mono">{formatTime(n.timestamp)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 font-medium">{n.category}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2 leading-snug group-hover:text-primary transition-colors">{n.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{n.summary}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent" /> {n.source}
                  </span>
                  {n.url && (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                      Read more <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Total count */}
        <div className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} of {newsItems.length} articles
        </div>
      </div>
    </AppLayout>
  );
};

export default News;
