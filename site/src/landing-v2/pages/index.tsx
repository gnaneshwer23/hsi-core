import { Link, SiteLink } from "../router";
import { Card, Section, meta } from "../components/site/ui";
import { Hero } from "../components/home/Hero";
import { BiologicalAtlas } from "../components/atlas/BiologicalAtlas";
import { LiveGraphHero } from "../../components/home/LiveGraphHero";

export const pageMeta = meta(
  "HSI — See what the evidence supports",
  "HSI links published studies to the biology they describe, so researchers can see where a claim came from, what it applied to and where studies disagree. A research platform in development.",
);

const steps = [
  ["Ask a question", "Start with a research question, such as whether a pathway matters in a disease."],
  ["Read the evidence", "See what each study found, and in which species, tissue and model."],
  ["See where it holds", "Find where studies agree, where they conflict and which conditions might explain it. A person decides what it means."],
] as const;

const uses = [
  ["Keep a record", "Questions, sources and decisions stay together, so work can be picked up later.", "/platform/memory", "How the record works"],
  ["Use specialised agents", "Agents search, extract and check evidence. Each hands its work on for review.", "/platform/agents", "Meet the agents"],
  ["Find disagreements", "Compare studies that seem to conflict and see which conditions differ.", "/platform/contradiction-analysis", "Try the comparison"],
  ["Follow one investigation", "See a single question taken from start to finish, with the evidence at each stage.", "/platform/workbench", "See the walkthrough"],
] as const;

export default function Home() {
  return (
    <>
      <Hero />

      <Section id="how" title="From a question to a checked answer.">
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="border-t border-border pt-5">
              <p className="text-sm text-primary">Step {i + 1}</p>
              <h3 className="mt-2 font-display text-xl font-medium">{t}</h3>
              <p className="mt-3 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm">
          <Link to="/how-it-works" className="text-primary underline underline-offset-4">Read the full walkthrough</Link>
        </p>
      </Section>

      <Section
        id="atlas"
        title="Follow a pathway across biology."
        intro="Choose a pathway to see how it links the immune system, the nervous system, the gut and other areas, and how well each step is supported. This is an illustration, not published data."
      >
        <BiologicalAtlas />
      </Section>

      <Section
        id="published-graph"
        title="The graph so far."
        intro="This is the graph HSI has published, read live. Every line is a candidate from a recorded source. None is an approved finding."
      >
        <LiveGraphHero />
        <p className="mt-6 text-sm">
          <Link to="/knowledge-graph" className="text-primary underline underline-offset-4">About the knowledge graph</Link>
        </p>
      </Section>

      <Section id="uses" title="What you can do with it.">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {uses.map(([t, d, to, cta]) => (
            <li key={t}>
              <Card>
                <h3 className="font-display text-lg font-medium">{t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{d}</p>
                <Link to={to} className="mt-4 inline-block text-sm text-primary underline underline-offset-4">{cta}</Link>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="audience" title="Made for people who do research." intro="Researchers, research groups, biotech R&D teams, clinical researchers and laboratories. Each has different needs, and the Solutions page says what HSI does and does not do for each.">
        <Link to="/solutions" className="text-sm text-primary underline underline-offset-4">See the solutions</Link>
      </Section>

      <Section id="status" title="Where it stands." intro="HSI is in development. Some parts work today and others are planned, and every page says which. It does not give clinical advice and does not handle patient data.">
        <Link to="/trust" className="text-sm text-primary underline underline-offset-4">How HSI keeps evidence separate from approval</Link>
      </Section>

      <Section id="access" title="Ask for access." intro="Tell us about your research question. Access is approved separately from creating an account.">
        <div className="flex flex-wrap items-center gap-4">
          <SiteLink to="/contact#pilot-request" className="bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Request access
          </SiteLink>
          <SiteLink to="/sign-up" className="border border-border px-6 py-4 text-sm font-medium hover:border-primary">
            Create an account
          </SiteLink>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          The request form saves a draft in your browser and says plainly whether it was delivered. Please do not include patient data or unpublished research.
        </p>
      </Section>
    </>
  );
}
