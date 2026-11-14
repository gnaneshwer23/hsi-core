import { PRODUCT_NAME, PRODUCT_SHORT } from "../../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL } from "../../lib/productMaturity";

/** Hero operating-model panel — shared software vs product-owned data. */
export function FoundationArt() {
  return (
    <div
      className="hsi-platform-foundation"
      role="img"
      aria-label="Operating model: Human Super Intelligence is the shared technology foundation. Four product experiences reuse that software while each keeps its own data and governance. Evidence, knowledge and review are reusable patterns—not a live cross-product data pipe."
    >
      <div className="hsi-platform-foundation-label">OPERATING MODEL · HOW IT WORKS</div>
      <p className="hsi-platform-foundation-lede">
        One shared technology foundation. Four product experiences. Separate data ownership. Humans still review.
      </p>

      <div className="hsi-platform-foundation-core">
        <span className="hsi-platform-symbol" aria-hidden="true">
          {PRODUCT_SHORT[0]}
        </span>
        <div>
          <strong>{PRODUCT_NAME}</strong>
          <span>Shared technology foundation — software reuse, not a shared evidence database</span>
        </div>
      </div>

      <div className="hsi-platform-foundation-split">
        <div className="hsi-platform-foundation-shared">
          <span className="hsi-platform-foundation-eyebrow">What is shared</span>
          <p>Capability patterns each product can reuse in its own environment.</p>
          <ul>
            <li>Evidence</li>
            <li>Knowledge</li>
            <li>Review</li>
          </ul>
          <small>Connected context · Traceable evidence · Human review</small>
        </div>
        <div className="hsi-platform-foundation-owned">
          <span className="hsi-platform-foundation-eyebrow">What is never shared</span>
          <p>Product data, access rights and governance stay with each experience.</p>
          <div className="hsi-platform-foundation-products">
            {ECOSYSTEM_PRODUCTS.map((item) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <small>{MATURITY_CHIP_LABEL[item.chip]} · own data · own governance</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="hsi-platform-foundation-foot">
        Software reuse. Product-owned data. No live cross-product sync claimed here.
      </p>
    </div>
  );
}

/** Cream idea-panel art: shared HSI core with four permission-walled product silos — not Home’s connection map. */
export function SharedSoftwareArt() {
  const silos = [
    { x: 48, y: 48, title: "PATIENT-REPORTED", sub: "Own records", short: "PATIENT" },
    { x: 372, y: 48, title: "CLINICAL CONTEXT", sub: "Own records", short: "CLIN" },
    { x: 48, y: 318, title: "SCIENTIFIC DISCOVERY", sub: "Own evidence", short: "SCIENCE" },
    { x: 372, y: 318, title: "STUDY CONTEXT", sub: "Own studies", short: "STUDY" },
  ] as const;

  return (
    <svg
      className="hsi-platform-silo-art"
      viewBox="0 0 660 560"
      role="img"
      aria-label="Operating model diagram: Human Super Intelligence software at the centre, with four product silos behind permissions walls. Technology can be reused; product records stay inside each silo."
    >
      <defs>
        <radialGradient id="platform-silo-glow">
          <stop stopColor="#C4E5DB" stopOpacity=".85" />
          <stop offset="1" stopColor="#FFFAF4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="platform-silo-wall" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#17645F" stopOpacity=".15" />
          <stop offset=".5" stopColor="#FF6845" stopOpacity=".55" />
          <stop offset="1" stopColor="#17645F" stopOpacity=".15" />
        </linearGradient>
      </defs>
      <ellipse
        className="hsi-platform-silo-glow"
        cx="330"
        cy="280"
        rx="300"
        ry="240"
        fill="url(#platform-silo-glow)"
      />

      {/* Cross-silo permission walls — records do not cross */}
      <rect x="318" y="42" width="24" height="476" fill="url(#platform-silo-wall)" opacity=".9" />
      <rect x="42" y="268" width="576" height="24" fill="url(#platform-silo-wall)" opacity=".9" />
      <text x="330" y="36" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="2" fill="#FF6845">
        PERMISSIONS WALLS
      </text>

      {silos.map((silo) => (
        <g key={silo.short}>
          <rect
            x={silo.x}
            y={silo.y}
            width="240"
            height="194"
            rx="4"
            fill="#FFFAF4"
            stroke="#17645F"
            strokeOpacity=".35"
            strokeWidth="1.5"
          />
          <rect
            x={silo.x + 14}
            y={silo.y + 14}
            width="212"
            height="166"
            rx="2"
            fill="#F3EEE8"
            stroke="#17645F"
            strokeOpacity=".18"
          />
          <text
            x={silo.x + 120}
            y={silo.y + 78}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            letterSpacing="1.6"
            fill="#17645F"
          >
            {silo.title}
          </text>
          <text x={silo.x + 120} y={silo.y + 102} textAnchor="middle" fontSize="11" fill="#466D67">
            {silo.sub}
          </text>
          <text
            x={silo.x + 120}
            y={silo.y + 138}
            textAnchor="middle"
            fontSize="10"
            letterSpacing="1.2"
            fill="#17645F"
            opacity=".7"
          >
            SILO · NOT SHARED
          </text>
        </g>
      ))}

      {/* Software reuse rays stop at the wall edge — they do not carry records; unanimated on purpose */}
      <g fill="none" stroke="#FF6845" strokeWidth="1.4" strokeDasharray="5 7" opacity=".85">
        <path d="M330 280 L270 210" />
        <path d="M330 280 L390 210" />
        <path d="M330 280 L270 350" />
        <path d="M330 280 L390 350" />
      </g>

      <g className="hsi-platform-silo-core" transform="translate(330 280)">
        <circle r="78" fill="#17645F" />
        <circle r="64" fill="none" stroke="#F3EEE8" strokeOpacity=".35" strokeDasharray="3 6" />
        <text y="-8" textAnchor="middle" fontSize="22" fontWeight="800" letterSpacing="2" fill="#F3EEE8">
          {PRODUCT_SHORT}
        </text>
        <text y="16" textAnchor="middle" fontSize="10" letterSpacing="1.4" fill="#D3E1D9">
          SHARED SOFTWARE
        </text>
        <text y="32" textAnchor="middle" fontSize="9" fill="#A8C4BB">
          not shared records
        </text>
      </g>
    </svg>
  );
}

/** Accountability-band connection map — technology shared, records never shared. */
export function PlatformConnectionMap() {
  return (
    <div className="hsi-platform-connection-visual">
      <div
        className="hsi-editorial-connection-map hsi-platform-connection-map"
        role="img"
        aria-label="Connection map: Human Super Intelligence shared technology at the centre. The patient-reported, clinical, scientific and study capabilities each keep their own data. Technology is shared; records are never shared."
      >
        <div className="hsi-editorial-map-core">
          {PRODUCT_SHORT}
          <small>SHARED TECH</small>
        </div>
        <span>PATIENT-REPORTED · OWN DATA</span>
        <span>CLINICAL · OWN DATA</span>
        <span>SCIENTIFIC · OWN DATA</span>
        <span>STUDIES · OWN DATA</span>
      </div>
      <p className="hsi-platform-connection-legend">
        <b>Technology shared</b>
        <span aria-hidden="true">·</span>
        <b>Data never shared</b>
      </p>
    </div>
  );
}
