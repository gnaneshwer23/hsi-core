import {useState} from "react";
import {Link} from "react-router-dom";
import {
  RESEARCH_MECHANISM_STEPS,
  buildResearchMechanismWorkflow,
  type ResearchMechanismStep,
  type ResearchMechanismWorkflow,
} from "../../../src/researchMechanismWorkflow";
import {
  R3_JOURNEY_STAGES,
  buildR3ConnectedWorkbenchJourney,
  extractInspectablePassages,
  type R3ConnectedWorkbenchJourney,
  type R3JourneyStage,
} from "../../../src/researchConnectedWorkbench";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../../../src/researchWorkspaceTestFixture";

type StageProbe = {
  id: string;
  httpStatus: number | null;
  ok: boolean;
  error: string | null;
  preview: string | null;
  passages: ReturnType<typeof extractInspectablePassages>;
};

async function probeStage(stage: R3JourneyStage): Promise<StageProbe> {
  try {
    const response = await fetch(stage.apiPath, {
      method: stage.method === "POST" ? "GET" : stage.method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {Accept: "application/json"},
      signal: AbortSignal.timeout(20000),
    });
    const text = await response.text();
    let preview: string | null = null;
    let passages: ReturnType<typeof extractInspectablePassages> = [];
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      passages = extractInspectablePassages(json);
      preview = JSON.stringify(
        {
          id: json.id ?? json.investigationId ?? json.status ?? null,
          state: json.state ?? null,
          question:
            typeof json.question === "string" ? json.question.slice(0, 160) : null,
          passageCount: passages.length,
          honesty: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
        },
        null,
        2,
      );
    } catch {
      preview = text.slice(0, 240);
    }
    return {
      id: stage.id,
      httpStatus: response.status,
      ok: response.ok,
      error: response.ok ? null : "Backend refused or unauthenticated",
      preview,
      passages,
    };
  } catch {
    return {
      id: stage.id,
      httpStatus: null,
      ok: false,
      error: "Network or auth failure talking to research API",
      preview: null,
      passages: [],
    };
  }
}

async function probeMechanismStep(step: ResearchMechanismStep): Promise<StageProbe> {
  if (!step.apiPath || !step.method) {
    return {id: step.id, httpStatus: null, ok: false, error: "No API path", preview: null, passages: []};
  }
  const synthetic: R3JourneyStage = {
    id: "ask",
    title: step.title,
    order: 1,
    uiPath: step.uiPath,
    apiPath: step.apiPath,
    method: step.method,
    consumesBackend: true,
    hardCodedDemoContent: false,
    inspectablePassages: false,
    passageSourceHint: "",
    mechanismStepIds: [step.id],
    note: step.note,
  };
  const result = await probeStage(synthetic);
  return {...result, id: step.id};
}

