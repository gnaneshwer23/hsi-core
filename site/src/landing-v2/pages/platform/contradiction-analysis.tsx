import { Card, PageHero, Section, meta } from "../../components/site/ui";
import { ContradictionPanel } from "../../components/site/Interactive";

export const pageMeta = meta("Contradiction Intelligence — HSI", "How HSI evaluates conflicting biomedical findings in context and communicates uncertainty explicitly.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Contradiction Intelligence"
        title="Most contradictions are missing context."
        intro="Conflicting results often reflect differences in model system, dose, timing, cohort or method. HSI is designed to surface those variables, assess verification status and state the remaining uncertainty."
      />
      <Section eyebrow="Example" title="Side-by-side evidence analysis.">
        <ContradictionPanel />
      </Section>
      <Section eyebrow="Method" title="How a claim is evaluated.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Extract", "Claim, organism, model, dose, timing, cohort."],
            ["Align", "Group studies by comparable context."],
            ["Verify", "Check passages, retractions and corrections."],
            ["Communicate", "Status, confidence and what would resolve it."],
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
