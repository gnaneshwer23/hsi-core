export function PublicNotices() {
  return (
    <section className="hsi-section hsi-notices" aria-label="Website information">
      <div className="hsi-content">
        <h2>Website information</h2>
        <div id="privacy">
          <h3>Privacy information</h3>
          <p>
            The contact page prepares a browser-only draft; it does not send an access request. Account
            authentication uses the configured identity service. Do not enter patient identifiers,
            confidential study material or private benchmark content in public demonstrations. Contact HSI
            before sharing research data or agreeing any data-handling terms.
          </p>
        </div>
        <div id="terms">
          <h3>Research use information</h3>
          <p>
            Public examples are for research and education. They are not scientific approval, treatment
            advice, trial eligibility decisions or permission to reuse source material. Source rights and
            research access are assessed separately. This notice is not a claim of an independently reviewed
            legal policy or a clinical service.
          </p>
        </div>
        <div id="accessibility">
          <h3>Accessibility</h3>
          <p>
            The public experience supports keyboard navigation, visible focus and reduced motion. Scientific
            diagrams have text explanations. If you encounter a barrier, use the contact page to prepare a
            description of the affected route and interaction; that draft is not automatically delivered.
          </p>
        </div>
        <div id="security">
          <h3>Security information</h3>
          <p>
            Research access, source permissions, reviewer scope and publication decisions are independently
            controlled. A website deployment does not authorize live research execution. Do not submit
            passwords, API keys or vulnerability details through a public demonstration. Coordinate a suitable
            reporting channel before sharing sensitive details.
          </p>
        </div>
      </div>
    </section>
  );
}
