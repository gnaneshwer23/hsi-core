import {ContextAuditReviewPanel} from "./ContextAuditReviewPanel";
import {printResearchDocument} from "../lib/printResearchDocument";
import {renderResearchOutcome} from "../../../src/researchOutcome";
import {useEffect, useState} from "react";
import type {EvidenceBrief} from "../../../src/investigationDelivery";
import type {ResearchOutcome} from "../../../src/researchOutcome";
import {fetchResearchOutcome, downloadResearchOutcome} from "../lib/researchOutcomeClient";
import {INVESTIGATION_SECTIONS} from "../lib/investigationSections";
import "../styles/research-outcome.css";

function sourceUrl(value: string | null) {
  try {
    const u = new URL(value ?? "");
    return u.protocol === "https:" && !u.username && !u.password ? u.href : null;
  } catch {
    return null;
  }
}
const human = (value: string) => value.replaceAll("_", " ");

function ReverseTrace({
  outcome,
  claimIds,
  heading,
}: {
  outcome: ResearchOutcome;
  claimIds: readonly string[];
  heading: string;
}) {
  if (!claimIds.length) {
    return (
      <details>
        <summary>{heading}</summary>
        <p>No claim bindings recorded for reverse trace on this item.</p>
      </details>
    );
  }
  return (
    <details open>
      <summary>{heading}</summary>
      <ol className="outcome-reverse-trace">
        {claimIds.map((claimId) => {
          const claim = outcome.evidence.find((c) => c.claimId === claimId);
          if (!claim) {
            return (
              <li key={claimId}>
                <code>{claimId}</code> — claim not present in this outcome package.
              </li>
            );
          }
          return (
            <li key={claimId}>
              <strong>Claim</strong> · {claim.statement}
              <p>
                Relationship <code>{claim.relationshipId}</code> · epistemic {human(claim.epistemicType)} ·
                context preserved (species {claim.context.species ?? "n/a"}, system{" "}
                {claim.context.experimentalSystem ?? "n/a"})
              </p>
              <ul>
                {claim.passageIds.map((passageId) => {
                  const passage = outcome.passages.find((p) => p.id === passageId);
                  const source = passage
                    ? outcome.sources.find((s) => s.id === passage.sourceId)
                    : undefined;
                  if (!passage || !source) {
                    return (
                      <li key={passageId}>
                        Passage <code>{passageId}</code> missing from package.
                      </li>
                    );
                  }
                  const href = sourceUrl(source.url);
                  return (
                    <li key={passageId}>
                      <strong>Passage → source</strong>
                      <blockquote>{passage.text}</blockquote>
                      <p>
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {source.title} ↗
                          </a>
                        ) : (
                          source.title
                        )}
                        {" · "}
                        {passage.locator} · PMID {source.pmid ?? "not recorded"} · DOI{" "}
                        {source.doi ?? "not recorded"}
                      </p>
                      <p>
                        Passage SHA-256: <code>{passage.sha256}</code>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

export function ResearchOutcomePanel({brief}: {brief: EvidenceBrief}) {
  const [outcome, setOutcome] = useState<ResearchOutcome | null>(null);
  const [section, setSection] = useState<(typeof INVESTIGATION_SECTIONS)[number]["id"]>("01");
  const [edgeId, setEdgeId] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const key = brief.package.packageHash + ":" + (brief.decision?.decisionHash ?? "");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    setOutcome(null);
    setMessage("Loading and verifying the saved research outcome…");
    fetchResearchOutcome(brief, controller.signal)
      .then((o) => {
        if (!controller.signal.aborted) {
          setOutcome(o);
          setEdgeId(o.mechanismMap.edges[0]?.id ?? "");
          setMessage("");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMessage(
            "The research outcome could not be verified. Refresh to check current evidence and access.",
          );
        }
      })
      .finally(() => clearTimeout(timeout));
    const abort = () => setMessage("The outcome request timed out. Refresh to retry.");
    controller.signal.addEventListener("abort", abort, {once: true});
    return () => {
      controller.signal.removeEventListener("abort", abort);
      controller.abort();
      clearTimeout(timeout);
    };
  }, [key, attempt]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const match = INVESTIGATION_SECTIONS.find((s) => s.anchor === hash);
    if (match) setSection(match.id);
  }, [key]);

  async function download(format: "json" | "markdown") {
    if (!outcome || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await downloadResearchOutcome(brief, outcome, format);
      setMessage("Verified research outcome downloaded.");
    } catch {
      setMessage("The download could not be verified. Refresh the outcome before retrying.");
    } finally {
      setBusy(false);
    }
  }

  async function print() {
    if (!outcome || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const current = await fetchResearchOutcome(brief, AbortSignal.timeout(20000));
      if (current.outcomeHash !== outcome.outcomeHash) throw Error();
      printResearchDocument(
        "Human Super Intelligence — research brief",
        renderResearchOutcome(current, "markdown"),
      );
    } catch {
      setMessage("The current brief could not be verified for printing. Refresh and check access.");
    } finally {
      setBusy(false);
    }
  }

  const edge = outcome?.mechanismMap.edges.find((e) => e.id === edgeId);
  const active = INVESTIGATION_SECTIONS.find((s) => s.id === section)!;

  return (
    <section className="research-outcome" aria-labelledby="outcome-heading">
      <div className="outcome-top">
        <div>
          <p className="outcome-eyebrow">HUMAN SUPER INTELLIGENCE / RESEARCH</p>
          <h3 id="outcome-heading">Unified research outcome</h3>
          <p>One question. Six investigation sections. Visible limits. No new scientific generation.</p>
        </div>
        <button type="button" onClick={() => setAttempt((n) => n + 1)} disabled={busy}>
          Refresh outcome
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {outcome && (
        <>
          <nav aria-label="Investigation sections 01 to 06" className="outcome-navigation">
            {INVESTIGATION_SECTIONS.map((s) => (
              <button
                type="button"
                key={s.id}
                aria-pressed={s.id === section}
                onClick={() => {
                  setSection(s.id);
                  const el = document.getElementById(s.anchor);
                  if (el) el.scrollIntoView({behavior: "smooth", block: "start"});
                  else window.history.replaceState(null, "", `#${s.anchor}`);
                }}
              >
                {s.id} {s.short}
              </button>
            ))}
          </nav>
          <div className="outcome-content" id={active.anchor}>
            <p className="outcome-eyebrow">
              SECTION {active.id} · {active.title.toUpperCase()}
            </p>

            {section === "01" && (
              <>
                <h4>{outcome.question}</h4>
                <p className="outcome-answer">{outcome.answer.summary}</p>
                <div className="outcome-facts">
                  <article>
                    <h4>Confidence</h4>
                    <p>Not calibrated</p>
                  </article>
                  <article>
                    <h4>Data context</h4>
                    <p>{human(outcome.scope.sourceDisease)} research sources</p>
                  </article>
                  <article>
                    <h4>Human review</h4>
                    <p>{human(outcome.review.status)}</p>
                  </article>
                </div>
                {outcome.scope.questionFit === "scope_review_required" && (
                  <p role="note">
                    This question needs scope review. The saved release cannot establish a patient-specific or
                    cross-disease answer.
                  </p>
                )}
                <h4>Mechanism map from the primary release</h4>
                <p>
                  Landscape is composed from the bound mechanism map and saved answer. It is not a curated
                  narrative for arbitrary new questions.
                </p>
                <ul>
                  {outcome.mechanismMap.edges.map((e) => (
                    <li key={e.id}>
                      {(outcome.mechanismMap.nodes.find((n) => n.id === e.subjectId)?.label ?? e.subjectId) +
                        " → " +
                        human(e.predicate) +
                        " → " +
                        (outcome.mechanismMap.nodes.find((n) => n.id === e.objectId)?.label ?? e.objectId)}
                      {" · "}
                      {human(e.epistemicType)}
                    </li>
                  ))}
                </ul>
                <h4>Living evidence metadata (step 03)</h4>
                <p>{outcome.livingEvidence.note}</p>
                <p>
                  Status: <strong>{human(outcome.livingEvidence.status)}</strong>
                  {outcome.livingEvidence.asOf ? ` · as of ${outcome.livingEvidence.asOf}` : ""}
                </p>
                {outcome.livingEvidence.status === "bound_metadata_refresh" ? (
                  <>
                    <h4>Retrieved bibliographic records (Europe PMC)</h4>
                    <ul>
                      {outcome.livingEvidence.bibliographic.map((r) => (
                        <li key={r.pmid ?? r.url}>
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            {r.title} ↗
                          </a>
                          {" · "}PMID {r.pmid ?? "n/a"}
                          {r.journal ? ` · ${r.journal}` : ""}
                          {r.publicationYear ? ` · ${r.publicationYear}` : ""}
                          {r.isRetracted ? " · retracted flag observed" : ""}
                        </li>
                      ))}
                    </ul>
                    <h4>Open Targets association candidates (not graph-promoted)</h4>
                    <ul>
                      {outcome.livingEvidence.openTargetsAssociations.slice(0, 10).map((a) => (
                        <li key={`${a.diseaseId}:${a.targetEnsemblId}`}>
                          {a.diseaseName} → {a.targetSymbol} ({a.targetEnsemblId}) · score{" "}
                          {a.score.toFixed(3)} · graphPromotable=false
                        </li>
                      ))}
                    </ul>
                    <h4>Registry identity only (not O-04 trials attach)</h4>
                    <ul>
                      {outcome.livingEvidence.registryIdentityOnly.map((r) => (
                        <li key={r.nctId}>
                          {r.nctId}
                          {r.briefTitle ? ` · ${r.briefTitle}` : ""}
                          {r.overallStatus ? ` · ${r.overallStatus}` : ""} ·{" "}
                          {human(r.translationalAttachStatus)}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <details>
                  <summary>Unavailable capabilities disclosed</summary>
                  <ul>
                    {outcome.livingEvidence.unavailableCapabilities.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </details>
                <h4>What has been recorded</h4>
                <ol className="outcome-stages">
                  {outcome.stages.map((s) => (
                    <li key={s.id}>
                      <strong>
                        {human(s.id)} · {human(s.status)}
                      </strong>
                      <p>{s.detail}</p>
                    </li>
                  ))}
                </ol>
                <details>
                  <summary>Answer limitations</summary>
                  <ul>
                    {outcome.answer.limitations.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              </>
            )}

            {section === "02" && (
              <>
                <h4>Explore the source mechanism map</h4>
                <p>
                  Relationships from the primary release retain their biological context. They do not establish a
                  causal chain or automatically support a candidate hypothesis.
                </p>
                <label htmlFor="outcome-edge">Select a relationship</label>
                <select
                  id="outcome-edge"
                  value={edgeId}
                  onChange={(e) => setEdgeId(e.target.value)}
                >
                  {outcome.mechanismMap.edges.map((e) => (
                    <option key={e.id} value={e.id}>
                      {(outcome.mechanismMap.nodes.find((n) => n.id === e.subjectId)?.label ?? e.subjectId) +
                        " → " +
                        e.predicate +
                        " → " +
                        (outcome.mechanismMap.nodes.find((n) => n.id === e.objectId)?.label ?? e.objectId)}
                    </option>
                  ))}
                </select>
                {edge && (
                  <>
                    <div className="outcome-mechanism" role="img" aria-label="Selected source relationship">
                      <strong>
                        {outcome.mechanismMap.nodes.find((n) => n.id === edge.subjectId)?.label ??
                          edge.subjectId}
                      </strong>
                      <span>→ {human(edge.predicate)} →</span>
                      <strong>
                        {outcome.mechanismMap.nodes.find((n) => n.id === edge.objectId)?.label ??
                          edge.objectId}
                      </strong>
                    </div>
                    <p>Evidence type: {human(edge.epistemicType)}</p>
                    {outcome.evidence
                      .filter((c) => c.relationshipId === edge.id)
                      .map((c) => (
                        <article className="outcome-evidence" key={c.claimId}>
                          <h4>{c.statement}</h4>
                          <p>
                            Source review: {human(c.sourceHumanReview.status)} · {c.sourceHumanReview.reviewedAt}
                          </p>
                          <p>
                            Supports: {c.supportingBranchIds.join(", ") || "no branch assigned"}. Opposes:{" "}
                            {c.opposingBranchIds.join(", ") || "no branch assigned"}. Semantic support requires
                            expert assessment.
                          </p>
                          <dl className="outcome-context">
                            {Object.entries(c.context).map(([k, v]) => (
                              <div key={k}>
                                <dt>{human(k)}</dt>
                                <dd>{v ?? "Not recorded"}</dd>
                              </div>
                            ))}
                          </dl>
                          <ReverseTrace
                            outcome={outcome}
                            claimIds={[c.claimId]}
                            heading="Reverse trace · claim → passage → source"
                          />
                        </article>
                      ))}
                  </>
                )}
                <h4>Conflicting evidence</h4>
                <p>{outcome.contradictions.note}</p>
                {outcome.contextConflictAudit && <section aria-label="Saved context-conflict audit">
                  <h4>Versioned Context-Conflict Audit</h4>
                  <p>Version {outcome.contextConflictAudit.version} · audit {outcome.contextConflictAudit.auditHash}</p>
                  <p>Parent: {outcome.contextConflictAudit.parentAuditHash ?? 'First version'}. Verifier: {human(outcome.contextConflictAudit.verifier.status)}.</p>
                  {outcome.contextConflictAudit.searches.map(s => <p key={s.intent}>{s.intent}: {human(s.status)}. Search completeness and consensus are not established.</p>)}
                  <ul>{outcome.contextConflictAudit.report.map(r => <li key={r.comparisonId}>{human(r.classification)} · {r.reasons.join(' ')}</li>)}</ul>
                  <details><summary>Missing context and evidence gaps</summary><ul>{outcome.contextConflictAudit.gaps.map((g,i) => <li key={i}>{g}</li>)}</ul></details>
                  {outcome.contextConflictAuditReview ? <div><h4>Independent audit assessment</h4><p>{human(outcome.contextConflictAuditReview.decision)} · {outcome.contextConflictAuditReview.reviewedAt}</p><p>{outcome.contextConflictAuditReview.rationale}</p><ul>{outcome.contextConflictAuditReview.limitations.map((s,i) => <li key={i}>{s}</li>)}</ul><p>Decision {outcome.contextConflictAuditReview.decisionHash}. Scope: this audit hash only.</p></div> : <p>Independent audit assessment is still required. An evidence-brief decision does not approve this audit.</p>}
                  <p>No scientific approval or graph publication is transferred. Rerunning creates a new audit version requiring its own assessment.</p>
                  <ContextAuditReviewPanel investigationId={outcome.investigationId} packageHash={outcome.binding.packageHash} audit={outcome.contextConflictAudit} onReviewed={()=>setAttempt(n=>n+1)}/>
                </section>}
                <ul>
                  {outcome.contradictions.recordedOpposingClaimIds.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
                <ReverseTrace
                  outcome={outcome}
                  claimIds={outcome.contradictions.recordedOpposingClaimIds}
                  heading="Reverse trace · opposing claims"
                />
                {outcome.comparison.available ? (
                  <p>
                    Separate comparison context available · release {outcome.comparison.releaseId} · role{" "}
                    {human(outcome.comparison.role)}.
                  </p>
                ) : (
                  <p>No secondary disease comparison context is attached to this package.</p>
                )}
              </>
            )}

            {section === "03" && (
              <>
                <h4>Gap verification</h4>
                <p>
                  Status: <strong>{human(outcome.gapVerification.status)}</strong>.{" "}
                  {outcome.gapVerification.note}
                </p>
                <p role="note">
                  SME gold filled: {String(outcome.gapVerification.honesty.smeGoldFilled)} · scientifically
                  validated: {String(outcome.gapVerification.honesty.scientificallyValidated)} · passage
                  import authorised: {String(outcome.gapVerification.honesty.passageImportAuthorized)}.
                  Expert labels remain unavailable (human queue #4 PARKED).
                </p>
                <p>
                  Classes · missing local {outcome.gapVerification.summary.missingLocalData} · incomplete
                  literature {outcome.gapVerification.summary.incompleteLiteratureCoverage} · contradictory{" "}
                  {outcome.gapVerification.summary.contradictoryFindings} · unresolved mechanism{" "}
                  {outcome.gapVerification.summary.unresolvedBiologicalMechanism} · unverified computational{" "}
                  {outcome.gapVerification.summary.unverifiedComputationalHypothesis} · insufficient{" "}
                  {outcome.gapVerification.summary.insufficientEvidence} · genuine unresolved{" "}
                  {outcome.gapVerification.summary.genuineUnresolved} · passage rights blocked{" "}
                  {outcome.gapVerification.summary.passageRightsBlocked} · oppose search incomplete{" "}
                  {outcome.gapVerification.summary.opposeSearchIncomplete} · abstain{" "}
                  {outcome.gapVerification.summary.abstain}.
                </p>
                <p role="note">
                  Search completeness ≠ scientific novelty. Incomplete literature coverage leaves
                  scientific-gap status not verified.
                </p>
                {outcome.gapVerification.items.length ? (
                  <ul>
                    {outcome.gapVerification.items.map((g) => (
                      <li key={g.id}>
                        <strong>[{human(g.kind)}]</strong> {g.recordedText}
                        <p>{g.rationale}</p>
                        <p role="note">
                          Scientific-gap: {human(g.scientificGapStatus)} · search completeness:{" "}
                          {human(g.searchCompleteness.status)} · novelty: {human(g.scientificNovelty.status)} ·
                          semantic support: {human(g.semanticSupport.kind)}
                          {g.expertReview.status === "expert_reviewed" && g.expertReview.searchScope
                            ? ` · expert search scope: ${g.expertReview.searchScope.providers.join(", ")} @ ${g.expertReview.searchScope.dateOfSearch}`
                            : ""}
                        </p>
                        <ReverseTrace
                          outcome={outcome}
                          claimIds={[...g.trace.supportingClaimIds, ...g.trace.opposingClaimIds]}
                          heading={`Reverse trace · ${g.id}`}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No recorded missing-evidence or uncertainty strings to classify.</p>
                )}
                <h4>Unavailable for this verification</h4>
                <ul>
                  {outcome.gapVerification.unavailableCapabilities.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <h4>Recorded gap strings (raw)</h4>
                <ul>
                  {outcome.missingData.length ? (
                    outcome.missingData.map((s, i) => <li key={i}>{s}</li>)
                  ) : (
                    <li>No missing-evidence strings were recorded on candidate branches.</li>
                  )}
                </ul>
                <h4>Hypothesis uncertainty</h4>
                {outcome.hypotheses.map((b) => (
                  <details key={b.id}>
                    <summary>
                      {b.statement} · {human(b.assessment)}
                    </summary>
                    <ul>
                      {b.uncertainty.length ? (
                        b.uncertainty.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li>No uncertainty strings recorded for this branch.</li>
                      )}
                    </ul>
                    <ReverseTrace
                      outcome={outcome}
                      claimIds={[...b.supportingClaimIds, ...b.opposingClaimIds]}
                      heading="Reverse trace · claims behind this gap note"
                    />
                  </details>
                ))}
              </>
            )}

            {section === "04" && (
              <>
                <h4>Translational intelligence (O-04)</h4>
                <p>{outcome.trials.note}</p>
                <p>
                  Status: <strong>{human(outcome.trials.status)}</strong> · relevance{" "}
                  {human(outcome.trials.relevanceScope)}. No participant eligibility has been assessed.
                  Registration is not efficacy; missing results are not therapy failure.
                </p>
                {outcome.trials.status === "not_queried" ? (
                  <p role="note">
                    No versioned registry snapshot is bound. An empty list is not evidence of worldwide trial
                    absence. Living-evidence NCT identity resolution remains separate from O-04 attach.
                  </p>
                ) : (
                  <>
                    <h4>Trial registration and status</h4>
                    <ul>
                      {(outcome.trials.planes?.trialRegistrationAndStatus ?? []).map((r) => (
                        <li key={r.nctId}>
                          <a href={r.registryUrl} target="_blank" rel="noopener noreferrer">
                            {r.nctId} ↗
                          </a>
                          {r.briefTitle ? ` · ${r.briefTitle}` : ""}
                          {r.overallStatus ? ` · ${r.overallStatus}` : ""}
                          {r.phases?.length ? ` · ${r.phases.join(", ")}` : ""} · registration≠efficacy
                        </li>
                      ))}
                    </ul>
                    <h4>Intervention and target mapping</h4>
                    <ul>
                      {(outcome.trials.planes?.interventionAndTargetMapping ?? []).map((m) => (
                        <li key={m.nctId}>
                          {m.nctId} · interventions:{" "}
                          {m.interventions.map((i) => i.name).join(", ") || "none"} · mapped targets:{" "}
                          {m.mappedTargets.map((t) => t.targetSymbol).join(", ") || "none"} ·
                          association≠efficacy
                        </li>
                      ))}
                    </ul>
                    <h4>Registry-reported results</h4>
                    <ul>
                      {(outcome.trials.planes?.registryReportedResults ?? []).map((r) => (
                        <li key={r.nctId}>
                          {r.nctId} · hasResultsSection={String(r.hasResultsSection)} · primary:{" "}
                          {r.primaryOutcomeMeasures.map((p) => p.title).join("; ") || "none extracted"} ·
                          registry results≠efficacy proof
                        </li>
                      ))}
                    </ul>
                    <h4>Published outcomes (locators)</h4>
                    <ul>
                      {(outcome.trials.planes?.publishedOutcomes ?? []).length ? (
                        outcome.trials.planes.publishedOutcomes.map((p, i) => (
                          <li key={`${p.nctId}:${p.pmid ?? i}`}>
                            {p.nctId}
                            {p.pmid ? ` · PMID ${p.pmid}` : ""} · {p.referenceType ?? "ref"} · claim
                            support not assessed
                          </li>
                        ))
                      ) : (
                        <li>No published outcome locators attached.</li>
                      )}
                    </ul>
                    <h4>Missing or unresolved outcome evidence</h4>
                    <ul>
                      {(outcome.trials.planes?.missingOrUnresolvedOutcomeEvidence ?? []).map((m, i) => (
                        <li key={`${m.nctId}:${m.kind}:${i}`}>
                          {m.nctId} · {human(m.kind)}: {m.detail}
                        </li>
                      ))}
                    </ul>
                    {outcome.researchBrief ? (
                      <details>
                        <summary>Integrated research brief (source-linked; unapproved)</summary>
                        <p>
                          Scientific validity claimed: {String(outcome.researchBrief.scientificValidityClaimed)} ·
                          eligibility inferred: {String(outcome.researchBrief.eligibilityInferred)}
                        </p>
                        <ul>
                          {outcome.researchBrief.limitations.slice(0, 8).map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </>
                )}
              </>
            )}

            {section === "05" && (
              <>
                <h4>Investigation question tree</h4>
                <p>Recorded research questions, separate from clinical decision support.</p>
                <ul>
                  {outcome.decisionTree.questions.map((q) => (
                    <li key={q.id}>
                      <strong>{q.text}</strong>
                      <p>
                        {q.parentId
                          ? "Follow-up to " +
                            outcome.decisionTree.questions.find((p) => p.id === q.parentId)?.text
                          : "Root question"}{" "}
                        · {q.purpose} · {q.status}
                      </p>
                    </li>
                  ))}
                </ul>
                <h4>Next research work</h4>
                <p>These are research-planning tasks from the saved record, not patient measurement orders.</p>
                {outcome.nextResearchSteps.map((s) => (
                  <article key={s.branchId}>
                    <p>{s.falsificationQuestion}</p>
                    <p>{s.action}</p>
                    <ReverseTrace
                      outcome={outcome}
                      claimIds={
                        outcome.hypotheses.find((h) => h.id === s.branchId)?.supportingClaimIds ?? []
                      }
                      heading="Reverse trace · recommendation → supporting claims"
                    />
                  </article>
                ))}
                <h4>Testable candidate directions</h4>
                {outcome.hypotheses.map((b) => (
                  <details key={b.id}>
                    <summary>{b.statement}</summary>
                    <p>
                      {human(b.classification)} · {human(b.assessment)}
                    </p>
                    <p>Falsification question: {b.falsificationCriteria}</p>
                    <p>Predicted observation, experiment and required controls: not specified in the saved record.</p>
                  </details>
                ))}
              </>
            )}

            {section === "06" && (
              <>
                <h4>Independent human review</h4>
                <p>
                  {human(outcome.review.status)} · Evidence brief only
                </p>
                <p>{outcome.review.rationale ?? "No independent brief decision is recorded."}</p>
                <ul>
                  {outcome.review.limitations.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <p>Review does not transfer approval to a hypothesis, graph publication or clinical use.</p>
                <h4>Reproducible source binding</h4>
                <p>
                  Release: {outcome.binding.releaseId} v{outcome.binding.releaseVersion}
                </p>
                <p>
                  Package SHA-256: <code>{outcome.binding.packageHash}</code>
                </p>
                <p>
                  Outcome SHA-256: <code>{outcome.outcomeHash}</code>
                </p>
                <p>Method: {outcome.method}</p>
                <ul>
                  {outcome.provenance.methods.map((m, i) => (
                    <li key={i}>
                      {m.agentId} v{m.version} · {m.modelVersion} · prompt {m.promptVersion} · {m.toolCallCount}{" "}
                      recorded tool calls
                    </li>
                  ))}
                </ul>
                <p>
                  This projection invokes no model and performs no new external search. A matching hash verifies
                  the saved content, not scientific truth. Live Ask→export writes remain parked on human queue
                  #5.
                </p>
                <ReverseTrace
                  outcome={outcome}
                  claimIds={outcome.evidence.map((c) => c.claimId)}
                  heading="Full reverse index · every claim → passage → source"
                />
              </>
            )}
          </div>
          <div className="outcome-downloads">
            <button type="button" disabled={busy} onClick={() => void print()}>
              Print / Save PDF
            </button>
            <button type="button" disabled={busy} onClick={() => void download("markdown")}>
              Download research outcome
            </button>
            <button type="button" disabled={busy} onClick={() => void download("json")}>
              Download outcome JSON
            </button>
          </div>
          <p className="outcome-disclaimer">{outcome.disclaimer}</p>
        </>
      )}
    </section>
  );
}
