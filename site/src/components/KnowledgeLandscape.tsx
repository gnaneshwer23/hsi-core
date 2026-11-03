/** Original conceptual wireframe. Geometry is decorative, not a measured biological surface. */
function project(x: number, z: number) {
  const height = 1.35 * Math.exp(-((x + .55) ** 2 + (z + .15) ** 2) / 1.15)
    + .7 * Math.exp(-((x - 1.8) ** 2 + (z - .3) ** 2) / .65)
    + .06 * Math.sin(x * 3 + z * 2);
  return [700 + x * 176 + z * 82, 270 + z * 71 - height * 160];
}
const rows = Array.from({ length: 31 }, (_, row) => Array.from({ length: 81 }, (_, col) => project(-3.8 + col * .095, -1.9 + row * .127)));
const columns = Array.from({ length: 41 }, (_, col) => Array.from({ length: 31 }, (_, row) => rows[row][col * 2]));
const path = (points: number[][]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export function KnowledgeLandscape() {
  return <svg className="v2-knowledge-landscape" viewBox="0 0 1400 480" fill="none" role="img" aria-labelledby="landscape-title landscape-desc">
    <title id="landscape-title">A landscape of connected knowledge</title>
    <desc id="landscape-desc">An original illustrative wireframe connects health context, biological systems and scientific evidence. It does not depict study measurements.</desc>
    <defs>
      <linearGradient id="v2-landscape-fade" x1="0" y1="0" x2="0" y2="1"><stop stopColor="white"/><stop offset=".77" stopColor="white"/><stop offset="1" stopColor="black"/></linearGradient>
      <linearGradient id="v2-landscape-line" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#17645f" stopOpacity=".12"/><stop offset=".5" stopColor="#17645f" stopOpacity=".65"/><stop offset="1" stopColor="#17645f" stopOpacity=".12"/></linearGradient>
      <mask id="v2-landscape-mask"><rect width="1400" height="480" fill="url(#v2-landscape-fade)"/></mask>
    </defs>
    <g mask="url(#v2-landscape-mask)" stroke="url(#v2-landscape-line)" strokeWidth=".7">{rows.map((r,i)=><path key={`r${i}`} d={path(r)}/>)}{columns.map((c,i)=><path key={`c${i}`} d={path(c)}/>)}</g>
    {[
      { x: 310, y: 269, label: "HEALTH CONTEXT", dx: -55, dy: -65 },
      { x: 650, y: 64, label: "BIOLOGICAL SYSTEMS", dx: 65, dy: -10 },
      { x: 1045, y: 229, label: "SCIENTIFIC EVIDENCE", dx: 35, dy: -62 },
    ].map(p=><g key={p.label}><circle cx={p.x} cy={p.y} r="14" stroke="#ff6845" strokeOpacity=".5"/><circle cx={p.x} cy={p.y} r="4" fill="#ff6845"/><path d={`M${p.x},${p.y-15}L${p.x},${p.y+p.dy}L${p.x+p.dx},${p.y+p.dy}`} stroke="#17645f" strokeOpacity=".55"/><rect x={p.x+p.dx-8} y={p.y+p.dy-22} width={p.label.length*6.7+16} height="27" rx="3" fill="#f3eee8" fillOpacity=".95"/><text x={p.x+p.dx} y={p.y+p.dy-5} fill="#17645f" fontFamily="monospace" fontSize="10" letterSpacing="1">{p.label}</text></g>)}
  </svg>;
}
