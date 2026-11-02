import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";

type GapBucket = {
  missingKey: string;
  count: number;
  edgeIds: string[];
};

type QueueItem = {
  edgeId: string;
  claimId: string;
  isiRelationshipId: string | null;
  pmid: string | null;
  spoNote: string | null;
  assertion: string | null;
  effectiveStatus: string;
  decision: string | null;
  actionable: boolean;
  reviewedBy: string | null;
};

type CuratorUx = {
  schemaVersion: string;
  notCds: boolean;
  autoApproveIntoKg: boolean;
  mayFlipHsiGrade: boolean;
  generatedAt: string;
  partner: {
    id: string | null;
    label: string | null;
    lockedPilot: boolean;
    partnerSigned: boolean;
  };
  partnerReviewSession: {
    status: string;
    note: string;
    humanDecisionCount: number;
    inventedOutcomes: boolean;
    isiNeonTarget: string;
    hsiNeonTarget: string;
  };
  gapAnalysis: {
    gapRowCount: number;
    summary: {
      seedEdges: number;
      claimsMappedToIsi: number;
      claimsMappedToAksh: number;
      loinc?: { claimsWithLoincMarker: number };
      gradeCounts?: Record<string, number>;
    };
    buckets: GapBucket[];
  };
  gateCQueue: {
    items: QueueItem[];
    pendingCount: number;
    decidedCount: number;
    actionableCount: number;
    unmappedCount: number;
    translationCandidates: number;
    modelProposals: number;
    neonTarget: string;
  };
  honesty: string[];
  nextActions: string[];
};

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, "-");
  return <span className={`dc-status dc-status-${s}`}>{status}</span>;
}

