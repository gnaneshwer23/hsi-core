import { expect, test } from "bun:test";
import fixture from "./fixtures/research-contract.json";
import { appendResearchRunEvent, parseResearchBundle, parseResearchContext, parseResearchRun, researchRunState, RESEARCH_STAGES, type ResearchBundle, type ResearchRun, type ResearchRunEvent } from "../src/researchContracts";
const copy = () => JSON.parse(JSON.stringify(fixture));
const event = (sequence = 1, stage: ResearchRunEvent["stage"] = "context", status: ResearchRunEvent["status"] = "started"): ResearchRunEvent => ({
  id: `SYN-EVENT-${sequence}`, sequence, stage, status, at: `2026-11-03T00:00:${String(sequence).padStart(2, "0")}Z`,
  provider: { id: "fixture-provider", version: "1" }, execution: "deterministic", actorRef: null, modelRef: null,
  inputRefs: ["SYN-CONTEXT-1"], outputRefs: [], reason: null,
});
test("versioned shared context and bundle round-trip without inventing metadata", () => {
  const b = parseResearchBundle(JSON.stringify(fixture));
  expect(b).toEqual(fixture as typeof b); expect(parseResearchContext(b.context)).toBe(b.context);
  expect(researchRunState(b.runs[0]!)).toBe("pending");
});
test("strict boundaries reject unknown fields, identifiers, classes, clinical flags and oversize payloads", () => {
  for (const mutate of [
    (b: any) => { b.schemaVersion = "future"; }, (b: any) => { b.containsPhi = true; },
    (b: any) => { b.clinicalAdvice = true; }, (b: any) => { b.kgWrite = true; },
    (b: any) => { b.patient = { id: "patient" }; }, (b: any) => { b.context.provenance.credentials = "not-allowed"; },
    (b: any) => { b.context.id = "not a valid id"; }, (b: any) => { b.entities[0].dataClass = "public_real"; },
    (b: any) => { b.entities[0].provenance.retrievedAt = "2026-02-30T00:00:00Z"; },
    (b: any) => { b.entities.push(b.entities[0]); },
  ]) { const b = copy(); mutate(b); expect(() => parseResearchBundle(b)).toThrow(); }
  expect(() => parseResearchBundle(" ".repeat(1_000_001))).toThrow();
  const b = copy(); b.passages[0].text = "x".repeat(1_000_001); expect(() => parseResearchBundle(b)).toThrow();
});
test("passage rights, source version, endpoints and exact claim references fail closed", () => {
  for (const mutate of [
    (b: any) => { b.passages[0].sourceId = "SYN-MISSING"; }, (b: any) => { b.passages[0].sourceVersion = "2"; },
    (b: any) => { b.sources[0].licence.passageUsePermitted = false; }, (b: any) => { b.sources[0].licence.status = "unknown"; },
    (b: any) => { b.relationships[0].objectId = "SYN-MISSING"; }, (b: any) => { b.relationships[0].context.tissueId = "SYN-NODE-A"; },
    (b: any) => { b.claims[0].relationshipId = "SYN-MISSING"; }, (b: any) => { b.claims[0].passageIds = ["SYN-MISSING"]; },
    (b: any) => { b.context.conceptIds = ["SYN-MISSING"]; }, (b: any) => { b.passages[0].sha256 = "not-a-hash"; },
  ]) { const b = copy(); mutate(b); expect(() => parseResearchBundle(b)).toThrow(); }
});
test("synthetic records cannot become assessed or approved evidence or pretend to be publications", () => {
  for (const mutate of [
    (b: any) => { b.claims[0].support = "supports"; }, (b: any) => { b.claims[0].curation = "approved"; },
    (b: any) => { b.sources[0].pmid = "123456"; }, (b: any) => { b.sources[0].kind = "publication"; },
    (b: any) => { b.context.dataClass = "public_real"; },
  ]) { const b = copy(); mutate(b); expect(() => parseResearchBundle(b)).toThrow(); }
});

