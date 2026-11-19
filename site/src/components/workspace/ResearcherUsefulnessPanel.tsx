import { useEffect, useState } from "react";
import {
  RESEARCHER_USEFULNESS_HONESTY,
  buildResearcherUsefulnessPanel,
  loadResearcherUsefulnessStore,
  saveResearcherUsefulness,
  type ResearcherUsefulnessStore,
  type UsefulnessRating,
  type WillingnessSignal,
} from "@hsi/investigation/researcherUsefulnessFeedback";

const RATING_LABEL: Record<UsefulnessRating, string> = {
  useful: "Useful",
  partially_useful: "Partially useful",
  not_useful: "Not useful",
};

const WILLINGNESS_LABEL: Record<WillingnessSignal, string> = {
  yes: "Yes",
  no: "No",
  maybe: "Maybe",
};

/** Device-local Stage 2 exit metric — researcher-rated usefulness after the brief. */
export function ResearcherUsefulnessPanel({
  briefHash,
  question,
  onRated,
}: {
  briefHash: string | null;
  question: string;
  onRated?: () => void;
}) {
  const [store, setStore] = useState<ResearcherUsefulnessStore>(() =>
    loadResearcherUsefulnessStore(typeof localStorage !== "undefined" ? localStorage : null),
  );
  const [rating, setRating] = useState<UsefulnessRating | null>(null);
  const [willingness, setWillingness] = useState<WillingnessSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const panel = buildResearcherUsefulnessPanel({ briefHash, store });

  useEffect(() => {
    const next = loadResearcherUsefulnessStore(
      typeof localStorage !== "undefined" ? localStorage : null,
    );
    setStore(next);
    const existing = briefHash
      ? next.entries.find((e) => e.briefHash === briefHash.trim())
      : null;
    setRating(existing?.rating ?? null);
    setWillingness(existing?.willingness ?? null);
    setError(null);
    setJustSaved(false);
  }, [briefHash]);

  const onSave = () => {
    if (!briefHash || !rating) {
      setError("Choose a usefulness rating first");
      return;
    }
    const result = saveResearcherUsefulness(
      typeof localStorage !== "undefined" ? localStorage : null,
      {
        briefHash,
        question,
        rating,
        willingness,
      },
    );
    setStore(result.store);
    if (!result.ok) {
      setError(result.error);
      setJustSaved(false);
      return;
    }
    setError(null);
    setJustSaved(true);
    onRated?.();
  };

  return (
    <section className="ws-card ws-usefulness" aria-labelledby="ws-useful-h">
      <header>
        <h2 id="ws-useful-h">Researcher usefulness (this device)</h2>
      </header>
      <p className="ws-muted">
        Stage 2 exit metric · browser local only · production writes:{" "}
        {String(RESEARCHER_USEFULNESS_HONESTY.productionWritesEnabled)} · journey complete claimed:{" "}
        {String(RESEARCHER_USEFULNESS_HONESTY.journeyCompleteClaimed)} · invents aggregate
        conversion: {String(RESEARCHER_USEFULNESS_HONESTY.inventsAggregateConversion)} · pilot
        conversion claimed: {String(RESEARCHER_USEFULNESS_HONESTY.pilotConversionClaimed)} ·
        scientific approval: {String(RESEARCHER_USEFULNESS_HONESTY.scientificApproval)}
      </p>
      <p className="ws-muted">{panel.note}</p>

      {!panel.ready ? (
        <p className="ws-muted">Run a live investigation to unlock local usefulness rating.</p>
      ) : (
        <div className="ws-useful-grid">
          <div className="ws-useful-block" role="group" aria-label="Usefulness rating">
            <h3>Was this investigation useful?</h3>
            <div className="ws-row-actions">
              {(Object.keys(RATING_LABEL) as UsefulnessRating[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className="ws-btn"
                  aria-pressed={rating === id}
                  onClick={() => {
                    setRating(id);
                    setJustSaved(false);
                  }}
                >
                  {RATING_LABEL[id]}
                </button>
              ))}
            </div>
          </div>

          <div className="ws-useful-block" role="group" aria-label="Willingness signal">
            <h3>Willingness to pay (optional signal)</h3>
            <p className="ws-muted">
              Local preference only — not checkout, not a conversion metric, not a pilot claim.
            </p>
            <div className="ws-row-actions">
              {(Object.keys(WILLINGNESS_LABEL) as WillingnessSignal[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className="ws-btn"
                  aria-pressed={willingness === id}
                  onClick={() => {
                    setWillingness((w) => (w === id ? null : id));
                    setJustSaved(false);
                  }}
                >
                  {WILLINGNESS_LABEL[id]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {panel.ready ? (
        <div className="ws-row-actions">
          <button type="button" className="ws-run" onClick={onSave} disabled={!rating}>
            Save rating in this browser
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="ws-err" role="alert">
          {error}
        </p>
      ) : null}
      {justSaved || panel.existing ? (
        <p className="ws-warn" role="status">
          {justSaved ? "Saved locally for briefHash " : "Previously saved for briefHash "}
          <code>{panel.briefHash}</code>
          {rating ? ` · ${RATING_LABEL[rating]}` : ""}
          {willingness ? ` · willingness ${WILLINGNESS_LABEL[willingness]}` : ""} · not a server
          store.
        </p>
      ) : null}
    </section>
  );
}