export function Curator() {
  const [data, setData] = useState<CuratorUx | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/discovery/hsi-curator-ux.json");
        if (!res.ok) {
          throw new Error(
            `Missing curator UX pack (${res.status}). Run bun run outputs.`,
          );
        }
        const json = (await res.json()) as CuratorUx;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const awaiting =
    data?.partnerReviewSession.status === "awaiting_partner_review_session";
  const actionable = data?.gateCQueue.items.filter((i) => i.actionable) ?? [];
  const decided = data?.gateCQueue.items.filter((i) => !i.actionable) ?? [];

  return (
    <>
      <PageHero
        eyebrow="Curator UX · P1.6"
        title={
          <>
            Gap &amp; Gate C
            <br />
            <span className="accent">without invented outcomes.</span>
          </>
        }
        lede="Richer gap buckets and Gate C queue from published packs. Human decisions stay on ISI autumn-snow. When none are imported, this surface says awaiting partner review session — it never fabricates Apolo approve/reject rows or flips grades."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="section-head">
            <span className="section-num">POSTURE</span>
            <h2 className="display display-md">Honesty first</h2>
          </div>
          {error ? (
            <p className="lede" style={{ color: "var(--danger, #f87171)" }}>
              {error}
            </p>
          ) : null}
          {data ? (
            <>
              <div className="tag-row" style={{ marginBottom: "1.25rem" }}>
                <span className="tag">notCds={String(data.notCds)}</span>
                <span className="tag">
                  autoApprove={String(data.autoApproveIntoKg)}
                </span>
                <span className="tag">
                  mayFlipHsiGrade={String(data.mayFlipHsiGrade)}
                </span>
                <span className="tag">
                  inventedOutcomes=
                  {String(data.partnerReviewSession.inventedOutcomes)}
                </span>
              </div>
              <p className="lede">
                Partner: <strong>{data.partner.label ?? "unnamed"}</strong> (
                <code>{data.partner.id ?? "—"}</code>) · lockedPilot=
                {String(data.partner.lockedPilot)}
              </p>
              <div
                className="dc-hyp-card"
                style={{ marginTop: "1.25rem", maxWidth: "48rem" }}
              >
                <StatusChip status={data.partnerReviewSession.status} />
                <p style={{ marginTop: "0.75rem" }}>
                  {data.partnerReviewSession.note}
                </p>
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  Decisions Neon: <code>{data.partnerReviewSession.isiNeonTarget}</code>{" "}
                  · HSI substrate:{" "}
                  <code>{data.partnerReviewSession.hsiNeonTarget}</code>
                </p>
              </div>
              <ul style={{ marginTop: "1.5rem" }}>
                {data.honesty.map((h) => (
                  <li key={h} className="muted">
                    {h}
                  </li>
                ))}
              </ul>
            </>
          ) : !error ? (
            <p className="muted">Loading curator UX pack…</p>
          ) : null}
        </div>
      </section>

      {data ? (
        <>
          <section className="section section-bone">
            <div className="container">
              <div className="section-head">
                <span className="section-num">GAPS</span>
                <h2 className="display display-md">
                  Schema / mapping buckets
                </h2>
              </div>
              <p className="lede">
                {data.gapAnalysis.gapRowCount} gap rows across{" "}
                {data.gapAnalysis.summary.seedEdges} seed edges · ISI mapped{" "}
                {data.gapAnalysis.summary.claimsMappedToIsi} · LOINC{" "}
                {data.gapAnalysis.summary.loinc?.claimsWithLoincMarker ?? "—"}
              </p>
              <div className="dc-table-wrap" style={{ marginTop: "1.5rem" }}>
                <table className="dc-table">
                  <thead>
                    <tr>
                      <th>Missing slot</th>
                      <th>Count</th>
                      <th>Sample edges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gapAnalysis.buckets.map((b) => (
                      <tr key={b.missingKey}>
                        <td>
                          <code>{b.missingKey}</code>
                        </td>
                        <td>{b.count}</td>
                        <td className="muted">
                          {b.edgeIds.slice(0, 4).map((id) => (
                            <code key={id} style={{ marginRight: "0.4rem" }}>
                              {id}
                            </code>
                          ))}
                          {b.edgeIds.length === 0 ? "—" : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="muted" style={{ marginTop: "1rem" }}>
                Full markdown:{" "}
                <code>hsi-gap-report.md</code> via{" "}
                <code>bun run outputs</code> / <code>bun run curator-ux</code>.
              </p>
            </div>
          </section>

          <section className="section section-grid-light">
            <div className="container">
              <div className="section-head">
                <span className="section-num">GATE C</span>
                <h2 className="display display-md">
                  Queue · {awaiting ? "pending only" : "with decisions"}
                </h2>
              </div>
              <div className="tag-row" style={{ marginBottom: "1rem" }}>
                <span className="tag tag-light">
                  actionable {data.gateCQueue.actionableCount}
                </span>
                <span className="tag tag-light">
                  decided {data.gateCQueue.decidedCount}
                </span>
                <span className="tag tag-light">
                  unmapped {data.gateCQueue.unmappedCount}
                </span>
                <span className="tag tag-light">
                  model proposals {data.gateCQueue.modelProposals}
                </span>
                <span className="tag tag-light">
                  translation {data.gateCQueue.translationCandidates}
                </span>
              </div>
              <div className="dc-table-wrap">
                <table className="dc-table">
                  <thead>
                    <tr>
                      <th>Edge</th>
                      <th>REL</th>
                      <th>PMID</th>
                      <th>S–P–O</th>
                      <th>Status</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionable.map((r) => (
                      <tr key={r.edgeId}>
                        <td>
                          <code>{r.edgeId}</code>
                        </td>
                        <td>
                          <code>{r.isiRelationshipId ?? "—"}</code>
                        </td>
                        <td>{r.pmid ?? "—"}</td>
                        <td className="muted">{r.spoNote ?? "—"}</td>
                        <td>
                          <StatusChip status={r.effectiveStatus} />
                        </td>
                        <td className="muted">
                          {awaiting ? "awaiting partner" : (r.decision ?? "—")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {decided.length > 0 ? (
                <>
                  <h3 style={{ marginTop: "2rem" }}>Imported human decisions</h3>
                  <div className="dc-table-wrap">
                    <table className="dc-table">
                      <thead>
                        <tr>
                          <th>Edge</th>
                          <th>Decision</th>
                          <th>Status</th>
                          <th>Reviewer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {decided.map((r) => (
                          <tr key={r.edgeId}>
                            <td>
                              <code>{r.edgeId}</code>
                            </td>
                            <td>{r.decision ?? "—"}</td>
                            <td>
                              <StatusChip status={r.effectiveStatus} />
                            </td>
                            <td>{r.reviewedBy ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="muted" style={{ marginTop: "1.25rem" }}>
                  No decided rows — record approve/reject/defer on immunecity{" "}
                  <code>/hsi/discovery</code> REVIEW (autumn-snow only), then
                  optionally re-run{" "}
                  <code>bun run curator-ux --decisions …</code>.
                </p>
              )}
            </div>
          </section>

          <section className="section section-elevated">
            <div className="container">
              <div className="section-head">
                <span className="section-num">NEXT</span>
                <h2 className="display display-md">Curator actions</h2>
              </div>
              <ul>
                {data.nextActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <div className="tag-row" style={{ marginTop: "1.5rem" }}>
                <Link to="/discovery" className="btn btn-primary">
                  Discovery REVIEW
                </Link>
                <Link to="/evidence" className="btn btn-ghost">
                  Evidence grades
                </Link>
                <Link to="/docs" className="btn btn-ghost">
                  How to run
                </Link>
              </div>
              <p className="muted" style={{ marginTop: "1rem" }}>
                Generated {data.generatedAt} · schema{" "}
                <code>{data.schemaVersion}</code>
              </p>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