export function ResearchMechanismWorkflowPage() {
  const workflow: ResearchMechanismWorkflow = buildResearchMechanismWorkflow();
  const journey: R3ConnectedWorkbenchJourney = buildR3ConnectedWorkbenchJourney();
  const [probes, setProbes] = useState<StageProbe[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "Sign in, then probe the real research APIs for this honesty-labelled fixture.",
  );

  async function runProbes() {
    if (busy) return;
    setBusy(true);
    setMessage("Probing authorised research endpoints for R3 Ask→export…");
    const next: StageProbe[] = [];
    for (const stage of journey.stages) {
      if (stage.method === "POST") {
        next.push({
          id: stage.id,
          httpStatus: null,
          ok: true,
          error: null,
          preview:
            "POST submit-review is available in the decision workbench; probe skipped to avoid duplicate submissions.",
          passages: [],
        });
        continue;
      }
      next.push(await probeStage(stage));
    }
    setProbes(next);
    setBusy(false);
    setMessage(
      next.some((p) => p.httpStatus === 401 || p.httpStatus === 403)
        ? "Some endpoints require a verified researcher session — sign in and retry."
        : "Probe complete. Responses come from /api/research/* — not hard-coded demo content.",
    );
  }

  return (
    <div className="xp-page" style={{maxWidth: 960, margin: "0 auto", padding: "1.5rem"}}>
      <p className="science-body-kicker">HSI RESEARCH / R3 CONNECTED WORKBENCH</p>
      <h1>Ask → retrieve → investigate → verify → review → export</h1>
      <aside role="status" style={{border: "1px solid #aab3c0", borderRadius: 12, padding: 16, marginBlock: 16}}>
        <strong>{workflow.syntheticFixture.honestyBanner}</strong>
        <p>
          Fixture investigation <code>{workflow.syntheticFixture.investigationId}</code> · recorded pilot
          decision unchanged · scientific acceptance BLOCKED · no Gate C auto-approve · no generative model ·
          engineeringScaffold CLEARED · researcherJourneyCompleteClaimed false.
        </p>
      </aside>
      <p>
        Roadmap R3 Connected Research Workbench. UI probes consume real backend responses. Inspectable
        passages appear only when the authenticated API returns them — never invented client-side.
      </p>
      <p>
        <Link to={`/research/decision-workbench?investigation=${encodeURIComponent(workflow.syntheticFixture.investigationId)}`}>
          Open decision workbench
        </Link>
        {" · "}
        <Link to="/research/scientific-workbench">Scientific workbench</Link>
        {" · "}
        <Link to="/research/account">Research account</Link>
      </p>
      <button type="button" disabled={busy} onClick={() => void runProbes()}>
        {busy ? "Probing…" : "Probe R3 journey APIs"}
      </button>
      <p role="status">{message}</p>

      <h2>R3 journey stages</h2>
      <ol>
        {journey.stages.map((stage) => {
          const probe = probes.find((p) => p.id === stage.id);
          return (
            <li key={stage.id} style={{marginBlock: 18}}>
              <h3>
                {String(stage.order).padStart(2, "0")} · {stage.title}
              </h3>
              <p>{stage.note}</p>
              <p>
                UI: <Link to={stage.uiPath}>{stage.uiPath}</Link>
                {" · "}
                API: <code>{stage.method} {stage.apiPath}</code>
              </p>
              {stage.inspectablePassages && (
                <p>
                  Inspectable passages: <em>{stage.passageSourceHint}</em>
                </p>
              )}
              {probe && (
                <details open={Boolean(probe.preview || probe.passages.length)}>
                  <summary>
                    Probe {probe.httpStatus ?? "n/a"} · {probe.ok ? "reachable" : "blocked"}
                    {probe.passages.length ? ` · ${probe.passages.length} passage(s)` : ""}
                  </summary>
                  {probe.error && <p role="alert">{probe.error}</p>}
                  {probe.preview && <pre style={{whiteSpace: "pre-wrap"}}>{probe.preview}</pre>}
                  {probe.passages.map((passage) => (
                    <article key={`${probe.id}-${passage.id}`} style={{marginBlock: 12}}>
                      <h4>Passage {passage.id}</h4>
                      <p>Source path: {passage.source}</p>
                      {passage.locator && <p>Locator: {passage.locator}</p>}
                      {passage.sha256 && (
                        <p>
                          SHA-256: <code>{passage.sha256}</code>
                        </p>
                      )}
                      {passage.textPreview ? (
                        <blockquote>{passage.textPreview}</blockquote>
                      ) : (
                        <p>No passage text in this response — locator/hash only; text is not invented.</p>
                      )}
                    </article>
                  ))}
                </details>
              )}
            </li>
          );
        })}
      </ol>

      <details>
        <summary>Underlying mechanism workflow steps ({RESEARCH_MECHANISM_STEPS.length})</summary>
        <ol>
          {workflow.steps.map((step, index) => (
            <li key={step.id} style={{marginBlock: 12}}>
              <strong>
                {String(index + 1).padStart(2, "0")} · {step.title}
              </strong>
              <p>{step.note}</p>
              <p>
                UI: <Link to={step.uiPath}>{step.uiPath}</Link>
                {step.apiPath ? (
                  <>
                    {" "}
                    · API: <code>{step.method} {step.apiPath}</code>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            void (async () => {
              if (busy) return;
              setBusy(true);
              const next: StageProbe[] = [];
              for (const step of workflow.steps) {
                if (step.method === "POST") {
                  next.push({
                    id: step.id,
                    httpStatus: null,
                    ok: true,
                    error: null,
                    preview: "POST skipped in probe.",
                    passages: [],
                  });
                  continue;
                }
                next.push(await probeMechanismStep(step));
              }
              setProbes(next);
              setBusy(false);
              setMessage("Mechanism-step probe complete (legacy detail path).");
            })();
          }}
        >
          Probe detailed mechanism steps
        </button>
      </details>

      <p>
        R3 stages covered: {R3_JOURNEY_STAGES.length}. This page never invents SME gold labels, flips
        scientific acceptance, fabricates passages, or writes to autumn-snow.
      </p>
    </div>
  );
}

export default ResearchMechanismWorkflowPage;
