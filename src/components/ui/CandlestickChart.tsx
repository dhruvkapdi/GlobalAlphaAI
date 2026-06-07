import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OHLC {
  date: string; open: number; high: number; low: number; close: number; volume?: number;
}
interface CandlestickChartProps {
  data?: OHLC[];
  height?: number;
  className?: string;
  basePrice?: number;
  ticker?: string;
}

const TFS = ['1W','1M','3M','6M','1Y'] as const;
const TF_DAYS: Record<string,number> = { '1W':7,'1M':30,'3M':90,'6M':180,'1Y':365 };

function genData(base: number, days: number, vol = 0.02): OHLC[] {
  const out: OHLC[] = [];
  let price = base;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const change = (Math.random() - 0.48) * vol * price;
    const open = price;
    const close = price + change;
    const hi = Math.max(open, close) + Math.random() * vol * price * 0.4;
    const lo = Math.min(open, close) - Math.random() * vol * price * 0.4;
    out.push({
      date: d.toISOString().split('T')[0],
      open: +open.toFixed(2), high: +hi.toFixed(2),
      low: +lo.toFixed(2), close: +close.toFixed(2),
      volume: Math.floor(Math.random() * 50e6) + 5e6,
    });
    price = close;
  }
  return out;
}

export function CandlestickChart({ data: ext, height = 280, className, basePrice, ticker }: CandlestickChartProps) {
  const [tf, setTf] = useState('3M');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    if (ext && ext.length > 5) return ext;
    const base = basePrice && basePrice > 0 ? basePrice : 150;
    const vol = base > 10000 ? 0.008 : base > 1000 ? 0.012 : base > 100 ? 0.018 : 0.025;
    return genData(base, TF_DAYS[tf] || 90, vol);
  }, [ext, tf, basePrice]);

  const visible = useMemo(() => data.slice(-Math.min(TF_DAYS[tf] || 90, data.length)), [data, tf]);

  const PAD = { t: 16, b: 28, l: 52, r: 12 };
  const chartW = Math.max(0, w - PAD.l - PAD.r);
  const chartH = height - PAD.t - PAD.b;
  const n = visible.length;

  const { minP, maxP, range } = useMemo(() => {
    const lows = visible.map(d => d.low);
    const highs = visible.map(d => d.high);
    const mn = Math.min(...lows); const mx = Math.max(...highs);
    const pad = (mx - mn) * 0.08;
    return { minP: mn - pad, maxP: mx + pad, range: mx - mn + pad * 2 };
  }, [visible]);

  const py = (p: number) => PAD.t + ((maxP - p) / range) * chartH;
  const cx = (i: number) => PAD.l + (i + 0.5) * (chartW / n);
  const cw = Math.max(2, Math.min(14, (chartW / n) * 0.65));

  const grid = useMemo(() => {
    const lines: number[] = [];
    for (let i = 0; i <= 4; i++) lines.push(minP + (range / 4) * i);
    return lines;
  }, [minP, range]);

  const hov = hoverIdx !== null ? visible[hoverIdx] : null;
  const last = visible[visible.length - 1];
  const first = visible[0];
  const pct = last && first ? ((last.close - first.open) / first.open) * 100 : 0;

  // Date labels — show ~5 evenly spaced
  const dateLabels = useMemo(() => {
    if (!n) return [];
    const step = Math.max(1, Math.floor(n / 5));
    const out: {i:number; label:string}[] = [];
    for (let i = 0; i < n; i += step) {
      const d = new Date(visible[i].date);
      out.push({ i, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    return out;
  }, [visible, n]);

  return (
    <div ref={containerRef} className={cn('w-full select-none', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="text-[11px] font-mono" style={{ color: pct >= 0 ? '#4ade80' : '#f87171' }}>
          {hov ? (
            <span className="flex gap-3">
              <span style={{ color: '#64748b' }}>{hov.date}</span>
              <span>O <b style={{ color: '#e2e8f0' }}>{hov.open.toFixed(2)}</b></span>
              <span>H <b style={{ color: '#4ade80' }}>{hov.high.toFixed(2)}</b></span>
              <span>L <b style={{ color: '#f87171' }}>{hov.low.toFixed(2)}</b></span>
              <span>C <b style={{ color: hov.close >= hov.open ? '#4ade80' : '#f87171' }}>{hov.close.toFixed(2)}</b></span>
            </span>
          ) : (
            <span>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}% ({tf})</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {TFS.map(t => (
            <button key={t} onClick={() => setTf(t)}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all"
              style={{
                background: tf === t ? 'rgba(37,99,235,0.8)' : 'transparent',
                color: tf === t ? 'white' : '#475569',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ height, position: 'relative' }}>
        <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <filter id="cglow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          {grid.map((p, i) => (
            <g key={i}>
              <line
                x1={PAD.l} x2={PAD.l + chartW}
                y1={py(p)} y2={py(p)}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3 4"
              />
              <text x={PAD.l - 6} y={py(p) + 3.5}
                textAnchor="end" fontSize={9} fontFamily="monospace"
                fill="rgba(255,255,255,0.3)">
                {p > 1000 ? p.toFixed(0) : p.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Candles */}
          {visible.map((c, i) => {
            const bull = c.close >= c.open;
            const col = bull ? '#22c55e' : '#ef4444';
            const top = py(Math.max(c.open, c.close));
            const bot = py(Math.min(c.open, c.close));
            const bh = Math.max(1.5, bot - top);
            const x = cx(i);
            const isH = hoverIdx === i;
            return (
              <g key={i} style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}>
                {isH && <rect x={x - cw} y={PAD.t} width={cw * 2} height={chartH}
                  fill="rgba(255,255,255,0.04)" rx={2} />}
                {/* Wick */}
                <line x1={x} x2={x} y1={py(c.high)} y2={py(c.low)}
                  stroke={col} strokeWidth={1.2} opacity={0.8} />
                {/* Body */}
                <rect x={x - cw / 2} y={top} width={cw} height={bh}
                  fill={bull ? col : col} rx={1.5}
                  opacity={isH ? 1 : 0.85}
                  filter={isH ? 'url(#cglow)' : undefined} />
              </g>
            );
          })}

          {/* Crosshair */}
          {hov && hoverIdx !== null && (
            <>
              <line x1={PAD.l} x2={PAD.l + chartW}
                y1={py(hov.close)} y2={py(hov.close)}
                stroke="rgba(96,165,250,0.5)" strokeWidth={0.8} strokeDasharray="3 3" />
              <rect x={1} y={py(hov.close) - 8} width={PAD.l - 4} height={16}
                fill="hsl(221,83%,50%)" rx={4} />
              <text x={PAD.l / 2} y={py(hov.close) + 3.5}
                textAnchor="middle" fontSize={8} fontFamily="monospace"
                fill="white" fontWeight="bold">
                {hov.close > 1000 ? hov.close.toFixed(0) : hov.close.toFixed(2)}
              </text>
            </>
          )}

          {/* X-axis date labels */}
          {dateLabels.map(({ i, label }) => (
            <text key={i} x={cx(i)} y={height - 6}
              textAnchor="middle" fontSize={9} fontFamily="system-ui"
              fill="rgba(255,255,255,0.3)">
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
