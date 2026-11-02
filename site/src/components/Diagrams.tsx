/** Original HSI schematic SVGs — ivory/teal/coral tokens. Not derived from third-party dumps. */

const FONT_SANS = "Host Grotesk, system-ui, sans-serif";
const FONT_MONO = "JetBrains Mono, monospace";
const INK = "#0a2e2b";
const NAVY = "#0a2e2b";
const COBALT = "#17645f";
const ACCENT = "#7ab5af";
const BONE = "#f3eee8";
const AMBER = "#e4a65a";
const MUTED = "rgba(138,171,167,0.75)";
const GRID = "rgba(122,181,175,0.08)";

type DiagramProps = {
  className?: string;
  title?: string;
};

export function NetworkGraphDiagram({ className, title = "Evidence graph" }: DiagramProps) {
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 640 360" role="img" aria-label={title} className="diagram-svg">
        <defs>
          <radialGradient id="ng-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ng-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.55" />
            <stop offset="100%" stopColor={COBALT} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect width="640" height="360" rx="20" fill={NAVY} />
        <rect width="640" height="360" rx="20" fill="url(#ng-glow)" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={40 + i * 48} y1="28" x2={40 + i * 48} y2="332" stroke={GRID} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="28" y1={40 + i * 44} x2="612" y2={40 + i * 44} stroke={GRID} />
        ))}
        <g stroke="url(#ng-edge)" strokeWidth="1.6" fill="none">
          <path d="M120 180 C 200 120, 260 120, 320 160" />
          <path d="M320 160 C 380 100, 440 90, 520 130" />
          <path d="M320 160 C 360 220, 400 250, 480 270" />
          <path d="M120 180 C 180 240, 240 260, 320 240" />
          <path d="M320 240 C 380 280, 420 300, 500 310" strokeDasharray="5 5" opacity="0.7" />
          <path d="M200 90 C 250 130, 280 140, 320 160" opacity="0.65" />
        </g>
        {[
          { x: 120, y: 180, r: 18, label: "claim", fill: ACCENT },
          { x: 320, y: 160, r: 22, label: "edge", fill: ACCENT },
          { x: 520, y: 130, r: 16, label: "PMID", fill: AMBER },
          { x: 480, y: 270, r: 16, label: "LOINC", fill: ACCENT },
          { x: 200, y: 90, r: 12, label: "seed", fill: "#7a8f88" },
          { x: 500, y: 310, r: 12, label: "gap", fill: "#7a8f88" },
          { x: 320, y: 240, r: 14, label: "obs", fill: COBALT },
        ].map((n) => (
          <g key={n.label} transform={`translate(${n.x} ${n.y})`}>
            <circle r={n.r + 6} fill={n.fill} opacity="0.12" />
            <circle r={n.r} fill={INK} stroke={n.fill} strokeWidth="2" />
            <text y="4" textAnchor="middle" fill={BONE} fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.06em">
              {n.label}
            </text>
          </g>
        ))}
        <text x="36" y="338" fill="rgba(168,176,200,0.55)" fontFamily={FONT_MONO} fontSize="11" letterSpacing="0.12em">
          SCHEMATIC · NO PHI · ORIGINAL HSI
        </text>
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

