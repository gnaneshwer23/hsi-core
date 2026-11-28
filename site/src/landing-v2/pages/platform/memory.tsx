import { Card, PageHero, Section, meta, PageStatus } from "../../components/site/ui";

export const pageMeta = meta("Scientific Memory Engine — HSI", "Persistent, permission-controlled scientific memory: lineage tracking, contextual recall and cross-project synthesis.");

const timeline = [
  ["Entry 1", "Question defined", "Does intervention X lower marker Y?"],
  ["Entry 2", "Evidence retrieved", "Sources searched and filter rule saved; preprints flagged"],
  ["Entry 3", "Reviewer note", "A reviewer: set aside studies that do not report sex"],
  ["Entry 4", "Hypothesis saved", "H1 linked to its source passages; marked a proposal"],
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Scientific Memory Engine"
        title="Research that remembers — and knows where it came from."
        intro="Laboratories lose context when people move on, projects end or notes scatter. The Memory Engine preserves questions, evidence, decisions and reviewer judgement as version-controlled, permissioned scientific records."
      >
        <PageStatus>In development and not enabled for researchers. The record history below is an illustrative example.</PageStatus>
      </PageHero>
      <Section eyebrow="Capabilities" title="Four properties of scientific memory.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [
              "Persistent lab memory",
              "Investigations, protocols and reasoning are retained beyond individual sessions and team members.",
            ],
            [
              "Lineage tracking",
              "Each conclusion links to the passages, decisions and versions that produced it.",
            ],
            [
              "Contextual recall",
              "When a new question touches past work, relevant memory is surfaced — with its original uncertainty.",
            ],
            [
              "Cross-project synthesis",
              "Connect findings across projects, restricted to what each user is authorised to access.",
            ],
          ].map(([t, d]) => (
            <Card key={t}>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section
        eyebrow="Lineage"
        title="An investigation, versioned."
        intro="How one record changes over time, as an example."
      >
        <ol className="relative max-w-2xl border-l border-helix/40 pl-8">
          {timeline.map(([v, t, d]) => (
            <li key={v} className="mb-8">
              <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-helix" />
              <p className="font-mono text-xs text-helix">{v}</p>
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section
        eyebrow="Permissions"
        title="Memory belongs to the institution that created it."
        intro="Memory is scoped per user, group, lab or institution. HSI is designed so that one institution's memory is never used to answer another's questions."
      />
    </>
  );
}
