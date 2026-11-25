import { Card, PageHero, Section, StatusTag, meta } from "../../components/site/ui";
import { KnowledgeGraph, PathwayMap } from "../../components/site/Visuals";

export const pageMeta = meta("Biological Knowledge Graph — HSI", "How HSI connects genes, cells, metabolites and phenotypes across six biological domains, with every relation tied to evidence.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Platform · Knowledge Graph"
        title={
          <>
            Every relation, <span className="text-gradient">tied to evidence.</span>
          </>
        }
        intro="HSI is designed to represent biology as entities and relations — each carrying its source passages, model system and verification status — so you can see what is supported, contested or only hypothesised."
      >
        <div className="mt-6 flex gap-2">
          <StatusTag s="In development" />
          <StatusTag s="Illustrative" />
        </div>
      </PageHero>
      <Section eyebrow="Explore" title="Select any entity to inspect its relations.">
        <KnowledgeGraph />
      </Section>
      <Section
        eyebrow="Across omic layers"
        title="From variant to phenotype."
        intro="Hover a layer to trace associations between genome, transcriptome, proteome, metabolome and observed phenotype."
      >
        <PathwayMap />
      </Section>
      <Section eyebrow="Design principles" title="What a relation carries.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Provenance", "Source passage, version and access basis."],
            ["Context", "Organism, tissue, model, dose and timing."],
            ["Status", "Supported, contested or hypothesis — never implied."],
            ["Permissions", "Private lab relations stay inside your institution."],
          ].map(([t, d]) => (
            <Card key={t}>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
