import { PageHero, Section, meta } from "../components/site/ui";
import { PersonaTabs } from "../components/site/Interactive";

export const pageMeta = meta("Solutions — HSI", "How HSI supports students, postdocs, PIs, departments, biotech and pharma R&D, and translational researchers.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Value for every research user."
        intro="From a student's first literature review to an R&D team's target decision, HSI adapts to role, scope and permissions."
      />
      <Section eyebrow="Filter by role" title="Choose your perspective.">
        <PersonaTabs />
        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          HSI is research software. It does not process patient data and is not clinical decision support. Clinical
          and translational roles use published evidence and registry context only.
        </p>
      </Section>
    </>
  );
}
