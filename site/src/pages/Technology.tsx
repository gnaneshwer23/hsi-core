import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SharedSoftwareArt } from "../components/platform/PlatformArt";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";
import "../styles/hsi-editorial.css";
import "../styles/platform.css";

const PAGE_TITLE = `Technology — ${PRODUCT_NAME}`;
const PAGE_DESCRIPTION =
  "How Human Super Intelligence shares technology patterns across products while keeping each product’s data and permissions separate. Not clinical decision support.";

const pillars = [
  {
    number: "01",
    title: "Shared capability patterns",
    body: "Evidence lookup, knowledge context, investigation structure and review are reusable software patterns. Products can adopt them without inventing a second stack.",
  },
  {
    number: "02",
    title: "Product-owned data",
    body: "Each product keeps its own authentication, permissions and database. Sharing technology does not create a shared patient or research evidence store.",
  },
  {
    number: "03",
    title: "Human review stays explicit",
    body: "Investigations remain candidate work until an authorised person reviews them. No Gate C auto-approve and no live clinical decision support are claimed here.",
  },
] as const;

/** Thin public Technology page — operating-model story; Platform holds architecture depth. */
export function Technology() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? null;

    document.title = PAGE_TITLE;
    meta?.setAttribute("content", PAGE_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) {
        meta.setAttribute("content", previousDescription);
      }
    };
  }, []);

  return (
    <div className="hsi-editorial">
      <section className="hsi-platform-hero" aria-labelledby="technology-title">
        <div className="hsi-editorial-wrap hsi-platform-hero-grid">
          <div className="hsi-platform-hero-copy">
            <p className="hsi-editorial-kicker">
              <span className="hsi-coral-dot" /> {PRODUCT_NAME} / TECHNOLOGY
            </p>
            <h1 id="technology-title">
              Share the software.<br />
              <em>Keep the boundaries.</em>
            </h1>
            <p className="hsi-editorial-lede">
              {PRODUCT_SHORT} is the shared technology foundation behind distinct product
              experiences. Patterns travel; records stay behind each product’s permissions wall.
            </p>
            <div className="hsi-editorial-actions">
              <Link className="hsi-editorial-button" to="/platform">
                Explore the platform <span aria-hidden="true">↗</span>
              </Link>
              <Link className="hsi-editorial-textlink" to="/products">
                See the products ↗
              </Link>
            </div>
          </div>
          <figure className="hsi-idea-figure">
            <SharedSoftwareArt />
            <figcaption>
              Operating model · shared {PRODUCT_SHORT} software · product silos · not a live data
              pipe
            </figcaption>
          </figure>
        </div>
        <div className="hsi-editorial-wrap hsi-platform-hero-foot">
          <span>Shared technology · product-owned data</span>
          <span>Editorial overview · architecture depth on Platform</span>
        </div>
      </section>

      <section className="hsi-editorial-intro hsi-platform-idea" aria-labelledby="tech-pillars-title">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">01 / THE SHARED FOUNDATION</p>
          <h2 id="tech-pillars-title">
            What is shared —<br />
            <em>and what is not.</em>
          </h2>
          <div className="hsi-tech-pillars" role="list">
            {pillars.map((item) => (
              <article key={item.number} role="listitem">
                <span aria-hidden="true">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <p className="hsi-tech-depth-note">
            This page is a short technology overview. For product perspectives, capability patterns
            and the connected architecture, continue to{" "}
            <Link className="hsi-editorial-textlink" to="/platform">
              Platform
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
