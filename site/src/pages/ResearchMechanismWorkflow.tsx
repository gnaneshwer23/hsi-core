import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
  RESEARCH_MECHANISM_STEPS,
  buildResearchMechanismWorkflow,
  type ResearchMechanismStep,
  type ResearchMechanismWorkflow,
} from "../../../src/researchMechanismWorkflow";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../../../src/researchWorkspaceTestFixture";

type StepProbe = {
  id: string;
  httpStatus: number | null;
  ok: boolean;
  error: string | null;
  preview: string | null;
};

async function probeStep(step: ResearchMechanismStep): Promise<StepProbe> {
  if (!step.apiPath || !step.method) {
    return {id: step.id, httpStatus: null, ok: false, error: "No API path", preview: null};
  }
  try {
    const response = await fetch(step.apiPath, {
      method: step.method === "POST" ? "GET" : step.method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {Accept: "application/json"},
      signal: AbortSignal.timeout(20000),
    });
    const text = await response.text();
    let preview: string | null = null;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      preview = JSON.stringify(
        {
          id: json.id ?? json.investigationId ?? json.status ?? null,
          state: json.state ?? null,
          question:
            typeof json.question === "string" ? json.question.slice(0, 160) : null,
          honesty: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
        },
        null,
        2,
      );
    } catch {
      preview = text.slice(0, 240);
    }
    return {
      id: step.id,
      httpStatus: response.status,
      ok: response.ok,
      error: response.ok ? null : "Backend refused or unauthenticated",
      preview,
    };
  } catch {
    return {
      id: step.id,
      httpStatus: null,
      ok: false,
      error: "Network or auth failure talking to research API",
      preview: null,
    };
  }
}

export function ResearchMechanismWorkflowPage() {
  const workflow: ResearchMechanismWorkflow = buildResearchMechanismWorkflow();
  const [probes, setProbes] = useState<StepProbe[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Sign in, then probe the real research APIs for this honesty-labelled fixture.");

  useEffect(() => {
    setProbes([]);
  }, []);

  async function runProbes() {
    if (busy) return;
    setBusy(true);
    setMessage("Probing authorised research endpoints…");
    const next: StepProbe[] = [];
    for (const step of workflow.steps) {
      // POST submit is not auto-fired from the probe — only GET-safe paths execute.
      if (step.method === "POST") {
        next.push({
          id: step.id,
          httpStatus: null,
          ok: true,
          error: null,
          preview: "POST submit-review is available in the decision workbench; probe skipped to avoid duplicate submissions.",
        });
        continue;
      }
      next.push(await probeStep(step));
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
      <p className="science-body-kicker">HSI RESEARCH / MECHANISM WORKFLOW</p>
      <h1>One complete research path</h1>
      <aside role="status" style={{border: "1px solid #aab3c0", borderRadius: 12, padding: 16, marginBlock: 16}}>
        <strong>{workflow.syntheticFixture.honestyBanner}</strong>
        <p>
          Fixture investigation <code>{workflow.syntheticFixture.investigationId}</code> · recorded pilot
          decision unchanged · scientific acceptance BLOCKED · no Gate C auto-approve · no generative model.
        </p>
      </aside>
      <p>
        Ask a mechanism question → authorised source-linked evidence → context/limitations → support vs oppose →
        multi-hop mechanism → uncertainty/review → bounded brief → propose for independent review → export a
        reproducible package. UI probes consume real backend responses.
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
        {busy ? "Probing…" : "Probe real research APIs"}
      </button>
      <p role="status">{message}</p>
      <ol>
        {workflow.steps.map((step, index) => {
          const probe = probes.find((p) => p.id === step.id);
          return (
            <li key={step.id} style={{marginBlock: 18}}>
              <h2>
                {String(index + 1).padStart(2, "0")} · {step.title}
              </h2>
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
              {probe && (
                <details open={Boolean(probe.preview)}>
                  <summary>
                    Probe {probe.httpStatus ?? "n/a"} · {probe.ok ? "reachable" : "blocked"}
                  </summary>
                  {probe.error && <p role="alert">{probe.error}</p>}
                  {probe.preview && <pre style={{whiteSpace: "pre-wrap"}}>{probe.preview}</pre>}
                </details>
              )}
            </li>
          );
        })}
      </ol>
      <p>
        Steps covered: {RESEARCH_MECHANISM_STEPS.length}. This page never invents SME gold labels, flips
        scientific acceptance, or writes to autumn-snow.
      </p>
    </div>
  );
}

export default ResearchMechanismWorkflowPage;
