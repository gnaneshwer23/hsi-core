import { Link } from "../../router";
import { PageHero, Section, meta } from "../../components/site/ui";
import { WorkspaceFigure } from "../../components/site/WorkspaceFigure";
import { AgentBoard } from "../../components/agents/AgentBoard";

export const pageMeta = meta("Scientific AI Agents — HSI", "Specialised scientific agents for synthesis, verification, contradiction detection, hypothesis generation and experimental design.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Scientific AI Agents"
        title="Narrow agents. Shared evidence. Contested conclusions."
        intro="Instead of one general model answering everything, HSI is designed to orchestrate specialised agents. Each output is designed to be checked by another agent, and every step to remain inspectable."
      />
      <Section eyebrow="Orchestration" title="Who produces, who checks, who decides.">
        <AgentBoard />
      </Section>
      <Section eyebrow="Available today" title="NEXUS in the graph workspace." intro="Three deterministic checks run now, over a selection you build from the graph. They add no reasoning of their own, and every answer is a candidate finding that cannot change the graph.">
        <div className="mb-4 flex flex-wrap items-center gap-3"><Link to="/workspace/graph" className="text-sm text-primary underline underline-offset-4">Open the workspace</Link></div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <ul className="grid gap-6">
            {[
              ["Compare the selected findings", "Tests whether two findings are comparable before a difference is treated as disagreement. No pair is ever confirmed as a contradiction."],
              ["Separate gaps from coverage limits", "Distinguishes a question the graph records from something the graph has simply not captured."],
              ["List candidate chains", "Directed association chains between two concepts. A chain is an association path, not a mechanism."],
              ["Proposals, not changes", "A finding can be downloaded as a proposal for independent review. The investigation record downloads only after it reproduces exactly."],
              ["Model interpretation is off", "Interpretation by a language model is listed and disabled until an approved deployment and evaluation exist."],
            ].map(([t, d]) => (
              <li key={t} className="border-t border-border pt-5">
                <h3 className="font-display text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
          <WorkspaceFigure shot="nexus" caption="NEXUS comparing six recorded findings. Each answer is labelled deterministic, not model-backed, with no scientific approval." />
        </div>
      </Section>
      <Section eyebrow="Design rules" title="Four rules every chain is built around.">
        <ol className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {[
            ["Narrow responsibility", "An agent does one job and states what it does not do, so its output can be judged on its own terms."],
            ["A separate checker", "What an agent produces is checked by a different agent, never by itself, and disputed claims also go to a person."],
            ["Returned with a reason", "A claim that fails a check goes back with the reason and stays out of the output until it is fixed."],
            ["People decide", "Agents propose. A reviewer sees the evidence, the conflicts and the uncertainty, and records a decision."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t border-border pt-5">
              <p className="font-mono text-xs text-primary">0{i + 1}</p>
              <h3 className="mt-2 font-display text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
