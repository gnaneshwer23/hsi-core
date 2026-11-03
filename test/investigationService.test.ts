import { test, expect } from "bun:test";
import { createHash } from "node:crypto";
import fixture from "./fixtures/research-contract.json";
import { researchRunState, type ResearchBundle } from "../src/researchContracts";
import { createInvestigationService, createCorpusRetrievalProvider, createMemoryInvestigationStore, validateInvestigationSnapshot, InvestigationAccessError, InvestigationConflictError, type InvestigationAuthorizer, type InvestigationStore, type InvestigationProviders, type HypothesisResult } from "../src/investigationService";

const input = (): ResearchBundle => ({ ...structuredClone(fixture), runs: [] }) as ResearchBundle;
const authorize: InvestigationAuthorizer = async (token, _action, key) => {
  if (!key.startsWith("team-a-") || !["researcher", "reviewer", "admin"].includes(token as string)) throw new InvestigationAccessError();
  return { id: `user:${token}`, role: token as "researcher" | "reviewer" | "admin" };
};
const setup = (providers: InvestigationProviders = { retrieval: createCorpusRetrievalProvider() }, store: InvestigationStore = createMemoryInvestigationStore(), timeoutMs = 500) => {
  let ticks = 0;
  const service = createInvestigationService({ store, authorize, providers, timeoutMs, now: () => new Date(Date.UTC(2026, 10, 3, 0, 0, ticks++)).toISOString() });
  return { service, store };
};
const state = (s: Awaited<ReturnType<ReturnType<typeof setup>["service"]["start"]>>) => researchRunState(s.bundle.runs[0]!);

test("executes the real stage functions and checkpoints, then awaits human review without changing claims", async () => {
  const { service, store } = setup(); const b = input(), before = JSON.stringify(b);
  const s = await service.start("team-a-one", b, "researcher");
  expect(state(s)).toBe("awaiting_human_review"); expect(s.bundle.runs[0]!.history).toHaveLength(10);
  expect(s.revision).toBe(11); expect(s.payloads.retrieval!.passageIds).toEqual(["SYN-PASSAGE-1"]);
  expect(s.payloads.graph!.relationshipIds).toEqual(["SYN-REL-AB"]);
  expect(s.payloads.hypothesis!.candidates[0]!.relationshipId).toBe("SYN-REL-AB");
  expect(s.payloads.hypothesis!.status).toBe("unvalidated"); expect(s.payloads.dossier).toBeUndefined();
  expect(s.bundle.claims).toEqual(b.claims); expect(JSON.stringify(b)).toBe(before);
  expect(await store.load("team-a-one")).toEqual(s);
  s.bundle.claims[0]!.statement = "caller mutation";
  expect((await service.get("team-a-one", "researcher")).bundle.claims[0]!.statement).toBe(b.claims[0]!.statement);
});

test("human review produces versioned JSON/Markdown and preserves a request for revision", async () => {
  for (const decision of ["accept_for_research", "request_revision"] as const) {
    const { service } = setup(); const s = await service.start("team-a-review", input(), "researcher");
    await expect(service.exportDossier("team-a-review", "researcher")).rejects.toThrow();
    await expect(service.review("team-a-review", s.revision, decision, "Researcher cannot review", "researcher")).rejects.toBeInstanceOf(InvestigationAccessError);
    const reviewed = await service.review("team-a-review", s.revision, decision, "Fixture workflow review only.", "reviewer");
    expect(state(reviewed)).toBe("completed"); expect(reviewed.bundle.runs[0]!.history).toHaveLength(14);
    expect(reviewed.payloads.dossier!.review.decision).toBe(decision);
    expect(reviewed.payloads.review!.reviewerRef).toBe("user:reviewer");
    expect(reviewed.bundle.claims[0]!.curation).toBe("unreviewed"); expect(reviewed.payloads.dossier!.kgWrite).toBe(false);
    const exported = await service.exportDossier("team-a-review", "researcher");
    expect(JSON.parse(exported.json)).toEqual(reviewed);
    expect(exported.markdown).toContain("SYN-PASSAGE-1"); expect(exported.markdown).toContain("Fixture paragraph 1");
    expect(exported.markdown).toContain(decision); expect(exported.markdown).toContain("no publication locator");
  }
});

