import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
const Experience = lazy(() =>
  import('../InvestigationGraphExperience').then((m) => ({
    default: m.InvestigationGraphExperience,
  })),
);

/** Public entry loads the verified snapshot only on request, not during prerender. */
export function InvestigationGraphEntry() {
  const [open, setOpen] = useState(false);
  return (
    <div className="hsi-graph-entry">
      {!open ? (
        <>
          <h3>Follow an actual candidate connection.</h3>
          <p>
            Open the versioned research snapshot. Inspect a path, its study models, source records
            and unresolved gaps. These are unreviewed candidates, not established mechanisms.
          </p>
          <button className="hsi-action" onClick={() => setOpen(true)}>
            Open the investigation graph
          </button>
          <p>
            <Link to="/science/graph">Continue directly to Science</Link>
          </p>
        </>
      ) : (
        <Suspense fallback={<p role="status">Loading the investigation view…</p>}>
          <Experience embedded />
        </Suspense>
      )}
    </div>
  );
}
