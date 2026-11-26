import { Link } from "../router";
import { Card, PageHero, Section, StatusTag, meta } from "../components/site/ui";
import { LiveGraphHero } from "../../components/home/LiveGraphHero";
import { GraphSnapshotProvider, useGraphSnapshot } from "../../components/home/useGraphSnapshot";

export const pageMeta = meta(
  "Knowledge graph — HSI",
  "The published HSI knowledge graph: biological concepts linked to the studies that report them, with the model, tissue and uncertainty kept attached. Candidate relationships only; none has been scientifically reviewed.",
);

function RecordedGaps() {
  const { snapshot, failed } = useGraphSnapshot();
  if (failed) return <p className="text-sm text-muted-foreground">The published snapshot could not be loaded, so no figures are shown. Nothing has been substituted.</p>;
  if (!snapshot) return <p role="status" className="text-sm text-muted-foreground">Loading the recorded gaps from the published snapshot…</p>;
  return (
    <>
      <p className="max-w-3xl text-sm text-muted-foreground">
        <strong className="text-foreground">{snapshot.gaps.length}</strong> recorded gaps across <strong className="text-foreground">{snapshot.relationships}</strong> candidate relationships and <strong className="text-foreground">{snapshot.sources}</strong> sources.{" "}
        <strong className="text-foreground">{snapshot.reviewed}</strong> relationships have been scientifically reviewed. Snapshot version {snapshot.version}.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {snapshot.gaps.slice(0, 6).map((g) => (
          <li key={g.question}>
            <Card>
              <h3 className="font-semibold">{g.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.missing}</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-3xl text-xs text-muted-foreground">A recorded gap is a candidate. It may reflect incomplete retrieval or a different term for the same concept, not missing science.</p>
    </>
  );
}

export default function Page() {
  return (
    <GraphSnapshotProvider>
      <PageHero
        eyebrow="Knowledge graph"
        title="Every connection, with the study behind it."
        intro="The graph links biological concepts, such as genes, pathways, cells and diseases, to the studies that report the connection. Each link keeps the species, tissue and design of that study, so you can judge what it supports."
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <StatusTag s="In development" />
        </div>
      </PageHero>

      <Section id="graph" eyebrow="The published graph" title="Explore the graph as published." intro="Search for a concept, filter by area, and select a line to read the study behind it. This is read live from the published snapshot. Every line is a candidate; none is an approved finding.">
        <LiveGraphHero />
        <p className="mt-6 text-sm">
          <Link to="/research/knowledge-graph" className="text-primary hover:underline">Open the full explorer →</Link>
        </p>
      </Section>

      <Section eyebrow="What a line means" title="A line is a recorded connection, not a proven fact.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Source", "The paper and passage the connection came from."],
            ["Context", "Species, tissue, model and dose where the study reports them."],
            ["Status", "Candidate, reviewed or contested. Nothing is implied."],
            ["Limits", "What the study design can and cannot support."],
          ].map(([t, d]) => (
            <Card key={t}>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
          Nothing in the graph has scientific approval. Promoting a relationship is a separate, recorded decision by a person. See <Link to="/trust#validation" className="text-primary underline underline-offset-4">how evidence, inference and approval stay separate</Link>.
        </p>
      </Section>

      <Section id="gaps" eyebrow="Research gaps" title="Where the evidence is thin." intro="Gaps are recorded in the same graph: questions the sources raise but do not answer. The list below comes straight from the published snapshot.">
        <RecordedGaps />
        <p className="mt-6 text-sm">
          <Link to="/research/gaps" className="text-primary hover:underline">Open the recorded gap register →</Link>
        </p>
      </Section>
    </GraphSnapshotProvider>
  );
}
