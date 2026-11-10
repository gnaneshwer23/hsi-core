import { Link } from "react-router-dom";
import { PUBLIC_PRIMARY_CTA } from "../../lib/ctaPolicy";

function Arrow() {
  return (
    <span className="cl-arrow" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="16" height="16">
        <path
          d="M4 10h12M11 5l5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Section 10 — access and collaboration CTAs to verified workflows. */
export function HomeAccess() {
  return (
    <section className="cl-cta cl-chapter cl-chapter-cta" aria-labelledby="access-title">
      <div className="cl-chapter-inner">
        <h2 id="access-title">Advance research through connected scientific intelligence.</h2>
        <p>
          Evidence-grounded environment for researchers and institutions investigating complex human biology.
        </p>
        <div className="cl-actions">
          <Link className="cl-arrow-link cl-arrow-link-solid" to={PUBLIC_PRIMARY_CTA.to}>
            Request Research Access <Arrow />
          </Link>
          <Link className="cl-text-link cl-text-link-on-deep" to="/how-it-works">
            Explore How HSI Works
          </Link>
          <Link className="cl-text-link cl-text-link-on-deep" to="/contact">
            Contact for Collaboration
          </Link>
        </div>
      </div>
    </section>
  );
}
