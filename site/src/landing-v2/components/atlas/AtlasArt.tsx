import type { ReactNode } from "react";
import type { AtlasDomain, AtlasDomainKey } from "./atlasData";

/**
 * Original line illustrations, one per domain, drawn at low opacity behind the entities. They depict the kind of biology each
 * domain covers (a T cell, a neuron and microglia, gut bacteria, DNA with a variant, an intestinal epithelium, a tumour cell
 * cluster). They are schematic, not to scale and not data. All coordinates are local to the domain's territory (370 x 300).
 */
const ink = "var(--foreground)";
const L = { fill: "none", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function helix(x0: number, x1: number, y: number, amp: number, accent: string): ReactNode {
  const pts = (phase: number) => {
    const n = 48;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      d += `${i ? "L" : "M"}${x.toFixed(1)},${(y + amp * Math.sin((i / n) * Math.PI * 6 + phase)).toFixed(1)} `;
    }
    return d;
  };
  const rungs: ReactNode[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, x = x0 + (x1 - x0) * t, a = Math.sin(t * Math.PI * 6), b = Math.sin(t * Math.PI * 6 + Math.PI);
    rungs.push(<line key={i} x1={x.toFixed(1)} y1={(y + amp * a).toFixed(1)} x2={x.toFixed(1)} y2={(y + amp * b).toFixed(1)} stroke={ink} opacity={0.35} strokeWidth={0.8} />);
  }
  return (
    <>
      {rungs}
      <path d={pts(0)} stroke={accent} {...L} />
      <path d={pts(Math.PI)} stroke={ink} {...L} opacity={0.7} />
    </>
  );
}

const art: Record<AtlasDomainKey, (accent: string) => ReactNode> = {
  immunology: (accent) => (
    <g transform="translate(300 240)">
      {/* T cell: membrane, nucleus, receptor stalks with Y tips */}
      <circle r="44" stroke={accent} {...L} />
      <circle cx="-4" cy="2" r="24" stroke={ink} {...L} opacity={0.7} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, x1 = Math.cos(a) * 44, y1 = Math.sin(a) * 44, x2 = Math.cos(a) * 58, y2 = Math.sin(a) * 58;
        const tx = Math.cos(a + 0.35) * 64, ty = Math.sin(a + 0.35) * 64, ux = Math.cos(a - 0.35) * 64, uy = Math.sin(a - 0.35) * 64;
        return <path key={i} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} M${x2.toFixed(1)},${y2.toFixed(1)} L${tx.toFixed(1)},${ty.toFixed(1)} M${x2.toFixed(1)},${y2.toFixed(1)} L${ux.toFixed(1)},${uy.toFixed(1)}`} stroke={ink} {...L} opacity={0.6} />;
      })}
    </g>
  ),
  neuroscience: (accent) => (
    <g>
      {/* neuron: soma, branching dendrites, myelinated axon */}
      <circle cx="205" cy="60" r="15" stroke={accent} {...L} />
      <path d="M192,52 C170,40 160,30 140,28 M170,36 C160,20 150,14 138,10 M193,70 C170,82 160,92 140,96 M198,74 C186,92 178,104 166,114 M218,52 C236,38 240,28 256,22" stroke={ink} {...L} opacity={0.7} />
      <path d="M220,66 C250,76 280,70 330,98" stroke={accent} {...L} />
      {[248, 276, 304].map((x, i) => (
        <rect key={x} x={x} y={60 + i * 9 + (i === 2 ? 4 : 0)} width="16" height="8" rx="4" transform={`rotate(${14 + i * 8} ${x + 8} ${64 + i * 9})`} stroke={ink} {...L} opacity={0.55} />
      ))}
    </g>
  ),
  microbiome: (accent) => (
    <g>
      {/* rod-shaped bacteria with flagella, and small metabolite particles */}
      {[[300, 60, 20], [255, 95, -30], [315, 120, 55], [80, 200, 10]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <rect x="-24" y="-8" width="48" height="16" rx="8" stroke={i % 2 ? ink : accent} {...L} opacity={i % 2 ? 0.6 : 1} />
          <path d="M24,0 C34,-6 40,6 50,0" stroke={ink} {...L} opacity={0.5} />
        </g>
      ))}
      {[[215, 150], [236, 168], [222, 186], [344, 190], [330, 214], [30, 160], [48, 178]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.5 : 2.4} fill={i % 2 ? accent : ink} opacity={0.6} />
      ))}
    </g>
  ),
  genomics: (accent) => (
    <g>
      {helix(14, 356, 38, 15, accent)}
      {/* a variant marked on the strand */}
      <path d="M250,16 l7,9 l-7,9 l-7,-9 z" fill="var(--signal)" opacity={0.9} />
      {/* expression matrix (rows = cells, columns = genes) */}
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 7 }, (_, c) => (
          <rect key={`${r}-${c}`} x={236 + c * 17} y={228 + r * 14} width="13" height="10" rx="1.5" fill={accent} opacity={0.12 + ((r * 7 + c * 5) % 6) * 0.1} />
        )),
      )}
    </g>
  ),
  organ: (accent) => (
    <g>
      {/* intestinal epithelium in profile: villi above, a crypt dipping below, a lining of cells with tight-junction ticks */}
      <path d="M10,250 C40,250 50,282 80,282 C110,282 120,250 150,250 C165,250 170,206 190,206 C210,206 215,250 235,250 C255,250 262,200 285,200 C308,200 315,250 335,250 L360,250" stroke={accent} {...L} />
      <path d="M10,262 C40,262 50,292 80,292 C110,292 120,262 150,262 C165,262 170,218 190,218 C210,218 215,262 235,262 C255,262 262,212 285,212 C308,212 315,262 335,262 L360,262" stroke={ink} {...L} opacity={0.5} />
      {[40, 80, 120, 160, 190, 222, 262, 285, 322].map((x, i) => (
        <line key={x} x1={x} y1={i % 3 === 1 ? 282 : 250} x2={x} y2={i % 3 === 1 ? 292 : 262} stroke={ink} strokeWidth="1" opacity="0.45" />
      ))}
    </g>
  ),
  disease: (accent) => (
    <g>
      {/* a tumour cell cluster with a few T cells at its margin */}
      {[[290, 235, 24], [320, 252, 17], [262, 255, 16], [300, 200, 13], [326, 218, 12]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} stroke={i === 0 ? accent : ink} {...L} opacity={i === 0 ? 1 : 0.65} />
          <circle cx={x! + 2} cy={y! + 1} r={r! * 0.4} stroke={ink} {...L} opacity={0.45} />
        </g>
      ))}
      {[[236, 215], [348, 270]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" stroke="var(--verify)" {...L} />
      ))}
    </g>
  ),
};

/** The territory background and its illustration. Pointer-inert; the entities are drawn above it. */
export function AtlasTerritory({ d, index, dimmed }: { d: AtlasDomain; index: number; dimmed: boolean }) {
  return (
    <g transform={`translate(${d.x} ${d.y})`} opacity={dimmed ? 0.35 : 1} style={{ transition: "opacity .25s" }}>
      <rect width={d.w} height={d.h} rx="14" fill="var(--card)" fillOpacity="0.45" stroke="var(--border)" strokeOpacity="0.8" />
      <g opacity="0.3">{art[d.key](d.accent)}</g>
      <text x="16" y="28" className="max-md:hidden" fill="var(--muted-foreground)" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.2">
        {String(index + 1).padStart(2, "0")} · {d.name.toUpperCase()}
      </text>
    </g>
  );
}
