/** Original HSI schematic SVGs — cobalt/navy tokens. Not derived from third-party dumps. */

const FONT_SANS = "Host Grotesk, system-ui, sans-serif";
const FONT_MONO = "JetBrains Mono, monospace";
const INK = "#0b0f24";
const NAVY = "#0a1028";
const COBALT = "#3965fa";
const ACCENT = "#8fa8ff";
const BONE = "#f0ece9";
const AMBER = "#e4a65a";
const MUTED = "rgba(168,176,200,0.75)";
const GRID = "rgba(143,168,255,0.08)";

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
          <line
            key={`v${i}`}
            x1={40 + i * 48}
            y1="28"
            x2={40 + i * 48}
            y2="332"
            stroke={GRID}
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="28"
            y1={40 + i * 44}
            x2="612"
            y2={40 + i * 44}
            stroke={GRID}
          />
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
            <text
              y="4"
              textAnchor="middle"
              fill={BONE}
              fontFamily={FONT_MONO}
              fontSize="10"
              letterSpacing="0.06em"
            >
              {n.label}
            </text>
          </g>
        ))}
        <text
          x="36"
          y="338"
          fill="rgba(168,176,200,0.55)"
          fontFamily={FONT_MONO}
          fontSize="11"
          letterSpacing="0.12em"
        >
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
        <path
          d="M70 110 H570"
          stroke="rgba(143,168,255,0.35)"
          strokeWidth="2"
          strokeDasharray="4 8"
          fill="none"
        />
        {stages.map((s, i) => {
          const x = 80 + i * 150;
          return (
            <g key={s.id} transform={`translate(${x} 110)`}>
              <circle r="28" fill={INK} stroke={ACCENT} strokeWidth="2" />
              <text y="-2" textAnchor="middle" fill={ACCENT} fontFamily={FONT_MONO} fontSize="11">
                {s.id}
              </text>
              <text
                y="14"
                textAnchor="middle"
                fill={BONE}
                fontFamily={FONT_SANS}
                fontSize="12"
                fontWeight="600"
              >
                {s.label}
              </text>
              <text y="58" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
                {s.sub}
              </text>
              {i < stages.length - 1 && (
                <path
                  d="M36 0 H114"
                  stroke={COBALT}
                  strokeWidth="2"
                  markerEnd="url(#pipe-arrow)"
                />
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
        <rect
          x="230"
          y="110"
          width="180"
          height="80"
          rx="16"
          fill="rgba(57,101,250,0.22)"
          stroke={ACCENT}
          strokeWidth="1.5"
        />
        <text
          x="320"
          y="148"
          textAnchor="middle"
          fill={ACCENT}
          fontFamily={FONT_SANS}
          fontSize="18"
          fontWeight="600"
        >
          hsi-core
        </text>
        <text
          x="320"
          y="170"
          textAnchor="middle"
          fill="rgba(240,236,233,0.65)"
          fontFamily={FONT_MONO}
          fontSize="10"
          letterSpacing="0.08em"
        >
          PUBLISH ONLY
        </text>
        <path
          d="M230 140 C 160 140, 140 90, 110 90"
          stroke={ACCENT}
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
        <rect
          x="36"
          y="54"
          width="150"
          height="72"
          rx="14"
          fill="rgba(143,168,255,0.1)"
          stroke="rgba(143,168,255,0.4)"
        />
        <text
          x="111"
          y="84"
          textAnchor="middle"
          fill={BONE}
          fontFamily={FONT_SANS}
          fontSize="15"
          fontWeight="600"
        >
          ISI
        </text>
        <text x="111" y="104" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          discovery · Ask · Radar
        </text>
        <path
          d="M410 160 C 480 160, 500 220, 530 220"
          stroke={AMBER}
          strokeWidth="1.5"
          fill="none"
          opacity="0.75"
        />
        <rect
          x="454"
          y="184"
          width="150"
          height="72"
          rx="14"
          fill="rgba(228,166,90,0.1)"
          stroke="rgba(228,166,90,0.4)"
        />
        <text
          x="529"
          y="214"
          textAnchor="middle"
          fill={BONE}
          fontFamily={FONT_SANS}
          fontSize="15"
          fontWeight="600"
        >
          Aksh
        </text>
        <text x="529" y="234" textAnchor="middle" fill={MUTED} fontFamily={FONT_SANS} fontSize="12">
          HITL · Gate C only
        </text>
        <text
          x="320"
          y="278"
          textAnchor="middle"
          fill="rgba(168,176,200,0.45)"
          fontFamily={FONT_MONO}
          fontSize="10"
          letterSpacing="0.1em"
        >
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
            <text
              x="180"
              y={g.y + 5}
              fill={BONE}
              fontFamily={FONT_SANS}
              fontSize="15"
              fontWeight="500"
            >
              {`${String(i + 1).padStart(2, "0")}  ${g.label}`}
              {g.em ? <tspan fill={ACCENT}>{`  ·  ${g.em}`}</tspan> : null}
            </text>
          </g>
        ))}
        <text
          x="36"
          y="304"
          fill="rgba(168,176,200,0.5)"
          fontFamily={FONT_MONO}
          fontSize="11"
          letterSpacing="0.1em"
        >
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
            <text
              x="136"
              y={l.y + l.h / 2 + 5}
              fill={BONE}
              fontFamily={FONT_SANS}
              fontSize="16"
              fontWeight="500"
            >
              {l.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="diagram-cap">{title}</figcaption>
    </figure>
  );
}
