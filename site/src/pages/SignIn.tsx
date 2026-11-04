import { Link } from "react-router-dom";
import "../styles/sign-in.css";

/**
 * Research authentication entry. This page intentionally does not accept
 * passwords until the trusted same-origin Neon Auth integration is deployed.
 */
export function SignIn() {
  return (
    <section className="hsi-sign-in" aria-labelledby="sign-in-heading">
      <div className="hsi-sign-in-card">
        <p className="hsi-sign-in-eyebrow">HSI / SECURE RESEARCH ACCESS</p>
        <h1 id="sign-in-heading">Researcher sign in</h1>
        <p className="hsi-sign-in-description">
          A secure workspace for exploring governed biomedical evidence,
          research relationships and scientific review decisions.
        </p>
        <div className="hsi-sign-in-status" role="status">
          <strong>Secure sign-in is being connected.</strong>
          <p>Neon Auth is configured in our isolated test environment. We are validating
          session handling and researcher permissions before enabling sign-in here.
          No credentials are collected on this page.</p>
        </div>
        <Link className="hsi-sign-in-back" to="/science">Explore public science <span aria-hidden="true">↗</span></Link>
        <p className="hsi-sign-in-footnote">Research access requires an approved account. Public science pages remain available without signing in.</p>
      </div>
    </section>
  );
}
