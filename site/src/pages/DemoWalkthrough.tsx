import { useEffect, useMemo, useState } from "react";
import { generateSyntheticCohort, latestLab, type SyntheticPatient } from "@hsi/demo/cohort";
import { toFhirBundle } from "@hsi/demo/fhir";
import { prescreen } from "@hsi/demo/trials";
import { similarPatients } from "@hsi/demo/similarity";
import "../styles/demo-walkthrough.css";

const VIEWS = [
  { id: "patient", label: "Patient" },
  { id: "clinician", label: "Clinician" },
  { id: "investigation", label: "Investigation" },
  { id: "trials", label: "Trials" },
  { id: "discovery", label: "Discovery" },
  { id: "review", label: "Review" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

type ScenarioSnapshot = {
  question: string;
  firstSteps: { id: number; name: string; detail: string }[];
  firstBrief: { hypotheses: { text: string }[] };
  evidence: { literature: { pmid: string | null; title: string }[] };
  targets: { symbol: string; openTargetsScore: number }[];
  repurposing: { text: string }[];
  release: { releaseId: string; version?: string; priorReleaseId?: string | null; approvedEdge?: string | null };
  secondInvestigationReadRelease?: string | null;
  secondMentionsApprovedEdge?: boolean;
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
  const roster = useMemo(
    () => cohort.filter((patient, index) => patient.condition.rheumatoidArthritis || index % 40 === 0).slice(0, 8),
    [cohort],
  );
  const [pseudonym, setPseudonym] = useState(roster[0]?.pseudonym ?? "");
  const [view, setView] = useState<ViewId>("investigation");
  const [scenario, setScenario] = useState<ScenarioSnapshot | null>(null);
  const patient = cohort.find((item) => item.pseudonym === pseudonym) ?? roster[0];

  useEffect(() => {
    let cancelled = false;
    void fetch("/demo/scenario.json")
      .then((response) => response.json())
      .then((result: ScenarioSnapshot) => {
        if (!cancelled) setScenario(result);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="demo-walk">
      <header className="demo-walk-hero">
        <p className="demo-walk-kicker">How this technology works</p>
        <div className="demo-walk-title-row">
          <h1>One investigation, four modules.</h1>
          <span className="demo-env">Demo environment</span>
        </div>
        <p>
          Gut microbial metabolites, metabolic disease and neuroinflammation, with rheumatoid arthritis kept as its own immune-mediated thread. Association is not shown as a causal mechanism. Nothing on this page is a diagnosis, a prescription, or a confirmed trial eligibility.
        </p>
      </header>

      <div className="demo-walk-layout">
        <aside>
          <h2>Project pseudonyms</h2>
          <ul>
            {roster.map((item) => (
              <li key={item.pseudonym}>
                <button type="button" aria-pressed={item.pseudonym === patient?.pseudonym} onClick={() => setPseudonym(item.pseudonym)}>
                  <strong>{item.pseudonym}</strong>
                  <span>{labelCondition(item)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section>
          <div className="demo-tabs" role="tablist" aria-label="Investigation views">
            {VIEWS.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={view === item.id} onClick={() => setView(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {patient ? <View view={view} patient={patient} cohort={cohort} scenario={scenario} /> : <p>Loading the investigation.</p>}
        </section>
      </div>
    </div>
  );
}

function View({
  view,
  patient,
  cohort,
  scenario,
}: {
  view: ViewId;
  patient: SyntheticPatient;
  cohort: SyntheticPatient[];
  scenario: ScenarioSnapshot | null;
}) {
  if (view === "patient") {
    return (
      <article>
        <h2>{patient.pseudonym}</h2>
        <p>Consent scopes: {patient.consentScopes.join(", ")}. Permission epoch {patient.permissionEpoch}.</p>
        <ul>
          <li>Diet pattern “{patient.diet.pattern}” is an unverified self-report.</li>
          <li>Microbiome {patient.microbiome.missing ? "is missing" : `Faecalibacterium relative abundance ${patient.microbiome.faecalibacterium}`}</li>
          <li>Wearables {patient.wearables.missing ? "are missing" : `${patient.wearables.meanSteps} mean steps`}</li>
        </ul>
      </article>
    );
  }
  if (view === "clinician") {
    const bundle = toFhirBundle(patient);
    return (
      <article>
        <h2>Longitudinal context</h2>
        <p>FHIR R4 resources in this bundle: {bundle.entry.map((item) => String(item.resource.resourceType)).filter((value, index, all) => all.indexOf(value) === index).join(", ")}.</p>
        <table>
          <caption>Laboratory history with LOINC and UCUM. A blank value stays unknown.</caption>
          <thead>
            <tr><th>Date</th><th>LOINC</th><th>Name</th><th>Value</th></tr>
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
      </article>
    );
  }
  if (view === "investigation") {
    return (
      <article>
        <h2>Researcher investigation</h2>
        <p>{scenario?.question ?? "Preparing the question."}</p>
        <ol>
          {(scenario?.firstSteps ?? []).map((step) => (
            <li key={step.id}><strong>{step.id}. {step.name}.</strong> {step.detail}</li>
          ))}
        </ol>
        {scenario ? (
          <>
            <h3>Evidence used offline</h3>
            <ul>
              {scenario.evidence.literature.map((item) => (
                <li key={item.title}>PMID {item.pmid}: {item.title}</li>
              ))}
            </ul>
            <h3>Unvalidated hypothesis</h3>
            <p>{scenario.firstBrief.hypotheses[0]?.text}</p>
          </>
        ) : <p>Retrieving the fixture bibliography.</p>}
      </article>
    );
  }
  if (view === "trials") {
    const report = prescreen(patient);
    const crp = latestLab(patient, "1988-5");
    return (
      <article>
        <h2>Pre-screening</h2>
        <p>Confirmed eligibility: no. {crp?.missing ? "CRP is missing, so that criterion stays unknown." : "Recorded values are still not a confirmation."}</p>
        <ul>
          {report.criteria.map((item) => (
            <li key={item.id}><strong>{item.label}:</strong> {item.state}. {item.basis}</li>
          ))}
        </ul>
        <h3>Similar records</h3>
        <p>Similarity does not meet an eligibility criterion.</p>
        <ul>
          {similarPatients(patient, cohort, 4).map((hit) => (
            <li key={hit.pseudonym}>{hit.pseudonym} · distance {hit.distance}</li>
          ))}
        </ul>
      </article>
    );
  }
  if (view === "discovery") {
    return (
      <article>
        <h2>Target context</h2>
        <p>Open Targets association scores for rheumatoid arthritis are ranks, not causation and not efficacy.</p>
        <ol>
          {(scenario?.targets ?? []).map((target) => (
            <li key={target.symbol}>{target.symbol} · score {target.openTargetsScore}</li>
          ))}
        </ol>
        <h3>Repurposing hypothesis</h3>
        <p>{scenario?.repurposing[0]?.text}</p>
        <p>RDKit and ESM adapters are proposal-only. They are not run, and they do not produce a molecule or a claim of activity.</p>
      </article>
    );
  }
  const loop = scenario?.learningLoop;
  return (
    <article>
      <h2>Step 8 · Learning loop</h2>
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
                <span>{item.at.slice(11, 19)}{item.releaseId ? ` · ${item.releaseId}` : ""}</span>
              </li>
            ))}
          </ol>
          <div className="demo-learning-compare" aria-label="Before and after the approved release">
            <section>
              <h3>Before</h3>
              <p>Release {loop.before.releaseId} ({loop.before.version})</p>
              <p>Approved edges: {loop.before.approvedEdgeCount}</p>
              <p>Step 8: {loop.before.step8Detail}</p>
              <p>Release read by the first investigation: {loop.before.releaseRead}</p>
            </section>
            <section>
              <h3>After</h3>
              <p>Release {loop.after.releaseId} ({loop.after.version})</p>
              <p>Prior release: {loop.after.priorReleaseId ?? "none"}</p>
              <p>Approved edges: {loop.after.approvedEdgeCount}</p>
              <p>Approved edge: {loop.after.approvedEdgeId ?? "none"}</p>
              <p>Step 8: {loop.after.step8Detail}</p>
              <p>
                Next investigation reads {loop.after.releaseRead}
                {loop.after.mechanismMentionsRelease ? " and cites the approved edge." : "."}
              </p>
            </section>
          </div>
        </>
      ) : (
        <p>
          A scientific reviewer question was approved in this environment and published graph release{" "}
          {scenario?.release.releaseId ?? "…"}. A later investigation reads that release.
        </p>
      )}
      <h3>Review events</h3>
      <ul>
        {(scenario?.reviewEvents ?? []).slice(0, 12).map((event) => (
          <li key={`${event.at}-${event.name}`}>{event.at.slice(11, 19)} · {event.name}</li>
        ))}
      </ul>
    </article>
  );
}

function labelCondition(patient: SyntheticPatient): string {
  const diabetes = patient.condition.diabetes === "t1d" ? "Type 1 diabetes" : patient.condition.diabetes === "t2d" ? "Type 2 diabetes" : "No diabetes";
  return patient.condition.rheumatoidArthritis ? `${diabetes} · rheumatoid arthritis` : diabetes;
}
