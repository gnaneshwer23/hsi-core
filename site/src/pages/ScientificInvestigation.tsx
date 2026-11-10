import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  EVIDENCE_TIERS,
  EVIDENCE_TIER_LABEL,
  EXAMPLE_QUESTIONS,
  authoriseWorkspaceSave,
  buildScientificInvestigation,
  recordIndependentReview,
  renderInvestigationJson,
  type EvidenceTier,
  type ScientificInvestigation,
} from "@hsi/scientificInvestigation";
import "../styles/scientific-investigation.css";

const STEPS = [
  { id: "start", label: "Start" },
  { id: "evidence", label: "Evidence" },
  { id: "relationships", label: "Relationships" },
  { id: "comparison", label: "Comparison" },
  { id: "contradictions", label: "Contradictions" },
  { id: "gaps", label: "Gaps" },
  { id: "hypotheses", label: "Hypotheses" },
  { id: "review", label: "Human review" },
  { id: "report", label: "Report" },
  { id: "save", label: "Save and export" },
] as const;

type StepId = (typeof STEPS)[number]["id"];
const SESSION_KEY = "hsi-demo-investigation";

function Tier({ tier }: { tier: EvidenceTier }) {
  return <span className={`inv-tier inv-tier-${tier}`}>{EVIDENCE_TIER_LABEL[tier]}</span>;
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ScientificInvestigationPage() {
  const [questionId, setQuestionId] = useState<(typeof EXAMPLE_QUESTIONS)[number]["id"]>("gut-neuro");
  const [stepIndex, setStepIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const record = useMemo(() => buildScientificInvestigation(questionId), [questionId]);
  const reviewed = useMemo(() => {
    if (!reviewNote) return record;
    return recordIndependentReview(record, { kind: "human_scientific_reviewer", label: "Example reviewer" }, reviewNote, "2026-11-10T18:00:00.000Z");
  }, [record, reviewNote]);
  const step = STEPS[stepIndex] ?? STEPS[0];

  function choose(id: (typeof EXAMPLE_QUESTIONS)[number]["id"]) {
    setQuestionId(id);
    setReviewNote("");
    setSaveNote("");
    setStepIndex(0);
  }

  function recordComment() {
    try {
      const next = recordIndependentReview(
        record,
        { kind: "human_scientific_reviewer", label: "Example reviewer" },
        comment,
        new Date().toISOString(),
      );
      setReviewNote(next.review.status === "comments_recorded" ? next.review.comment : "");
      setComment("");
    } catch (error) {
      setSaveNote(error instanceof Error ? error.message : "The comment was not recorded.");
    }
  }

  function saveBrowser() {
    const payload = { id: reviewed.id, questionId, reviewNote };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    setSessionId(reviewed.id);
    setSaveNote("Kept in this browser session only. It is not saved to your workspace.");
  }

  function reopenBrowser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      setSaveNote("No browser copy yet.");
      return;
    }
    let parsed: { id?: string; questionId?: "gut-neuro" | "metabolic"; reviewNote?: string };
    try {
      parsed = JSON.parse(raw) as { id?: string; questionId?: "gut-neuro" | "metabolic"; reviewNote?: string };
    } catch {
      setSaveNote("The browser copy could not be read.");
      return;
    }
    if (parsed.questionId) setQuestionId(parsed.questionId);
    setReviewNote(parsed.reviewNote ?? "");
    setSessionId(parsed.id ?? null);
    setSaveNote(parsed.id ? `Reopened browser copy ${parsed.id}.` : "The browser copy had no id.");
  }

  function saveWorkspace() {
    const gate = authoriseWorkspaceSave({ signedIn: false, writesEnabled: false, role: "anonymous" });
    setSaveNote(
      gate.ok
        ? "Unexpected workspace save."
        : "Sign in to save this to your workspace. Research writes stay closed until an administrator enables them on the staging database.",
    );
  }

  return (
    <div className="inv-page">
      <div className="inv-wrap">
        <header>
          <p className="inv-kicker">Research demonstration</p>
          <div className="inv-title-row">
            <h1>Start an investigation</h1>
            <span className="inv-badge">Demo environment</span>
          </div>
          <p className="inv-lead">
            Follow one gut–immune–metabolic–neuroinflammation question from evidence to export. Curated examples only.
            Nothing here is clinical validation.
          </p>
        </header>
        <ol className="inv-rail" aria-label="Investigation steps">
          {STEPS.map((item, index) => (
            <li key={item.id}>
              <button type="button" aria-current={index === stepIndex ? "step" : undefined} onClick={() => setStepIndex(index)}>
                {index + 1}. {item.label}
              </button>
            </li>
          ))}
        </ol>
        <StepView
          step={step.id}
          record={reviewed}
          questionId={questionId}
          comment={comment}
          saveNote={saveNote}
          sessionId={sessionId}
          onChoose={choose}
          onComment={setComment}
          onRecordComment={recordComment}
          onSaveBrowser={saveBrowser}
          onReopen={reopenBrowser}
          onSaveWorkspace={saveWorkspace}
          onExportJson={() => download(`${reviewed.id}.json`, renderInvestigationJson(reviewed), "application/json")}
          onExportMarkdown={() => download(`${reviewed.id}.md`, reviewed.report.markdown, "text/markdown")}
        />
        <div className="inv-nav">
          <button type="button" onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={stepIndex === 0}>
            Back
          </button>
          <p>
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <button type="button" className="inv-next" onClick={() => setStepIndex((index) => Math.min(STEPS.length - 1, index + 1))} disabled={stepIndex === STEPS.length - 1}>
            {stepIndex === STEPS.length - 1 ? "End" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepView(props: {
  step: StepId;
  record: ScientificInvestigation;
  questionId: (typeof EXAMPLE_QUESTIONS)[number]["id"];
  comment: string;
  saveNote: string;
  sessionId: string | null;
  onChoose: (id: (typeof EXAMPLE_QUESTIONS)[number]["id"]) => void;
  onComment: (value: string) => void;
  onRecordComment: () => void;
  onSaveBrowser: () => void;
  onReopen: () => void;
  onSaveWorkspace: () => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
}) {
  const { step, record } = props;
  switch (step) {
    case "start":
      return (
        <section className="inv-card" aria-labelledby="inv-start">
          <h2 id="inv-start">Choose a question</h2>
          <p>The first question is the demonstration. The second uses the same evidence and records why a metabolic answer is not assembled.</p>
          <div className="inv-actions">
            {EXAMPLE_QUESTIONS.map((item) => (
              <button key={item.id} type="button" className="inv-choice" aria-pressed={props.questionId === item.id} onClick={() => props.onChoose(item.id)}>
                {item.text}
              </button>
            ))}
          </div>
          <p>Systemic sclerosis remains a separate reference question for expert review. It is not a product boundary and is not run here.</p>
        </section>
      );
    case "evidence":
      return (
        <section className="inv-card">
          <h2>Evidence</h2>
          <p>{record.verifiedEvidenceNote}</p>
          <p>
            {EVIDENCE_TIERS.map((tier) => (
              <Tier key={tier} tier={tier} />
            ))}
          </p>
          {record.evidence.map((claim) => (
            <article key={claim.id}>
              <Tier tier={claim.tier} />
              <p>{claim.statement}</p>
              <p>
                {claim.tissue}; {claim.system}. Sources: {claim.sourceIds.join(", ")}.
              </p>
            </article>
          ))}
        </section>
      );
    case "relationships":
      return (
        <section className="inv-card">
          <h2>Biological relationships</h2>
          <ul>
            {record.relationships.map((edge) => (
              <li key={edge.id}>
                <Tier tier={edge.tier} /> {edge.subject} → {edge.predicate} → {edge.object}. Not a causal claim.
              </li>
            ))}
          </ul>
        </section>
      );
    case "comparison":
      return (
        <section className="inv-card">
          <h2>Evidence comparison</h2>
          <ul>
            {record.comparison.map((row) => (
              <li key={row.id}>
                <Tier tier={row.tier} /> {row.claimId}: {row.whatWasCompared}
              </li>
            ))}
          </ul>
        </section>
      );
    case "contradictions":
      return (
        <section className="inv-card">
          <h2>Contradictions</h2>
          {record.contradictions.map((item) => (
            <article key={item.id}>
              <Tier tier={item.tier} />
              <p>{item.summary}</p>
              <p>Resolution: {item.resolution}.</p>
            </article>
          ))}
        </section>
      );
    case "gaps":
      return (
        <section className="inv-card">
          <h2>Research gaps</h2>
          <ul>
            {record.gaps.map((gap) => (
              <li key={gap.id}>
                <Tier tier={gap.tier} /> {gap.text} {gap.whyItMatters}
              </li>
            ))}
          </ul>
          <h3>Datasets that could be requested</h3>
          <ul>
            {record.datasets.map((dataset) => (
              <li key={dataset.id}>
                {dataset.name}, custodian {dataset.custodian}. Access not requested. Similar patterns could be tested if access were granted.{" "}
                <a href={dataset.gatewayUrl}>Gateway record</a>
              </li>
            ))}
          </ul>
        </section>
      );
    case "hypotheses":
      return (
        <section className="inv-card">
          <h2>Testable hypotheses</h2>
          {record.hypotheses.map((item) => (
            <article key={item.id}>
              <Tier tier={item.tier} />
              <p>{item.statement}</p>
              <p>{item.suggestedObservation}</p>
            </article>
          ))}
        </section>
      );
    case "review":
      return (
        <section className="inv-card">
          <h2>Human review</h2>
          <p>Status: {record.review.status.replaceAll("_", " ")}. An automated composer cannot approve this output. A comment is not scientific truth.</p>
          <label className="inv-field">
            Comment as Example reviewer
            <textarea value={props.comment} onChange={(event) => props.onComment(event.target.value)} />
          </label>
          <button type="button" onClick={props.onRecordComment}>
            Record example review comment
          </button>
          {props.saveNote ? <p className="inv-status" role="status">{props.saveNote}</p> : null}
        </section>
      );
    case "report":
      return (
        <section className="inv-card" id="investigation-report">
          <h2>Research report</h2>
          <p>{record.question}</p>
          <pre>{record.report.markdown}</pre>
        </section>
      );
    case "save":
      return (
        <section className="inv-card">
          <h2>Save and export</h2>
          <p>Export works in this demo without an account. Saving to your own workspace needs sign-in, and writes stay closed until they are explicitly enabled.</p>
          <div className="inv-actions">
            <button type="button" onClick={props.onExportJson}>Download JSON</button>
            <button type="button" onClick={props.onExportMarkdown}>Download Markdown</button>
            <button type="button" onClick={() => window.print()}>Print / save PDF</button>
            <button type="button" onClick={props.onSaveBrowser}>Keep in this browser</button>
            <button type="button" onClick={props.onReopen}>Reopen browser copy</button>
            <button type="button" onClick={props.onSaveWorkspace}>Save to my workspace</button>
            <Link to="/sign-in">Sign in</Link>
          </div>
          {props.sessionId ? <p>Browser copy: {props.sessionId}</p> : null}
          {props.saveNote ? <p className="inv-status" role="status">{props.saveNote}</p> : null}
        </section>
      );
    default: {
      const exhaustive: never = step;
      return exhaustive;
    }
  }
}
