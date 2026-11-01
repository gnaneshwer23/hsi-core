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
  type TranslationCandidate,
} from "../lib/discoveryData";
import {
  DiscoveryGraphExplorer,
  packMapToGraphEdges,
  raRowsToGraphEdges,
} from "../components/DiscoveryGraphExplorer";

type LoopTab = "ask" | "map" | "review" | "validate" | "translate";

const TABS: { id: LoopTab; label: string; n: string }[] = [
  { id: "ask", label: "ASK", n: "01" },
  { id: "map", label: "MAP", n: "02" },
  { id: "review", label: "REVIEW", n: "03" },
  { id: "validate", label: "VALIDATE", n: "04" },
  { id: "translate", label: "TRANSLATE", n: "05" },
];

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, "-");
  return <span className={`dc-status dc-status-${s}`}>{status}</span>;
}

function TranslationCandidates({
  candidates,
}: {
  candidates: TranslationCandidate[];
}) {
  return (
    <ul className="dc-hyp-list">
      {candidates.map((c) => (
        <li key={c.id} className="dc-hyp-card">
          <div className="dc-panel-head">
            <StatusChip status={c.status} />
            <span className="dc-pill">HITL required</span>
            <span className="dc-pill dc-pill-danger">{c.clinicalUse}</span>
            <span className="dc-pill">cds={String(c.cdsSurfacable)}</span>
          </div>
          <h4>{c.clinicLabel ?? "Unmapped clinic concept"}</h4>
          <p className="muted">{c.assertion}</p>
          <div className="dc-meta-row" style={{ marginTop: "0.65rem" }}>
            <code className="dc-mono">{c.claimId}</code>
            {c.akshNodeId ? (
              <code className="dc-mono">{c.akshNodeId}</code>
            ) : null}
            {c.loinc ? <span className="dc-pill">LOINC {c.loinc}</span> : null}
            {c.markerName ? (
              <span className="dc-pill">{c.markerName}</span>
            ) : null}
            <GradeChip grade={c.hsiGrade} />
            <span className="dc-pill">teaching={c.teachingStatus}</span>
          </div>
          <p style={{ marginTop: "0.55rem" }}>
            <strong>{c.requiredClinicianAction.label}</strong>
            <span className="muted"> — {c.requiredClinicianAction.rationale}</span>
          </p>
          <p className="dc-axes-note">{c.axesNote}</p>
        </li>
      ))}
    </ul>
  );
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
            <p className="dc-banner dc-banner-danger">
              Clinical translation is NOT ACTIVE · clinicalActive=false · Akeno
              HITL at /akeno is not CDS
            </p>
            <p className="dc-banner dc-banner-info">
              Phase 8 = HSI translation substrate. Akeno HITL consumer at{" "}
              <Link to="/akeno">/akeno</Link> — not live CDS. Aksh agent
              names: <Link to="/aksh-agents">/aksh-agents</Link>.
            </p>
          </div>
          <span className="eyebrow">ISI · Discovery Centre · Phase 8</span>
          <h1 className="display display-lg">
            ASK → MAP → REVIEW → VALIDATE → TRANSLATE
            <br />
            <span className="accent">on real HSI packs.</span>
          </h1>
          <p className="lede">
            Product discovery loop for the scope-locked RA / anti-TNF question.
            Majority time stays on current-state evidence (ASK→MAP) before any
            TRANSLATE handoff. Never live CDS · Gate C never auto-approves.
          </p>
          <div className="dc-hero-actions">
            <a href="#workspace" className="btn btn-primary">
              Open workspace <span className="arrow">↘</span>
            </a>
            <a href="/discovery.json" className="btn btn-ghost">
              Machine catalogue JSON <span className="arrow">↗</span>
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
                            : t.id === "validate"
                              ? "Hypothesis & gaps"
                              : "HITL handoff (not clinical)"}
                    </strong>
                  </button>
                ))}
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

                  <div className="dc-card dc-contract" role="note">
                    <span className="panel-label">Upfront contract</span>
                    <p style={{ marginTop: "0.45rem" }}>
                      We map what is already evidenced on the locked RA /
                      anti-TNF question, surface honest gaps, then decide whether
                      VALIDATE or a HITL handoff is warranted. Outcomes can be:
                      continue, stop (not a fit / insufficient evidence), or park
                      pending human Gate C — all fine. No auto-approve into the
                      product KG.
                    </p>
                    <ul className="dc-compact-list" style={{ marginTop: "0.75rem" }}>
                      <li>
                        <strong>Spend most of the loop on ASK→MAP</strong> —
                        current-state evidence before TRANSLATE.
                      </li>
                      <li>
                        Implication prompts on REVIEW/VALIDATE expand the cost of
                        gaps; they do not manufacture urgency.
                      </li>
                      <li>
                        Need-payoff lives on VALIDATE: what human review unlocks
                        before any clinic-facing handoff.
                      </li>
                    </ul>
                  </div>

                  <div className="dc-ask-grid" style={{ marginTop: "1.25rem" }}>
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

                  {data.gutImmune?.deepSeedsPresent ? (
                    <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                      <span className="panel-label">
                        Systems secondary axis · does not replace ASK
                      </span>
                      <h3 style={{ fontSize: "1.15rem", marginTop: "0.4rem" }}>
                        {data.gutImmune.pathway.label}
                      </h3>
                      <p className="muted" style={{ marginTop: "0.55rem" }}>
                        Pack{" "}
                        <code>hsi-gut-immune-pack.json</code> ·{" "}
                        {data.gutImmune.evidenceMap.length} edges · grades stay
                        uncertain / hypothesized · role=
                        {data.gutImmune.discoveryRole ??
                          "systems_secondary_axis"}
                      </p>
                      <div className="dc-chip-row" style={{ marginTop: "0.75rem" }}>
                        {(data.gutImmune.pathway.primaryPmids ?? [])
                          .slice(0, 7)
                          .map((pmid) => (
                            <span key={pmid} className="dc-pill">
                              PMID {pmid}
                            </span>
                          ))}
                      </div>
                      <ul className="dc-compact-list" style={{ marginTop: "0.85rem" }}>
                        {data.gutImmune.competingExplanations
                          .slice(0, 4)
                          .map((e) => (
                            <li key={e.id}>
                              <strong>{e.label}</strong>{" "}
                              <span className="muted">({e.status})</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : null}

                  {data.neuroImmune?.deepSeedsPresent ? (
                    <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                      <span className="panel-label">
                        Systems secondary axis · does not replace ASK
                      </span>
                      <h3 style={{ fontSize: "1.15rem", marginTop: "0.4rem" }}>
                        {data.neuroImmune.pathway.label}
                      </h3>
                      <p className="muted" style={{ marginTop: "0.55rem" }}>
                        Pack{" "}
                        <code>hsi-neuroimmune-pack.json</code> ·{" "}
                        {data.neuroImmune.evidenceMap.length} edges · grades stay
                        uncertain / hypothesized · human VNS–RA not a clinical
                        cure · role=
                        {data.neuroImmune.discoveryRole ??
                          "systems_secondary_axis"}
                      </p>
                      <div className="dc-chip-row" style={{ marginTop: "0.75rem" }}>
                        {(data.neuroImmune.pathway.primaryPmids ?? [])
                          .slice(0, 6)
                          .map((pmid) => (
                            <span key={pmid} className="dc-pill">
                              PMID {pmid}
                            </span>
                          ))}
                      </div>
                      <ul className="dc-compact-list" style={{ marginTop: "0.85rem" }}>
                        {data.neuroImmune.competingExplanations
                          .slice(0, 4)
                          .map((e) => (
                            <li key={e.id}>
                              <strong>{e.label}</strong>{" "}
                              <span className="muted">({e.status})</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === "map" ? (
                <div className="dc-panel" role="tabpanel">
                  <div className="section-head">
                    <span className="section-num">MAP</span>
                    <h2 className="display display-md">
                      Current-state evidence + graph
                    </h2>
                    <p className="lede">
                      Partner-scoped RA evidence from{" "}
                      <code>hsi-pilot-evidence-pack.json</code>, plus optional
                      SSc / gut / neuro pack toggles on the interactive graph.
                      This is the majority of discovery time — map what is broken,
                      missing, or graded uncertain before pitching TRANSLATE.
                      Grades stay honest — established / uncertain / unexplored.
                      Not diagnostic.
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
                    <DiscoveryGraphExplorer
                      defaultPacks={["ra"]}
                      edges={[
                        ...raRowsToGraphEdges(scopedRows),
                        ...(data.sscPathway?.evidenceMap
                          ? packMapToGraphEdges(
                              "ssc",
                              data.sscPathway.evidenceMap,
                            )
                          : []),
                        ...(data.gutImmune?.evidenceMap
                          ? packMapToGraphEdges(
                              "gut",
                              data.gutImmune.evidenceMap,
                            )
                          : []),
                        ...(data.neuroImmune?.evidenceMap
                          ? packMapToGraphEdges(
                              "neuro",
                              data.neuroImmune.evidenceMap,
                            )
                          : []),
                      ]}
                    />
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

                  <div className="dc-card" role="note">
                    <span className="panel-label">Implication prompts (consequence of gaps)</span>
                    <ul className="dc-compact-list" style={{ marginTop: "0.75rem" }}>
                      <li>
                        If grade holes stay unexplored, what downstream partner
                        decision (trial arm, biomarker panel, Gate C queue) stays
                        blocked?
                      </li>
                      <li>
                        When competing frames are not held side-by-side, who else
                        in the review chain inherits a false single narrative?
                      </li>
                      <li>
                        If LOINC-linked claims stay thin, what does that cost the
                        HITL translation path six months out — without inventing
                        urgency?
                      </li>
                    </ul>
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

                  <div className="dc-card" role="note">
                    <span className="panel-label">
                      Need-payoff — what would VALIDATE unlock before TRANSLATE?
                    </span>
                    <ul className="dc-compact-list" style={{ marginTop: "0.75rem" }}>
                      <li>
                        If ranked gaps were closed under human Gate C, which
                        handoff candidates could move from deferred_until_hitl
                        without claiming CDS?
                      </li>
                      <li>
                        What becomes possible for the partner walkthrough that is
                        not possible while hypothesis cards stay untested?
                      </li>
                      <li>
                        Explicit next step: pick one ranked gap → human review in
                        HSI Neon (pending only) — never auto-approve.
                      </li>
                    </ul>
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

              {tab === "translate" ? (
                <div className="dc-panel" role="tabpanel">
                  <div className="dc-banner-stack" role="alert">
                    <p className="dc-banner dc-banner-danger">
                      CLINICAL NOT ACTIVE · not for clinical use · no diagnosis /
                      treatment · no PHI
                    </p>
                    <p className="dc-banner dc-banner-warn">
                      status=deferred_until_hitl · hitlRequired=true ·
                      autoApprove=false · cdsSurfacable=0 · Akeno consumer =
                      /akeno HITL (not live CDS)
                    </p>
                  </div>

                  <div className="section-head">
                    <span className="section-num">TRANSLATE</span>
                    <h2 className="display display-md">
                      Stage 3 handoff candidates
                    </h2>
                    <p className="lede">
                      Only after ASK→MAP→REVIEW→VALIDATE. Phase 8 HSI translation
                      substrate from <code>hsi-translation-handoff.json</code>.
                      Research edges → clinic-facing pointers. teachingStatus ≠
                      hsiGrade ≠ CDS. Explicit next: human HITL on{" "}
                      <Link to="/akeno">/akeno</Link> — never fake Gate C
                      auto-approve.
                    </p>
                  </div>

                  <div className="grade-row dc-grade-summary">
                    {(
                      [
                        ["candidates", data.translation.summary.candidates],
                        ["with LOINC", data.translation.summary.withLoinc],
                        ["HITL required", data.translation.summary.hitlRequired],
                        [
                          "CDS surfacable",
                          data.translation.summary.cdsSurfacableCount,
                        ],
                      ] as const
                    ).map(([label, n]) => (
                      <div key={label} className="grade-cell">
                        <div className="label">{label}</div>
                        <h3>{n}</h3>
                        <p>handoff</p>
                      </div>
                    ))}
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.5rem" }}>
                    <div className="dc-panel-head">
                      <h3>Handoff candidates</h3>
                      <span className="dc-pill">
                        {data.translation.summary.deferredUntilHitl} deferred ·{" "}
                        {data.translation.summary.notForClinicalUse} not clinical
                      </span>
                    </div>
                    <TranslationCandidates
                      candidates={data.translation.candidates}
                    />
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <div className="dc-panel-head">
                      <span className="panel-label">
                        Outside hsi-core (still gated)
                      </span>
                      <Link to="/akeno" className="dc-pill">
                        Akeno consumer →
                      </Link>
                    </div>
                    <ul className="checklist" style={{ marginTop: "0.85rem" }}>
                      {data.translation.whatRemainsOutsideHsiCore.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="dc-card" style={{ marginTop: "1.25rem" }}>
                    <span className="panel-label">Boundary</span>
                    <ul className="checklist" style={{ marginTop: "0.85rem" }}>
                      {data.translation.boundary.map((b) => (
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
            <h2 className="display display-md">
              Research + translation scaffolding. Clinical product later.
            </h2>
            <p className="lede">
              NOW = Discovery + R2 validation + translation substrate + in-repo
              Akeno HITL consumer (clinicalActive=false). GATED = partner
              cohorts, HCP eval, regulatory CDS. Never implied by map presence
              alone.
            </p>
          </div>
          <div className="dc-horizon">
            <div>
              <span className="dc-pill">NOW</span>
              <strong>Discovery + Validate</strong>
              <p>ASK → MAP → REVIEW → VALIDATE on RA / anti-TNF</p>
            </div>
            <div>
              <span className="dc-pill">NOW</span>
              <strong>Translate substrate</strong>
              <p>Phase 8 · deferred_until_hitl · not clinical</p>
            </div>
            <div>
              <span className="dc-pill">NOW</span>
              <strong>Akeno HITL</strong>
              <p>
                <Link to="/akeno">/akeno</Link> · not CDS · no Akeno Neon ·{" "}
                <Link to="/aksh-agents">agent catalog</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
