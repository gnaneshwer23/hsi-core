import { Link } from "../../router";
import { PageHero, Section, StatusTag, meta } from "../../components/site/ui";
import { WorkspaceFigure } from "../../components/site/WorkspaceFigure";
import { ContradictionLab } from "../../components/contradiction/ContradictionLab";

export const pageMeta = meta("Contradiction Intelligence — HSI", "How HSI evaluates conflicting biomedical findings in context and communicates uncertainty explicitly.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Contradiction Intelligence"
        title="Most contradictions are missing context."
        intro="Conflicting results often reflect differences in model system, dose, timing, cohort or method. HSI is designed to surface those variables, assess verification status and state the remaining uncertainty."
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusTag s="Prototype" />
          <Link to="/workspace/graph?mode=contradiction" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Open contradiction mode</Link>
        </div>
      </PageHero>
      <Section eyebrow="On the published graph" title="Three readings, kept apart, never resolved." intro="In the graph workspace, recorded disagreements are sorted by the context each finding states. No reading says which finding is right, and every one carries “adjudication: not performed”.">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <ol className="grid gap-6">
            {[
              ["Potential contradiction", "One fully stated context holds both a reported and a negative finding. A candidate for a genuine conflict that needs expert reading."],
              ["Possible context dependence", "The findings differ only across contexts, such as population, timepoint or endpoint. The difference may be the context."],
              ["Insufficient context to tell", "A disagreeing finding does not state its study system or design, so comparability cannot be judged."],
              ["Side by side", "Compare two to six findings on direction and eight context variables, each marked same, differs, cannot tell or not stated by any. A missing value is “cannot tell”, never “differs”."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-border pt-5">
                <p className="font-mono text-xs text-primary">0{i + 1}</p>
                <h3 className="mt-2 font-display text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
          <WorkspaceFigure shot="contradiction" caption="Disagreements recorded in the published graph, and the side-by-side comparison of one of them." cta="Open contradiction mode" to="/workspace/graph?mode=contradiction" />
        </div>
      </Section>
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