test("authorisation precedes storage access and enforces product ownership on every method", async () => {
  let reads = 0, writes = 0;
  const { service } = setup(undefined, { async load() { reads++; return null; }, async save() { writes++; } });
  for (const operation of [
    () => service.start("team-a-secret", input(), "anonymous"), () => service.get("team-b-secret", "researcher"),
    () => service.exportDossier("team-a-secret", "anonymous"), () => service.review("team-a-secret", 1, "accept_for_research", "reason", "researcher"),
    () => service.recoverInterrupted("team-a-secret", 1, "reviewer"),
  ]) await expect(operation()).rejects.toBeInstanceOf(InvestigationAccessError);
  expect(reads).toBe(0); expect(writes).toBe(0);
});

test("duplicate creation and concurrent review cannot replay stages or overwrite decisions", async () => {
  let retrievalCalls = 0; const retrieval = createCorpusRetrievalProvider(), execute = retrieval.execute;
  retrieval.execute = async (...args) => { retrievalCalls++; return execute(...args); };
  const { service } = setup({ retrieval }); const s = await service.start("team-a-cas", input(), "researcher");
  await expect(service.start("team-a-cas", input(), "researcher")).rejects.toBeInstanceOf(InvestigationConflictError);
  expect(retrievalCalls).toBe(1);
  const results = await Promise.allSettled([
    service.review("team-a-cas", s.revision, "accept_for_research", "first reviewer", "reviewer"),
    service.review("team-a-cas", s.revision, "request_revision", "second reviewer", "admin"),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  expect((await service.get("team-a-cas", "researcher")).bundle.runs[0]!.history).toHaveLength(14);
});

test("bad provider output fails its stage and is not converted into zero search results", async () => {
  for (const result of [
    { passageIds: ["SYN-INVENTED"], scope: "test", truncated: false },
    { passageIds: [], scope: "test", truncated: false, secretlyApproved: true },
  ]) {
    const retrieval = createCorpusRetrievalProvider(); retrieval.execute = async () => result;
    const { service } = setup({ retrieval }); const s = await service.start("team-a-bad", input(), "researcher");
    expect(state(s)).toBe("failed"); expect(s.bundle.runs[0]!.history.at(-1)!.stage).toBe("retrieval");
    expect(s.payloads.retrieval).toBeUndefined(); expect(s.payloads.graph).toBeUndefined();
    expect(s.bundle.runs[0]!.history.at(-1)!.reason).toBe("provider_failed_or_invalid_output");
  }
});

test("provider error details and secrets do not enter persisted failure reasons", async () => {
  const retrieval = createCorpusRetrievalProvider(); retrieval.execute = async () => { throw new Error("secret_database_credential"); };
  const { service } = setup({ retrieval }); const s = await service.start("team-a-fail", input(), "researcher");
  expect(state(s)).toBe("failed"); expect(JSON.stringify(s)).not.toContain("secret_database_credential");
});

test("empty retrieval is a successful scoped result with an abstaining draft", async () => {
  const retrieval = createCorpusRetrievalProvider(); retrieval.execute = async () => ({ passageIds: [], scope: "Explicitly empty fixture search", truncated: false });
  const { service } = setup({ retrieval }); const s = await service.start("team-a-empty", input(), "researcher");
  expect(state(s)).toBe("awaiting_human_review"); expect(s.payloads.retrieval!.passageIds).toEqual([]);
  expect(s.payloads.hypothesis!.candidates).toEqual([]); expect(s.payloads.contradictions!.noMappedOpposingEvidence).toBe(true);
  const reviewed = await service.review("team-a-empty", s.revision, "request_revision", "Need more mapped sources", "reviewer");
  expect(reviewed.payloads.dossier!.limitations.join(" ")).toContain("does not establish agreement");
});

test("timeouts abort cooperative providers; late results never replace failure", async () => {
  let aborted = false;
  const retrieval = createCorpusRetrievalProvider(); retrieval.execute = async (_b, _p, signal) => new Promise((resolve) => {
    signal.addEventListener("abort", () => { aborted = true; resolve({ passageIds: [], scope: "late result", truncated: false }); });
  });
  const { service } = setup({ retrieval }, undefined, 10);
  const s = await service.start("team-a-timeout", input(), "researcher");
  expect(aborted).toBe(true); expect(state(s)).toBe("failed");
  expect(s.bundle.runs[0]!.history.at(-1)!.reason).toBe("provider_timeout"); expect(s.payloads.retrieval).toBeUndefined();
});

test("a persistence interruption leaves a started checkpoint and needs explicit admin recovery", async () => {
  const backing = createMemoryInvestigationStore(); let interrupted = false;
  const store: InvestigationStore = { load: (key) => backing.load(key), async save(key, revision, snapshot) {
    if (!interrupted && snapshot.payloads.retrieval) { interrupted = true; throw new Error("storage offline"); }
    return backing.save(key, revision, snapshot);
  } };
  const { service } = setup(undefined, store);
  await expect(service.start("team-a-interrupted", input(), "researcher")).rejects.toThrow("storage offline");
  const before = await service.get("team-a-interrupted", "researcher");
  expect(before.bundle.runs[0]!.history.at(-1)!.status).toBe("started"); expect(before.payloads.retrieval).toBeUndefined();
  const after = await service.recoverInterrupted("team-a-interrupted", before.revision, "admin");
  expect(state(after)).toBe("failed"); expect(after.bundle.runs[0]!.history.at(-1)!.reason).toContain("user:admin");
  await expect(service.review("team-a-interrupted", after.revision, "accept_for_research", "cannot bypass", "reviewer")).rejects.toThrow();
});

test("providers receive detached copies and cannot mutate the canonical bundle", async () => {
  const retrieval = createCorpusRetrievalProvider(); retrieval.execute = async (b) => {
    b.context.question = "Mutated provider input"; b.claims[0]!.curation = "approved";
    return { passageIds: [], scope: "fixture", truncated: false };
  };
  const { service } = setup({ retrieval }); const original = input(); const s = await service.start("team-a-copy", original, "researcher");
  expect(s.bundle.context.question).toBe(original.context.question); expect(s.bundle.claims[0]!.curation).toBe("unreviewed");
});

test("hypothesis citations must be retrieved AND linked to that exact relationship", async () => {
  const b = input(); b.passages.push({ ...b.passages[0]!, id: "SYN-UNLINKED", text: "workflow unrelated retrieved fixture" });
  const { service } = setup({ retrieval: createCorpusRetrievalProvider(), hypothesis: {
    descriptor: { id: "test-model", version: "1", execution: "model", modelRef: "test-model-v1" },
    async execute() { return { status: "unvalidated", candidates: [{ question: "test?", relationshipId: "SYN-REL-AB", passageIds: ["SYN-UNLINKED"] }], limitations: ["Fixture only"] } satisfies HypothesisResult; },
  } });
  const s = await service.start("team-a-citation", b, "researcher");
  expect(state(s)).toBe("failed"); expect(s.payloads.hypothesis).toBeUndefined();
  expect(s.bundle.runs[0]!.history.at(-1)!.modelRef).toBe("test-model-v1");
});

test("snapshot digest checks reject tampering and supplied passage digest mismatches", async () => {
  const { service } = setup(); const s = await service.start("team-a-hash", input(), "researcher");
  const bad = structuredClone(s); bad.payloads.hypothesis!.candidates[0]!.question = "Tampered draft";
  expect(() => validateInvestigationSnapshot(bad)).toThrow();
  const missing = structuredClone(s); delete missing.payloads.retrieval;
  expect(() => validateInvestigationSnapshot(missing)).toThrow();
  const b = input(); b.passages[0]!.sha256 = "a".repeat(64);
  await expect(service.start("team-a-bad-hash", b, "researcher")).rejects.toThrow();
  b.passages[0]!.sha256 = createHash("sha256").update(b.passages[0]!.text).digest("hex");
  expect(state(await service.start("team-a-valid-hash", b, "researcher"))).toBe("awaiting_human_review");
});

test("opposing and supporting assessment sides remain distinct, with original provenance and context", async () => {
  // Reserved example.org exercises real-data structures, not a claimed real study or scientific finding.
  const b = JSON.parse(JSON.stringify(input()).replaceAll("SYN-", "TEST-").replaceAll('"synthetic"', '"public_real"')) as ResearchBundle;
  b.sources[0]!.kind = "dataset"; b.sources[0]!.url = "https://example.org/test-only";
  b.claims[0]!.assessmentKind = "model_draft"; b.claims[0]!.support = "supports";
  b.claims.push({ ...structuredClone(b.claims[0]!), id: "TEST-OPPOSING", support: "contradicts" });
  b.relationships[0]!.context.species = "mouse";
  const { service } = setup(); const s = await service.start("team-a-opposing", b, "researcher");
  const group = s.payloads.contradictions!.groups[0]!;
  expect(group.supportingClaimIds).toEqual(["TEST-CLAIM-1"]); expect(group.opposingClaimIds).toEqual(["TEST-OPPOSING"]);
  expect(s.payloads.contradictions!.noMappedOpposingEvidence).toBe(false);
  expect(s.bundle.relationships[0]!.context.species).toBe("mouse"); expect(s.bundle.claims.every((c) => c.curation === "unreviewed")).toBe(true);
});

test("retrieval and graph caps are explicit and preserved in dossier limitations", async () => {
  const b = input(); for (let i = 2; i <= 45; i++) b.passages.push({ ...b.passages[0]!, id: `SYN-PASSAGE-${i}`, text: "workflow reference fixture" });
  for (let i = 2; i <= 125; i++) b.relationships.push({ ...structuredClone(b.relationships[0]!), id: `SYN-REL-${i}` });
  const { service } = setup(); const s = await service.start("team-a-caps", b, "researcher");
  expect(s.payloads.retrieval!.passageIds).toHaveLength(40); expect(s.payloads.retrieval!.truncated).toBe(true);
  expect(s.payloads.graph!.relationshipIds).toHaveLength(120); expect(s.payloads.graph!.truncated).toBe(true);
  const done = await service.review("team-a-caps", s.revision, "request_revision", "Increase corpus coverage", "reviewer");
  expect(done.payloads.dossier!.limitations.join(" ")).toContain("truncated");
});

test("resume continues only unstarted stages and never repeats completed retrieval or a human decision", async () => {
  const backing = createMemoryInvestigationStore(); let pauseBeforeGraph = true, pauseBeforeDossier = true, retrievalCalls = 0;
  const retrieval = createCorpusRetrievalProvider(), execute = retrieval.execute;
  retrieval.execute = async (...args) => { retrievalCalls++; return execute(...args); };
  const store: InvestigationStore = { load: (key) => backing.load(key), async save(key, expected, s) {
    const last = s.bundle.runs[0]!.history.at(-1);
    if (pauseBeforeGraph && last?.stage === "graph" && last.status === "started") { pauseBeforeGraph = false; throw new Error("restart before graph"); }
    if (pauseBeforeDossier && last?.stage === "dossier" && last.status === "started") { pauseBeforeDossier = false; throw new Error("restart before dossier"); }
    await backing.save(key, expected, s);
  } };
  const { service } = setup({ retrieval }, store);
  await expect(service.start("team-a-resume", input(), "researcher")).rejects.toThrow("restart before graph");
  let s = await service.get("team-a-resume", "researcher");
  expect(s.bundle.runs[0]!.history.at(-1)!.stage).toBe("retrieval");
  s = await service.resume("team-a-resume", s.revision, "researcher");
  expect(state(s)).toBe("awaiting_human_review"); expect(retrievalCalls).toBe(1);
  await expect(service.review("team-a-resume", s.revision, "request_revision", "Fixture review", "reviewer")).rejects.toThrow("restart before dossier");
  s = await service.get("team-a-resume", "researcher");
  expect(s.payloads.review!.decision).toBe("request_revision");
  s = await service.resume("team-a-resume", s.revision, "researcher");
  expect(state(s)).toBe("completed");
  expect(await service.resume("team-a-resume", s.revision, "researcher")).toEqual(s);
  expect(retrievalCalls).toBe(1); expect(s.bundle.runs[0]!.history).toHaveLength(14);
});

test("payload integrity survives object-key reordering by JSONB storage", async () => {
  const { service } = setup(); const s = await service.start("team-a-jsonb", input(), "researcher");
  const done = await service.review("team-a-jsonb", s.revision, "request_revision", "Fixture review", "reviewer");
  function reorder(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(reorder);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).reverse().map(([k, value]) => [k, reorder(value)]));
    return v;
  }
  expect(validateInvestigationSnapshot(reorder(done) as typeof done)).toEqual(done);
});
