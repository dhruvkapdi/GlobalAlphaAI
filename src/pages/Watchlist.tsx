import { Bookmark, Trash2, Globe, TrendingUp, Loader2, Pin, Bell, BellOff, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { SentimentBadge } from '@/components/ui/SentimentBadge';
import { Button } from '@/components/ui/button';
import { useUserWatchlist, useRemoveFromWatchlist } from '@/hooks/useUserWatchlist';
import { useCountries } from '@/hooks/useMarketData';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistPins, useWatchlistAlerts } from '@/hooks/useUserPreferences';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const computeAIScore = (c: any) => {
  if (!c) return 50;
  const sentimentBoost = c.aiSentiment === 'bullish' ? 18 : c.aiSentiment === 'bearish' ? -18 : 0;
  const riskPenalty = c.riskLevel === 'high' ? -12 : c.riskLevel === 'low' ? 8 : 0;
  const gdp = (c.gdpGrowth || 0) * 2.5;
  const opp = (c.opportunityScore || 50) * 0.4;
  return Math.max(5, Math.min(98, Math.round(50 + sentimentBoost + riskPenalty + gdp + opp - 20)));
};

const Watchlist = () => {
  const { user } = useAuth();
  const { data: watchlist = [], isLoading } = useUserWatchlist();
  const { data: countries = [] } = useCountries();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const { pins, toggle: togglePin } = useWatchlistPins();
  const { alerts, toggle: toggleAlert } = useWatchlistAlerts();

  const enrichedItems = watchlist
    .map((w: any) => {
      const country = countries.find((c: any) => c.iso === w.country_iso);
      return { ...w, country, aiScore: computeAIScore(country) };
    })
    .sort((a: any, b: any) => {
      const pa = pins.includes(a.id) ? 1 : 0;
      const pb = pins.includes(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return b.aiScore - a.aiScore;
    });

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-3">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-bold">Sign in to view your Watchlist</h2>
            <p className="text-muted-foreground text-sm">Save countries and markets to track them here.</p>
            <Link to="/signin"><Button>Sign In</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-[1200px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" /> My Watchlist
          </h1>
          <p className="text-muted-foreground text-sm">
            {watchlist.length} saved {watchlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Globe className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground">No items in watchlist</h3>
            <p className="text-sm text-muted-foreground/70 text-center max-w-md">
              Go to the Globe Explorer and click on a country, then tap "Add to Watchlist" to start tracking markets.
            </p>
            <Link to="/globe"><Button variant="outline"><Globe className="h-4 w-4 mr-2" /> Explore Globe</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrichedItems.map((item: any) => {
              const isPinned = pins.includes(item.id);
              const isAlerted = !!alerts[item.id];
              const scoreColor = item.aiScore >= 70 ? 'text-success' : item.aiScore >= 40 ? 'text-warning' : 'text-destructive';
              return (
              <GlassCard key={item.id} hover className={cn('p-5 relative', isPinned && 'ring-1 ring-primary/40')}>
                {isPinned && (
                  <span className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40">
                    <Pin className="h-2.5 w-2.5" />
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.country?.flag || '🌍'}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{item.ticker}</span>
                        {item.country_iso && (
                          <span className="text-[10px] text-muted-foreground">• {item.country_iso}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost" size="icon"
                      className={cn('h-7 w-7', isPinned ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
                      onClick={() => togglePin(item.id)}
                      title={isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className={cn('h-3.5 w-3.5', isPinned && 'fill-current')} />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className={cn('h-7 w-7', isAlerted ? 'text-accent' : 'text-muted-foreground hover:text-accent')}
                      onClick={() => {
                        toggleAlert(item.id);
                        toast({ title: isAlerted ? 'Alerts off' : 'Alerts on', description: isAlerted ? 'You will no longer receive alerts.' : 'You\'ll be notified of major moves and AI signals.' });
                      }}
                      title="Toggle alerts"
                    >
                      {isAlerted ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromWatchlist.mutate(item.id)}
                      disabled={removeFromWatchlist.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* AI Score */}
                <div className="mb-3 p-2.5 rounded-lg bg-card/40 border border-border/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-accent" /> AI Score
                    </span>
                    <span className={cn('text-sm font-mono font-bold', scoreColor)}>{item.aiScore}<span className="text-muted-foreground text-[10px]">/100</span></span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full', item.aiScore >= 70 ? 'bg-success' : item.aiScore >= 40 ? 'bg-warning' : 'bg-destructive')}
                      style={{ width: `${item.aiScore}%` }}
                    />
                  </div>
                </div>

                {item.country && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sentiment</span>
                      <SentimentBadge sentiment={item.country.aiSentiment} size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">GDP Growth</span>
                      <span className={cn('font-mono font-semibold', item.country.gdpGrowth >= 0 ? 'text-success' : 'text-destructive')}>
                        {item.country.gdpGrowth >= 0 ? '+' : ''}{item.country.gdpGrowth}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Risk</span>
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        item.country.riskLevel === 'low' && 'bg-success/10 text-success',
                        item.country.riskLevel === 'medium' && 'bg-warning/10 text-warning',
                        item.country.riskLevel === 'high' && 'bg-destructive/10 text-destructive',
                      )}>
                        {item.country.riskLevel?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Classification</span>
                      <span className="text-[10px] font-medium">{item.country.classification}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-[11px] hover:bg-primary/10 hover:text-primary">
                    <Link to={`/ai-insights?q=Analyze%20${encodeURIComponent(item.name || item.ticker)}`}>
                      <TrendingUp className="h-3 w-3 mr-1" /> Quick Analyze
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            );})}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Watchlist;
