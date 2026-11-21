import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/home-redesign.css";
import "../styles/contact-figure.css";
import "../styles/premium-public.css";
import "../styles/stage2-landing.css";
import {AccessIntentPanel} from "../components/AccessIntentPanel";
import {LandingEvidenceCard, LandingMaturityLabel} from "../components/landing/LandingPrimitives";
import {signInHref,signUpHref} from "../lib/researchContext";

const path=[
  ["Create and verify your account","Register with your email address and complete the verification process through the configured authentication provider."],
  ["Confirm research access","An administrator provisions the appropriate permissions. The research backend checks your identity, role and permitted source access."],
  ["Check what you can open","After you sign in, the research account page shows permissions an administrator has provisioned. This page does not start an investigation, and research writes stay closed until an administrator enables them."],
] as const;

const ACCESS_TIERS=[
  {
    title: "Individual researcher",
    body: "Research preview for a single investigator: public literature retrieval, published graph and on-device records. Permissions remain administrator-provisioned.",
    maturity: "available" as const,
  },
  {
    title: "Research group",
    body: "Group-oriented access for PIs and teams. Organisation tables, seats and confidential science unlocks are not sold on this page.",
    maturity: "planned" as const,
  },
  {
    title: "Organisation / institution",
    body: "Institutional programmes under separate agreement. No subscription price, seat catalogue or auto-provisioned writes are listed here.",
    maturity: "planned" as const,
  },
] as const;

/** Contact: research access. Browser draft always; server delivery only when the deployment is configured. */
export function ContactPublicPage(){
  return (
    <div className="sp-page fg-page ct-page pg-page pg-sub s2-landing">
      <header className="pg-phero">
        <h1>Request a design-partner pilot.</h1>
        <div>
          <p className="pg-lead">Tell us the research question you want to test with HSI. This page prepares a local draft. An access request is sent only when notification delivery is configured, and it does not grant research access or scientific-review rights. The page never claims operator receipt unless the server reports provider acceptance, and grants remain administrator-provisioned. Researcher, source and scientific-review permissions are provisioned independently. An account is not research access.</p>
          <div className="pg-cta">
            <a className="pg-btn" href="#pilot-request">Start a pilot request <span aria-hidden="true">→</span></a>
            <Link className="pg-link" to={signUpHref()}>Create an account <span aria-hidden="true">→</span></Link>
            <Link className="pg-link" to={signInHref()}>Sign in <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </header>

      <section className="pg-block" aria-labelledby="ct-tiers">
        <h2 id="ct-tiers">Access shapes (planned labels only).</h2>
        <p className="pg-sub-p">
          No prices, subscriptions or seat SKUs are published here. Labels describe intended access shapes — not a
          checkout. <LandingMaturityLabel level="planned" /> means not offered for purchase on this page.
        </p>
        <div className="s2-card-grid">
          {ACCESS_TIERS.map((t)=>(
            <LandingEvidenceCard key={t.title} title={t.title} body={t.body} maturity={t.maturity} />
          ))}
        </div>
        <p className="s2-section-note" role="note">
          Former <code>/pricing</code> URLs redirect here. Do not treat this section as a commercial offer.
        </p>
      </section>

      <figure className="fg ct-figure pg-block" aria-labelledby="ct-cap">
        <ol className="ct-path">
          {path.map(([t,d],i)=>(
            <li key={t}>
              <span className="fg-letter" aria-hidden="true">{String.fromCharCode(65+i)}</span>
              <h2>{t}</h2>
              <p>{d}</p>
            </li>
          ))}
        </ol>
        <figcaption id="ct-cap" className="fg-cap"><b>Figure 5.</b> The access path. Each step is separate: an account does not grant research access, and an administrator's grant does not enable research writes. An access request, when delivery is configured, notifies the operator only — it does not provision permissions.</figcaption>
      </figure>

      <section className="fg-block ct-draft pg-block" id="pilot-request" aria-labelledby="ct-draft">
        <h2 id="ct-draft">Start a pilot request</h2>
        <div>
          <AccessIntentPanel />
          <p className="ct-scope" role="note">Browser drafts are optional. Create an account, then an administrator grants research access. Check status on your research account after sign-in.</p>
          <p><Link to="/research/account">Check your research account →</Link></p>
          <p><Link to="/trust">Evidence, review and safety boundaries →</Link></p>
        </div>
      </section>
    </div>
  );
}
