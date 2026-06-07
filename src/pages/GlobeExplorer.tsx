import { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe as GlobeIcon, Search, X, TrendingUp, TrendingDown, Scale,
  Activity, Zap, Filter, Bookmark, BookmarkCheck, Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SentimentBadge } from '@/components/ui/SentimentBadge';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { MiniChart } from '@/components/ui/MiniChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCountries } from '@/hooks/useMarketData';
import { useForexRates, useForexRate } from '@/hooks/useForexRates';
import { useUserWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useUserWatchlist';
import { useAuth } from '@/contexts/AuthContext';
import { Country } from '@/types/market';
import { cn } from '@/lib/utils';

const GlobeVisualization = lazy(() => import('@/components/globe/GlobeVisualization'));

const continents = ['All', 'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'];

const GlobeExplorer = () => {
  const { data: countries = [] } = useCountries();
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [filterContinent, setFilterContinent] = useState('All');
  const [filterClassification, setFilterClassification] = useState('All');
  const [filterSentiment, setFilterSentiment] = useState('All');
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Country[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCountries = useMemo(() => {
    return countries.filter(c => {
      // Search across name, iso code, region, continent, capital
      const q = search.toLowerCase();
      const matchSearch = !search || 
        c.name?.toLowerCase().includes(q) || 
        c.iso?.toLowerCase().includes(q) ||
        c.region?.toLowerCase().includes(q) ||
        c.continent?.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q);
      // Continent filter — match against both continent and region fields
      const matchContinent = filterContinent === 'All' || 
        c.continent === filterContinent || 
        c.region === filterContinent ||
        c.continent?.toLowerCase().includes(filterContinent.toLowerCase()) ||
        c.region?.toLowerCase().includes(filterContinent.toLowerCase());
      const matchClass = filterClassification === 'All' || c.classification === filterClassification;
      const matchSentiment = filterSentiment === 'All' || c.aiSentiment === filterSentiment;
      return matchSearch && matchContinent && matchClass && matchSentiment;
    });
  }, [countries, search, filterContinent, filterClassification, filterSentiment]);

  const handleCountryClick = useCallback((country: Country) => {
    if (compareMode) {
      setCompareList(prev => {
        if (prev.find(x => x.iso === country.iso)) return prev.filter(x => x.iso !== country.iso);
        if (prev.length < 3) return [...prev, country];
        return prev;
      });
    } else {
      setSelectedCountry(country);
    }
  }, [compareMode]);

  const globePoints = useMemo(() => {
    return filteredCountries.map(c => ({
      lat: c.lat,
      lng: c.lng,
      name: c.name,
      iso: c.iso,
      sentiment: c.aiSentiment,
      classification: c.classification,
      size: c.classification === 'developed' ? 0.5 : c.classification === 'emerging' ? 0.38 : 0.25,
      color: c.aiSentiment === 'bullish' ? 'hsl(152, 69%, 45%)' : c.aiSentiment === 'bearish' ? 'hsl(0, 72%, 51%)' : 'hsl(38, 92%, 50%)',
      country: c,
    }));
  }, [filteredCountries]);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="p-4 md:px-6 md:pt-5 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <GlobeIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Globe Explorer
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              AI-powered intelligence for {countries.length} countries worldwide
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: showFilters ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${showFilters ? 'rgba(96,165,250,0.45)' : 'rgba(255,255,255,0.14)'}`,
                color: showFilters ? '#93c5fd' : '#94a3b8',
              }}>
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
            <button
              onClick={() => { setCompareMode(!compareMode); setCompareList([]); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: compareMode ? 'linear-gradient(135deg,hsl(221,83%,50%),hsl(258,78%,55%))' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${compareMode ? 'transparent' : 'rgba(255,255,255,0.14)'}`,
                color: compareMode ? 'white' : '#94a3b8',
                boxShadow: compareMode ? '0 0 16px rgba(37,99,235,0.4)' : 'none',
              }}>
              <Scale className="h-3.5 w-3.5" /> Compare {compareList.length > 0 && `(${compareList.length})`}
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 md:px-6 overflow-hidden flex-shrink-0"
            >
              <div className="flex flex-col md:flex-row gap-3 pb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(255,255,255,0.4)'}} />
                  <input
                    placeholder="Search any country..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-[13px] text-white outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'white'}}
                    onFocus={e=>(e.target as HTMLInputElement).style.borderColor='rgba(96,165,250,0.4)'}
                    onBlur={e=>(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.12)'}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    {val:filterContinent, set:setFilterContinent, opts:['All','Asia','Europe','Americas','Africa','Oceania','Middle East'], label:'Region'},
                    {val:filterClassification, set:setFilterClassification, opts:['All','developed','emerging','frontier','limited'], label:'Market'},
                    {val:filterSentiment, set:setFilterSentiment, opts:['All','bullish','bearish','neutral'], label:'Sentiment'},
                  ].map(({val,set,opts,label}) => (
                    <select key={label} value={val} onChange={e=>set(e.target.value)}
                      className="text-[12px] font-medium outline-none cursor-pointer"
                      style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:'10px',padding:'6px 12px',color:'white'}}>
                      {opts.map(o=><option key={o} value={o} style={{background:'#0a0e1f',color:'white'}}>{o==='All'?`All ${label}s`:o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                    </select>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content — globe takes full space */}
        <div className="flex-1 relative min-h-0" style={{minHeight: "60vh"}}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_70%)]" />
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <GlobeIcon className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse-glow" />
                <p className="text-muted-foreground text-sm">Loading Globe...</p>
              </div>
            </div>
          }>
            <GlobeVisualization points={globePoints} onCountryClick={handleCountryClick} />
          </Suspense>

          {/* Stats overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="glass-card-strong px-3 py-2 rounded-lg">
              <div className="text-[10px] text-muted-foreground">Markets</div>
              <div className="text-sm font-bold font-mono">{filteredCountries.length}</div>
            </div>
            <div className="glass-card-strong px-3 py-2 rounded-lg">
              <div className="text-[10px] text-muted-foreground">Bullish</div>
              <div className="text-sm font-bold font-mono text-success">
                {filteredCountries.filter(c => c.aiSentiment === 'bullish').length}
              </div>
            </div>
            <div className="glass-card-strong px-3 py-2 rounded-lg">
              <div className="text-[10px] text-muted-foreground">Bearish</div>
              <div className="text-sm font-bold font-mono text-destructive">
                {filteredCountries.filter(c => c.aiSentiment === 'bearish').length}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-card-strong px-3 py-2 rounded-lg">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Sentiment</div>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Bullish</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Neutral</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Bearish</span>
            </div>
          </div>
        </div>

        {/* Compare Panel */}
        <AnimatePresence>
          {compareMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              id="compare-panel"
              className="overflow-hidden flex-shrink-0"
              style={{borderTop:'1px solid rgba(255,255,255,0.08)',background:'rgba(4,6,18,0.97)',backdropFilter:'blur(24px)'}}
            >
              {/* Instruction bar when < 2 selected */}
              {compareList.length < 2 && (
                <div className="px-4 py-3 flex items-center gap-3 flex-wrap"
                  style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center gap-2 text-[12px]" style={{color:'#60a5fa'}}>
                    <Scale className="h-4 w-4" />
                    <span className="font-semibold">Compare Mode Active</span>
                  </div>
                  {compareList.length === 1 && (
                    <span className="flex items-center gap-1.5 text-[12px]" style={{color:'#4ade80'}}>
                      <span className="text-base">{compareList[0].flag}</span>
                      <span className="font-semibold">{compareList[0].name}</span>
                      <span style={{color:'rgba(255,255,255,0.3)'}}>selected</span>
                    </span>
                  )}
                  <span className="text-[12px]" style={{color:'rgba(255,255,255,0.35)'}}>
                    {compareList.length === 0 ? '→ Click any country dot on the globe to add it' : '→ Click another country on the globe to compare'}
                  </span>
                  {/* Quick country picker */}
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      className="text-[12px] outline-none cursor-pointer"
                      style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'4px 10px',color:'white'}}
                      onChange={e => {
                        const found = countries.find(c => c.iso === e.target.value);
                        if (found && !compareList.find(x => x.iso === found.iso)) {
                          setCompareList(prev => prev.length < 3 ? [...prev, found] : prev);
                        }
                        e.target.value = '';
                      }}
                      value=""
                    >
                      <option value="" style={{background:'#0a0e1f'}}>+ Add country</option>
                      {countries.filter(c => !compareList.find(x => x.iso === c.iso)).map(c => (
                        <option key={c.iso} value={c.iso} style={{background:'#0a0e1f',color:'white'}}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setCompareMode(false); setCompareList([]); }}
                      className="text-[11px] px-2.5 py-1 rounded-lg"
                      style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {compareList.length >= 2 && <ComparePanel countries={compareList} onClear={() => { setCompareMode(false); setCompareList([]); }} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Country Detail Sheet — fixed to viewport */}
      <Sheet open={!!selectedCountry && !compareMode} onOpenChange={(open) => { if (!open) setSelectedCountry(null); }}>
        <SheetContent side="right" className="w-[420px] sm:w-[460px] p-0 border-l" style={{background:'rgba(6,9,22,0.98)',backdropFilter:'blur(32px)',borderColor:'rgba(255,255,255,0.09)'}}>
          <SheetHeader className="sr-only">
            <SheetTitle>{selectedCountry?.name ?? 'Country Details'}</SheetTitle>
          </SheetHeader>
          {selectedCountry && (
            <ScrollArea className="h-full">
              <CountryDrawerContent country={selectedCountry} onCompare={(c) => {
                setSelectedCountry(null);
                setCompareMode(true);
                setCompareList([c]);
                // Small timeout to let sheet close, then scroll compare panel into view
                setTimeout(() => {
                  document.getElementById('compare-panel')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 400);
              }} />
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

/* ─── Country Drawer Content (used inside Sheet) ─── */
const CountryDrawerContent = ({ country, onCompare }: { country: Country; onCompare?: (country: Country) => void }) => {
  const { user } = useAuth();
  const { data: watchlist = [] } = useUserWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const { rate: realRate, isLoading: rateLoading } = useForexRate(country.currency);

  const watchlistItem = watchlist.find((w: any) => w.country_iso === country.iso);
  const isInWatchlist = !!watchlistItem;

  const displayRate = realRate ?? country.exchangeRateUSD;

  const handleWatchlistToggle = () => {
    if (!user) return;
    if (isInWatchlist && watchlistItem) {
      removeFromWatchlist.mutate(watchlistItem.id);
    } else {
      addToWatchlist.mutate({ ticker: country.primaryIndex || country.iso, name: country.name, countryIso: country.iso });
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{country.flag}</span>
          <div>
            <h2 className="text-lg font-bold leading-tight">{country.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-mono text-muted-foreground">{country.iso}</span>
              <span className="text-muted-foreground text-[8px]">•</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider',
                country.classification === 'developed' && 'bg-primary/10 text-primary border border-primary/20',
                country.classification === 'emerging' && 'bg-success/10 text-success border border-success/20',
                country.classification === 'frontier' && 'bg-warning/10 text-warning border border-warning/20',
                country.classification === 'limited' && 'bg-muted text-muted-foreground border border-border',
              )}>
                {country.classification}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Geo Info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-medium">{country.region}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Capital</span><span className="font-medium">{country.capital}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span className="font-medium">{country.currencySymbol} {country.currency}</span></div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">1 USD =</span>
          <span className="font-mono">
            {rateLoading ? '...' : `${displayRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${country.currency}`}
          </span>
        </div>
      </div>

      {/* Market Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/15 border border-border/20">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Market</div>
          <div className="text-sm font-semibold">{country.primaryExchange}</div>
          <div className="text-xs text-muted-foreground">{country.primaryIndex}</div>
        </div>
        <div className="text-right">
          <div className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
            country.marketStatus === 'open' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
          )}>
            <div className={cn('h-1.5 w-1.5 rounded-full', country.marketStatus === 'open' ? 'bg-success animate-pulse' : 'bg-muted-foreground')} />
            {country.marketStatus.toUpperCase()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">{country.timezone}</div>
        </div>
      </div>

      {/* Key Macro Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/15 rounded-xl p-3 text-center border border-border/10">
          <div className="text-[10px] text-muted-foreground">GDP Growth</div>
          <div className={cn('text-lg font-bold font-mono', country.gdpGrowth >= 0 ? 'text-success' : 'text-destructive')}>
            {country.gdpGrowth > 0 ? '+' : ''}{country.gdpGrowth}%
          </div>
        </div>
        <div className="bg-muted/15 rounded-xl p-3 text-center border border-border/10">
          <div className="text-[10px] text-muted-foreground">Inflation</div>
          <div className="text-lg font-bold font-mono">{country.inflation}%</div>
        </div>
        <div className="bg-muted/15 rounded-xl p-3 text-center border border-border/10">
          <div className="text-[10px] text-muted-foreground">Interest Rate</div>
          <div className="text-lg font-bold font-mono">{country.interestRate}%</div>
        </div>
      </div>

      {/* AI Intelligence Scores */}
      <div className="space-y-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-accent">
          <Zap className="h-3 w-3" /> AI Intelligence
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Market Sentiment</span>
          <SentimentBadge sentiment={country.aiSentiment} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Risk Level</span>
          <span className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
            country.riskLevel === 'low' && 'bg-success/10 text-success',
            country.riskLevel === 'medium' && 'bg-warning/10 text-warning',
            country.riskLevel === 'high' && 'bg-destructive/10 text-destructive',
            country.riskLevel === 'extreme' && 'bg-destructive/20 text-destructive',
          )}>
            {country.riskLevel.toUpperCase()}
          </span>
        </div>
        <RiskMeter level={country.volatilityLevel} label="Volatility" size="sm" />
        <RiskMeter level={country.opportunityScore} label="Opportunity Score" size="sm" />
      </div>

      {/* Index Chart */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Activity className="h-3 w-3" /> {country.primaryIndex} — 30 Day
        </h4>
        <div className="bg-muted/10 rounded-xl p-3 border border-border/15">
          <MiniChart data={country.chartData} height={110} />
        </div>
      </div>

      {/* Top Sectors */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dominant Sectors</h4>
        <div className="flex flex-wrap gap-1.5">
          {country.topSectors.map(s => (
            <span key={s} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Companies</h4>
        <div className="space-y-1">
          {country.topCompanies.map(c => (
            <div key={c.ticker} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/10 border border-border/10 hover:bg-muted/20 transition-colors">
              <div>
                <span className="text-xs font-semibold">{c.name}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">{c.ticker}</span>
              </div>
              <span className={cn('text-[11px] font-mono font-semibold', c.change >= 0 ? 'text-success' : 'text-destructive')}>
                {c.change >= 0 ? '+' : ''}{c.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Economic Indicators */}
      {country.economicIndicators.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Economic Indicators</h4>
          <div className="space-y-1.5">
            {country.economicIndicators.map(ei => (
              <div key={ei.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{ei.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium">{ei.value}</span>
                  {ei.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                  {ei.trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                  {ei.trend === 'stable' && <span className="text-[8px] text-muted-foreground">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-accent">
          <Zap className="h-3 w-3" /> AI Market Summary
        </h4>
        <p className="text-xs leading-relaxed text-muted-foreground">{country.aiSummary}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={handleWatchlistToggle}
          disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
        >
          {(addToWatchlist.isPending || removeFromWatchlist.isPending) ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : isInWatchlist ? (
            <BookmarkCheck className="h-3 w-3 mr-1 text-primary" />
          ) : (
            <Bookmark className="h-3 w-3 mr-1" />
          )}
          {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onCompare?.(country)}>
          <Scale className="h-3 w-3 mr-1" /> Compare
        </Button>
      </div>
    </div>
  );
};

/* ─── Compare Panel ─── */
const ComparePanel = ({ countries: compareCountries, onClear }: { countries: Country[]; onClear?: () => void }) => (
  <div className="p-4 max-h-72 overflow-auto">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[13px] font-bold flex items-center gap-2 text-white">
        <Scale className="h-4 w-4" style={{color:'#60a5fa'}} /> 
        Comparing {compareCountries.length} Countries
        <div className="flex gap-1 ml-1">
          {compareCountries.map(c => (
            <span key={c.iso} className="text-base" title={c.name}>{c.flag}</span>
          ))}
        </div>
      </h3>
      {onClear && (
        <button onClick={onClear}
          className="text-[11px] px-3 py-1 rounded-lg font-medium"
          style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171'}}>
          Close
        </button>
      )}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <th className="text-left p-2 text-[11px] font-semibold" style={{color:'rgba(255,255,255,0.35)'}}>Metric</th>
            {compareCountries.map(c => (
              <th key={c.iso} className="text-center p-2">
                <span className="text-base">{c.flag}</span>
                <span className="block text-[11px] font-bold text-white mt-0.5">{c.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Index', getValue: (c: Country) => c.primaryIndex, color: () => '#94a3b8' },
            { label: 'GDP Growth', getValue: (c: Country) => `${c.gdpGrowth}%`, color: (c: Country) => c.gdpGrowth >= 0 ? '#4ade80' : '#f87171' },
            { label: 'Inflation', getValue: (c: Country) => `${c.inflation}%`, color: (c: Country) => c.inflation < 5 ? '#4ade80' : c.inflation < 10 ? '#fbbf24' : '#f87171' },
            { label: 'Interest Rate', getValue: (c: Country) => `${c.interestRate}%`, color: () => '#94a3b8' },
            { label: 'AI Sentiment', getValue: (c: Country) => c.aiSentiment, color: (c: Country) => c.aiSentiment === 'bullish' ? '#4ade80' : c.aiSentiment === 'bearish' ? '#f87171' : '#fbbf24' },
            { label: 'Risk Level', getValue: (c: Country) => c.riskLevel, color: (c: Country) => c.riskLevel === 'Low' ? '#4ade80' : c.riskLevel === 'High' ? '#f87171' : '#fbbf24' },
            { label: 'Volatility', getValue: (c: Country) => `${c.volatilityLevel}/100`, color: () => '#94a3b8' },
            { label: 'Opportunity', getValue: (c: Country) => `${c.opportunityScore}/100`, color: (c: Country) => c.opportunityScore >= 70 ? '#4ade80' : c.opportunityScore >= 50 ? '#fbbf24' : '#f87171' },
            { label: 'Classification', getValue: (c: Country) => c.classification, color: () => '#a78bfa' },
            { label: 'Top Sectors', getValue: (c: Country) => c.topSectors.slice(0, 2).join(', '), color: () => '#94a3b8' },
          ].map((row, ri) => (
            <tr key={row.label} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background: ri%2===0?'transparent':'rgba(255,255,255,0.02)'}}>
              <td className="p-2 text-[11px] font-medium" style={{color:'rgba(255,255,255,0.4)'}}>{row.label}</td>
              {compareCountries.map(c => (
                <td key={c.iso} className="p-2 text-center font-mono text-[11px] font-semibold"
                  style={{color: row.color(c)}}>{row.getValue(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default GlobeExplorer;
