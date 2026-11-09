import { useEffect, useMemo, useState } from "react";
import { generateSyntheticCohort, latestLab, type SyntheticPatient } from "@hsi/demo/cohort";
import { toFhirBundle } from "@hsi/demo/fhir";
import { prescreen } from "@hsi/demo/trials";
import { similarPatients } from "@hsi/demo/similarity";
import "../styles/demo-walkthrough.css";

/** Ordered guided story — plain labels, phone-first. */
const STEPS = [
  { id: "patient", label: "Patient" },
  { id: "clinician", label: "Clinician" },
  { id: "research", label: "Research" },
  { id: "review", label: "Review" },
  { id: "graph", label: "Graph" },
  { id: "trials", label: "Trials" },
  { id: "discovery", label: "Discovery" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type ScenarioSnapshot = {
  question: string;
  focus?: { pseudonym: string };
  firstSteps: { id: number; name: string; detail: string }[];
  firstBrief: { hypotheses: { text: string }[]; mechanisms?: string[] };
  evidence: { literature: { pmid: string | null; title: string }[] };
  targets: { symbol: string; openTargetsScore: number; scoreFetchedAt?: string }[];
  repurposing: { text: string }[];
  release: { releaseId: string; version?: string; priorReleaseId?: string | null; approvedEdge?: string | null };
  learningLoop?: {
    step8Label: string;
    before: {
      releaseId: string;
      version: string;
      approvedEdgeCount: number;
      step8Detail: string | null;
      releaseRead: string | null;
    };
    after: {
      releaseId: string;
      version: string;
      priorReleaseId: string | null;
      approvedEdgeId: string | null;
      approvedEdgeCount: number;
      step8Detail: string | null;
      releaseRead: string | null;
      mechanismMentionsRelease: boolean;
    };
    timeline: { label: string; at: string; releaseId?: string }[];
  };
  reviewEvents: { name: string; at: string }[];
};

export function DemoWalkthrough() {
  const cohort = useMemo(() => generateSyntheticCohort(), []);
  const raDefault = useMemo(
    () =>
      cohort.find((patient) => patient.condition.rheumatoidArthritis && patient.condition.diabetes === "t2d") ??
      cohort.find((patient) => patient.condition.rheumatoidArthritis) ??
      cohort[0],
    [cohort],
  );
  const roster = useMemo(() => {
    const raFirst = cohort.filter((patient) => patient.condition.rheumatoidArthritis);
    const fillers = cohort.filter((patient) => !patient.condition.rheumatoidArthritis && patient.pseudonym.endsWith("0"));
    return [...raFirst, ...fillers].slice(0, 8);
  }, [cohort]);
  const [pseudonym, setPseudonym] = useState(raDefault?.pseudonym ?? "");
  const [stepIndex, setStepIndex] = useState(0);
  const [scenario, setScenario] = useState<ScenarioSnapshot | null>(null);
  const patient = cohort.find((item) => item.pseudonym === pseudonym) ?? raDefault;
  const step = STEPS[stepIndex] ?? STEPS[0];
  const isLast = stepIndex >= STEPS.length - 1;

  useEffect(() => {
    let cancelled = false;
    void fetch("/demo/scenario.json")
      .then((response) => response.json())
      .then((result: ScenarioSnapshot) => {
        if (cancelled) return;
        setScenario(result);
        if (result.focus?.pseudonym) {
          const match = cohort.find((item) => item.pseudonym === result.focus?.pseudonym && item.condition.rheumatoidArthritis);
          if (match) setPseudonym(match.pseudonym);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cohort]);

  function goNext() {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  function goPrev() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <div className="demo-walk demo-walk-guided">
      <header className="demo-walk-hero">
        <p className="demo-walk-kicker">Guided demo</p>
        <div className="demo-walk-title-row">
          <h1>Follow one rheumatoid arthritis record through the workbench.</h1>
          <span className="demo-env">Demo environment</span>
        </div>
        <p>
          Start with a synthetic RA patient, then move through clinician context, research, review, the graph release, trials and discovery.
          Association is not a causal mechanism. Nothing here is a diagnosis, a prescription, or confirmed trial eligibility.
        </p>
      </header>

      <div className="demo-walk-layout">
        <aside>
          <h2>People in this demo</h2>
          <ul>
            {roster.map((item) => (
              <li key={item.pseudonym}>
                <button
                  type="button"
                  aria-pressed={item.pseudonym === patient?.pseudonym}
                  onClick={() => setPseudonym(item.pseudonym)}
                >
                  <strong>{item.pseudonym}</strong>
                  <span>{labelCondition(item)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="demo-story">
          <nav className="demo-step-rail" aria-label="Demo steps">
            <ol>
              {STEPS.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={index === stepIndex ? "step" : undefined}
                    onClick={() => setStepIndex(index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {patient ? (
            <View step={step.id} patient={patient} cohort={cohort} scenario={scenario} />
          ) : (
            <p>Loading the investigation.</p>
          )}

          <div className="demo-story-nav">
            <button type="button" className="demo-nav-btn demo-nav-btn-secondary" onClick={goPrev} disabled={stepIndex === 0}>
              Back
            </button>
            <p className="demo-step-progress">
              Step {stepIndex + 1} of {STEPS.length} · {step.label}
            </p>
            <button type="button" className="demo-nav-btn" onClick={goNext} disabled={isLast}>
              {isLast ? "End of story" : "Next"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function View({
  step,
  patient,
  cohort,
  scenario,
}: {
  step: StepId;
  patient: SyntheticPatient;
  cohort: SyntheticPatient[];
  scenario: ScenarioSnapshot | null;
}) {
  switch (step) {
    case "patient":
      return (
        <article>
          <h2>Patient</h2>
          <p>
            Synthetic project pseudonym <strong>{patient.pseudonym}</strong>. Consent scopes:{" "}
            {patient.consentScopes.join(", ")}. Permission epoch {patient.permissionEpoch}.
          </p>
          <ul>
            <li>Condition: {labelCondition(patient)}</li>
            <li>Diet pattern “{patient.diet.pattern}” is an unverified self-report.</li>
            <li>
              Microbiome{" "}
              {patient.microbiome.missing
                ? "is missing"
                : `Faecalibacterium relative abundance ${patient.microbiome.faecalibacterium}`}
            </li>
            <li>
              Wearables{" "}
              {patient.wearables.missing ? "are missing" : `${patient.wearables.meanSteps} mean steps`}
            </li>
          </ul>
        </article>
      );
    case "clinician": {
      const bundle = toFhirBundle(patient);
      return (
        <article>
          <h2>Clinician</h2>
          <p>
            Longitudinal context as FHIR R4 resources:{" "}
            {bundle.entry
              .map((item) => String(item.resource.resourceType))
              .filter((value, index, all) => all.indexOf(value) === index)
              .join(", ")}
            .
          </p>
          <div className="demo-table-scroll">
            <table>
              <caption>Laboratory history with LOINC and UCUM. A blank value stays unknown.</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>LOINC</th>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {patient.labs.map((lab) => (
                  <tr key={`${lab.at}-${lab.loinc}`}>
                    <td>{lab.at}</td>
                    <td>{lab.loinc}</td>
                    <td>{lab.display}</td>
                    <td>{lab.missing || lab.value === null ? "Unknown" : `${lab.value} ${lab.ucum}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      );
    }
    case "research":
      return (
        <article>
          <h2>Research</h2>
          <p>{scenario?.question ?? "Preparing the question."}</p>
          <ol>
            {(scenario?.firstSteps ?? []).map((item) => (
              <li key={item.id}>
                <strong>
                  {item.id}. {item.name}.
                </strong>{" "}
                {item.detail}
              </li>
            ))}
          </ol>
          {scenario ? (
            <>
              <h3>Evidence used offline</h3>
              <ul>
                {scenario.evidence.literature.map((item) => (
                  <li key={item.title}>
                    {item.pmid ? (
                      <a href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`} target="_blank" rel="noreferrer">
                        PMID {item.pmid}
                      </a>
                    ) : (
                      "PMID not recorded"
                    )}
                    : {item.title}
                  </li>
                ))}
              </ul>
              <h3>Unvalidated hypothesis</h3>
              <p>{scenario.firstBrief.hypotheses[0]?.text}</p>
            </>
          ) : (
            <p>Retrieving the fixture bibliography.</p>
          )}
        </article>
      );
    case "review": {
      const loop = scenario?.learningLoop;
      return (
        <article>
          <h2>Review</h2>
          <p>
            {loop?.step8Label ??
              "Review approved → release published → next investigation reads it."}{" "}
            Patient-facing questions are not sent.
          </p>
          {loop ? (
            <>
              <ol className="demo-learning-timeline">
                {loop.timeline.map((item) => (
                  <li key={`${item.at}-${item.label}`}>
                    <strong>{item.label}</strong>
                    <span>
                      {item.at.slice(11, 19)}
                      {item.releaseId ? ` · ${item.releaseId}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="demo-learning-compare" aria-label="Before and after the approved release">
                <section>
                  <h3>Before</h3>
                  <p>
                    Release {loop.before.releaseId} ({loop.before.version})
                  </p>
                  <p>Approved edges: {loop.before.approvedEdgeCount}</p>
                  <p>Step 8: {loop.before.step8Detail}</p>
                </section>
                <section>
                  <h3>After</h3>
                  <p>
                    Release {loop.after.releaseId} ({loop.after.version})
                  </p>
                  <p>Approved edges: {loop.after.approvedEdgeCount}</p>
                  <p>Approved edge: {loop.after.approvedEdgeId ?? "none"}</p>
                  <p>
                    Next investigation reads {loop.after.releaseRead}
                    {loop.after.mechanismMentionsRelease ? " and cites the approved edge." : "."}
                  </p>
                </section>
              </div>
            </>
          ) : (
            <p>Loading the learning-loop receipt…</p>
          )}
          <h3>Review events</h3>
          <ul>
            {(scenario?.reviewEvents ?? []).slice(0, 12).map((event) => (
              <li key={`${event.at}-${event.name}`}>
                {event.at.slice(11, 19)} · {event.name}
              </li>
            ))}
          </ul>
        </article>
      );
    }
    case "graph":
      return (
        <article>
          <h2>Graph</h2>
          <p>
            The Living Health Knowledge Graph only gains a versioned edge after human approval. Private clinical rows stay out.
          </p>
          <ul>
            <li>Prior release: {scenario?.learningLoop?.before.releaseId ?? "lhkg-demo-1.0.0"}</li>
            <li>
              Published release: {scenario?.release.releaseId ?? "…"}
              {scenario?.release.version ? ` (${scenario.release.version})` : ""}
            </li>
            <li>Approved edge: {scenario?.release.approvedEdge ?? scenario?.learningLoop?.after.approvedEdgeId ?? "pending"}</li>
          </ul>
          <h3>Mechanism lines in the next brief</h3>
          <ul>
            {(
              scenario?.firstBrief.mechanisms ?? [
                "Faecalibacterium-associated butyrate is linked, not proven, to barrier transcripts.",
                `Prior release ${scenario?.release.releaseId ?? "lhkg-demo-1.0.1"} includes the approved hypothesis edge as an association only.`,
              ]
            ).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      );
    case "trials": {
      const report = prescreen(patient);
      const crp = latestLab(patient, "1988-5");
      return (
        <article>
          <h2>Trials</h2>
          <p>
            Confirmed eligibility: no.{" "}
            {crp?.missing
              ? "CRP is missing, so that criterion stays unknown."
              : "Recorded values are still not a confirmation."}
          </p>
          <ul>
            {report.criteria.map((item) => (
              <li key={item.id}>
                <strong>{item.label}:</strong> {item.state}. {item.basis}
              </li>
            ))}
          </ul>
          <h3>Similar records</h3>
          <p>Similarity does not meet an eligibility criterion.</p>
          <ul>
            {similarPatients(patient, cohort, 4).map((hit) => (
              <li key={hit.pseudonym}>
                {hit.pseudonym} · distance {hit.distance}
              </li>
            ))}
          </ul>
        </article>
      );
    }
    case "discovery":
      return (
        <article>
          <h2>Discovery</h2>
          <p>Open Targets association scores for rheumatoid arthritis are ranks, not causation and not efficacy.</p>
          <ol>
            {(scenario?.targets ?? []).map((target) => (
              <li key={target.symbol}>
                {target.symbol} · score {target.openTargetsScore}
                {target.scoreFetchedAt ? ` · fetched ${target.scoreFetchedAt}` : ""}
              </li>
            ))}
          </ol>
          <h3>Repurposing hypothesis</h3>
          <p>{scenario?.repurposing[0]?.text}</p>
          <p>RDKit and ESM adapters are proposal-only. They are not run, and they do not produce a molecule or a claim of activity.</p>
        </article>
      );
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

function labelCondition(patient: SyntheticPatient): string {
  const diabetes =
    patient.condition.diabetes === "t1d"
      ? "Type 1 diabetes"
      : patient.condition.diabetes === "t2d"
        ? "Type 2 diabetes"
        : "No diabetes";
  return patient.condition.rheumatoidArthritis ? `${diabetes} · rheumatoid arthritis` : diabetes;
}
