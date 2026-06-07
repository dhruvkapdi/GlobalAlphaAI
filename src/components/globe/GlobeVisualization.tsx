import { useRef, useEffect, useState, useCallback } from 'react';
import { Country } from '@/types/market';

interface GlobePoint {
  lat: number; lng: number; name: string; iso: string;
  sentiment: string; classification: string; size: number; color: string; country: Country;
}
interface GlobeVisualizationProps {
  points: GlobePoint[];
  onCountryClick: (country: Country) => void;
  onCountryHover?: (country: Country | null) => void;
}

// Load script from CDN dynamically
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const GlobeVisualization = ({ points, onCountryClick, onCountryHover }: GlobeVisualizationProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let globe: any = null;

    const init = async () => {
      try {
        // Load Three.js first (r128 — stable, no webgpu/tsl)
        await loadScript('https://unpkg.com/three@0.128.0/build/three.min.js');
        // Load react-globe.gl standalone UMD bundle (uses its own bundled three-globe)
        await loadScript('https://unpkg.com/globe.gl@2.27.1/dist/globe.gl.min.js');

        if (cancelled || !mountRef.current) return;

        const GlobeGL = (window as any).Globe;
        if (!GlobeGL) { setError(true); return; }

        const el = mountRef.current;
        const w = containerRef.current?.clientWidth || 900;
        const h = containerRef.current?.clientHeight || 700;

        globe = GlobeGL()(el)
          .width(w)
          .height(h)
          .backgroundColor('rgba(0,0,0,0)')
          .globeImageUrl('https://unpkg.com/three-globe@2.33.0/example/img/earth-night.jpg')
          .backgroundImageUrl('https://unpkg.com/three-globe@2.33.0/example/img/night-sky.png')
          .atmosphereColor('rgba(30, 100, 255, 0.8)')
          .atmosphereAltitude(0.22)
          .pointsData(points)
          .pointLat('lat')
          .pointLng('lng')
          .pointAltitude(0.01)
          .pointRadius((d: any) =>
            d.classification === 'developed' ? 0.55
              : d.classification === 'emerging' ? 0.42 : 0.28
          )
          .pointColor((d: any) => d.color)
          .pointLabel((d: any) => `
            <div style="background:rgba(4,6,18,0.97);backdrop-filter:blur(20px);border:1px solid ${d.sentiment === 'bullish' ? 'rgba(34,197,94,0.4)' : d.sentiment === 'bearish' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'};border-radius:14px;padding:14px 18px;font-family:Inter,system-ui,sans-serif;min-width:200px;box-shadow:0 16px 48px rgba(0,0,0,0.7)">
              <div style="font-size:15px;font-weight:700;margin-bottom:8px;color:white">${d.country?.flag || ''} ${d.name}</div>
              <span style="font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:2px 10px;border-radius:9999px;background:${d.sentiment === 'bullish' ? 'rgba(34,197,94,0.15)' : d.sentiment === 'bearish' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'};color:${d.sentiment === 'bullish' ? '#4ade80' : d.sentiment === 'bearish' ? '#f87171' : '#fbbf24'}">${d.sentiment}</span>
              <div style="font-size:11px;color:#888;display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin-top:10px">
                <span>GDP ${d.country?.gdpGrowth >= 0 ? '+' : ''}${d.country?.gdpGrowth}%</span>
                <span>Risk: ${d.country?.riskLevel}</span>
                <span>Infl: ${d.country?.inflation}%</span>
                <span>${d.country?.currency}</span>
              </div>
              <div style="font-size:10px;color:#444;margin-top:10px">Click to explore →</div>
            </div>
          `)
          .onPointClick((d: any) => {
            if (d?.country) {
              onCountryClick(d.country);
              globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.8 }, 1200);
            }
          })
          .onPointHover((d: any) => {
            onCountryHover?.(d?.country ?? null);
            el.style.cursor = d ? 'pointer' : 'grab';
            const controls = globe.controls();
            if (controls) controls.autoRotateSpeed = d ? 0.05 : 0.45;
          });

        // Arc lines between financial hubs
        const hubs = points.filter(p => ['US', 'GB', 'JP', 'DE', 'SG', 'HK', 'CN', 'IN'].includes(p.iso));
        const arcs = hubs.map((h, i) => ({
          startLat: h.lat, startLng: h.lng,
          endLat: hubs[(i + 1) % hubs.length].lat,
          endLng: hubs[(i + 1) % hubs.length].lng,
        }));

        globe
          .arcsData(arcs)
          .arcColor(() => ['rgba(96,165,250,0.12)', 'rgba(167,139,250,0.12)'])
          .arcDashLength(0.5)
          .arcDashGap(0.3)
          .arcDashAnimateTime(4000)
          .arcStroke(0.3);

        // Ring pulse on developed markets
        const rings = points.filter(p => p.classification === 'developed').map(p => ({
          lat: p.lat, lng: p.lng,
          maxR: 3, propagationSpeed: 1.5, repeatPeriod: 2500, color: p.color,
        }));
        globe
          .ringsData(rings)
          .ringColor((d: any) => (t: number) => `rgba(${d.color === '#22c55e' ? '34,197,94' : d.color === '#ef4444' ? '239,68,68' : '245,158,11'},${Math.max(0, 0.65 - t)})`)
          .ringMaxRadius('maxR')
          .ringPropagationSpeed('propagationSpeed')
          .ringRepeatPeriod('repeatPeriod');

        // Auto rotate
        const controls = globe.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.45;
          controls.enableDamping = true;
          controls.dampingFactor = 0.1;
        }

        globe.pointOfView({ lat: 20, lng: 20, altitude: 2.0 }, 0);
        globeInstanceRef.current = globe;
        if (!cancelled) setLoading(false);

      } catch (err) {
        console.error('Globe load error:', err);
        if (!cancelled) setError(true);
      }
    };

    init();
    return () => {
      cancelled = true;
      if (globeInstanceRef.current) {
        try {
          const el = mountRef.current;
          if (el) el.innerHTML = '';
        } catch {}
      }
    };
  }, []);

  // Update points when they change
  useEffect(() => {
    const g = globeInstanceRef.current;
    if (!g || loading) return;
    g.pointsData(points);
  }, [points, loading]);

  // Resize handler
  useEffect(() => {
    const update = () => {
      const g = globeInstanceRef.current;
      if (!g || !containerRef.current) return;
      g.width(containerRef.current.clientWidth);
      g.height(containerRef.current.clientHeight);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [loading]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ background: 'radial-gradient(ellipse at center, #08111f 0%, #020408 100%)' }}>
          {/* Stars bg while loading */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 2 + 0.5}px`, height: `${Math.random() * 2 + 0.5}px`,
                  top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.2,
                  animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
          {/* Globe placeholder glow */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full animate-pulse mb-6"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(37,99,235,0.1) 50%, transparent 70%)' }} />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-300 text-sm font-semibold">Loading Earth...</span>
            </div>
            <p className="text-slate-600 text-xs">Fetching NASA night earth texture</p>
          </div>
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #08111f 0%, #020408 100%)' }}>
          <div className="text-center">
            <div className="text-4xl mb-4">🌍</div>
            <p className="text-slate-400 text-sm mb-2">Globe requires internet connection</p>
            <p className="text-slate-600 text-xs">Connect to load the 3D Earth visualization</p>
          </div>
        </div>
      )}

      {/* Globe mount point */}
      <div ref={mountRef} className="w-full h-full" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.6s ease' }} />
    </div>
  );
};

export default GlobeVisualization;
