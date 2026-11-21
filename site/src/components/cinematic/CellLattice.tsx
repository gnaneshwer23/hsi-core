import {useEffect, useRef} from "react";

type Cell = {x: number; y: number; q: number; r: number};

const SIZE = 34;
const CELLS: Cell[] = [];
for (let q = -9; q <= 9; q++) {
  for (let r = -7; r <= 7; r++) {
    const x = SIZE * 1.5 * q;
    const y = SIZE * Math.sqrt(3) * (r + q / 2);
    if (Math.hypot(x, y) < SIZE * 8.6) CELLS.push({x, y, q, r});
  }
}
const NEIGHBORS: [number, number][] = [];
const key = (q: number, r: number) => `${q},${r}`;
const index = new Map(CELLS.map((c, i) => [key(c.q, c.r), i]));
for (const c of CELLS) {
  for (const [dq, dr] of [[1, 0], [0, 1], [-1, 1]] as const) {
    const j = index.get(key(c.q + dq, c.r + dr));
    if (j !== undefined) NEIGHBORS.push([index.get(key(c.q, c.r))!, j]);
  }
}

/** A glowing cell lattice drawn from geometry, labelled with published graph concepts when they have loaded. */
export function CellLattice({labels}: {labels: string[]}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mood = useRef(0);
  const names = useRef(labels);
  names.current = labels;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let alive = true;
    const parent = el.parentElement;

    const paint = (angle: number) => {
      const ctx = el.getContext("2d");
      if (!ctx || !parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w < 2 || h < 2) return;
      if (el.width !== Math.floor(w * dpr) || el.height !== Math.floor(h * dpr)) {
        el.width = Math.floor(w * dpr);
        el.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mix = mood.current;
      const tilt = -0.62;
      const project = (x: number, y: number, z: number) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x1 = x * cos - z * sin;
        const z1 = x * sin + z * cos;
        const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
        const p = 640 / (640 + z2 + 220);
        return {x: w * 0.5 + x1 * p, y: h * 0.78 + y2 * p, z: z2, p};
      };
      const pts = CELLS.map((c) => {
        const z = -0.0022 * (c.x * c.x + c.y * c.y);
        return project(c.x, c.y, z);
      });
      const bloom = ctx.createRadialGradient(w * 0.5, h * 0.72, 20, w * 0.5, h * 0.78, Math.min(w, h) * 0.62);
      bloom.addColorStop(0, `rgba(${80 + mix * 40}, ${40 + (1 - mix) * 80}, ${160 + mix * 40}, 0.55)`);
      bloom.addColorStop(0.45, `rgba(35, 150, 172, ${0.18 * (1 - mix) + 0.05})`);
      bloom.addColorStop(1, "rgba(0, 3, 16, 0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      const edges = NEIGHBORS.map(([a, b]) => ({a, b, z: (pts[a]!.z + pts[b]!.z) / 2})).sort((p, q) => p.z - q.z);
      for (const edge of edges) {
        const A = pts[edge.a]!;
        const B = pts[edge.b]!;
        const magenta = (edge.a * 3 + edge.b) % 11 === 0;
        const front = Math.max(0, Math.min(1, (edge.z + 80) / 220));
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = magenta
          ? `rgba(197, 32, 118, ${0.35 + front * 0.45})`
          : `rgba(${40 + mix * 90}, ${180 - mix * 80}, ${190 - mix * 20}, ${0.28 + front * 0.62})`;
        ctx.lineWidth = 0.8 + front * 1.1;
        ctx.shadowColor = magenta ? "rgba(197,32,118,0.85)" : `rgba(${60 + mix * 80}, ${200 - mix * 90}, 220, 0.9)`;
        ctx.shadowBlur = reduce ? 0 : 10 + front * 8;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      const labelled = [...CELLS.keys()]
        .sort((a, b) => Math.hypot(CELLS[a]!.x, CELLS[a]!.y) - Math.hypot(CELLS[b]!.x, CELLS[b]!.y))
        .slice(0, names.current.length);
      ctx.font = "500 11px Montserrat Variable, Montserrat, sans-serif";
      ctx.textAlign = "center";
      labelled.forEach((i, n) => {
        const p = pts[i]!;
        const name = names.current[n];
        if (!name || p.y < 24 || p.y > h - 8) return;
        ctx.fillStyle = "rgba(216, 219, 230, 0.88)";
        ctx.fillText(name.length > 22 ? name.slice(0, 20) + "…" : name, p.x, p.y - 6);
      });
    };

    const onScroll = () => {
      const y = window.scrollY;
      mood.current = Math.max(0, Math.min(1, y / 640));
      if (parent && !reduce) parent.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});
    const resize = () => paint(reduce ? 0.4 : performance.now() / 9000);
    resize();
    window.addEventListener("resize", resize);
    const loop = (t: number) => {
      if (!alive) return;
      paint(reduce ? 0.4 : t / 9000);
      frame = requestAnimationFrame(loop);
    };
    if (!reduce) frame = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      if (parent) parent.style.transform = "";
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className="cine-lattice"
      role="img"
      aria-label="Abstract cell lattice drawn from the published knowledge graph. It is a visual, not a scientific claim."
    />
  );
}
