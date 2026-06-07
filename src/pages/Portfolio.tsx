import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Wallet, TrendingUp, TrendingDown, Pencil, Trash2, Sparkles,
  PieChart as PieIcon, Shield, Activity, AlertTriangle, Brain,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HoldingDialog } from '@/components/portfolio/HoldingDialog';
import { PremiumLock } from '@/components/subscription/PremiumLock';
import { PremiumBadge } from '@/components/subscription/PremiumBadge';
import { usePortfolio, useDeleteHolding, simulateCurrentPrice, type Holding } from '@/hooks/usePortfolio';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PALETTE = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7'];

export default function Portfolio() {
  const { data: holdings = [], isLoading } = usePortfolio();
  const deleteHolding = useDeleteHolding();
  const { isPro } = useSubscription();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | null>(null);

  const enriched = useMemo(() => holdings.map(h => {
    const current = simulateCurrentPrice(h.symbol, h.avg_cost);
    const marketValue = current * h.quantity;
    const costBasis = h.avg_cost * h.quantity;
    const pnl = marketValue - costBasis;
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, current, marketValue, costBasis, pnl, pnlPct };
  }), [holdings]);

  const totals = useMemo(() => {
    const marketValue = enriched.reduce((s, h) => s + h.marketValue, 0);
    const costBasis = enriched.reduce((s, h) => s + h.costBasis, 0);
    const pnl = marketValue - costBasis;
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { marketValue, costBasis, pnl, pnlPct };
  }, [enriched]);

  const allocation = useMemo(() => {
    if (!enriched.length) return [];
    const byType: Record<string, number> = {};
    enriched.forEach(h => { byType[h.asset_type] = (byType[h.asset_type] || 0) + h.marketValue; });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  // Diversification: HHI-derived score (100 = perfectly spread)
  const diversificationScore = useMemo(() => {
    if (enriched.length === 0) return 0;
    const total = enriched.reduce((s, h) => s + h.marketValue, 0);
    if (total === 0) return 0;
    const hhi = enriched.reduce((s, h) => {
      const w = h.marketValue / total;
      return s + w * w;
    }, 0);
    return Math.round((1 - hhi) * 100);
  }, [enriched]);

  const volatilityScore = useMemo(() => {
    if (!enriched.length) return 0;
    const avgAbs = enriched.reduce((s, h) => s + Math.abs(h.pnlPct), 0) / enriched.length;
    return Math.min(100, Math.round(avgAbs * 4));
  }, [enriched]);

  const sentiment = totals.pnlPct > 5 ? 'Bullish' : totals.pnlPct < -5 ? 'Bearish' : 'Neutral';
  const sentimentColor = sentiment === 'Bullish' ? 'text-success' : sentiment === 'Bearish' ? 'text-destructive' : 'text-muted-foreground';

  const aiRecommendations = useMemo(() => {
    const recs: { icon: any; tone: 'good' | 'warn' | 'bad'; title: string; body: string }[] = [];
    if (!enriched.length) return recs;
    if (diversificationScore < 40) recs.push({
      icon: AlertTriangle, tone: 'warn',
      title: 'Concentration risk detected',
      body: `Your portfolio is concentrated in a few positions (diversification score: ${diversificationScore}). Consider adding holdings across different sectors or asset classes to reduce idiosyncratic risk.`,
    });
    if (volatilityScore > 60) recs.push({
      icon: Activity, tone: 'warn',
      title: 'Elevated volatility profile',
      body: `Average position-level price swing is ${volatilityScore}% above baseline. Tighten stop-losses or rebalance toward lower-beta assets if this exceeds your risk tolerance.`,
    });
    const types = new Set(enriched.map(h => h.asset_type));
    if (types.size === 1) recs.push({
      icon: PieIcon, tone: 'warn',
      title: 'Single asset class exposure',
      body: 'All positions are within one asset class. Multi-asset allocation historically reduces drawdowns by 20-30% during regime shifts.',
    });
    if (totals.pnlPct > 15) recs.push({
      icon: TrendingUp, tone: 'good',
      title: 'Strong unrealized gains',
      body: `Portfolio is +${totals.pnlPct.toFixed(1)}%. Consider partial profit-taking on positions exceeding +25% to lock in alpha and rebalance.`,
    });
    if (totals.pnlPct < -10) recs.push({
      icon: TrendingDown, tone: 'bad',
      title: 'Drawdown exceeds threshold',
      body: `Portfolio is ${totals.pnlPct.toFixed(1)}%. Review thesis on losing positions — average down only on highest-conviction holdings with strong fundamentals.`,
    });
    if (recs.length === 0) recs.push({
      icon: Shield, tone: 'good',
      title: 'Portfolio profile looks balanced',
      body: 'Risk metrics are within healthy ranges. Continue monitoring sector exposure and macro indicators.',
    });
    return recs.slice(0, 4);
  }, [enriched, diversificationScore, volatilityScore, totals.pnlPct]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this holding?')) return;
    try {
      await deleteHolding.mutateAsync(id);
      toast({ title: 'Holding removed' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">Portfolio</h1>
              <PremiumBadge tier="pro" />
            </div>
            <p className="text-xs text-muted-foreground">Track positions, monitor risk and get AI-powered allocation insights.</p>
          </div>
          <Button
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            className="bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add holding
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total value" value={`$${totals.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`${enriched.length} positions`} />
          <StatCard
            label="Unrealized P&L"
            value={`${totals.pnl >= 0 ? '+' : ''}$${totals.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            sub={`${totals.pnlPct >= 0 ? '+' : ''}${totals.pnlPct.toFixed(2)}%`}
            tone={totals.pnl >= 0 ? 'good' : 'bad'}
          />
          <StatCard label="Cost basis" value={`$${totals.costBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="Capital deployed" />
          <StatCard label="Sentiment" value={sentiment} sub="AI portfolio outlook" toneClass={sentimentColor} />
        </div>

        {/* Allocation + AI insights row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <PieIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Allocation</h3>
            </div>
            {allocation.length === 0 ? (
              <EmptyMini text="Add holdings to see allocation" />
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                        {allocation.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {allocation.map((a, i) => {
                    const pct = (a.value / totals.marketValue) * 100;
                    return (
                      <div key={a.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                          <span className="capitalize">{a.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Risk scores */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Risk profile</h3>
            </div>
            <ScoreRow label="Diversification" value={diversificationScore} good />
            <ScoreRow label="Volatility" value={volatilityScore} />
            <ScoreRow label="Concentration" value={100 - diversificationScore} inverted />
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Sentiment</p>
              <p className={cn('text-lg font-bold', sentimentColor)}>{sentiment}</p>
            </div>
          </div>

          {/* AI recommendations — premium-locked for free users */}
          <PremiumLock
            title="AI portfolio analyzer"
            description="Unlock institutional allocation, risk and rebalancing recommendations."
            className="lg:col-span-1"
          >
            <div className="glass-card p-5 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">AI recommendations</h3>
                {isPro && <PremiumBadge />}
              </div>
              {enriched.length === 0 ? (
                <EmptyMini text="Add holdings for AI analysis" />
              ) : (
                <div className="space-y-2.5">
                  {aiRecommendations.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'rounded-lg border p-3',
                        r.tone === 'good' && 'border-success/30 bg-success/5',
                        r.tone === 'warn' && 'border-amber-500/30 bg-amber-500/5',
                        r.tone === 'bad' && 'border-destructive/30 bg-destructive/5',
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <r.icon className="h-3.5 w-3.5" />
                        <p className="text-xs font-semibold">{r.title}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{r.body}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </PremiumLock>
        </div>

        {/* Holdings table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <h3 className="text-sm font-semibold">Holdings</h3>
            <span className="text-[10px] text-muted-foreground">{enriched.length} positions</span>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : enriched.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium mb-1">No holdings yet</p>
              <p className="text-xs text-muted-foreground mb-4">Add your first position to start tracking.</p>
              <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-gradient-to-r from-primary to-accent">
                <Plus className="h-4 w-4 mr-1.5" /> Add holding
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-foreground/[0.02] text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Symbol</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Type</th>
                    <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                    <th className="text-right px-4 py-2.5 font-medium hidden md:table-cell">Avg cost</th>
                    <th className="text-right px-4 py-2.5 font-medium">Price</th>
                    <th className="text-right px-4 py-2.5 font-medium">Value</th>
                    <th className="text-right px-4 py-2.5 font-medium">P&L</th>
                    <th className="text-right px-4 py-2.5 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {enriched.map(h => (
                    <tr key={h.id} className="border-t border-white/[0.04] hover:bg-foreground/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{h.symbol}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{h.name}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-foreground/[0.05] border border-white/[0.05]">{h.asset_type}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{h.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono hidden md:table-cell">${h.avg_cost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono">${h.current.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono">${h.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className={cn('px-4 py-3 text-right font-mono', h.pnl >= 0 ? 'text-success' : 'text-destructive')}>
                        <div>{h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(0)}</div>
                        <div className="text-[10px]">{h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditing(h); setDialogOpen(true); }} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[10px] text-center text-muted-foreground/60 flex items-center justify-center gap-1">
          <Sparkles className="h-2.5 w-2.5" /> Prices are simulated for demo purposes. AI analysis for informational use only — not financial advice.
        </p>
      </div>

      <HoldingDialog open={dialogOpen} onOpenChange={setDialogOpen} holding={editing} />
    </AppLayout>
  );
}

function StatCard({ label, value, sub, tone, toneClass }: { label: string; value: string; sub: string; tone?: 'good' | 'bad'; toneClass?: string }) {
  const cls = toneClass ?? (tone === 'good' ? 'text-success' : tone === 'bad' ? 'text-destructive' : '');
  return (
    <div className="glass-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-xl font-bold font-mono', cls)}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function ScoreRow({ label, value, good, inverted }: { label: string; value: number; good?: boolean; inverted?: boolean }) {
  const isGood = inverted ? value < 50 : value >= 60;
  const color = isGood ? 'bg-success' : value >= 30 ? 'bg-amber-500' : 'bg-destructive';
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-mono font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-foreground/[0.05] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
      {text}
    </div>
  );
}
