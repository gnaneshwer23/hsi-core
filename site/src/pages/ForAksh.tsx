import { AkshHealthLanding } from "../components/landing/AkshHealthLanding";

/**
 * Aksh Health product landing — founder Downloads/index (1).html
 * (personal health intelligence). Technical HITL/CDS boundary: /aksh-agents.
 */
export function ForAksh() {
  const configured = import.meta.env.VITE_AKSH_APP_URL as string | undefined;
  let researchUrl: string | null = null;
  try {
    if (configured) {
      const url = new URL(configured);
      if (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
        researchUrl = new URL("/hsi", url).href;
      }
    }
  } catch { /* An invalid deployment URL must not become a clickable link. */ }
  return <>
    <section className="section section-ink">
      <div className="container">
        <span className="eyebrow">Aksh × HSI</span>
        <h1 className="display display-md">Connected research. Separate care records.</h1>
        <p className="lede">Aksh is the care application in the HSI ecosystem. Shared concept mappings connect it to HSI research context; patient records and clinical decisions remain in Aksh.</p>
        <div className="dc-hero-actions">
          <a className="btn btn-primary" href="https://www.akshhealth.com" target="_blank" rel="noreferrer">Open Aksh Health ↗</a>
          {researchUrl ? <a className="btn btn-ghost" href={researchUrl} target="_blank" rel="noreferrer">Open shared research context ↗</a> : null}
        </div>
        <p className="muted">Research context is a read-only preview, not patient-specific advice or clinical approval.</p>
      </div>
    </section>
    <AkshHealthLanding />
  </>;
}
