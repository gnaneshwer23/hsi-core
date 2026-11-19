import {
  STAGE2_COMPLETION_HONESTY,
  type Stage2CompletionChecklist,
} from "@hsi/investigation/stage2CompletionChecklist";

/** Local Stage 2 exit progress — never claims journey complete. */
export function Stage2CompletionChecklistPanel({
  checklist,
  onSelectItem,
}: {
  checklist: Stage2CompletionChecklist;
  onSelectItem: (id: Stage2CompletionChecklist["items"][number]["id"]) => void;
}) {
  return (
    <section className="ws-card ws-stage2" aria-labelledby="ws-s2-h">
      <header>
        <h2 id="ws-s2-h">Stage 2 investigation progress</h2>
      </header>
      <p className="ws-muted">
        Audit exit metric · local progress only:{" "}
        {String(STAGE2_COMPLETION_HONESTY.localProgressOnly)} · journey complete claimed:{" "}
        {String(STAGE2_COMPLETION_HONESTY.journeyCompleteClaimed)} · scientific approval:{" "}
        {String(STAGE2_COMPLETION_HONESTY.scientificApproval)} · production writes:{" "}
        {String(STAGE2_COMPLETION_HONESTY.productionWritesEnabled)} · invents aggregate
        conversion: {String(STAGE2_COMPLETION_HONESTY.inventsAggregateConversion)} · pilot
        accepted: {String(STAGE2_COMPLETION_HONESTY.pilotAccepted)}
      </p>
      <p className="ws-warn" role="status">
        {checklist.note} Progress: {checklist.doneCount}/{checklist.totalCount}
        {checklist.briefHash ? (
          <>
            {" "}
            · briefHash <code>{checklist.briefHash.slice(0, 12)}…</code>
          </>
        ) : null}
      </p>
      <ol className="ws-s2-list" aria-label="Stage 2 checklist">
        {checklist.items.map((item) => (
          <li key={item.id} data-done={item.done ? "true" : "false"}>
            <button
              type="button"
              className="ws-s2-item"
              aria-current={!item.done ? "step" : undefined}
              onClick={() => onSelectItem(item.id)}
            >
              <span className="ws-s2-mark" aria-hidden="true">
                {item.done ? "✓" : "○"}
              </span>
              <span className="ws-s2-copy">
                <b>{item.label}</b>
                <small>{item.detail}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
