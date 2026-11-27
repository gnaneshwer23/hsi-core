import { PageHero, Section, meta, PageStatus } from "../../components/site/ui";
import { InvestigationRecord } from "../../components/investigation/InvestigationRecord";

export const pageMeta = meta("Research Workbench Preview — HSI", "Interactive preview of an HSI investigation, from research question to suggested experiments.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Research Workbench"
        title="From a research question to the next experiment."
        intro="An interactive walkthrough of the proposed HSI workflow, using one invented question. It shows what an investigation record keeps at each stage, not a live run."
      >
        <PageStatus>A prototype walkthrough with one invented question. Nothing on this page is a live run.</PageStatus>
      </PageHero>
      <Section eyebrow="Ten stages" title="Click a stage to see what it keeps.">
        <InvestigationRecord labTo="/platform/contradiction-analysis" />
      </Section>
    </>
  );
}
