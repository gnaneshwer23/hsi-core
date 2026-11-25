import { Card, PageHero, Section, StatusTag, meta } from "../../components/site/ui";
import { agents } from "../../lib/site-data";

export const pageMeta = meta("Scientific AI Agents — HSI", "Specialised scientific agents for synthesis, verification, contradiction detection, hypothesis generation and experimental design.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Scientific AI Agents"
        title="Narrow agents. Shared evidence. Contested conclusions."
        intro="Instead of one general model answering everything, HSI is designed to orchestrate specialised agents. Each output is designed to be checked by another agent, and every step to remain inspectable."
      />
      <Section eyebrow="Agents" title="Six responsibilities, clearly separated.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => (
            <Card key={a.name}>
              <p className="font-mono text-xs text-muted-foreground">
                agent.{String(i + 1).padStart(2, "0")}
              </p>
              <div className="mt-2 flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold">{a.name}</h3>
                <StatusTag s={a.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a.role}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section eyebrow="Orchestration" title="How agents collaborate." intro="Illustrative flow.">
        <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
          {[
            "Question",
            "Literature Synthesis",
            "Evidence Verification",
            "Contradiction Detection",
            "Hypothesis Generation",
            "Experimental Design",
            "Expert review",
          ].map((s, i, a) => (
            <span key={s} className="flex items-center gap-3">
              <span
                className={
                  i === a.length - 1
                    ? "rounded-md border border-verify/50 bg-verify/10 px-3 py-2 text-verify"
                    : "rounded-md border border-border bg-card px-3 py-2"
                }
              >
                {s}
              </span>
              {i < a.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Every chain ends with a human. Agents propose; scientists decide.
        </p>
      </Section>
    </>
  );
}