export function PipelineDiagram({ className, title = "Claim → marker → observation → action" }: DiagramProps) {
  const stages = [
    { id: "01", label: "Claim", sub: "graded edge" },
    { id: "02", label: "Marker", sub: "LOINC link" },
    { id: "03", label: "Observation", sub: "stub only" },
    { id: "04", label: "Action", sub: "HITL / export" },
  ];
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 640 220" role="img" aria-label={title} className="diagram-svg">
        <rect width="640" height="220" rx="20" fill={NAVY} />
        <path d="M70 110 H570" stroke="rgba(143,168,255,0.35)" strokeWidth="2" strokeDasharray="4 8" fill="none" />
        {stages.map((s, i) => {
          const x = 80 + i * 150;
          return (
            <g key={s.id} transform={`translate(${x} 110)`}>
              <circle r="28" fill={INK} stroke={ACCENT} strokeWidth="2" />
              <text y="-2" textAnchor="middle" fill={ACCENT} fontFamily={FONT_MONO} fontSize="11">
                {s.id}
              </text>
              <text y="14" textAnchor="middle" fill={BONE} fontFamily={FONT_SANS} fontSize="12" fontWeight="600">
                {s.label}
              </text>
              <text y="58" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
                {s.sub}
              </text>
              {i < stages.length - 1 && (
                <path d="M36 0 H114" stroke={COBALT} strokeWidth="2" markerEnd="url(#pipe-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="pipe-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ACCENT} />
          </marker>
        </defs>
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

export function DualConsumerDiagram({ className, title = "One graph · two safe faces" }: DiagramProps) {
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 640 300" role="img" aria-label={title} className="diagram-svg">
        <rect width="640" height="300" rx="20" fill={INK} />
        <rect x="230" y="110" width="180" height="80" rx="16" fill="rgba(57,101,250,0.22)" stroke={ACCENT} strokeWidth="1.5" />
        <text x="320" y="148" textAnchor="middle" fill={ACCENT} fontFamily={FONT_SANS} fontSize="18" fontWeight="600">
          hsi-core
        </text>
        <text x="320" y="170" textAnchor="middle" fill="rgba(240,236,233,0.65)" fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.08em">
          PUBLISH ONLY
        </text>
        <path d="M230 140 C 160 140, 140 90, 110 90" stroke={ACCENT} strokeWidth="1.5" fill="none" opacity="0.7" />
        <rect x="36" y="54" width="150" height="72" rx="14" fill="rgba(143,168,255,0.1)" stroke="rgba(143,168,255,0.4)" />
        <text x="111" y="84" textAnchor="middle" fill={BONE} fontFamily={FONT_SANS} fontSize="15" fontWeight="600">
          ISI
        </text>
        <text x="111" y="104" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          discovery · Ask · Radar
        </text>
        <path d="M410 160 C 480 160, 500 220, 530 220" stroke={AMBER} strokeWidth="1.5" fill="none" opacity="0.75" />
        <rect x="454" y="184" width="150" height="72" rx="14" fill="rgba(228,166,90,0.1)" stroke="rgba(228,166,90,0.4)" />
        <text x="529" y="214" textAnchor="middle" fill={BONE} fontFamily={FONT_SANS} fontSize="15" fontWeight="600">
          Aksh
        </text>
        <text x="529" y="234" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          HITL · Gate C only
        </text>
        <text x="320" y="278" textAnchor="middle" fill="rgba(168,176,200,0.45)" fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.1em">
          CONSUMERS PULL · NEVER INVENT GRADES
        </text>
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

export function GateCDiagram({ className, title = "Gate C — human release" }: DiagramProps) {
  const gates = [
    { y: 70, label: "PMID linked", ok: true },
    { y: 130, label: "curationReview", ok: true, em: "approved" },
    { y: 190, label: "hsiGrade", ok: true, em: "established" },
    { y: 250, label: "isCdsSurfacable", ok: true, em: "pass" },
  ];
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 640 320" role="img" aria-label={title} className="diagram-svg">
        <rect width="640" height="320" rx="20" fill={NAVY} />
        <path d="M120 40 V280" stroke="rgba(143,168,255,0.25)" strokeWidth="3" />
        {gates.map((g, i) => (
          <g key={g.label}>
            <circle cx="120" cy={g.y} r="14" fill={INK} stroke={ACCENT} strokeWidth="2" />
            <path
              d={`M114 ${g.y} l5 5 l10 -12`}
              fill="none"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="160"
              y={g.y - 22}
              width="360"
              height="44"
              rx="12"
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(143,168,255,0.22)"
            />
            <text x="180" y={g.y + 5} fill={BONE} fontFamily={FONT_SANS} fontSize="15" fontWeight="500">
              {`${String(i + 1).padStart(2, "0")}  ${g.label}`}
              {g.em ? <tspan fill={ACCENT}>{`  ·  ${g.em}`}</tspan> : null}
            </text>
          </g>
        ))}
        <text x="36" y="304" fill="rgba(168,176,200,0.5)" fontFamily={FONT_MONO} fontSize="11" letterSpacing="0.1em">
          HUMAN ONLY · NO AUTO-PROMOTE
        </text>
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

export function SystemsLayersDiagram({ className, title = "Substrate layers" }: DiagramProps) {
  const layers = [
    { y: 48, h: 52, label: "Exports · ISI / Aksh maps", tone: ACCENT },
    { y: 112, h: 52, label: "Gate C checklists · curator docs", tone: AMBER },
    { y: 176, h: 52, label: "Seeds · edges · claims", tone: COBALT },
    { y: 240, h: 52, label: "Schema · grades · axes", tone: "#7a8f88" },
  ];
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 640 320" role="img" aria-label={title} className="diagram-svg">
        <rect width="640" height="320" rx="20" fill={NAVY} />
        {layers.map((l) => (
          <g key={l.label}>
            <rect
              x="80"
              y={l.y}
              width="480"
              height={l.h}
              rx="14"
              fill="rgba(11,15,36,0.55)"
              stroke={l.tone}
              strokeWidth="1.5"
              opacity="0.95"
            />
            <circle cx="112" cy={l.y + l.h / 2} r="6" fill={l.tone} />
            <text x="136" y={l.y + l.h / 2 + 5} fill={BONE} fontFamily={FONT_SANS} fontSize="16" fontWeight="500">
              {l.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

/** Wireframe mountain climb — P0–P3 evidence altitude */
export function TerrainClimb({
  className,
  active = "p1",
  onSelect,
}: {
  className?: string;
  active?: string;
  onSelect?: (id: string) => void;
}) {
  const points = [
    { id: "p0", n: "01", label: "P0 SCHEMA", x: 140, y: 310, pillX: 40 },
    { id: "p1", n: "02", label: "P1 DURABLE MAPS", x: 260, y: 240, pillX: 170 },
    { id: "p2", n: "03", label: "P2 RICHER EXPORTS", x: 400, y: 165, pillX: 310 },
    { id: "p3", n: "04", label: "P3 BIO PLUGINS", x: 520, y: 95, pillX: 430 },
  ];
  return (
    <div className={`terrain ${className ?? ""}`}>
      <svg viewBox="0 0 640 380" role="img" aria-label="Evidence altitude climb P0 to P3" className="terrain-svg">
        <defs>
          <linearGradient id="terrain-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a2e2b" />
            <stop offset="45%" stopColor="#1a7a73" />
            <stop offset="100%" stopColor="#7ab5af" />
          </linearGradient>
          <linearGradient id="path-glow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="640" height="380" rx="24" fill="url(#terrain-sky)" />
        {/* wireframe mesh peaks */}
        <g stroke="rgba(200,220,255,0.35)" strokeWidth="1" fill="none">
          <path d="M40 340 L120 300 L200 320 L280 250 L360 280 L440 180 L520 210 L600 90 L620 340 Z" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path
              key={`rid${i}`}
              d={`M${40 + i * 70} 340 L${100 + i * 55} ${300 - i * 18} L${160 + i * 55} ${320 - i * 12}`}
              opacity={0.55}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`vmesh${i}`}
              x1={80 + i * 90}
              y1="340"
              x2={140 + i * 70}
              y2={280 - i * 28}
              opacity="0.4"
            />
          ))}
        </g>
        <path
          d="M120 320 C 180 300, 220 270, 260 240 S 340 190, 400 165 S 470 120, 520 95"
          fill="none"
          stroke="url(#path-glow)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="drop-shadow(0 0 6px rgba(255,255,255,0.6))"
        />
        {points.map((p) => {
          const isActive = active === p.id;
          return (
            <g
              key={p.id}
              className="terrain-node"
              style={{ cursor: onSelect ? "pointer" : "default" }}
              onClick={() => onSelect?.(p.id)}
            >
              {isActive && <circle cx={p.x} cy={p.y} r="16" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />}
              <circle cx={p.x} cy={p.y} r="7" fill="#fff" />
              <line x1={p.x} y1={p.y} x2={p.pillX + 70} y2={p.y - 28} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
              <rect
                x={p.pillX}
                y={p.y - 42}
                width="140"
                height="28"
                rx="14"
                fill={isActive ? "rgba(11,15,36,0.75)" : "rgba(11,15,36,0.45)"}
                stroke="rgba(255,255,255,0.35)"
              />
              <text
                x={p.pillX + 70}
                y={p.y - 23}
                textAnchor="middle"
                fill="#fff"
                fontFamily={FONT_MONO}
                fontSize="9"
                letterSpacing="0.08em"
              >
                {`${p.n} ${p.label}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Light isometric process — schema to publish */
export function IsometricProcess({ className, title = "From seed to publish" }: DiagramProps) {
  const nodes = [
    { x: 90, y: 180, label: "Schema" },
    { x: 220, y: 140, label: "Seed" },
    { x: 360, y: 170, label: "Gate C" },
    { x: 500, y: 120, label: "Export" },
  ];
  return (
    <figure className={`diagram iso-diagram ${className ?? ""}`}>
      <div className="iso-plane">
        <svg viewBox="0 0 640 280" role="img" aria-label={title}>
          <defs>
            <linearGradient id="iso-path" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#17645f" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#17645f" stopOpacity="1" />
            </linearGradient>
            <pattern id="iso-grid" width="40" height="23" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
              <path d="M0 0 H40 M0 0 V23" stroke="rgba(57,101,250,0.12)" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="640" height="280" rx="20" fill="#f7f8fc" />
          <rect width="640" height="280" rx="20" fill="url(#iso-grid)" />
          <path
            d="M90 180 C 150 160, 180 145, 220 140 S 300 155, 360 170 S 440 140, 500 120"
            fill="none"
            stroke="url(#iso-path)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* monoliths */}
          <g>
            <rect x="270" y="70" width="36" height="100" rx="4" fill="#17645f" opacity="0.85" />
            <rect x="310" y="55" width="36" height="115" rx="4" fill="#17645f" opacity="0.7" />
          </g>
          {nodes.map((n) => (
            <g key={n.label} transform={`translate(${n.x} ${n.y})`}>
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#fff" stroke={COBALT} strokeWidth="2" transform="skewY(-12)" />
              <circle r="5" fill={COBALT} />
              <text y="36" textAnchor="middle" fill={INK} fontFamily={FONT_SANS} fontSize="13" fontWeight="600">
                {n.label}
              </text>
            </g>
          ))}
          <text x="40" y="250" fill="rgba(19,25,48,0.45)" fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.1em">
            BUSINESS NEED
          </text>
          <text x="250" y="250" fill={COBALT} fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.1em">
            CURATOR IN THE LOOP
          </text>
          <text x="480" y="250" fill="rgba(19,25,48,0.45)" fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.1em">
            WORKING EXPORT
          </text>
        </svg>
      </div>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

/** Dark agent workflow — claim / evidence / Gate C */
export function AgentWorkflowDiagram({ className, title = "Claim → evidence → Gate C" }: DiagramProps) {
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 720 340" role="img" aria-label={title} className="diagram-svg diagram-svg-wide">
        <defs>
          <radialGradient id="aw-glow" cx="55%" cy="45%" r="40%">
            <stop offset="0%" stopColor={COBALT} stopOpacity="0.35" />
            <stop offset="100%" stopColor={COBALT} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="720" height="340" rx="20" fill={NAVY} />
        <rect width="720" height="340" rx="20" fill="url(#aw-glow)" />
        {/* request */}
        <rect x="24" y="90" width="130" height="160" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(143,168,255,0.25)" />
        <text x="40" y="118" fill={ACCENT} fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.1em">
          THE CLAIM
        </text>
        <text x="40" y="148" fill={BONE} fontFamily={FONT_SANS} fontSize="13">
          Source · seed
        </text>
        <text x="40" y="172" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          Edge graded
        </text>
        <text x="40" y="196" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          PMID linked
        </text>
        <text x="40" y="220" fill={AMBER} fontFamily={FONT_SANS} fontSize="12">
          Gate C pending
        </text>
        {/* process */}
        {[
          { y: 70, t: "Read", d: "axes + citations" },
          { y: 145, t: "Reason", d: "rules · graph · gaps" },
          { y: 220, t: "Act", d: "export · never invent" },
        ].map((b) => (
          <g key={b.t}>
            <rect x="180" y={b.y} width="120" height="55" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(143,168,255,0.3)" />
            <text x="196" y={b.y + 24} fill={BONE} fontFamily={FONT_SANS} fontSize="14" fontWeight="600">
              {b.t}
            </text>
            <text x="196" y={b.y + 42} fill={MUTED} fontFamily={FONT_SANS} fontSize="11">
              {b.d}
            </text>
          </g>
        ))}
        {/* stack cylinders */}
        {[
          { x: 340, y: 70, t: "Embeddings" },
          { x: 340, y: 120, t: "Policies" },
          { x: 340, y: 170, t: "Entity graph" },
          { x: 340, y: 220, t: "Timeline" },
        ].map((c) => (
          <g key={c.t}>
            <ellipse cx={c.x + 50} cy={c.y} rx="48" ry="12" fill="rgba(57,101,250,0.25)" stroke={ACCENT} />
            <rect x={c.x + 2} y={c.y} width="96" height="22" fill="rgba(20,28,55,0.9)" />
            <ellipse cx={c.x + 50} cy={c.y + 22} rx="48" ry="12" fill="rgba(23,100,95,0.35)" stroke={ACCENT} />
            <text x={c.x + 50} y={c.y + 16} textAnchor="middle" fill={BONE} fontFamily={FONT_MONO} fontSize="9">
              {c.t}
            </text>
          </g>
        ))}
        {/* decisions */}
        <ellipse cx="520" cy="130" rx="58" ry="16" fill={COBALT} opacity="0.5" />
        <rect x="462" y="130" width="116" height="36" fill={COBALT} opacity="0.85" />
        <ellipse cx="520" cy="166" rx="58" ry="16" fill={COBALT} />
        <text x="520" y="152" textAnchor="middle" fill="#fff" fontFamily={FONT_SANS} fontSize="13" fontWeight="600">
          Decisions
        </text>
        <circle cx="568" cy="140" r="5" fill="#fff" />
        {/* HITL */}
        <rect x="600" y="90" width="100" height="70" rx="12" fill="rgba(57,101,250,0.2)" stroke={COBALT} strokeWidth="2" />
        <text x="650" y="118" textAnchor="middle" fill={ACCENT} fontFamily={FONT_MONO} fontSize="9">
          YOUR TEAM
        </text>
        <text x="650" y="138" textAnchor="middle" fill={BONE} fontFamily={FONT_SANS} fontSize="12" fontWeight="600">
          Sign-off
        </text>
        <rect x="600" y="180" width="100" height="55" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(143,168,255,0.25)" />
        <text x="650" y="210" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          Learn → rules
        </text>
        <text x="36" y="320" fill="rgba(168,176,200,0.45)" fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.1em">
          ORIGINAL HSI · CLAIM / EVIDENCE / GATE C
        </text>
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

/** Triggers → hub → grades */
export function TriggersFlowDiagram({ className, title = "Triggers → Gate C hub → grades" }: DiagramProps) {
  const left = ["New seed edge", "PMID verified", "REL suggestion", "Gap report"];
  const right = ["established", "uncertain", "unexplored", "Gate C approve"];
  return (
    <figure className={`diagram ${className ?? ""}`}>
      <svg viewBox="0 0 640 300" role="img" aria-label={title} className="diagram-svg">
        <rect width="640" height="300" rx="20" fill="#080b1a" />
        {Array.from({ length: 16 }, (_, i) =>
          Array.from({ length: 8 }, (_, j) => (
            <circle key={`${i}-${j}`} cx={20 + i * 40} cy={20 + j * 36} r="1" fill="rgba(255,255,255,0.08)" />
          )),
        )}
        <text x="48" y="36" fill={ACCENT} fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.14em">
          TRIGGERS
        </text>
        <text x="290" y="36" fill={ACCENT} fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.14em">
          HUB
        </text>
        <text x="470" y="36" fill={ACCENT} fontFamily={FONT_MONO} fontSize="10" letterSpacing="0.14em">
          GRADES
        </text>
        {left.map((t, i) => (
          <g key={t}>
            <rect
              x="36"
              y={58 + i * 50}
              width="160"
              height="38"
              rx="19"
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(143,168,255,0.35)"
            />
            <text x="116" y={82 + i * 50} textAnchor="middle" fill={BONE} fontFamily={FONT_SANS} fontSize="13">
              {t}
            </text>
            <path
              d={`M196 ${77 + i * 50} H250`}
              stroke="rgba(143,168,255,0.4)"
              strokeWidth="1"
            />
          </g>
        ))}
        <rect x="250" y="110" width="140" height="80" rx="16" fill="rgba(57,101,250,0.25)" stroke={ACCENT} strokeWidth="1.5" />
        <text x="320" y="145" textAnchor="middle" fill="#fff" fontFamily={FONT_SANS} fontSize="16" fontWeight="600">
          Gate C
        </text>
        <text x="320" y="168" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          scored · human
        </text>
        {right.map((t, i) => (
          <g key={t}>
            <path d={`M390 ${77 + i * 50} H430`} stroke="rgba(143,168,255,0.4)" strokeWidth="1" />
            <rect
              x="430"
              y={58 + i * 50}
              width="170"
              height="38"
              rx="19"
              fill="rgba(255,255,255,0.04)"
              stroke={i === 3 ? ACCENT : "rgba(143,168,255,0.35)"}
            />
            <circle cx="450" cy={77 + i * 50} r="5" fill={i === 3 ? COBALT : "rgba(143,168,255,0.35)"} />
            <text x="520" y={82 + i * 50} textAnchor="middle" fill={BONE} fontFamily={FONT_SANS} fontSize="13">
              {t}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}

/** Mini diagrams for four system cards */
export function MiniSystemDiagram({ kind }: { kind: "outcomes" | "act" | "build" | "foundations" }) {
  if (kind === "outcomes") {
    return (
      <svg viewBox="0 0 200 100" className="sys-mini" aria-hidden>
        <path d="M20 70 C 50 60, 70 40, 90 45 S 130 55, 160 30" fill="none" stroke={ACCENT} strokeWidth="2" />
        <circle cx="30" cy="68" r="6" fill={INK} stroke={ACCENT} />
        <circle cx="90" cy="45" r="6" fill={INK} stroke={ACCENT} />
        <rect x="145" y="18" width="40" height="22" rx="6" fill={COBALT} />
        <text x="165" y="33" textAnchor="middle" fill="#fff" fontSize="8" fontFamily={FONT_MONO}>
          LIVE
        </text>
      </svg>
    );
  }
  if (kind === "act") {
    return (
      <svg viewBox="0 0 200 100" className="sys-mini" aria-hidden>
        <text x="20" y="20" fill={MUTED} fontSize="8" fontFamily={FONT_MONO}>
          SCORE → ROUTE
        </text>
        {["A", "B", "C"].map((l, i) => (
          <rect key={l} x={16} y={32 + i * 20} width="40" height="14" rx="7" fill="rgba(255,255,255,0.08)" stroke={ACCENT} />
        ))}
        <circle cx="100" cy="55" r="16" fill={COBALT} opacity="0.8" />
        {["ISI", "Aksh", "Gap"].map((l, i) => (
          <rect key={l} x={140} y={28 + i * 22} width="44" height="14" rx="7" fill="rgba(255,255,255,0.08)" stroke={i < 2 ? ACCENT : MUTED} />
        ))}
      </svg>
    );
  }
  if (kind === "build") {
    return (
      <svg viewBox="0 0 200 100" className="sys-mini" aria-hidden>
        <circle cx="100" cy="52" r="28" fill="none" stroke={ACCENT} strokeWidth="1.5" />
        <text x="100" y="56" textAnchor="middle" fill={BONE} fontSize="8" fontFamily={FONT_MONO}>
          GATE C
        </text>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const r = (deg * Math.PI) / 180;
          const x = 100 + Math.cos(r) * 36;
          const y = 52 + Math.sin(r) * 36;
          return <circle key={i} cx={x} cy={y} r="5" fill={i === 1 ? COBALT : INK} stroke={ACCENT} />;
        })}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 100" className="sys-mini" aria-hidden>
      <text x="20" y="22" fill={MUTED} fontSize="8" fontFamily={FONT_MONO}>
        SEVEN ARTIFACTS
      </text>
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={18 + i * 24} y="34" width="16" height="16" rx="3" fill="rgba(143,168,255,0.2)" stroke={ACCENT} />
          <line x1={26 + i * 24} y1="50" x2={26 + i * 24} y2="68" stroke={ACCENT} strokeWidth="1" />
        </g>
      ))}
      <rect x="20" y="68" width="160" height="18" rx="9" fill={COBALT} opacity="0.85" />
      <text x="100" y="81" textAnchor="middle" fill="#fff" fontSize="8" fontFamily={FONT_MONO}>
        ONE SUBSTRATE
      </text>
    </svg>
  );
}
