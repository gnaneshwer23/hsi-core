import { EvidenceContextPassportView } from "../EvidenceContextPassport";
import {
  CURATED_DEMO_CLASS_LABEL,
  CURATED_DISAGREEMENT_PACK_HONESTY,
  type CuratedDisagreementCaseId,
  type CuratedDisagreementCaseView,
  type CuratedDisagreementPack,
} from "@hsi/investigation/curatedDisagreementPack";

/** Sealed-graph demonstration cases for USP A — not gold, not proven contradiction. */
export function CuratedDisagreementPackPanel({
  pack,
  selectedId,
  onSelect,
  graphError,
}: {
  pack: CuratedDisagreementPack | null;
  selectedId: CuratedDisagreementCaseId | null;
  onSelect: (id: CuratedDisagreementCaseId | null) => void;
  graphError: string | null;
}) {
  const selected =
    pack?.cases.find((c) => c.id === selectedId) ?? null;

  return (
    <section className="ws-card ws-curated-disagree" aria-labelledby="ws-curated-disagree-h">
      <header>
        <h2 id="ws-curated-disagree-h">Curated disagreement demonstrations</h2>
      </header>
      <p className="ws-muted">
        USP A demo pack from the sealed domain graph. Public bibliographic locators only.
        Demonstration only — not scientific gold, not SME adjudication, not a confirmed
        contradiction set. Scientific approval:{" "}
        {String(CURATED_DISAGREEMENT_PACK_HONESTY.scientificApproval)}. Confirmed contradiction:{" "}
        {String(CURATED_DISAGREEMENT_PACK_HONESTY.confirmedContradiction)}.
      </p>
      {graphError ? (
        <p className="ws-err" role="status">
          {graphError}
        </p>
      ) : null}
      {!pack && !graphError ? (
        <p className="ws-muted">Loading sealed graph cases…</p>
      ) : null}
      {pack ? (
        <>
          <p className="ws-muted" role="status">
            {pack.cases.length} resolved case
            {pack.cases.length === 1 ? "" : "s"} · graph {pack.graphVersion.slice(0, 12)}…
            {pack.unresolvedCaseIds.length
              ? ` · ${pack.unresolvedCaseIds.length} unresolved (edge missing from snapshot)`
              : ""}
          </p>
          <ul className="ws-curated-list" aria-label="Curated disagreement cases">
            {pack.cases.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="ws-curated-case"
                  aria-pressed={c.id === selectedId}
                  onClick={() => onSelect(c.id === selectedId ? null : c.id)}
                >
                  <span className="ws-tagline">{CURATED_DEMO_CLASS_LABEL[c.demoClass]}</span>
                  <b>{c.title}</b>
                  <small>
                    {c.left.id} · {c.right.id}
                    {c.sameEntityPair ? " · same entity pair" : ""}
                  </small>
                </button>
              </li>
            ))}
          </ul>
          {selected ? <CuratedCaseDetail caseView={selected} /> : null}
        </>
      ) : null}
    </section>
  );
}

function CuratedCaseDetail({ caseView }: { caseView: CuratedDisagreementCaseView }) {
  return (
    <div className="ws-curated-detail">
      <p className="ws-muted">{caseView.whyCurated}</p>
      <p className="ws-warn" role="status">
        Potential contradiction is not proven. Association is not causation. Locators are not proof
        of support. Missing context:{" "}
        {caseView.missingContext.length ? caseView.missingContext.join(", ") : "none listed"}.
      </p>
      <ul className="ws-disagree-diffs" aria-label="Recorded context differences">
        {caseView.differences.map((d) => (
          <li key={d.dimension}>
            <strong>{d.dimension}</strong>: {d.left} vs {d.right}
          </li>
        ))}
      </ul>
      <div className="ws-disagree-passports">
        <div>
          <p className="ws-muted">
            Left · {caseView.leftSource?.title ?? caseView.left.sourceId}
            {caseView.leftSource?.url ? (
              <>
                {" · "}
                <a href={caseView.leftSource.url} rel="noreferrer" target="_blank">
                  Open source
                </a>
              </>
            ) : null}
          </p>
          <EvidenceContextPassportView
            edge={caseView.left}
            heading={`Left · ${caseView.left.id}`}
            headingLevel={3}
          />
        </div>
        <div>
          <p className="ws-muted">
            Right · {caseView.rightSource?.title ?? caseView.right.sourceId}
            {caseView.rightSource?.url ? (
              <>
                {" · "}
                <a href={caseView.rightSource.url} rel="noreferrer" target="_blank">
                  Open source
                </a>
              </>
            ) : null}
          </p>
          <EvidenceContextPassportView
            edge={caseView.right}
            heading={`Right · ${caseView.right.id}`}
            headingLevel={3}
          />
        </div>
      </div>
    </div>
  );
}
