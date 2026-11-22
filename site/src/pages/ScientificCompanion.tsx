import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
  HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
} from "../../../src/hsiScientificCompanionAuthorization";
import {
  HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
} from "../../../src/hsiScientificCompanionLiveEvidenceAuthorization";
import {
  runHsiScientificCompanionTurn,
  type HsiScientificCompanionBoundEvidence,
  type HsiScientificCompanionMode,
  type HsiScientificCompanionTurnResult,
} from "../../../src/hsiScientificCompanionRuntime";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {LIVE_INVESTIGATION_PATH} from "../lib/workbenchPrimary";
import "../styles/research-home.css";

const SAMPLE_BOUND_EVIDENCE: HsiScientificCompanionBoundEvidence[] = [
  {
    sourceId: "europepmc:MED:example-ssc-1",
    title: "Example SSc fibrosis mechanism review (illustrative metadata)",
    provider: "workspace",
    sourceUrl: "https://europepmc.org/",
    verificationState: "metadata_retrieved_not_claim_verified",
    reviewState: "unreviewed",
  },
];

const MODES: {id: HsiScientificCompanionMode; label: string; hint: string}[] = [
  {
    id: "discuss",
    label: "Discuss",
    hint: "Plan mechanisms and missing evidence",
  },
  {
    id: "critique",
    label: "Critique",
    hint: "Surface disagreement pressure on the plan",
  },
  {
    id: "experiment_planning",
    label: "Plan experiments",
    hint: "Turn falsifiers into testable next steps",
  },
];

const STARTERS = [
  "Which SSc mechanisms require investigation?",
  "How might fibroblast activation be distinguished from vascular injury in SSc?",
  "What evidence would refute an immune-driven contribution to SSc fibrosis?",
] as const;

export function ScientificCompanionPage() {
  const [mode, setMode] = useState<HsiScientificCompanionMode>("discuss");
  const [question, setQuestion] = useState<string>(STARTERS[0]);
  const [evidenceJson, setEvidenceJson] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState<HsiScientificCompanionTurnResult | null>(null);

  const modeMeta = useMemo(() => MODES.find((m) => m.id === mode) ?? MODES[0]!, [mode]);

  function run() {
    setError(null);
    try {
      const trimmed = evidenceJson.trim();
      let liveEvidence:
        | {
            authorization: typeof HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL;
            records: HsiScientificCompanionBoundEvidence[];
          }
        | undefined;
      if (trimmed) {
        const parsed = JSON.parse(trimmed) as unknown;
        if (!Array.isArray(parsed)) {
          throw Error("Bound evidence must be a JSON array of public literature metadata records");
        }
        liveEvidence = {
          authorization: HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
          records: parsed as HsiScientificCompanionBoundEvidence[],
        };
      }
      const result = runHsiScientificCompanionTurn({
        authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
        mode,
        question,
        createdAt: new Date().toISOString(),
        liveEvidence,
      });
      setTurn(result);
    } catch (e) {
      setTurn(null);
      setError(e instanceof Error ? e.message : "Companion turn failed");
    }
  }

  return (
    <ResearchAppShell where="Scientific Companion" whereIcon="spark" active="companion">
      <main className="rh-main" id="rh-main" tabIndex={-1}>
        <header className="rh-card rh-card-top">
          <div>
            <h1>Scientific Companion</h1>
            <p className="rh-sub">
              Text-first, evidence-grounded discussion on the Living Knowledge Graph
              interrogative path. Same scientific services as the workbench — not an
              avatar, not voice, not networking.
            </p>
          </div>
        </header>

        <section className="rh-card" aria-labelledby="sc-ask-h">
          <h2 id="sc-ask-h">Ask the companion</h2>
          <p className="rh-note">
            Deterministic SSc planning catalogue for this engineering milestone. Free-text
            unfenced LLM answers stay closed.
          </p>
          <fieldset className="rh-choices" aria-label="Companion mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </fieldset>
          <p className="rh-note">{modeMeta.hint}</p>
          <label htmlFor="sc-q">Research question</label>
          <textarea
            id="sc-q"
            rows={3}
            maxLength={500}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="rh-row" style={{flexWrap: "wrap", gap: "0.5rem"}}>
            {STARTERS.map((s) => (
              <button key={s} type="button" className="rh-ghost" onClick={() => setQuestion(s)}>
                {s.length > 48 ? `${s.slice(0, 48)}…` : s}
              </button>
            ))}
          </div>
          <label htmlFor="sc-ev">
            Optional bound evidence JSON (U42 — caller-supplied metadata only)
          </label>
          <textarea
            id="sc-ev"
            rows={4}
            value={evidenceJson}
            onChange={(e) => setEvidenceJson(e.target.value)}
            placeholder='[{"sourceId":"…","title":"…","provider":"workspace","sourceUrl":"https://…","verificationState":"metadata_retrieved_not_claim_verified","reviewState":"unreviewed"}]'
          />
          <div className="rh-row" style={{flexWrap: "wrap", gap: "0.5rem"}}>
            <button
              type="button"
              className="rh-ghost"
              onClick={() => setEvidenceJson(JSON.stringify(SAMPLE_BOUND_EVIDENCE, null, 2))}
            >
              Load sample bound metadata
            </button>
            <button type="button" className="rh-ghost" onClick={() => setEvidenceJson("")}>
              Clear bound evidence
            </button>
          </div>
          <div className="rh-row">
            <button type="button" className="rh-primary" onClick={run}>
              Run companion turn
            </button>
            <Link className="rh-ghost" to={LIVE_INVESTIGATION_PATH}>
              Open live investigation
            </Link>
          </div>
          {error && (
            <p className="rh-err" role="alert">
              {error}
            </p>
          )}
        </section>

        {turn && (
          <section className="rh-card" aria-labelledby="sc-reply-h">
            <h2 id="sc-reply-h">Companion reply</h2>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {turn.replyMarkdown}
            </pre>
            <details>
              <summary>Limitations ({turn.limitations.length})</summary>
              <ul>
                {turn.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Citations / planned artefacts ({turn.citations.length})</summary>
              <ul>
                {turn.citations.map((c, i) => (
                  <li key={`${c.kind}-${c.label}-${i}`}>
                    <b>{c.kind}</b> · {c.label}: {c.detail}
                  </li>
                ))}
              </ul>
            </details>
            <p className="rh-note" role="status">
              Scientific approval: false · Avatar: false · Voice: false · Networking: false ·
              Unfenced LLM: false · Live evidence bound:{" "}
              {turn.honesty.liveEvidenceBound ? "yes (caller-supplied)" : "no"} · Companion
              network retrieval: false · Claim verified: false
            </p>
          </section>
        )}
      </main>
    </ResearchAppShell>
  );
}
