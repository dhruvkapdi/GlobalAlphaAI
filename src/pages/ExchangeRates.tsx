import { useState, useMemo } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { MiniChart } from '@/components/ui/MiniChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForexPairs } from '@/hooks/useMarketData';
import { useForexRates } from '@/hooks/useForexRates';
import { cn } from '@/lib/utils';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'INR', 'CNY', 'BRL', 'NZD', 'SGD', 'HKD', 'KRW', 'MXN', 'SEK', 'NOK', 'DKK', 'ZAR', 'THB'];

const ExchangeRates = () => {
  const { data: forexPairs = [], isLoading } = useForexPairs();
  const { data: allRates = [] } = useForexRates();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1000');

  // Build rate map from forex_rates table
  const rateMap = useMemo(() => {
    const m = new Map<string, number>();
    allRates.forEach(r => m.set(r.target_currency, r.rate));
    return m;
  }, [allRates]);

  // Calculate conversion
  const getRate = (from: string, to: string): number => {
    if (from === to) return 1;
    if (from === 'USD') return rateMap.get(to) ?? 0;
    if (to === 'USD') {
      const r = rateMap.get(from);
      return r ? 1 / r : 0;
    }
    // Cross rate via USD
    const fromUsd = rateMap.get(from);
    const toUsd = rateMap.get(to);
    if (fromUsd && toUsd) return toUsd / fromUsd;
    return 0;
  };

  const rate = getRate(fromCurrency, toCurrency);
  const converted = (parseFloat(amount || '0') * rate).toFixed(2);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowRightLeft className="h-6 w-6 text-primary" /> Exchange Rates</h1>
          <p className="text-muted-foreground text-sm">Live forex rates and currency conversion</p>
        </div>

        <GlassCard className="p-5" glow="primary">
          <h3 className="font-semibold text-sm mb-4">Currency Converter</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">From</label>
              <div className="flex gap-2">
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-card/60 border-border/50 font-mono" />
                <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="bg-card border border-border/50 rounded-lg px-3 text-sm">
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }} className="rounded-full mt-4 md:mt-3">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="flex-1 w-full">
              <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">To</label>
              <div className="flex gap-2">
                <Input value={converted} readOnly className="bg-card/60 border-border/50 font-mono" />
                <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="bg-card border border-border/50 rounded-lg px-3 text-sm">
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 font-mono">
            1 {fromCurrency} = {rate > 0 ? rate.toFixed(4) : '—'} {toCurrency}
            {allRates.length > 0 && <span className="ml-2 text-primary/60">• Live rates</span>}
          </p>
        </GlassCard>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {forexPairs.map((fx: any) => (
              <GlassCard key={fx.pair} hover className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{fx.pair}</h3>
                  <span className={cn('text-[10px] font-mono', (fx.changePercent ?? 0) >= 0 ? 'text-success' : 'text-destructive')}>
                    {(fx.changePercent ?? 0) >= 0 ? '+' : ''}{(fx.changePercent ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="text-xl font-bold font-mono mb-2">{(fx.rate ?? 0).toFixed(4)}</div>
                <MiniChart data={fx.chartData?.map((v: number, i: number) => ({ date: String(i), value: v })) || []} height={40} />
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExchangeRates;
