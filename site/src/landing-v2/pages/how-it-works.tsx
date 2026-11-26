import { Link } from "../router";
import { PageHero, Section, meta } from "../components/site/ui";
import { Spine } from "../components/site/Spine";
import { RelationshipLenses } from "../components/site/Lenses";

export const pageMeta = meta("How It Works — HSI", "From scientific questions to evidence-linked decisions: the investigation journey, the conditions behind findings and how scientific review stays separate.");

const STEPS = [
  ["Define the question", "Start with a research question, biological mechanism, publication or scientific topic."],
  ["Discover the evidence", "Find relevant scientific sources through approved retrieval systems."],
  ["Preserve the context", "Capture the species, tissue, cell type, assay, disease state and experimental conditions behind findings."],
  ["Connect the biology", "Explore relationships in the Living Biomedical Knowledge Graph."],
  ["Compare the findings", "Distinguish agreement, genuine contradiction and studies that are not directly comparable."],
  ["Identify what is missing", "Explore evidence gaps, unresolved mechanisms and limitations."],
  ["Develop the next hypothesis", "Consider alternative explanations and possible experiments."],
  ["Produce a research brief", "Bring findings, sources, uncertainty and suggested next steps into a traceable output."],
] as const;

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="The HSI platform"
        title="From scientific questions to evidence-linked decisions."
        intro="Research rarely follows a straight line. HSI is designed to help researchers move between evidence, mechanisms, uncertainty and possible next experiments without losing the scientific reasoning behind each step."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/platform/workbench" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">See an example investigation record</Link>
          <Link to="/trust#validation" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Read how approval stays separate</Link>
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Research preview · example findings are labelled · no clinical advice · no patient data on this site</p>
      </PageHero>

      <Section eyebrow="Journey" title="The investigation journey.">
        <Spine label="Investigation journey" items={STEPS.map(([title, text]) => ({ title, text }))} />
      </Section>

      <Section eyebrow="Context" title="Inspect the conditions before comparing the findings." intro="Different species, tissues or endpoints can change what a study establishes.">
        <RelationshipLenses />
      </Section>

      <Section eyebrow="On screen" title="What the product looks like today.">
        <div className="grid gap-6 md:grid-cols-2">
          <figure>
            <img src="/images/product/explorer-v2.webp" width={1440} height={900} alt="Graph explorer with a selected relationship and evidence context" loading="lazy" className="w-full rounded-xl border border-border" />
            <figcaption className="mt-2 text-sm text-muted-foreground">Explore a relationship and inspect its evidence.</figcaption>
          </figure>
          <figure>
            <img src="/images/product/dashboard-v2.webp" width={1440} height={1120} alt="Research home with topic metrics and a graph panel" loading="lazy" className="w-full rounded-xl border border-border" />
            <figcaption className="mt-2 text-sm text-muted-foreground">Return to your topics and continue the investigation.</figcaption>
          </figure>
        </div>
      </Section>

      <Section eyebrow="Review" title="Built for scientific scrutiny." intro="HSI distinguishes source evidence, extracted claims, model interpretations, candidate hypotheses and scientifically reviewed knowledge.">
        <Spine
          label="Scientific review boundaries"
          items={[
            { title: "Extracted claim", text: "A source-reported statement to inspect." },
            { title: "Evidence check", text: "Assess support, missing context and uncertainty." },
            { title: "Human review", text: "An authorised reviewer records a decision." },
            { title: "Versioned record", text: "Retain the source, decision and history." },
          ]}
        />
        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
          Published graph relationships are currently unreviewed. Model checks require configuration. <Link to="/trust#validation" className="text-primary underline underline-offset-2">Validation methodology</Link>
        </p>
      </Section>

      <Section eyebrow="Next" title="Explore an investigation.">
        <div className="flex flex-wrap gap-3">
          <Link to="/platform/workbench" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Explore an investigation record</Link>
          <Link to="/platform/contradiction-analysis" className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Try contradiction analysis</Link>
        </div>
      </Section>
    </>
  );
}
