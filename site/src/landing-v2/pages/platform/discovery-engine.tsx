import { Card, PageHero, Section, meta, PageStatus } from "../../components/site/ui";
import { StatusChip } from "../../components/atlas/EvidenceLegend";
import { Link } from "../../router";
import { WorkspaceFigure } from "../../components/site/WorkspaceFigure";

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
        <PageStatus>The engine is planned. Recorded candidate questions and designs can be inspected in the graph workspace today; the example output further down is illustrative.</PageStatus>
      </PageHero>
      <Section eyebrow="Available today" title="Recorded questions, as candidates you can inspect." intro="The engine that proposes new hypotheses is planned. What works now: the graph workspace shows the questions and gaps recorded with the published graph, each question with its prediction, what would count against it, its candidate experiment and the controls recorded with it.">
        <div className="mb-4 flex flex-wrap items-center gap-3"><Link to="/workspace/graph?mode=hypothesis" className="text-sm text-primary underline underline-offset-4">Open hypothesis mode</Link><Link to="/workspace/graph?mode=experimental" className="text-sm text-primary underline underline-offset-4">Open experimental mode</Link></div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <ul className="grid gap-6">
            {[
              ["Candidate questions", "Labelled “not validated”. Each states what would count against it."],
              ["Candidate designs", "Labelled “not a protocol”. They still need scientific review, a power analysis and ethics approval, none of which HSI does."],
              ["Gaps and questions linked", "Each question lists its recorded gaps, and each gap the questions that cite it, with a suggested next study marked as a candidate."],
              ["Chains, honestly", "Association chains between a question’s concepts are shown where they exist. Where none exists, the workspace says so instead of drawing one."],
            ].map(([t, d]) => (
              <li key={t} className="border-t border-border pt-5">
                <h3 className="font-display text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
          <WorkspaceFigure shot="experiment" caption="A recorded question shown in experimental mode." />
        </div>
      </Section>
      <Section eyebrow="Example output (illustrative)" title="Candidate hypotheses, each with what would falsify it.">
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
