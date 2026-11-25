import { PageHero, Section, meta } from "../components/site/ui";
import { EarlyAccessForm } from "../components/site/EarlyAccessForm";

export const pageMeta = meta("Early Access & Pilots — HSI", "Apply for early access, research collaboration or an institutional pilot with HSI.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Early Access"
        title="Help shape the future of scientific intelligence."
        intro="Join early access, become a research collaborator, or discuss an institutional pilot. We are looking for partners to help validate HSI rigorously."
      />
      <Section eyebrow="Application" title="Tell us about your research.">
        <EarlyAccessForm />
      </Section>
    </>
  );
}
