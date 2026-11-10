import { Link } from "react-router-dom";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL } from "../../lib/productMaturity";

/** Four governed products — maturity chips from the registry, not marketing invention. */
export function HomeEcosystemProducts() {
  return (
    <section className="cl-modules cl-chapter cl-chapter-instrument" aria-labelledby="ecosystem-title">
      <div className="cl-chapter-inner">
        <h2 id="ecosystem-title">Four products. One governed ecosystem.</h2>
        <p className="cl-chapter-lead">
          Products interoperate through governed interfaces. Patient data does not auto-enter the research knowledge
          graph. Immune Super Intelligence is the scientific discovery module within this ecosystem. Detail for each
          product lives on its module page.
        </p>
        <ol className="cl-module-list">
          {ECOSYSTEM_PRODUCTS.map((product, index) => (
            <li key={product.id}>
              <span className="cl-module-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="cl-module-role">
                  {MATURITY_CHIP_LABEL[product.chip]} · {product.oneLine}
                </p>
                <h3>{product.name}</h3>
                <p className="cl-module-mustnot">{product.mustNot.join(" · ")}</p>
                <div className="cl-journey-actions">
                  <Link to={product.primaryCta.href}>{product.primaryCta.label}</Link>
                  {product.secondaryCta ? (
                    <Link to={product.secondaryCta.href}>{product.secondaryCta.label}</Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
