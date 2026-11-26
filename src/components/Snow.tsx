import { useEffect, useRef } from "react";

/** Lightweight canvas snowfall. Flakes drift with the mouse and fade at the bottom. */
export function Snow({ on, density = 140 }: { on: boolean; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!on) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, wind = 0, targetWind = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const count = Math.round(density * Math.min(1.4, w / 1200 + 0.4));
    const flakes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.8,
      s: 0.3 + Math.random() * 1.1, p: Math.random() * Math.PI * 2,
    }));
    const onMove = (e: PointerEvent) => { targetWind = (e.clientX / window.innerWidth - 0.5) * 2.4; };
    const tick = () => {
      wind += (targetWind - wind) * 0.02;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.p += 0.01;
        f.y += f.s * (0.6 + f.r * 0.35);
        f.x += Math.sin(f.p) * 0.4 + wind * f.r * 0.25;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        if (f.x > w + 5) f.x = -5; else if (f.x < -5) f.x = w + 5;
        ctx.globalAlpha = Math.min(1, (1 - f.y / h) * 1.2 + 0.15) * (0.5 + f.r / 6);
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", onMove); };
  }, [on, density]);

  return <canvas ref={ref} className={`snow ${on ? "is-on" : ""}`} aria-hidden="true" />;
}
