import { PageHero, Section, meta, PageStatus } from "../../components/site/ui";

export const pageMeta = meta("Scientific Companion — HSI", "A conversational interface to HSI that answers with cited evidence, stated uncertainty and links back to your lab's memory.");

const msgs = [
  { who: "you", t: "Is there human evidence that intervention X lowers marker Y?" },
  {
    who: "hsi",
    t: "Not directly. Most supporting evidence comes from animal models [R-01, R-02]. The one human study in scope is observational and reports no clear association [R-04]. Your lab reviewed a related question earlier; see that investigation record.",
    note: "Unresolved · requires expert review",
  },
  { who: "you", t: "What would most reduce that uncertainty?" },
  {
    who: "hsi",
    t: "A longitudinal cohort pairing faecal SCFA profiles with CSF inflammatory markers. I can draft a study outline for review.",
    note: "Draft for review",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Scientific Companion"
        title="Ask in plain language. Get cited answers."
        intro="The Companion is a conversational layer over HSI's memory and agents. It is designed to answer with citations and confidence, and to say clearly when the evidence is not there."
      >
        <PageStatus>A prototype. The conversation below is an illustrative example, not a live answer.</PageStatus>
      </PageHero>
      <Section eyebrow="Example conversation" title="Honest about what is known.">
        <div className="glass mx-auto max-w-3xl space-y-4 rounded-2xl p-5 md:p-8">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={
                m.who === "you"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary/15 px-4 py-3 text-sm"
                  : "max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-background/60 px-4 py-3 text-sm"
              }
            >
              {m.who === "hsi" && (
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                  HSI Companion
                </p>
              )}
              <p className="leading-relaxed">{m.t}</p>
              {m.note && (
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  Status: <span className="text-signal">{m.note}</span> · illustrative
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
