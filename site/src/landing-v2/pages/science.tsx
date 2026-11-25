import { PageHero, Section, meta } from "../components/site/ui";
import { domains } from "../lib/site-data";

export const pageMeta = meta("Scientific Domains — HSI", "Six domains of human biology connected in one intelligence layer: immunology, neuroscience, microbiome, genomics, tissue biology and disease mechanisms.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Science"
        title="Six domains. One connected biology."
        intro="Biological questions rarely respect disciplinary boundaries. HSI treats each domain with equal depth and reasons across them."
      />
      {domains.map((d, i) => (
        <Section
          key={d.key}
          id={d.key}
          eyebrow={`Domain 0${i + 1}`}
          title={d.name}
          intro={d.summary}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="space-y-3">
              {d.questions.map((q) => (
                <li key={q} className="border-l-2 border-primary/50 pl-4">
                  {q}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap content-start gap-2">
              {d.ids.map((id) => (
                <span
                  key={id}
                  className="rounded border border-border bg-card px-2 py-1 font-mono text-xs"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
