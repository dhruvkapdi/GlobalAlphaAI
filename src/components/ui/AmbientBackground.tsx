import { useEffect, useRef } from 'react';

interface Props {
  variant?: 'subtle' | 'hero';
}

export const AmbientBackground = ({ variant = 'subtle' }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars only — real earth photo is the CSS background
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.45, // only in sky area above earth curve
      r: Math.random() * 1.3 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.2,
    }));

    // Parallax/cinematic subtle pan offset
    let panX = 0;
    let panDir = 1;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Subtle vignette darkening on sides
      const sideVig = ctx.createLinearGradient(0, 0, W, 0);
      sideVig.addColorStop(0,   'rgba(0,0,0,0.35)');
      sideVig.addColorStop(0.15,'rgba(0,0,0,0.0)');
      sideVig.addColorStop(0.85,'rgba(0,0,0,0.0)');
      sideVig.addColorStop(1,   'rgba(0,0,0,0.35)');
      ctx.fillStyle = sideVig;
      ctx.fillRect(0, 0, W, H);

      // Twinkling stars (upper portion only — sky above earth)
      const t = Date.now() * 0.001;
      stars.forEach(s => {
        const alpha = 0.2 + 0.8 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${alpha * 0.85})`;
        ctx.fill();
      });

      // Cinematic slow pan (subtle)
      panX += 0.008 * panDir;
      if (panX > 4 || panX < -4) panDir *= -1;

      // Bottom fade so content reads cleanly
      const fade = ctx.createLinearGradient(0, H * 0.48, 0, H);
      fade.addColorStop(0,   'rgba(3, 6, 18, 0)');
      fade.addColorStop(0.3, 'rgba(3, 6, 18, 0.55)');
      fade.addColorStop(0.65,'rgba(3, 6, 18, 0.88)');
      fade.addColorStop(1,   'rgba(3, 6, 18, 0.98)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, W, H);

      // Top vignette
      const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.06);
      topFade.addColorStop(0, 'rgba(3, 6, 18, 0.65)');
      topFade.addColorStop(1, 'rgba(3, 6, 18, 0)');
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, W, H * 0.06);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  return (
    <>
      {/* REAL EARTH PHOTO — the actual image you provided */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: -2,
          backgroundImage: 'url(/earth-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          animation: 'earthPan 60s ease-in-out infinite alternate',
        }}
        aria-hidden
      />
      {/* Canvas — only adds stars + fades on top of the real photo */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ display: 'block', zIndex: -1 }}
        aria-hidden
      />
    </>
  );
};
