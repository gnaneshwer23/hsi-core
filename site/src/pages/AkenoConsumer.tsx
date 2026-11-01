import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  loadDiscoveryBundle,
  type TranslationCandidate,
  type TranslationHandoff,
} from "../lib/discoveryData";

type HitlAction = "acknowledge" | "escalate" | "defer";

type LocalDecision = {
  candidateId: string;
  action: HitlAction;
  reason: string;
  reviewedAt: string;
};

function GradeChip({ grade }: { grade: string }) {
  const g = grade.toLowerCase();
  return <span className={`dc-grade dc-grade-${g}`}>{g}</span>;
}

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, "-");
  return <span className={`dc-status dc-status-${s}`}>{status}</span>;
}

function CandidateReviewCard({
  candidate,
  decision,
  onDecide,
}: {
  candidate: TranslationCandidate;
  decision?: LocalDecision;
  onDecide: (action: HitlAction, reason: string) => void;
}) {
  const [reason, setReason] = useState(decision?.reason ?? "");
  const [err, setErr] = useState<string | null>(null);

  const submit = (action: HitlAction) => {
    if (!reason.trim()) {
      setErr("HITL requires a non-empty reason — never silent approve.");
      return;
    }
    setErr(null);
    onDecide(action, reason.trim());
  };

  return (
    <li className="dc-hyp-card akeno-card">
      <div className="dc-panel-head">
        <StatusChip status={candidate.status} />
        <span className="dc-pill">HITL required</span>
        <span className="dc-pill dc-pill-danger">{candidate.clinicalUse}</span>
        <span className="dc-pill">cds={String(candidate.cdsSurfacable)}</span>
      </div>
      <h4>{candidate.clinicLabel ?? "Unmapped clinic concept"}</h4>
      <p className="muted">{candidate.assertion}</p>
      <div className="dc-meta-row" style={{ marginTop: "0.65rem" }}>
        <code className="dc-mono">{candidate.claimId}</code>
        {candidate.akshNodeId ? (
          <code className="dc-mono">{candidate.akshNodeId}</code>
        ) : null}
        {candidate.loinc ? (
          <span className="dc-pill">LOINC {candidate.loinc}</span>
        ) : null}
        <GradeChip grade={candidate.hsiGrade} />
        <span className="dc-pill">teaching={candidate.teachingStatus}</span>
      </div>
      <p style={{ marginTop: "0.55rem" }}>
        <strong>{candidate.requiredClinicianAction.label}</strong>
        <span className="muted">
          {" "}
          — {candidate.requiredClinicianAction.rationale}
        </span>
      </p>
      <p className="dc-axes-note">{candidate.axesNote}</p>

      <div className="akeno-hitl">
        <label className="akeno-hitl-label" htmlFor={`reason-${candidate.id}`}>
          Clinician rationale (session-local · not persisted to Neon)
        </label>
        <textarea
          id={`reason-${candidate.id}`}
          className="akeno-hitl-input"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why acknowledge, escalate, or defer — required"
        />
        {err ? <p className="akeno-hitl-err">{err}</p> : null}
        <div className="akeno-hitl-actions">
          <button type="button" className="btn" onClick={() => submit("acknowledge")}>
            Acknowledge
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => submit("escalate")}
          >
            Escalate
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => submit("defer")}
          >
            Defer
          </button>
        </div>
        {decision ? (
          <p className="akeno-hitl-recorded">
            Recorded <strong>{decision.action}</strong> · {decision.reviewedAt} ·
            cds stays false · no EHR
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function AkenoConsumer() {
  const [handoff, setHandoff] = useState<TranslationHandoff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, LocalDecision>>({});

  useEffect(() => {
    let cancelled = false;
    loadDiscoveryBundle()
      .then((bundle) => {
        if (!cancelled) setHandoff(bundle.translation);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load handoff");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    if (!handoff) return null;
    return handoff.summary;
  }, [handoff]);

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="dc-banner-stack" role="alert">
            <p className="dc-banner dc-banner-danger">
              CLINICAL NOT ACTIVE · not for clinical use · no diagnosis /
              treatment · no PHI · no EHR
            </p>
            <p className="dc-banner dc-banner-warn">
              Akeno in-repo HITL consumer · deferred_until_hitl ·
              autoApprove=false · cdsSurfacable=0 · HSI Neon red-wave only
            </p>
          </div>

          <div className="section-head" style={{ marginTop: "1.5rem" }}>
            <span className="eyebrow">Akeno · clinical consumer</span>
            <h1 className="display display-lg">Translation handoff HITL</h1>
            <p className="lede">
              Consumes <code>hsi-translation-handoff.json</code> clinic pointers
              (<code>aksh:…</code> / LOINC). Adapted from akenohealth governance
              shapes — not the Neon patient dashboard, not Lovable marketing CDS
              claims.{" "}
              <Link to="/discovery">← Discovery TRANSLATE</Link>
            </p>
          </div>

          {error ? (
            <p className="dc-banner dc-banner-danger" role="alert">
              {error}
            </p>
          ) : null}

          {summary ? (
            <div className="grade-row dc-grade-summary">
              {(
                [
                  ["candidates", summary.candidates],
                  ["with LOINC", summary.withLoinc],
                  ["HITL required", summary.hitlRequired],
                  ["CDS surfacable", summary.cdsSurfacableCount],
                  ["session reviews", Object.keys(decisions).length],
                ] as const
              ).map(([label, n]) => (
                <div key={label} className="grade-cell">
                  <div className="label">{label}</div>
                  <h3>{n}</h3>
                  <p>akeno</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Loading handoff…</p>
          )}

          {handoff ? (
            <>
              <div className="dc-card" style={{ marginTop: "1.5rem" }}>
                <div className="dc-panel-head">
                  <h3>Handoff queue</h3>
                  <span className="dc-pill">
                    {handoff.akenoProductIntegration} · intended=
                    {handoff.intendedConsumer}
                  </span>
                </div>
                <ul className="dc-hyp-list">
                  {handoff.candidates.map((c) => (
                    <CandidateReviewCard
                      key={c.id}
                      candidate={c}
                      decision={decisions[c.id]}
                      onDecide={(action, reason) => {
                        setDecisions((prev) => ({
                          ...prev,
                          [c.id]: {
                            candidateId: c.id,
                            action,
                            reason,
                            reviewedAt: new Date().toISOString(),
                          },
                        }));
                      }}
                    />
                  ))}
                </ul>
              </div>

              <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                <span className="panel-label">Boundary</span>
                <ul className="checklist" style={{ marginTop: "0.85rem" }}>
                  {handoff.boundary.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
