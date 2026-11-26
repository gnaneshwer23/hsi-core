import { Link, SiteLink } from "../router";
import {
  ShieldCheck,
  FileText,
  FlaskConical,
  Network,
  Lightbulb,
} from "lucide-react";
import { Card, Section, StatusTag, meta } from "../components/site/ui";
import {
  InvestigationDemo,
  PersonaTabs,
} from "../components/site/Interactive";
import { Hero } from "../components/home/Hero";
import { Fragmentation } from "../components/home/Fragmentation";
import { MemoryEngine } from "../components/home/MemoryEngine";
import { BiologicalAtlas } from "../components/atlas/BiologicalAtlas";
import { AgentBoard } from "../components/agents/AgentBoard";
import { LiveGraphHero } from "../../components/home/LiveGraphHero";
import { ContradictionLab } from "../components/contradiction/ContradictionLab";
import { sources } from "../lib/site-data";

export const pageMeta = meta("HSI — The living intelligence of human biology", "A scientific intelligence platform for human biology, in development: persistent scientific memory, specialised AI agents and contradiction-aware evidence verification are being built and validated.");

export default function Home() {
  return (
    <>
      <Hero />
      <Fragmentation />
      <MemoryEngine />
      <Section
        id="atlas"
        eyebrow="04 · Interactive biological atlas"
        title="Six domains. One connected biology."
        intro="Follow a pathway across immunology, neuroscience, microbiome, genomics, tissue and disease, and see how well each step is evidenced."
      >
        <BiologicalAtlas />
      </Section>

      <Section
        id="published-graph"
        eyebrow="Live snapshot"
        title="And this is the real graph, unreviewed."
        intro="The atlas above is illustrative. This is the graph HSI has published so far, read live from the published snapshot. Every line is a candidate from a recorded source; nothing here is an approved finding."
      >
        <LiveGraphHero />
      </Section>

      <Section
        id="agents"
        eyebrow="05 · Scientific AI agents"
        title="Specialised agents that check one another."
        intro="Each agent has a narrow job. What one produces, a different agent checks, and every chain ends with a person."
      >
        <AgentBoard />
      </Section>

      <Section
        eyebrow="06 · Investigation demonstration"
        title="From a research question to the next experiment."
        intro="Step through an illustrative investigation on the gut–brain axis."
      >
        <InvestigationDemo />
      </Section>

      <Section
        id="contradiction"
        eyebrow="07 · Contradiction intelligence"
        title="Most disagreement is missing context."
        intro="Align conflicting studies by model, sex, dose and timing before calling them contradictory, and keep what remains unresolved in view."
      >
        <ContradictionLab />
      </Section>

      <Section eyebrow="08 · Research outputs" title="Outputs built for scientific review.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [FileText, "Evidence dossiers"],
            [Lightbulb, "Mechanistic hypotheses"],
            [FlaskConical, "Experimental protocols"],
            [Network, "Knowledge graphs"],
          ].map(([I, t]) => {
            const Icon = I as typeof FileText;
            return (
              <Card key={t as string}>
                <Icon className="size-5 text-verify" />
                <h3 className="mt-4 font-semibold">{t as string}</h3>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  provenance · uncertainty · review status
                </p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="09 · Solutions" title="Built for every research user.">
        <PersonaTabs />
      </Section>

      <Section
        eyebrow="10 · Data ecosystem"
        title="Grounded in public scientific resources."
        intro="Integration status is shown honestly. Names are listed for reference only and do not imply partnership."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{s.type}</p>
              </div>
              <StatusTag s={s.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="11 · Scientific Companion"
        title="A companion that understands your research context."
        intro="A text-first interface to the HSI system — not a separate source of scientific truth."
      >
        <div className="max-w-2xl space-y-3 rounded-xl border border-border bg-card/50 p-6 font-mono text-sm">
          <div className="flex justify-end">
            <StatusTag s="Prototype" />
            <StatusTag s="Illustrative" className="ml-2" />
          </div>
          <p>
            <span className="text-muted-foreground">you ›</span> What did we conclude about butyrate
            dosing last month?
          </p>
          <p className="text-foreground/90">
            <span className="text-primary">hsi ›</span> Your 14 Oct investigation flagged dose as
            the main explanatory variable (confidence: low). 2 new murine studies have appeared
            since. Inspect evidence?
          </p>
          <p className="pt-2 text-xs text-muted-foreground">
            Voice & audiovisual interaction — <span className="text-foreground">planned</span>
          </p>
        </div>
      </Section>

      <Section
        eyebrow="12 · Trust & governance"
        title="Scientific intelligence must earn your trust."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {[
            "Source provenance",
            "Explicit uncertainty",
            "Data sovereignty",
            "Human-in-the-loop review",
          ].map((t) => (
            <Card key={t}>
              <ShieldCheck className="size-5 text-verify" />
              <h3 className="mt-4 font-semibold">{t}</h3>
            </Card>
          ))}
        </div>
        <Link to="/trust" className="mt-8 inline-block text-sm text-primary hover:underline">
          Our intended safeguards →
        </Link>
      </Section>

      <Section
        eyebrow="13 · Early access"
        title="Help shape the future of scientific intelligence."
        intro="We invite students, researchers, universities, laboratories and life-science organisations to take part in research validation and potential pilots."
      >
        <div className="flex flex-wrap items-center gap-4">
          <SiteLink to="/contact#pilot-request" className="bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Start a pilot request
          </SiteLink>
          <SiteLink to="/sign-up" className="border border-border px-6 py-4 text-sm font-medium hover:border-primary">
            Create an account
          </SiteLink>
        </div>
        <ol className="mt-10 grid max-w-3xl gap-x-10 gap-y-6 md:grid-cols-3">
          {[
            ["Tell us the question", "A pilot request starts from your research question and the evidence you need to see."],
            ["Create an account", "Register and verify your email. An account is not research access."],
            ["Access is approved", "Researcher, source and scientific-review permissions are provisioned separately by an administrator."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t border-border pt-4">
              <p className="font-mono text-xs text-primary">0{i + 1}</p>
              <h3 className="mt-2 font-display text-base font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-xs text-muted-foreground">
          Requests start as a draft kept in your browser. Nothing is sent unless the request page confirms delivery, and it never claims receipt before the server does. Do not include patient data or unpublished research.
        </p>
      </Section>
    </>
  );
}
