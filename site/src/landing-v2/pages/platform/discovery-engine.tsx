import { Card, PageHero, Section, StatusTag, meta } from "../../components/site/ui";
import { ConfidenceMeter } from "../../components/site/Visuals";

export const pageMeta = meta("Discovery Engine — HSI", "HSI's planned discovery engine: finding research gaps, proposing testable hypotheses and drafting experiments for expert review.");

const hyps = [
  {
    h: "Reduced faecal butyrate precedes elevated CSF IL-6 in prodromal Parkinson's disease.",
    s: 34,
    n: 31,
    gap: "No longitudinal human cohort",
  },
  {
    h: "AhR ligand availability modulates microglial priming via peripheral immune signalling.",
    s: 22,
    n: 12,
    gap: "Mechanism mostly in vitro",
  },
  {
    h: "Sex-specific SCFA responses explain conflicting murine neuroinflammation results.",
    s: 46,
    n: 19,
    gap: "Few sex-stratified analyses",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Discovery Engine"
        title="From mapped evidence to the next question."
        intro="The Discovery Engine is planned to identify gaps in the evidence, propose testable hypotheses and draft experiment options — always ranked with stated uncertainty and passed to researchers for judgement."
      >
        <div className="mt-6 flex gap-2">
          <StatusTag s="Planned" />
          <StatusTag s="Illustrative" />
        </div>
      </PageHero>
      <Section eyebrow="Example output" title="Candidate hypotheses, ranked with uncertainty.">
        <div className="space-y-4">
          {hyps.map((x, i) => (
            <Card key={x.h} className="grid gap-6 md:grid-cols-[1fr_260px]">
              <div>
                <p className="font-mono text-xs text-primary">H{i + 1}</p>
                <p className="mt-2 text-lg">{x.h}</p>
                <p className="mt-3 font-mono text-xs text-signal">Key gap: {x.gap}</p>
              </div>
              <div className="space-y-3">
                <ConfidenceMeter
                  label="Evidence support"
                  value={x.s}
                  tone={x.s > 40 ? "primary" : "signal"}
                />
                <p className="font-mono text-[11px] text-muted-foreground">
                  {x.n} linked records · requires expert review
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
      <Section eyebrow="Pipeline" title="Four steps, each reviewable.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Gap detection", "Where evidence is thin, conflicting or untested in humans."],
            ["Hypothesis", "Mechanistic, falsifiable statements grounded in the graph."],
            ["Experiment draft", "Model, controls, readouts and power considerations."],
            ["Expert review", "Researchers accept, edit or reject — decisions are remembered."],
          ].map(([t, d], i) => (
            <Card key={t}>
              <p className="font-mono text-xs text-primary">0{i + 1}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
