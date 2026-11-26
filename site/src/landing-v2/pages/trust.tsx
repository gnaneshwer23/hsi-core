import { Link } from "../router";
import { PageHero, Section, meta } from "../components/site/ui";
import { Spine, Statements } from "../components/site/Spine";
import { SiteNotices } from "../components/site/SiteNotices";

export const pageMeta = meta("Trust & Governance — HSI", "How HSI separates evidence from approval: five separate states, recorded decisions, source permissions and provenance.");

const principles = [
  ["Source use", "Each use is tied to the exact passage and version, with attribution and the current identity and retraction status. Unknown or revoked clearance blocks that use."],
  ["Scoped review", "Independent reviewers assess a fixed version within a stated scope of expertise. Self-review and decisions outside that scope are refused."],
  ["Honest uncertainty", "Missing context, failed or empty searches and unsupported causal steps stay visible. A bounded demonstration is not reported as cross-domain readiness."],
];
const memory = [
  ["Owned and scoped", "Each remembered item belongs to one researcher within one organisation and project scope. It is designed so another organisation cannot read it, and sharing is an explicit grant to a named person."],
  ["Expiry and revocation", "Items carry a retention date, and a share carries its own expiry. A revoked or expired share stops working at the next lookup."],
  ["Export and audit", "Only the owner can export an item, the current version only, and each export is recorded. Nothing is delivered outside the system."],
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Trust & governance"
        title="How HSI separates evidence from approval."
        intro="A statement extracted from a paper is not an approved fact, and a relationship proposed by a model is not a validated mechanism. Each moves through separate, recorded steps."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#validation" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Read the methodology</a>
          <Link to="/contact" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Request a pilot conversation</Link>
        </div>
      </PageHero>

      <Section id="scientific-governance" eyebrow="Five states" title="Each change recorded with a reason." intro="Study observation, computational interpretation, independent verification, scientific review and publication are different states. Nothing moves between them without a recorded decision.">
        <Spine
          label="The five states"
          items={[
            { title: "Study observation", text: "What a source reports, with its version, passage and conditions." },
            { title: "Computational interpretation", text: "An inference to examine; uncertainty stays attached." },
            { title: "Independent verification", text: "Check support, context, source rights and missing evidence." },
            { title: "Human scientific review", text: "A scoped independent decision on an immutable version." },
            { title: "Separate publication decision", text: "No automatic promotion into reviewed graph knowledge." },
          ]}
        />
        <Statements items={["A missing search result is not proof that evidence does not exist.", "Model agreement is not independent scientific validation.", "Human review and graph publication require separate governance."]} />
      </Section>

      <Section eyebrow="Provenance" title="Source permissions and provenance." intro="A source title, a model answer or a merged change does not replace current, independently verified evidence.">
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {principles.map(([t, d]) => (
            <div key={t} className="border-t border-border pt-5">
              <h3 className="font-display text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="scientific-memory" eyebrow="Scientific memory" title="Designed to be owned, scoped and expiring." intro="Persistent scientific memory is in development and is not enabled for researchers. These are the design rules it is being built and tested against, not features you can use today.">
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {memory.map(([t, d]) => (
            <div key={t} className="border-t border-border pt-5">
              <h3 className="font-display text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <Statements items={["A remembered note is not a verified finding.", "Memory does not enter the knowledge graph on its own.", "A note cannot support a claim until it passes the same evidence and review steps as any other source."]} />
        <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
          Status: the database procedures behind these rules have been tested in a disposable PostgreSQL database with synthetic data. No real research content is stored, and no live memory service is running. Embedding for retrieval is limited to synthetic fixtures; no external embedding provider is approved.
        </p>
      </Section>

      <Section id="validation" eyebrow="Validation" title="A methodology, not a scoreboard." intro="Benchmarks and evaluation harnesses exist as frameworks. Public pages do not invent accuracy percentages, and expert-labelled gold cases are not claimed.">
        <div className="max-w-3xl space-y-4 text-muted-foreground">
          <p>The workflow-rehearsal surface at /research/validation is a different page. It is not this methodology, and it is not clinical validation.</p>
          <p>HSI is not an NHS service, not a medical device, and not clinical decision support. UK research context does not imply an institutional partnership.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/platform/workbench" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">See what an investigation record keeps</Link>
          <Link to="/contact" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Request a pilot conversation</Link>
        </div>
      </Section>

      <Section eyebrow="Limits" title="Implementation is not independent validation." intro="The 120-case immunology protocol is an authoring and evaluation framework. It is not 120 expert-adjudicated scientific results.">
        <p className="max-w-3xl text-muted-foreground">
          External source/provider operation, researcher isolation, real scientific gold, independent results and operational release evidence require their own acceptance. Public examples do not run live models or enable research writes.
        </p>
      </Section>

      <SiteNotices />
    </>
  );
}
