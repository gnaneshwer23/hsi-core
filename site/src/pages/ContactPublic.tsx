import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/home-redesign.css";
import "../styles/contact-figure.css";
import {AccessIntentPanel} from "../components/AccessIntentPanel";
import {signInHref,signUpHref} from "../lib/researchContext";

const path=[
  ["Create and verify your account","Register with your email address and complete the verification process through the configured authentication provider."],
  ["Confirm research access","An administrator provisions the appropriate permissions. The research backend checks your identity, role and permitted source access."],
  ["Check what you can open","After you sign in, the research account page shows permissions an administrator has provisioned. This page does not start an investigation, and research writes stay closed until an administrator enables them."],
] as const;

/** Contact: research access. A browser draft only; it never submits a request. */
export function ContactPublicPage(){
  return (
    <div className="sp-page fg-page ct-page">
      <header className="fg-hook">
        <h1>Bring your next research question.</h1>
        <div>
          <p className="fg-lead">Create an HSI account if you need one. The question form on this page saves a browser draft only and does not submit an access request or start an investigation. Researcher, source and scientific-review permissions are provisioned independently.</p>
          <div className="sp-actions">
            <Link className="sp-button" to={signUpHref()}>Create an account <span aria-hidden="true">→</span></Link>
            <Link to={signInHref()}>Sign in →</Link>
          </div>
        </div>
      </header>

      <figure className="fg ct-figure" aria-labelledby="ct-cap">
        <ol className="ct-path">
          {path.map(([t,d],i)=>(
            <li key={t}>
              <span className="fg-letter" aria-hidden="true">{String.fromCharCode(65+i)}</span>
              <h2>{t}</h2>
              <p>{d}</p>
            </li>
          ))}
        </ol>
        <figcaption id="ct-cap" className="fg-cap"><b>Figure 5.</b> The access path. Each step is separate: an account does not grant research access, and an administrator's grant does not enable research writes. This page does not write an access request to HSI servers.</figcaption>
      </figure>

      <section className="fg-block ct-draft" aria-labelledby="ct-draft">
        <h2 id="ct-draft">Keep your question while you sign up.</h2>
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
