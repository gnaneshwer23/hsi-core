import { Section } from "./ui";

/** The website information notices (privacy, research use, accessibility, security). The ids are linked from elsewhere on the site. */
export function SiteNotices() {
  const items: [string, string, string][] = [
    ["privacy", "Privacy information", "The contact page keeps a browser draft and, only when delivery is configured on the deployment, can notify the HSI operator of an access request. It never claims a request was sent without server confirmation. Account authentication uses the configured identity service. Do not enter patient identifiers, confidential study material or private benchmark content in public demonstrations. Contact HSI before sharing research data or agreeing any data-handling terms."],
    ["terms", "Research use information", "Public examples are for research and education. They are not scientific approval, treatment advice, trial eligibility decisions or permission to reuse source material. Source rights and research access are assessed separately. This notice is not a claim of an independently reviewed legal policy or a clinical service."],
    ["accessibility", "Accessibility", "The public experience supports keyboard navigation, visible focus and reduced motion. Scientific diagrams have text explanations. If you encounter a barrier, use the contact page to describe the affected route and interaction. Delivery to the operator happens only when that channel is configured and the server confirms it."],
    ["security", "Security information", "Research access, source permissions, reviewer scope and publication decisions are independently controlled. A website deployment does not authorize live research execution. Do not submit passwords, API keys or vulnerability details through a public demonstration. Coordinate a suitable reporting channel before sharing sensitive details."],
  ];
  return (
    <Section eyebrow="Website information" title="Privacy, research use, accessibility and security.">
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {items.map(([id, t, d]) => (
          <div key={id} id={id} className="scroll-mt-24 border-t border-border pt-5">
            <h3 className="font-display text-lg font-medium">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
