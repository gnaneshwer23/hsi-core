import { Link } from "react-router-dom";
import {
  TESTABLE_NEXT_QUESTIONS_HONESTY,
  type TestableNextQuestionsPack,
} from "@hsi/investigation/testableNextQuestions";

/** Journey step 9 — demoted testable next questions from gaps + unvalidated hypotheses. */
export function TestableNextQuestionsPanel({
  pack,
  onInspectClaim,
  onOpenGaps,
}: {
  pack: TestableNextQuestionsPack;
  onInspectClaim: (claimId: string) => void;
  onOpenGaps: () => void;
}) {
  return (
    <section className="ws-card ws-testable" aria-labelledby="ws-tq-h">
      <header>
        <h2 id="ws-tq-h">Testable next questions</h2>
      </header>
      <p className="ws-muted">
        Journey step 9 · demoted only · invents experiments:{" "}
        {String(TESTABLE_NEXT_QUESTIONS_HONESTY.inventsExperiments)} · recommends action:{" "}
        {String(TESTABLE_NEXT_QUESTIONS_HONESTY.recommendsAction)} · scientific approval:{" "}
        {String(TESTABLE_NEXT_QUESTIONS_HONESTY.scientificApproval)} · clinical advice:{" "}
        {String(TESTABLE_NEXT_QUESTIONS_HONESTY.clinicalAdvice)} · journey complete claimed:{" "}
        {String(TESTABLE_NEXT_QUESTIONS_HONESTY.journeyCompleteClaimed)}
      </p>
      <p className="ws-warn" role="status">
        {pack.note} Gap-derived: {pack.gapDerivedCount}. Hypothesis-derived:{" "}
        {pack.hypothesisDerivedCount}.
      </p>

      {pack.items.length === 0 ? (
        <p className="ws-muted">
          Run a live investigation to derive next questions from gaps and any demoted hypotheses.
        </p>
      ) : (
        <ul className="ws-tq-list">
          {pack.items.map((item) => (
            <li key={item.id}>
              <p className="ws-tagline">{item.scopeLabel}</p>
              <b>{item.title}</b>
              <p className="ws-muted">{item.why}</p>
              {item.prediction || item.experiment || item.falsifier ? (
                <dl className="ws-tq-dl">
                  {item.prediction ? (
                    <>
                      <dt>Prediction if true</dt>
                      <dd>{item.prediction}</dd>
                    </>
                  ) : null}
                  {item.experiment ? (
                    <>
                      <dt>Proposed experiment (provisional, unvalidated)</dt>
                      <dd>{item.experiment}</dd>
                    </>
                  ) : null}
                  {item.falsifier ? (
                    <>
                      <dt>Would be falsified by</dt>
                      <dd>{item.falsifier}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
              <p>
                <b>Next step (not a recommendation):</b> {item.nextStep}
              </p>
              {item.citedClaimIds.length > 0 ? (
                <div className="ws-cites" role="group" aria-label={`Claims behind ${item.id}`}>
                  {item.citedClaimIds.map((id) => (
                    <button key={id} type="button" onClick={() => onInspectClaim(id)}>
                      {id}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="ws-row-actions">
        <button type="button" className="ws-btn" onClick={onOpenGaps}>
          Open gaps in this run
        </button>
        <Link className="ws-btn" to="/research/ledger">
          Open Hypothesis Ledger
        </Link>
      </div>
    </section>
  );
}
