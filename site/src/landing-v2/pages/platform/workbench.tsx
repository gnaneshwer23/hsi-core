import { PageHero, Section, StatusTag, meta } from "../../components/site/ui";
import { InvestigationDemo } from "../../components/site/Interactive";

export const pageMeta = meta("Research Workbench Preview — HSI", "Interactive preview of an HSI investigation, from research question to suggested experiments.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Research Workbench"
        title="From a research question to the next experiment."
        intro="An interactive walkthrough of the proposed HSI workflow using an illustrative question about gut microbiome metabolites and neuroinflammation."
      >
        <div className="mt-6 flex gap-2">
          <StatusTag s="Illustrative" />
          <StatusTag s="Prototype" />
        </div>
      </PageHero>
      <Section eyebrow="Ten stages" title="Click a stage to inspect its output.">
        <InvestigationDemo />
      </Section>
    </>
  );
}
