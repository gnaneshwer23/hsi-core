import { ShieldCheck } from "lucide-react";
import { Card, PageHero, Section, meta } from "../components/site/ui";

export const pageMeta = meta("Trust & Governance — HSI", "HSI's intended safeguards: evidence provenance, explicit uncertainty, institutional data isolation and human review.");

const items = [
  ["Traceable evidence", "Every claim is designed to link to a specific source passage."],
  ["Source provenance", "Origin, version and access basis recorded for each source."],
  ["Retraction awareness", "Retracted or corrected work is flagged."],
  ["Independent verification", "Claims are designed to be checked by a separate agent."],
  ["Explicit uncertainty", "Confidence and evidence gaps are always stated."],
  ["Permissioned memory", "Memory access follows user, group and institutional roles."],
  ["Institutional isolation", "Designed so that one institution's data never informs another's answers."],
  ["Human exception handling", "Ambiguous cases are designed to be escalated to people."],
  ["Version-controlled records", "Scientific records keep a full change history."],
  ["Benchmark evaluation", "Performance to be measured against scientific benchmarks."],
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Trust & Governance"
        title="Scientific intelligence must earn your trust."
        intro="These are the safeguards HSI is designed around. HSI does not currently claim regulatory certification, validated accuracy or production-grade security. None of these safeguards is running in a deployed service yet."
      />
      <Section eyebrow="Intended safeguards" title="Ten design commitments.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map(([t, d]) => (
            <Card key={t}>
              <ShieldCheck className="size-5 text-verify" />
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section
        eyebrow="Principle"
        title="HSI supports scientific judgement. It does not replace it."
      />
    </>
  );
}
