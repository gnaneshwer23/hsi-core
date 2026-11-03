import { Link } from "react-router-dom";
import {
  ECOSYSTEM_PRODUCTS,
  MATURITY_CHIP_LABEL,
  type EcosystemProduct,
} from "../../lib/productMaturity";

const VISUAL: Record<
  EcosystemProduct["id"],
  { tone: "dark" | "light" | "cream" | "sage"; number: string; headline: string; body: string }
> = {
  isi: {
    tone: "dark",
    number: "01 / SCIENTIFIC INTELLIGENCE",
    headline: "Explore the biology.",
    body: "Investigate cells, pathways, mechanisms and evidence to understand what research tells us—and what remains unknown.",
  },
  clinical: {
    tone: "light",
    number: "02 / CLINICAL INTELLIGENCE",
    headline: "See the full context.",
    body: "Bring authorised longitudinal records, laboratory trends and evidence into a reviewable clinical perspective.",
  },
  aksh: {
    tone: "cream",
    number: "03 / PERSONAL HEALTH",
    headline: "Understand your health.",
    body: "Connect health trends, everyday observations and accessible education in a personalised experience.",
  },
  trials: {
    tone: "sage",
    number: "04 / TRIAL INTELLIGENCE",
    headline: "Connect research to possibility.",
    body: "Explore clinical studies, structured eligibility criteria and missing information with investigator oversight.",
  },
};

/** Order matches founder §02 card sequence: ISI → Clinical → Aksh → Trials. */
const ORDER: EcosystemProduct["id"][] = ["isi", "clinical", "aksh", "trials"];

function CardVisual({ id }: { id: EcosystemProduct["id"] }) {
  if (id === "isi") {
    return (
      <svg viewBox="0 0 350 230" fill="none" aria-hidden>
        <g stroke="currentColor" strokeWidth="1" opacity=".55">
          <path d="M80 112L153 45 235 80 294 31M80 112L160 172 260 150 235 80M153 45L160 172M235 80L260 150M160 172L310 205" />
        </g>
        <g fill="var(--accent)">
          <circle cx="80" cy="112" r="8" />
          <circle cx="153" cy="45" r="7" />
          <circle cx="235" cy="80" r="10" />
          <circle cx="160" cy="172" r="7" />
          <circle cx="260" cy="150" r="7" />
          <circle cx="294" cy="31" r="5" />
          <circle cx="310" cy="205" r="5" />
        </g>
        <g stroke="currentColor" opacity=".2">
          <circle cx="235" cy="80" r="36" />
          <circle cx="235" cy="80" r="60" />
          <circle cx="235" cy="80" r="88" />
        </g>
      </svg>
    );
  }
  if (id === "clinical") {
    return (
      <svg viewBox="0 0 350 230" fill="none" aria-hidden>
        <g stroke="currentColor" opacity=".55">
          <path d="M20 146H65L86 102 113 175 142 68 164 137H203L224 94 246 146H332" strokeWidth="2.5" />
          <path d="M10 70H340M10 110H340M10 150H340M10 190H340" strokeDasharray="3 7" opacity=".35" />
        </g>
        <circle cx="142" cy="68" r="8" fill="var(--live)" />
        <circle cx="224" cy="94" r="6" fill="var(--live)" />
      </svg>
    );
  }
  if (id === "aksh") {
    return (
      <svg viewBox="0 0 350 230" fill="none" aria-hidden>
        <g stroke="currentColor" strokeWidth="2">
          <path d="M26 120C72 120 76 67 121 67S171 157 214 157 259 95 322 95" />
          <path d="M26 148C72 148 76 95 121 95S171 185 214 185 259 123 322 123" opacity=".25" />
        </g>
        <g fill="var(--accent)">
          <circle cx="121" cy="67" r="8" />
          <circle cx="214" cy="157" r="8" />
          <circle cx="322" cy="95" r="7" />
        </g>
        <circle cx="173" cy="120" r="95" stroke="currentColor" opacity=".2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 350 230" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M72 50V183M72 50H150M72 116H150M72 183H150M150 50H244M150 116H244M150 183H244" />
      </g>
      <g fill="var(--accent-soft)" stroke="currentColor">
        <rect x="50" y="30" width="46" height="40" rx="12" />
        <rect x="128" y="30" width="46" height="40" rx="12" />
        <rect x="128" y="96" width="46" height="40" rx="12" />
        <rect x="128" y="163" width="46" height="40" rx="12" />
        <rect x="222" y="30" width="46" height="40" rx="12" />
        <rect x="222" y="96" width="46" height="40" rx="12" />
        <rect x="222" y="163" width="46" height="40" rx="12" />
      </g>
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M141 50l7 7 13-15M141 116l7 7 13-15M235 50l7 7 13-15" />
      </g>
    </svg>
  );
}

type Props = {
  /** Use h1 on dedicated `/products`; h2 when embedded under Platform/Home. */
  headingLevel?: 1 | 2;
  footLink?: { to: string; label: string };
};

/** §02 ecosystem — one foundation, four experiences (founder HTML). */
export function EcosystemGrid({
  headingLevel = 2,
  footLink = { to: "/products", label: "Explore products ↗" },
}: Props) {
  const byId = Object.fromEntries(ECOSYSTEM_PRODUCTS.map((p) => [p.id, p])) as Record<
    EcosystemProduct["id"],
    EcosystemProduct
  >;
  const TitleTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="land-eco section section-grid-light" id="ecosystem" aria-labelledby="eco-title">
      <div className="container">
        <div className="land-eco-heading">
          <div>
            <span className="section-num">02 / THE HSI ECOSYSTEM</span>
            <TitleTag className="display display-xl" id="eco-title" style={{ marginTop: "0.75rem" }}>
              One intelligence.
              <br />
              Four perspectives.
            </TitleTag>
          </div>
          <p className="lede">
            Health cannot be understood in isolation. HSI connects scientific discovery,
            clinical context, personal health and research opportunities through one
            governed intelligence foundation.
          </p>
        </div>

        <div className="land-eco-grid">
          {ORDER.map((id) => {
            const product = byId[id];
            const visual = VISUAL[id];
            const href = product.primaryCta.href;
            return (
              <article key={id} className={`land-eco-card land-eco-${visual.tone}`}>
                <div className="land-eco-top">
                  <span className="land-eco-num">{visual.number}</span>
                  <Link to={href} className="land-eco-arrow" aria-label={product.primaryCta.label}>
                    ↗
                  </Link>
                </div>
                <div className="land-eco-visual">
                  <CardVisual id={id} />
                </div>
                <div className="land-eco-bottom">
                  <div className="land-eco-tag-row">
                    <span className="land-eco-tag">{product.name.toUpperCase()}</span>
                    <span className={`maturity-chip maturity-chip-${product.chip}`}>
                      {MATURITY_CHIP_LABEL[product.chip]}
                    </span>
                  </div>
                  <h3>{visual.headline}</h3>
                  <p>{visual.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="land-eco-foot">
          <span>
            <strong>One governed foundation.</strong> Different questions. Connected understanding.
          </span>
          <Link to={footLink.to} className="text-link">
            {footLink.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
