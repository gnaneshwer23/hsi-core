import { Link } from "../router";
import { PageHero, Section, meta } from "../components/site/ui";
import { StatusChip } from "../components/atlas/EvidenceLegend";

export const pageMeta = meta("About — HSI", "What HSI is for, who is responsible, and how to collaborate or offer expert review.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="What HSI is for."
        intro="HSI helps researchers see what is known, what conflicts and what to investigate next across published biomedical evidence, keeping the experimental context and uncertainty of each finding."
      >
        <a href="#collaboration" className="mt-8 inline-block bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Contact HSI</a>
      </PageHero>

      <Section eyebrow="Why it exists" title="Evidence is spread across disciplines." intro="Publications, experiments and biological relationships are spread across disciplines. HSI connects them and keeps each finding's source, context and review status.">
        <div className="max-w-3xl space-y-4 text-muted-foreground">
          <p>The long-term vision spans human biology, biomedical discovery, clinical research and translational intelligence. The initial research focus is understanding evidence conflict and preparing testable, reviewable research decisions.</p>
          <p>Systemic sclerosis is a validation example, not the platform boundary. Broad scientific coverage must be earned through independently evaluated evidence and scoped expertise.</p>
        </div>
        <div className="glass mt-8 max-w-3xl rounded-2xl p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Illustrative candidate chain</p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded border border-border px-3 py-1.5">T follicular helper cell</span>→
            <span className="rounded border border-border px-3 py-1.5">IL-21 signalling</span>→
            <span className="rounded border border-border px-3 py-1.5">B-cell response</span>
            <StatusChip status="hypothesis" />
          </p>
          <p className="mt-3 text-xs text-muted-foreground">The arrows are unvalidated candidate relationships, shown to explain the idea. They are not findings.</p>
        </div>
      </Section>

      <Section eyebrow="Responsibility" title="Who is responsible." intro="Scientific ownership is identified as Dr. Gnaneshwer Jadav. Independent domain reviewers, security and operational release authorities remain distinct roles.">
        <p className="max-w-3xl text-muted-foreground">
          No institutional affiliations, research partnerships, expert appointments or clinical readiness are claimed without evidence. Public demonstrations are not completed source-cleared investigations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/trust" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Scientific principles</Link>
          <Link to="/how-it-works" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">How it works</Link>
        </div>
      </Section>

      <Section id="collaboration" eyebrow="Collaboration" title="Collaboration and expert review." intro="Independent expert review is being arranged across immunology, disease mechanisms, experimental context and evidence methodology.">
        <div className="max-w-3xl space-y-4 text-muted-foreground">
          <p>Expert recruitment, compensation, confidentiality and a restricted review workspace require separate agreement. No expert panel or institution is represented as recruited or approved.</p>
          <p>For collaboration, begin with your research scope and relevant expertise. Do not send unpublished case material, patient data, private benchmark answers or credentials through a public demonstration.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/contact" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Contact HSI</Link>
          <Link to="/platform/workbench" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">See what a record keeps</Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">The contact page prepares a local browser draft; no message or access request is delivered unless the deployment confirms it.</p>
      </Section>
    </>
  );
}