// Reserved example.org and abstract concepts exercise real-data STRUCTURES, not scientific facts or approval.
function realStructure(): ResearchBundle {
  const b = JSON.parse(JSON.stringify(fixture).replaceAll("SYN-", "TEST-").replaceAll('"synthetic"', '"public_real"'));
  b.sources[0].kind = "dataset"; b.sources[0].url = "https://example.org/contract-test";
  return parseResearchBundle(b);
}
test("model proposals never satisfy human approval; only supports can be approved", () => {
  const b = realStructure(); const c = b.claims[0]!;
  c.support = "supports"; c.assessmentKind = "model_draft"; c.curation = "approved";
  expect(() => parseResearchBundle(b)).toThrow();
  c.assessmentKind = "human"; c.review = { decisionId: "TEST-DECISION", reviewerRef: "reviewer:test", role: "reviewer", reviewedAt: "2026-11-03T01:00:00Z", rationale: "Contract fixture only; not a real review." };
  expect(parseResearchBundle(b)).toBe(b);
  c.support = "contradicts"; expect(() => parseResearchBundle(b)).toThrow();
  c.support = "supports"; c.passageIds = []; expect(() => parseResearchBundle(b)).toThrow();
});
test("licensed data cannot be relabelled as a public research context", () => {
  const b = realStructure(); b.entities[0]!.dataClass = "licensed_real";
  expect(() => parseResearchBundle(b)).toThrow();
  b.context.dataClass = "licensed_real"; expect(() => parseResearchBundle(b)).toThrow();
  b.relationships[0]!.dataClass = "licensed_real"; expect(() => parseResearchBundle(b)).toThrow();
  b.claims[0]!.dataClass = "licensed_real"; expect(parseResearchBundle(b)).toBe(b);
  const passages = realStructure(); passages.context.dataClass = "licensed_real";
  passages.sources[0]!.dataClass = passages.passages[0]!.dataClass = "licensed_real";
  expect(() => parseResearchBundle(passages)).toThrow();
  passages.claims[0]!.dataClass = "licensed_real"; expect(parseResearchBundle(passages)).toBe(passages);
});
test("run events require actual starts, stable execution metadata and matching artifacts", () => {
  const b = parseResearchBundle(copy()); const original = b.runs[0]!;
  const started = appendResearchRunEvent(original, event()); expect(original.history).toHaveLength(0);
  const complete = { ...event(2, "context", "completed"), outputRefs: ["SYN-ARTIFACT-CONTEXT"] };
  const artifact = { id: "SYN-ARTIFACT-CONTEXT", kind: "context_snapshot" as const, version: "1", sha256: null, producedByEventId: complete.id };
  const run = appendResearchRunEvent(started, complete, [artifact]); b.runs = [run]; expect(parseResearchBundle(b)).toBe(b);
  expect(researchRunState(run)).toBe("running");
  expect(() => appendResearchRunEvent(original, { ...complete, sequence: 1 })).toThrow();
  expect(() => appendResearchRunEvent(started, complete)).toThrow();
  expect(() => appendResearchRunEvent(started, { ...complete, modelRef: "made-up-model" }, [artifact])).toThrow();
  expect(() => appendResearchRunEvent(started, { ...complete, provider: { id: "different", version: "2" } }, [artifact])).toThrow();
  expect(() => appendResearchRunEvent(started, complete, [{ ...artifact, kind: "dossier" }])).toThrow();
  const bad = structuredClone(run); bad.history[1]!.at = "2026-11-02T00:00:00Z"; expect(() => parseResearchRun(bad)).toThrow();
});
test("skipped stages produce partial execution, failures terminate and failed queries are not successful empty results", () => {
  let run = parseResearchBundle(copy()).runs[0]!;
  for (const [i, stage] of RESEARCH_STAGES.entries()) run = appendResearchRunEvent(run, { ...event(i + 1, stage, "skipped"), execution: "not_executed", reason: "Provider not configured", inputRefs: [] });
  expect(researchRunState(run)).toBe("partial");
  let failed = appendResearchRunEvent(parseResearchBundle(copy()).runs[0]!, event());
  failed = appendResearchRunEvent(failed, { ...event(2, "context", "failed"), reason: "Fixture failure" });
  expect(researchRunState(failed)).toBe("failed");
  expect(() => appendResearchRunEvent(failed, { ...event(3, "retrieval", "skipped"), execution: "not_executed", reason: "Not run" })).toThrow();
});
test("human review cannot be completed by a model and complete execution does not approve claims", () => {
  const b = parseResearchBundle(copy()); let run = b.runs[0]!; let sequence = 0;
  const kinds = ["context_snapshot", "retrieval_result", "graph_context", "contradiction_report", "hypothesis", "review_decision", "dossier"] as const;
  for (const [i, stage] of RESEARCH_STAGES.entries()) {
    const start = { ...event(++sequence, stage), execution: stage === "review" ? "human" as const : "deterministic" as const, actorRef: stage === "review" ? "reviewer:fixture" : null };
    run = appendResearchRunEvent(run, start);
    if (stage === "review") expect(researchRunState(run)).toBe("awaiting_human_review");
    const finish = { ...event(++sequence, stage, "completed"), execution: start.execution, actorRef: start.actorRef, outputRefs: [`SYN-OUTPUT-${i}`] };
    run = appendResearchRunEvent(run, finish, [{ id: finish.outputRefs[0]!, kind: kinds[i]!, version: "1", sha256: null, producedByEventId: finish.id }]);
  }
  b.runs = [run]; expect(parseResearchBundle(b)).toBe(b); expect(researchRunState(run)).toBe("completed");
  expect(b.claims[0]!.curation).toBe("unreviewed");
  const forged = structuredClone(run); forged.history[10]!.execution = "deterministic"; forged.history[11]!.execution = "deterministic";
  expect(() => parseResearchRun(forged)).toThrow();
});
test("bundle run inputs cannot point to missing or future artifacts", () => {
  const b = parseResearchBundle(copy()); b.runs[0] = appendResearchRunEvent(b.runs[0]!, { ...event(), inputRefs: ["SYN-MISSING"] });
  expect(() => parseResearchBundle(b)).toThrow();
});
