import {useEffect, useRef} from "react";

function paint(canvas: HTMLCanvasElement, seed: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#070b16";
  ctx.fillRect(0, 0, w, h);
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 90; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 8 + rnd() * 46;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const hue = rnd() > 0.55 ? "197,32,118" : rnd() > 0.4 ? "100,49,141" : "35,180,200";
    g.addColorStop(0, `rgba(${hue}, ${0.35 + rnd() * 0.45})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.45 + rnd() * 0.4), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(94, 208, 228, 0.25)";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.moveTo(rnd() * w, rnd() * h);
    ctx.bezierCurveTo(rnd() * w, rnd() * h, rnd() * w, rnd() * h, rnd() * w, rnd() * h);
    ctx.stroke();
  }
}

/** Procedural abstract fields. They are generated in the browser and are not experimental images. */
export function MicroTiles() {
  const a = useRef<HTMLCanvasElement>(null);
  const b = useRef<HTMLCanvasElement>(null);
  const c = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const nodes = [a.current, b.current, c.current].filter((n): n is HTMLCanvasElement => !!n);
    const draw = () => nodes.forEach((n, i) => paint(n, 40 + i * 97));
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);
  return (
    <div className="cine-tiles" aria-hidden="true">
      <canvas ref={a} />
      <canvas ref={b} />
      <canvas ref={c} />
    </div>
  );
}
