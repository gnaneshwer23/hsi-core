import { Card, PageHero, Section, StatusTag, meta } from "../../components/site/ui";
import { StatusChip } from "../../components/atlas/EvidenceLegend";

export const pageMeta = meta("Discovery Engine — HSI", "HSI's planned discovery engine: finding research gaps, proposing testable hypotheses and drafting experiments for expert review.");

const hyps = [
  {
    h: "The timing of an intervention relative to the inflammatory insult explains mixed results across studies.",
    status: "hypothesis" as const,
    gap: "Few studies vary timing alone",
    falsified: "Studies that vary timing alone show the same effect.",
  },
  {
    h: "A candidate metabolite modulates brain immune cells through peripheral immune signalling.",
    status: "hypothesis" as const,
    gap: "The mechanism is mostly shown in vitro",
    falsified: "Blocking the peripheral signal leaves the brain-cell response unchanged.",
  },
  {
    h: "Sex-specific responses explain conflicting results in animal models.",
    status: "association" as const,
    gap: "Few sex-stratified analyses",
    falsified: "Sex-stratified reanalyses show no difference between sexes.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Discovery Engine"
        title="From mapped evidence to the next question."
        intro="The Discovery Engine is planned to identify gaps in the evidence, propose testable hypotheses and draft experiment options — always ranked with stated uncertainty and passed to researchers for judgement."
      >
        <div className="mt-6 flex gap-2">
          <StatusTag s="Planned" />
          <StatusTag s="Illustrative" />
        </div>
      </PageHero>
      <Section eyebrow="Example output" title="Candidate hypotheses, each with what would falsify it.">
        <div className="space-y-4">
          {hyps.map((x, i) => (
            <Card key={x.h} className="grid gap-6 md:grid-cols-[1fr_260px]">
              <div>
                <p className="font-mono text-xs text-primary">H{i + 1}</p>
                <p className="mt-2 text-lg">{x.h}</p>
                <p className="mt-3 font-mono text-xs text-signal">Key gap: {x.gap}</p>
              </div>
              <div className="space-y-3 text-sm">
                <StatusChip status={x.status} />
                <p className="text-muted-foreground"><span className="font-mono text-[11px] uppercase tracking-widest">Falsified if</span><br />{x.falsified}</p>
                <p className="font-mono text-[11px] text-muted-foreground">A proposal · requires expert review</p>
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
