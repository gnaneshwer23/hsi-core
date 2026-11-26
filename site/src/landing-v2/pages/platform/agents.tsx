import { PageHero, Section, meta } from "../../components/site/ui";
import { AgentBoard } from "../../components/agents/AgentBoard";

export const pageMeta = meta("Scientific AI Agents — HSI", "Specialised scientific agents for synthesis, verification, contradiction detection, hypothesis generation and experimental design.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Scientific AI Agents"
        title="Narrow agents. Shared evidence. Contested conclusions."
        intro="Instead of one general model answering everything, HSI is designed to orchestrate specialised agents. Each output is designed to be checked by another agent, and every step to remain inspectable."
      />
      <Section eyebrow="Orchestration" title="Who produces, who checks, who decides.">
        <AgentBoard />
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
