import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Monk } from "./Monk";
import type { Trek } from "../data";

/**
 * "Snow route" journey: the Trekking Buddha walks a trek's typical route on a snowy
 * topographic map. Checkpoints light up as he reaches them; snow falls the whole time.
 * Rendered live in the page with @remotion/player.
 */
export const JOURNEY_W = 1280;
export const JOURNEY_H = 720;
export const JOURNEY_FRAMES = 330;
const WALK_START = 24;
const WALK_END = 262;

type P = [number, number];

function catmull(pts: P[], steps = 24): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export const JourneyMap: React.FC<{ trek: Trek }> = ({ trek }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = JOURNEY_W, H = JOURNEY_H;
  const n = trek.route.length;

  const geo = useMemo(() => {
    const cps: P[] = trek.route.map((_, i) => {
      const t = n === 1 ? 0 : i / (n - 1);
      return [130 + t * (W - 300), 590 - t * 330 + (i % 2 ? -46 : 40) * (i === 0 || i === n - 1 ? 0 : 1)];
    });
    const samples = catmull(cps);
    const cum = [0];
    for (let i = 1; i < samples.length; i++) cum.push(cum[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
    const total = cum[cum.length - 1];
    const cpFrac = cps.map((_, i) => cum[Math.min(samples.length - 1, i * 24)] / total);
    const d = samples.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    // topographic contour rings
    const rings: string[] = [];
    const centers: P[] = [[260, 520], [760, 380], [1100, 560], [1000, 210]];
    centers.forEach((c, ci) => {
      for (let r = 1; r <= 6; r++) {
        let s = "";
        for (let a = 0; a <= 64; a++) {
          const ang = (a / 64) * Math.PI * 2;
          const wob = 1 + 0.12 * Math.sin(ang * 3 + ci) + 0.06 * Math.sin(ang * 5 + r);
          const rad = r * 34 * wob;
          s += `${a ? "L" : "M"}${(c[0] + Math.cos(ang) * rad * 1.5).toFixed(1)},${(c[1] + Math.sin(ang) * rad).toFixed(1)}`;
        }
        rings.push(s + "Z");
      }
    });
    return { cps, samples, cum, total, cpFrac, d, rings };
  }, [trek.id]);

  const prog = interpolate(frame, [WALK_START, WALK_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const walking = frame > WALK_START && frame < WALK_END;

  // position along the route
  const target = prog * geo.total;
  let k = 1;
  while (k < geo.cum.length - 1 && geo.cum[k] < target) k++;
  const seg = (target - geo.cum[k - 1]) / Math.max(0.0001, geo.cum[k] - geo.cum[k - 1]);
  const a = geo.samples[k - 1], b = geo.samples[k];
  const pos: P = [a[0] + (b[0] - a[0]) * seg, a[1] + (b[1] - a[1]) * seg];

  const title = spring({ frame, fps, config: { damping: 16 } });
  const summit = spring({ frame: frame - WALK_END, fps, config: { damping: 12 } });
  const reached = geo.cpFrac.filter((f) => prog >= f - 0.001).length;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#e9f0f8 0%,#f7f9fc 45%,#ffffff 100%)", fontFamily: "Manrope, Inter, sans-serif", overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* distant snow range */}
        <path d="M0,200 L90,120 L150,160 L250,60 L330,140 L420,90 L520,170 L640,40 L760,150 L860,80 L980,160 L1080,30 L1190,130 L1280,90 L1280,260 L0,260 Z" fill="#d5e0ee" />
        <path d="M250,60 L280,95 L262,92 L248,104 L232,88 Z M640,40 L676,84 L654,80 L636,94 L616,76 Z M1080,30 L1118,78 L1096,72 L1078,88 L1056,66 Z M860,80 L884,108 L866,104 L846,104 Z" fill="#ffffff" />
        <rect x="0" y="250" width={W} height={H} fill="url(#fade)" />
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f6fb" /><stop offset="1" stopColor="#ffffff" /></linearGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        {geo.rings.map((r, i) => <path key={i} d={r} fill="none" stroke="#dbe5f0" strokeWidth={1.4} />)}
        {/* route: full faint trail + drawn progress */}
        <path d={geo.d} fill="none" stroke="#c9d5e3" strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
        <path d={geo.d} fill="none" stroke="#e8611a" strokeWidth={5} strokeLinecap="round" strokeDasharray={geo.total} strokeDashoffset={geo.total * (1 - prog)} />
        {/* checkpoints */}
        {geo.cps.map((c, i) => {
          const on = i < reached;
          const pop = spring({ frame: frame - (WALK_START + geo.cpFrac[i] * (WALK_END - WALK_START)), fps, config: { damping: 10 } });
          const last = i === n - 1;
          const above = i % 2 === 1;
          return (
            <g key={i} transform={`translate(${c[0]} ${c[1]})`}>
              <circle r={last ? 14 : 10} fill={on ? "#e8611a" : "#ffffff"} stroke={on ? "#e8611a" : "#b9c6d6"} strokeWidth={3} />
              {on && <circle r={(last ? 14 : 10) + 10 * pop} fill="none" stroke="#e8611a" strokeOpacity={0.35 * (1 - Math.min(1, pop))} strokeWidth={2} />}
              <g opacity={on ? Math.min(1, pop) : 0.55} transform={`translate(0 ${above ? -34 : 34})`}>
                <rect x={-78} y={-17} width={156} height={34} rx={17} fill="#ffffff" stroke={on ? "#f3c3a6" : "#e3e9f1"} />
                <text x={0} y={5} textAnchor="middle" fontSize={15} fontWeight={700} fill={on ? "#13161c" : "#8a96a8"}>{trek.route[i].length > 18 ? trek.route[i].slice(0, 17) + "…" : trek.route[i]}</text>
              </g>
            </g>
          );
        })}
        {/* summit flag */}
        {(() => {
          const c = geo.cps[n - 1];
          return (
            <g transform={`translate(${c[0] + 4} ${c[1] - 16}) scale(${Math.max(0, Math.min(1.1, summit))})`}>
              <line x1={0} y1={0} x2={0} y2={-56} stroke="#13161c" strokeWidth={3} />
              <path d="M0,-56 L34,-46 L0,-36 Z" fill="#e8611a" />
            </g>
          );
        })()}
        {/* the walking Buddha */}
        <ellipse cx={pos[0]} cy={pos[1] + 2} rx={22} ry={5} fill="#13161c" opacity={0.12} filter="url(#soft)" />
        <Monk phase={walking ? frame * 0.42 : Math.PI} size={92} x={pos[0] - (92 * 40) / 140} y={pos[1] - (92 * 135) / 140} />
        {/* snowfall */}
        {Array.from({ length: 90 }).map((_, i) => {
          const sp = 0.6 + random(`s${i}`) * 1.6;
          const y = (random(`y${i}`) * H + frame * sp * 2.2) % (H + 20) - 10;
          const x = (random(`x${i}`) * W + Math.sin((frame + i * 20) / 30) * 14 * sp) % W;
          const r = 1.2 + random(`r${i}`) * 2.6;
          return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" stroke="#c7d3e2" strokeWidth={0.6} opacity={0.95} />;
        })}
      </svg>

      {/* header card */}
      <div style={{ position: "absolute", left: 40, bottom: 40, padding: "18px 24px", borderRadius: 22, background: "rgba(255,255,255,.92)", boxShadow: "0 20px 50px -25px rgba(19,22,28,.35)", transform: `translateY(${(1 - title) * 40}px)`, opacity: title, minWidth: 330 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.16em", color: "#e8611a", textTransform: "uppercase" }}>{trek.country} · {trek.region}</div>
        <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 44, lineHeight: 1.05, color: "#13161c" }}>{trek.name}</div>
        <div style={{ marginTop: 10, height: 6, borderRadius: 6, background: "#eef2f7", overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", background: "#e8611a" }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#6b7280", fontWeight: 600 }}>
          Stop {Math.max(1, reached)} of {n} · {trek.route[Math.max(0, reached - 1)]}
        </div>
      </div>
      {trek.summit && (
        <div style={{ position: "absolute", right: 40, bottom: 40, padding: "14px 22px", borderRadius: 999, background: "#13161c", color: "#fff", fontWeight: 700, fontSize: 18, opacity: Math.min(1, Math.max(0, summit)), transform: `scale(${0.8 + 0.2 * Math.min(1, Math.max(0, summit))})` }}>
          🏔 {trek.summit}
        </div>
      )}
    </AbsoluteFill>
  );
};
