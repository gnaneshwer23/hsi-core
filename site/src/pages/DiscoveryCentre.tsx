import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  gradeCounts,
  loadDiscoveryBundle,
  partnerScopedEvidence,
  type DiscoveryBundle,
  type EvidenceRow,
  type ExpertItem,
  type R2HypothesisCard,
} from "../lib/discoveryData";

type LoopTab = "ask" | "map" | "review" | "validate";

const TABS: { id: LoopTab; label: string; n: string }[] = [
  { id: "ask", label: "ASK", n: "01" },
  { id: "map", label: "MAP", n: "02" },
  { id: "review", label: "REVIEW", n: "03" },
  { id: "validate", label: "VALIDATE", n: "04" },
];

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  return <span className={`dc-status dc-status-${s}`}>{s}</span>;
}

function GradeChip({ grade }: { grade: string }) {
  const g = grade.toLowerCase();
  return <span className={`dc-grade dc-grade-${g}`}>{g}</span>;
}

function EntityChips({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items?.length) return null;
  return (
    <div className="dc-entity-block">
      <h4>{title}</h4>
      <div className="dc-chip-row">
        {items.map((item) => (
          <span key={item} className="dc-chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function EvidenceTable({ rows }: { rows: EvidenceRow[] }) {
  return (
    <div className="dc-table-wrap">
      <table className="dc-table">
        <thead>
          <tr>
            <th>Grade</th>
            <th>Claim</th>
            <th>S–P–O</th>
            <th>Source</th>
            <th>Marker</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.claimId}>
              <td>
                <GradeChip grade={r.evidenceGrade} />
              </td>
              <td>
                <div className="dc-claim-text">{r.claimText}</div>
                <code className="dc-mono">{r.claimId}</code>
              </td>
              <td className="dc-spo">
                <span>{r.subject}</span>
                <em>{r.relationship}</em>
                <span>{r.object}</span>
              </td>
              <td>
                {r.source.pmid ? (
                  <a
                    href={
                      r.source.sourceUrl ??
                      `https://pubmed.ncbi.nlm.nih.gov/${r.source.pmid}/`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    PMID {r.source.pmid}
                  </a>
                ) : (
                  <span className="muted">—</span>
                )}
                {r.source.citationLabel ? (
                  <div className="dc-cite">{r.source.citationLabel}</div>
                ) : null}
              </td>
              <td>
                {r.marker?.loinc ? (
                  <>
                    <div>{r.marker.markerName ?? "marker"}</div>
                    <code className="dc-mono">LOINC {r.marker.loinc}</code>
                  </>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HypothesisCards({ cards }: { cards: R2HypothesisCard[] }) {
  return (
    <div className="dc-explain-grid">
      {cards.map((card) => (
        <article key={card.id} className="dc-card">
          <div className="dc-panel-head">
            <StatusChip status={card.validationStatus} />
            <span className="dc-pill">autoApproved={String(card.autoApproved)}</span>
          </div>
          <h3>{card.label}</h3>
          <p className="muted" style={{ marginTop: "0.55rem" }}>
            {card.statusRationale}
          </p>
          <div className="dc-meta-row" style={{ marginTop: "0.75rem" }}>
            <code className="dc-mono">{card.id}</code>
            <code className="dc-mono">{card.sourceExplanationId}</code>
            {card.groundingPmids.slice(0, 4).map((pmid) => (
              <a
                key={pmid}
                className="dc-pill"
                href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                target="_blank"
                rel="noreferrer"
              >
                PMID {pmid}
              </a>
            ))}
          </div>
          <ul className="dc-compact-list" style={{ marginTop: "0.85rem" }}>
            {card.literatureTests.map((t) => (
              <li key={t.id}>
                <strong>{t.kind.replace(/_/g, " ")}</strong> — {t.prompt}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ExpertList({ items }: { items: ExpertItem[] }) {
  const groups = useMemo(() => {
    const order = ["gap", "hypothesis", "pending_gate_c"];
    const map = new Map<string, ExpertItem[]>();
    for (const item of items) {
      const list = map.get(item.kind) ?? [];
      list.push(item);
      map.set(item.kind, list);
    }
    return order
      .filter((k) => map.has(k))
      .map((k) => ({ kind: k, items: map.get(k)! }))
      .concat(
        [...map.entries()]
          .filter(([k]) => !order.includes(k))
          .map(([kind, list]) => ({ kind, items: list })),
      );
  }, [items]);

  return (
    <div className="dc-expert-groups">
      {groups.map((g) => (
        <div key={g.kind} className="dc-expert-group">
          <h4>
            {g.kind.replace(/_/g, " ")} · {g.items.length}
          </h4>
          <ul>
            {g.items.map((item) => (
              <li key={item.id}>
                <p>{item.text}</p>
                <div className="dc-meta-row">
                  <code className="dc-mono">{item.id}</code>
                  <span className="dc-pill">
                    autoApproved={String(item.autoApproved)}
                  </span>
                  {item.relatedClaimIds.slice(0, 3).map((id) => (
                    <code key={id} className="dc-mono">
                      {id}
                    </code>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function DiscoveryCentre() {
  const [tab, setTab] = useState<LoopTab>("ask");
  const [data, setData] = useState<DiscoveryBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    loadDiscoveryBundle()
      .then((bundle) => {
        if (!cancelled) setData(bundle);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load outputs");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scopedRows = useMemo(
    () => (data ? partnerScopedEvidence(data.pack, data.lock) : []),
    [data],
  );
  const counts = useMemo(() => gradeCounts(scopedRows), [scopedRows]);
  const filteredRows = useMemo(() => {
    if (gradeFilter === "all") return scopedRows;
    return scopedRows.filter((r) => r.evidenceGrade === gradeFilter);
  }, [scopedRows, gradeFilter]);

  const entity = data?.pack.partnerScopedEntitySlice ?? data?.pack.entitySlice;
  const raExplanations =
    data?.pack.competingExplanations.filter((e) => !e.id.includes("sle")) ?? [];
  const gaps =
    data?.pack.expertShortlist.filter((e) => e.kind === "gap" || e.kind === "hypothesis") ??
    [];
  const raGaps =
    data?.gap.gaps.filter(
      (g) =>
        g.claimId.includes("-RA-") ||
        g.domain === "autoimmunity" ||
        /tnf|rheumatoid|acpa|ada/i.test(g.assertion),
    ) ?? [];

  return (
    <>
      <section className="dc-hero">
        <div className="hero-glow" aria-hidden />
        <div className="container dc-hero-inner">
          <div className="dc-banner-stack" role="status">
            <p className="dc-banner dc-banner-warn">
              Not diagnostic · not for clinical use · research intelligence only
            </p>
            <p className="dc-banner dc-banner-info">
              Concept → now product for research intelligence. Akeno clinical
              intelligence = later / gated.
            </p>
          </div>
          <span className="eyebrow">ISI · Discovery Centre · Phase 7</span>
          <h1 className="display display-lg">
            ASK → MAP → REVIEW → VALIDATE
            <br />
            <span className="accent">on real HSI packs.</span>
          </h1>
          <p className="lede">
            Target R1–R2 research surface for the scope-locked RA / anti-TNF
            question. Loads regenerable outputs — evidence map, competing
            explanations, expert shortlist, R2 hypothesis cards, ranked gaps.
          </p>
          <div className="dc-hero-actions">
            <a href="#workspace" className="btn btn-primary">
              Open workspace <span className="arrow">↘</span>
            </a>
            <Link to="/docs" className="btn btn-ghost">
              How to regenerate <span className="arrow">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-ink" id="workspace">
        <div className="container">
          {error ? (
            <div className="dc-error">
              <h2 className="display display-md">Could not load outputs</h2>
              <p className="lede">{error}</p>
              <p className="muted" style={{ marginTop: "1rem" }}>
                Run <code>bun run outputs</code> from the repo root, then refresh.
              </p>
            </div>
          ) : null}

          {!data && !error ? (
            <p className="lede dc-loading">Loading published packs…</p>
          ) : null}

          {data ? (
            <>
              <div className="dc-scope-strip">
                <div>
                  <span className="dc-pill">scopeLocked={String(data.lock.scopeLocked)}</span>
                  <span className="dc-pill">
                    partnerSigned={String(data.lock.partnerSigned)}
                  </span>
                  <span className="dc-pill">
                    lockedPilot={String(data.lock.lockedPilot)}
                  </span>
                  <span className="dc-pill">status={data.lock.status}</span>
                </div>
                <p className="dc-scope-disease">
                  {data.lock.disease?.label ?? data.pack.disease}
                </p>
                <p className="dc-scope-q">{data.lock.researchQuestion}</p>
                <p className="dc-meta-line">
                  Bundle <code>{data.index.bundleId}</code> · generated{" "}
                  {new Date(data.index.generatedAt).toLocaleString()} · notCds
                </p>
              </div>

              <div className="dc-loop" role="tablist" aria-label="Discovery loop">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={`dc-loop-tab${tab === t.id ? " active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    <span className="dc-loop-n">
                      {t.n} / {t.label}
                    </span>
                    <strong>
                      {t.id === "ask"
                        ? "Frame the question"
                        : t.id === "map"
                          ? "Traceable evidence"
                          : t.id === "review"
                            ? "Challenge & shortlist"
                            : "Hypothesis & gaps"}
                    </strong>
                  </button>
                ))}
                <div className="dc-loop-later" aria-hidden>
                  <span>05 LEARN</span>
                  <small>later / Phase 8+</small>
                </div>
              </div>

              {tab === "ask" ? (
                <div className="dc-panel" role="tabpanel">
                  <div className="section-head">
                    <span className="section-num">ASK</span>
                    <h2 className="display display-md">Scoped question</h2>
                    <p className="lede">
                      Working Stage 1 scope from{" "}
                      <code>hsi-partner-lock.json</code>. scopeLocked is
                      engineering scope — not a MoU.
                    </p>
                  </div>

                  <div className="dc-ask-grid">
                    <article className="dc-card">
                      <span className="panel-label">Disease</span>
                      <h3>{data.lock.disease?.label}</h3>
                      <p className="muted">
                        Pathway: {data.lock.seedPathway?.label}
                      </p>
                    </article>
                    <article className="dc-card">
                      <span className="panel-label">Partner lock honesty</span>
                      <ul className="dc-compact-list">
                        {data.lock.honesty.slice(0, 6).map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </article>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <span className="panel-label">Outreach category (not signed)</span>
                    <h3 style={{ fontSize: "1.15rem", marginTop: "0.4rem" }}>
                      {data.lock.partner?.label}
                    </h3>
                    <p className="muted" style={{ marginTop: "0.55rem" }}>
                      type={data.lock.partner?.type} · outreach=
                      {data.lock.partner?.outreachStatus}
                    </p>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <span className="panel-label">Candidate framings</span>
                    <ul className="checklist" style={{ marginTop: "0.85rem" }}>
                      {data.lock.candidateQuestions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <span className="panel-label">Illustrative contexts only</span>
                    <div className="dc-disease-row">
                      {data.pack.discoveryCentre.illustrativeDiseaseContexts.map(
                        (d) => (
                          <div
                            key={d.id}
                            className={`dc-disease${d.id === "ra" ? " active" : ""}`}
                          >
                            <strong>{d.label}</strong>
                            <span>{d.status.replace(/_/g, " ")}</span>
                            <small>{d.seedHint}</small>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "map" ? (
                <div className="dc-panel" role="tabpanel">
                  <div className="section-head">
                    <span className="section-num">MAP</span>
                    <h2 className="display display-md">Evidence + entities</h2>
                    <p className="lede">
                      Partner-scoped evidence map from{" "}
                      <code>hsi-pilot-evidence-pack.json</code>. Grades stay
                      honest — established / uncertain / unexplored.
                    </p>
                  </div>

                  <div className="grade-row dc-grade-summary">
                    {(
                      [
                        ["established", counts.established ?? 0],
                        ["uncertain", counts.uncertain ?? 0],
                        ["unexplored", counts.unexplored ?? 0],
                      ] as const
                    ).map(([label, n]) => (
                      <button
                        key={label}
                        type="button"
                        className={`grade-cell grade-${label}${gradeFilter === label ? " dc-filter-on" : ""}`}
                        onClick={() =>
                          setGradeFilter((cur) => (cur === label ? "all" : label))
                        }
                      >
                        <div className="label">{label}</div>
                        <h3>{n}</h3>
                        <p>scoped rows · click to filter</p>
                      </button>
                    ))}
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.5rem" }}>
                    <div className="dc-panel-head">
                      <h3>Entity slice</h3>
                      <span className="dc-pill">
                        {scopedRows.length} evidence rows · LOINC{" "}
                        {data.pack.summary.claimsWithLoinc ?? "—"}
                      </span>
                    </div>
                    {entity?.note ? (
                      <p className="muted" style={{ marginBottom: "1rem" }}>
                        {entity.note}
                      </p>
                    ) : null}
                    <div className="dc-entity-grid">
                      <EntityChips title="Diseases" items={entity?.diseases} />
                      <EntityChips title="Cells" items={entity?.cells} />
                      <EntityChips
                        title="Pathways / mechanisms"
                        items={entity?.pathwaysOrMechanisms}
                      />
                      <EntityChips title="Biomarkers" items={entity?.biomarkers} />
                      <EntityChips title="Treatments" items={entity?.treatments} />
                      <EntityChips title="Studies" items={entity?.studies} />
                    </div>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <div className="dc-panel-head">
                      <h3>Evidence map</h3>
                      <button
                        type="button"
                        className="dc-pill dc-pill-btn"
                        onClick={() => setGradeFilter("all")}
                      >
                        show all scoped
                      </button>
                    </div>
                    <EvidenceTable rows={filteredRows} />
                  </div>
                </div>
              ) : null}

              {tab === "review" ? (
                <div className="dc-panel" role="tabpanel">
                  <div className="section-head">
                    <span className="section-num">REVIEW</span>
                    <h2 className="display display-md">
                      Competing frames · shortlist · gaps
                    </h2>
                    <p className="lede">
                      Human review stays in the loop. Competing explanations are
                      not collapsed. Expert shortlist items never auto-approve.
                    </p>
                  </div>

                  <div className="dc-explain-grid">
                    {raExplanations.map((ex) => (
                      <article key={ex.id} className="dc-card">
                        <span className="panel-label">{ex.status.replace(/_/g, " ")}</span>
                        <h3>{ex.label}</h3>
                        <p className="muted" style={{ marginTop: "0.55rem" }}>
                          {ex.note}
                        </p>
                        <div className="dc-meta-row" style={{ marginTop: "0.75rem" }}>
                          {ex.relatedClaimIds.map((id) => (
                            <code key={id} className="dc-mono">
                              {id}
                            </code>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>

                  {data.pack.uncertainties.length > 0 ? (
                    <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                      <h3>Uncertainties</h3>
                      <ul className="dc-compact-list" style={{ marginTop: "0.75rem" }}>
                        {data.pack.uncertainties.map((u) => (
                          <li key={u.id}>
                            <strong>{u.label}</strong> — {u.note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <div className="dc-panel-head">
                      <h3>Expert shortlist</h3>
                      <span className="dc-pill">{gaps.length} gap / hypothesis</span>
                    </div>
                    <ExpertList items={data.pack.expertShortlist} />
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <div className="dc-panel-head">
                      <h3>Schema / mapping gaps (RA-relevant)</h3>
                      <span className="dc-pill">
                        {raGaps.length} of {data.gap.gaps.length} gap rows
                      </span>
                    </div>
                    <div className="dc-table-wrap">
                      <table className="dc-table">
                        <thead>
                          <tr>
                            <th>Claim</th>
                            <th>Assertion</th>
                            <th>Grade</th>
                            <th>Missing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {raGaps.slice(0, 16).map((g) => (
                            <tr key={g.claimId}>
                              <td>
                                <code className="dc-mono">{g.claimId}</code>
                              </td>
                              <td>{g.assertion}</td>
                              <td>
                                <GradeChip grade={g.hsiGrade} />
                              </td>
                              <td>
                                {g.missing.map((m) => (
                                  <span key={m} className="dc-chip">
                                    {m}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <span className="panel-label">Still required to flip partnerSigned</span>
                    <ul className="checklist" style={{ marginTop: "0.85rem" }}>
                      {data.lock.flipRequirements.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {tab === "validate" ? (
                <div className="dc-panel" role="tabpanel">
                  <div className="section-head">
                    <span className="section-num">VALIDATE</span>
                    <h2 className="display display-md">
                      R2 hypothesis cards · ranked gaps
                    </h2>
                    <p className="lede">
                      Phase 7 research validation from{" "}
                      <code>hsi-r2-validation.json</code>. Statuses are
                      literature-grounded — not clinical protocols, not Akeno.
                    </p>
                  </div>

                  <div className="grade-row dc-grade-summary">
                    {(
                      [
                        ["supported", data.r2.summary.byStatus.supported ?? 0],
                        ["gap", data.r2.summary.byStatus.gap ?? 0],
                        ["refuted", data.r2.summary.byStatus.refuted ?? 0],
                        ["untested", data.r2.summary.byStatus.untested ?? 0],
                      ] as const
                    ).map(([label, n]) => (
                      <div key={label} className={`grade-cell dc-status-cell dc-status-${label}`}>
                        <div className="label">{label}</div>
                        <h3>{n}</h3>
                        <p>hypothesis cards</p>
                      </div>
                    ))}
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.5rem" }}>
                    <div className="dc-panel-head">
                      <h3>Hypothesis cards</h3>
                      <span className="dc-pill">
                        {data.r2.summary.hypothesisCards} cards ·{" "}
                        {data.r2.summary.literatureTests} literature tests ·{" "}
                        {data.r2.summary.groundingPmidCount} PMIDs
                      </span>
                    </div>
                    <HypothesisCards cards={data.r2.hypothesisCards} />
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <div className="dc-panel-head">
                      <h3>Ranked gaps · next experiments</h3>
                      <span className="dc-pill">
                        {data.r2.summary.rankedGaps} ranked
                      </span>
                    </div>
                    <ol className="dc-ranked-gaps">
                      {data.r2.rankedGaps.map((g) => (
                        <li key={g.id}>
                          <div className="dc-panel-head">
                            <span className="dc-pill">#{g.rank}</span>
                            <span className="dc-pill">{g.priority}</span>
                            <span className="dc-pill">{g.source.replace(/_/g, " ")}</span>
                          </div>
                          <h4>{g.title}</h4>
                          <p className="muted">{g.why}</p>
                          <p style={{ marginTop: "0.55rem" }}>
                            <strong>Next:</strong> {g.nextExperimentPrompt}
                          </p>
                          <div className="dc-meta-row" style={{ marginTop: "0.65rem" }}>
                            {g.relatedPmids.map((pmid) => (
                              <a
                                key={pmid}
                                className="dc-pill"
                                href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                PMID {pmid}
                              </a>
                            ))}
                            {g.relatedClaimIds.slice(0, 4).map((id) => (
                              <code key={id} className="dc-mono">
                                {id}
                              </code>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <span className="panel-label">Boundary</span>
                    <ul className="checklist" style={{ marginTop: "0.85rem" }}>
                      {data.r2.boundary.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <section className="section section-teal">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="section-num">BOUNDARY</span>
            <h2 className="display display-md">Research now. Clinical later.</h2>
            <p className="lede">
              NOW = Discovery + R2 validation on published packs. NEXT = Phase 8
              clinical R3–R5 / Akeno — explicit ask + Stage 3 gates only. Never
              implied by this surface.
            </p>
          </div>
          <div className="dc-horizon">
            <div>
              <span className="dc-pill">NOW</span>
              <strong>Discovery + Validate</strong>
              <p>ASK → MAP → REVIEW → VALIDATE on RA / anti-TNF</p>
            </div>
            <div>
              <span className="dc-pill">NEXT</span>
              <strong>Translation</strong>
              <p>Phase 8 · R3–R5 / Akeno — explicit ask</p>
            </div>
            <div>
              <span className="dc-pill">GATED</span>
              <strong>Clinical</strong>
              <p>Stage 3 gates · never from research packs alone</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
