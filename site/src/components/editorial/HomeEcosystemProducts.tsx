import { Link } from "react-router-dom";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL } from "../../lib/productMaturity";

/** Section 9 — four governed products with truthful maturity. */
export function HomeEcosystemProducts() {
  return (
    <section className="cl-modules cl-chapter cl-chapter-instrument" aria-labelledby="ecosystem-title">
      <div className="cl-chapter-inner">
        <h2 id="ecosystem-title">Independent intelligence. One connected health ecosystem.</h2>
        <p className="cl-chapter-lead">
          Four products interoperate through governed interfaces. Patient data does not move unrestricted into research.
          Maturity chips come from the product registry — not marketing invention.
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
                <p>{product.chipDetail}</p>
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
