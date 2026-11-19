import { EvidenceContextPassportView } from "../EvidenceContextPassport";
import { liveClaimToPassportEdge } from "@hsi/investigation/liveClaimPassportEdge";
import {
  COMPARISON_OUTCOME_LABEL,
  type LiveComparisonItem,
  type LiveStructuredComparison,
} from "@hsi/investigation/liveBriefComparison";
import {
  comparisonPairKey,
} from "@hsi/investigation/uspADisagreementTrail";
import type { Cand, Run } from "../../lib/workspaceView";

/** Structured why-findings-differ panel with dual Context Passports for a pair. */
export function UspADisagreementPanel({
  run,
  comparison,
  selectedKey,
  onSelectPair,
  onSelectClaim,
  ctxLabel,
}: {
  run: Run;
  comparison: LiveStructuredComparison;
  selectedKey: string | null;
  onSelectPair: (key: string | null) => void;
  onSelectClaim: (id: string) => void;
  ctxLabel: (k: string) => string;
}) {
  const selected =
    comparison.items.find((i) => comparisonPairKey(i) === selectedKey) ?? null;
  const left = selected
    ? (run.candidates.find((c) => c.id === selected.leftId) ?? null)
    : null;
  const right = selected
    ? (run.candidates.find((c) => c.id === selected.rightId) ?? null)
    : null;

  return (
    <section className="ws-card ws-disagree" aria-labelledby="ws-disagree-h">
      <header>
        <h2 id="ws-disagree-h">Why findings may differ</h2>
      </header>
      <p className="ws-muted">
        USP A: compare experimental context across claims that share a subject–object
        relation. Verification is bound before contradiction language. Potential
        contradiction is <strong>not</strong> proven contradiction. Association is not
        causation. Missing context stays explicit.
      </p>
      <p className="ws-muted" role="status">
        Consistent {comparison.summary.consistent} · Context-dependent{" "}
        {comparison.summary.contextDependent} · Method difference{" "}
        {comparison.summary.methodologicalDifference} · Insufficient comparability{" "}
        {comparison.summary.insufficientComparability} · Insufficient evidence{" "}
        {comparison.summary.insufficientEvidence} · Potential contradiction (candidate){" "}
        {comparison.summary.potentialContradiction}
      </p>
      {comparison.pairCount === 0 ? (
        <p className="ws-muted">
          No comparable pairs in this run (need at least two candidates on the same
          relation).
        </p>
      ) : (
        <ul className="ws-disagree-list">
          {comparison.items.map((item) => (
            <ComparisonRow
              key={comparisonPairKey(item)}
              item={item}
              selected={comparisonPairKey(item) === selectedKey}
              onSelect={() =>
                onSelectPair(
                  comparisonPairKey(item) === selectedKey
                    ? null
                    : comparisonPairKey(item),
                )
              }
              onOpenLeft={() => onSelectClaim(item.leftId)}
              onOpenRight={() => onSelectClaim(item.rightId)}
            />
          ))}
        </ul>
      )}
      {selected && left && right ? (
        <DualPassport
          left={left}
          right={right}
          item={selected}
          ctxLabel={ctxLabel}
        />
      ) : null}
    </section>
  );
}

function ComparisonRow({
  item,
  selected,
  onSelect,
  onOpenLeft,
  onOpenRight,
}: {
  item: LiveComparisonItem;
  selected: boolean;
  onSelect: () => void;
  onOpenLeft: () => void;
  onOpenRight: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="ws-disagree-row"
        aria-pressed={selected}
        onClick={onSelect}
      >
        <b>{COMPARISON_OUTCOME_LABEL[item.outcome]}</b>
        <span>
          {item.leftLabel} vs {item.rightLabel}
        </span>
        <span className="ws-muted">{item.rationale}</span>
        {item.verificationBindNote ? (
          <span className="ws-warn">{item.verificationBindNote}</span>
        ) : null}
      </button>
      <div className="ws-row-actions">
        <button type="button" onClick={onOpenLeft}>
          Open left claim
        </button>
        <button type="button" onClick={onOpenRight}>
          Open right claim
        </button>
      </div>
    </li>
  );
}

function DualPassport({
  left,
  right,
  item,
  ctxLabel,
}: {
  left: Cand;
  right: Cand;
  item: LiveComparisonItem;
  ctxLabel: (k: string) => string;
}) {
  const leftEdge = liveClaimToPassportEdge({
    candidate: left,
    contextLabels: left.contexts.map(ctxLabel),
  });
  const rightEdge = liveClaimToPassportEdge({
    candidate: right,
    contextLabels: right.contexts.map(ctxLabel),
  });
  return (
    <div className="ws-dual-passports" aria-label="Side-by-side context passports">
      <p className="ws-warn" role="status">
        Outcome: {COMPARISON_OUTCOME_LABEL[item.outcome]}. Needs human review. Context
        depth: {item.contextDepth.replaceAll("_", " ")}. Engine outcome was{" "}
        {COMPARISON_OUTCOME_LABEL[item.engineOutcome]}
        {item.engineOutcome !== item.outcome ? " before verification binding" : ""}.
      </p>
      <div className="ws-dual-grid">
        <EvidenceContextPassportView
          edge={leftEdge}
          heading="Left claim · Evidence Context Passport"
          headingLevel={3}
        />
        <EvidenceContextPassportView
          edge={rightEdge}
          heading="Right claim · Evidence Context Passport"
          headingLevel={3}
        />
      </div>
    </div>
  );
}
