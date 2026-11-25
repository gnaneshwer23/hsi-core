import { PageHero, Section, meta } from "../../components/site/ui";
import { ContradictionLab } from "../../components/contradiction/ContradictionLab";

export const pageMeta = meta("Contradiction Intelligence — HSI", "How HSI evaluates conflicting biomedical findings in context and communicates uncertainty explicitly.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Contradiction Intelligence"
        title="Most contradictions are missing context."
        intro="Conflicting results often reflect differences in model system, dose, timing, cohort or method. HSI is designed to surface those variables, assess verification status and state the remaining uncertainty."
      />
      <Section eyebrow="Try it" title="Align the studies, then judge the conflict.">
        <ContradictionLab />
      </Section>
      <Section eyebrow="Method" title="How a claim is evaluated.">
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            ["Extract", "Claim, organism, model, dose, timing and cohort from each source."],
            ["Align", "Group studies by comparable context, and keep missing values visible."],
            ["Verify", "Check passages, retractions and corrections before comparing."],
            ["Communicate", "State the status, the gaps and what would resolve it."],
          ].map(([t, d], i) => (
            <li key={t} className="relative border-t border-border pt-5">
              <span className="absolute -top-1.5 left-0 size-3 rounded-full border border-primary bg-background" aria-hidden />
              <p className="font-mono text-xs text-primary-ink">0{i + 1}</p>
              <h3 className="mt-2 font-display text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
