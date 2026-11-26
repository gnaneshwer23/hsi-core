import { Link } from "../router";
import { PageHero, StatusTag, meta } from "../components/site/ui";
import { audiences, type Status } from "../lib/site-data";

export const pageMeta = meta("Solutions — HSI", "How researchers, research groups, biotech R&D teams, clinical researchers, laboratories and research networks can use HSI, and what it does not do.");

type Block = {
  id: (typeof audiences)[number]["id"];
  title: string;
  lead: string;
  can: string[];
  cannot: string[];
  status?: Status;
  statusNote?: string;
  cta: { label: string; to: string };
};

const blocks: Block[] = [
  {
    id: "researchers",
    title: "Researchers",
    lead: "Get from a question to a sourced, checked answer with less time spent connecting the literature.",
    can: ["See the studies behind a claim, with the species, tissue, assay and dose each one used.", "Find where studies disagree and which conditions might explain it.", "Keep the question, the sources and your decisions together as one record."],
    cannot: ["It does not decide which study is right.", "Account creation is not research access; access is granted separately.", "Saved work stays on your device until a server store is enabled."],
    cta: { label: "See an investigation record", to: "/platform/workbench" },
  },
  {
    id: "research-groups",
    title: "Research groups",
    lead: "Keep a group's questions, sources and decisions in one place that does not disappear when people move on.",
    can: ["Share an investigation with named colleagues while private notes stay private.", "Resume work later with the original sources and reviewer notes attached."],
    cannot: ["There are no production group workspaces yet; group views are demonstrations.", "Nothing is shared automatically, and a person makes every review decision."],
    status: "Planned",
    statusNote: "Group workspaces are planned.",
    cta: { label: "See how memory works", to: "/platform/memory" },
  },
  {
    id: "biotech",
    title: "Biotech and pharma R&D",
    lead: "Check what the evidence supports, and where it is thin, before committing to a direction.",
    can: ["Put two studies side by side with their experimental context and mark where they are not comparable.", "List recorded evidence gaps and the sources behind each, for a given mechanism."],
    cannot: ["It does not recommend targets.", "Gap detection uses a published snapshot, not a live literature search.", "Pilot scope, data sharing and review authority are agreed separately."],
    cta: { label: "Try contradiction analysis", to: "/platform/contradiction-analysis" },
  },
  {
    id: "clinical",
    title: "Clinical research",
    lead: "Evidence for translational questions, kept apart from patient care.",
    can: ["Trace a mechanism to the human evidence that exists for it, and see clearly where there is none.", "Review published trial registry context next to the literature."],
    cannot: ["It is not clinical decision support and gives no clinical advice.", "It does not accept patient data or identifiers anywhere on this site.", "Real patient records are refused by design."],
    cta: { label: "Read the boundaries", to: "/trust" },
  },
  {
    id: "laboratories",
    title: "Laboratories",
    lead: "Check what has been measured, in which system and with which assay, before you plan an experiment.",
    can: ["Compare published findings by species, tissue, cell state and assay before treating one as a baseline.", "Follow a claim back to its source passage and see what the study did and did not test.", "See which relationships rest on a single source or model."],
    cannot: ["No live instrument connections and no quality-control dashboards.", "No assay performance claims, and no private human samples."],
    cta: { label: "Explore the knowledge graph", to: "/knowledge-graph" },
  },
  {
    id: "community",
    title: "Research community",
    lead: "Find people whose published work bears on an open question, starting from the evidence.",
    can: ["Planned: connect a scientific question to relevant published work and people.", "Planned: investigations several researchers can inspect, each keeping private notes private."],
    cannot: ["Nothing is built yet, so no collaborators, institutions or matches are shown.", "Unpublished work is never shared automatically, and people are not ranked by activity."],
    status: "Planned",
    statusNote: "The research network is planned.",
    cta: { label: "Talk to us", to: "/contact" },
  },
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Solutions" title="How different research teams use HSI." intro="Pick the description closest to your work. Each one says what you can do today and what HSI does not do." />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-24 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Solutions" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {audiences.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`} className="block rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground lg:border-0 lg:px-2 lg:py-1.5">
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">
          {blocks.map((b) => (
            <section key={b.id} id={b.id} className="scroll-mt-24 border-t border-border/60 pt-10 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-3xl font-medium tracking-tight">{b.title}</h2>
                {b.status && <StatusTag s={b.status} />}
              </div>
              <p className="mt-3 max-w-2xl text-lg text-foreground/80">{b.lead}</p>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">What you can do</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {b.can.map((t) => (
                      <li key={t} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium">What it does not do</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {b.cannot.map((t) => (
                      <li key={t} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" aria-hidden />{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link to={b.cta.to} className="text-sm font-medium text-primary underline underline-offset-4">{b.cta.label} →</Link>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Request access</Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
