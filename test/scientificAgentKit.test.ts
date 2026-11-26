import {test, expect} from "bun:test";

import {
  AGENTS,
  CONTEXT_FIELDS,
  RESEARCH_SEQUENCE,
  classifyConflict,
  createResearchBrief,
  createScientificAgentHandlers,
  sha256,
  type Dependencies,
  type Evidence,
  type ExperimentalContext,
  type Finding,
  type RunContext,
} from "../src/agents/scientificAgentKit";

const context = Object.fromEntries(
  CONTEXT_FIELDS.map(field => [
    field,
    field === "species" ? "mouse" : "fixture_condition",
  ]),
) as ExperimentalContext;

function runContext(actorId = "researcher-a"): RunContext {
  return {
    runId: "fixture-run",
    investigationId: "fixture-investigation",
    actorId,
    question: "Compare two fictional experimental findings.",
    dataClass: "synthetic",
    outputs: {},
    trace: [],
  };
}

async function fixtureDependencies(): Promise<Dependencies> {
  const passage =
    "Software fixture only: metabolite X reduced signal Y in mice.";

  const evidence: Evidence = {
    id: "fixture-evidence",
    title: "Fictional test source",
    url: "https://example.org/fixture",
    sourceHash: await sha256("fixture-provider-response"),
    retrievedAt: "2026-11-23T00:00:00.000Z",
    passage,
    passageHash: await sha256(passage),
    locator: "Fixture paragraph 1",
    context,
  };

  return {
    authorise: async ctx =>
      ctx.actorId === "researcher-a" &&
      ctx.investigationId === "fixture-investigation",

    search: async () => [structuredClone(evidence)],

    clearSource: async item => ({
      allowed: true,
      sourceHash: item.sourceHash,
      receiptId: "fixture-rights-receipt",
    }),

    extract: async () => [{
      id: "fixture-finding",
      subject: "metabolite X",
      predicate: "reduces",
      object: "signal Y",
      polarity: "positive",
      evidenceId: evidence.id,
      quote: passage,
      context: structuredClone(context),
    }],

    readGraph: async () => ({
      version: "a".repeat(64),
      edges: [{
        id: "fixture-edge",
        subject: "metabolite X",
        predicate: "reduces",
        object: "signal Y",
      }],
    }),

    requestReview: async (input, ctx) => ({
      id: "fixture-review-request",
      investigationId: input.investigationId,
      requestedBy: ctx.actorId,
      status: "pending",
    }),

    evaluate: async () => ({
      benchmarkVersion: "fixture-benchmark",
      labelReceiptId: null,
      scores: {
        grounding: 1,
        context: 1,
        contradiction: 1,
        uncertainty: 1,
        mechanism: 1,
        provenance: 1,
        safety: 1,
        usefulness: 1,
      },
      criticalFailures: [],
      abstentions: 0,
      reviewerDisagreements: 0,
    }),

    now: () => new Date("2026-11-23T00:00:00.000Z"),
  };
}

async function executeFixture(
  deps: Dependencies,
  ctx = runContext(),
) {
  const handlers = createScientificAgentHandlers(deps);

  for (const agent of RESEARCH_SEQUENCE) {
    const result = await handlers[agent](ctx);

    expect(result.status, agent).toBe("completed");

    ctx.outputs[agent] = result.data;
    ctx.trace.push(result.receipt);
  }

  return {handlers, ctx};
}

test("all 13 handlers are registered", async () => {
  const handlers = createScientificAgentHandlers(
    await fixtureDependencies(),
  );

  expect(Object.keys(handlers).sort()).toEqual([...AGENTS].sort());
});

test("fixture research chain exports a versioned pending-review draft", async () => {
  const deps = await fixtureDependencies();
  const {ctx, handlers} = await executeFixture(deps);

  const brief = await createResearchBrief(ctx, deps);

  expect(brief.version).toMatch(/^[a-f0-9]{64}$/);
  expect(brief.graphVersion).toBe("a".repeat(64));
  expect(brief.review.status).toBe("pending");
  expect(brief.scientificApproval).toBe(false);
  expect(brief.canonicalGraphPromotionAllowed).toBe(false);

  const monitoring = await handlers.SENTINEL(ctx);
  expect(monitoring.status).toBe("completed");

  const evaluation = await handlers.CALIBER(ctx);
  expect(evaluation.status).toBe("completed");
  expect(evaluation.data).toMatchObject({
    aggregate: 1,
    releaseBlocked: true,
    releaseAuthorised: false,
  });
});

test("missing provider is blocked rather than simulated", async () => {
  const handlers = createScientificAgentHandlers({
    authorise: async () => true,
  });

  const result = await handlers.SCOUT(runContext());
  expect(result.status).toBe("blocked");
});

test("unauthorised user cannot execute any handler", async () => {
  const handlers = createScientificAgentHandlers(
    await fixtureDependencies(),
  );

  for (const agent of AGENTS) {
    const result = await handlers[agent](
      runContext("different-user"),
    );

    expect(result.status, agent).toBe("blocked");
  }
});

test("unverified source clearance prevents passage extraction", async () => {
  const deps = await fixtureDependencies();

  deps.clearSource = async evidence => ({
    allowed: false,
    sourceHash: evidence.sourceHash,
    receiptId: null,
  });

  const handlers = createScientificAgentHandlers(deps);
  const ctx = runContext();

  const scout = await handlers.SCOUT(ctx);
  ctx.outputs.SCOUT = scout.data;

  const aegis = await handlers.AEGIS(ctx);
  ctx.outputs.AEGIS = aegis.data;

  expect(aegis.data).toMatchObject({cleared: []});

  const lantern = await handlers.LANTERN(ctx);
  expect(lantern.status).toBe("blocked");
});

test("invented quotations fail extraction validation", async () => {
  const deps = await fixtureDependencies();
  const originalExtract = deps.extract!;

  deps.extract = async (evidence, ctx) => {
    const findings = await originalExtract(evidence, ctx);
    return findings.map(finding => ({
      ...finding,
      quote: "This quotation does not occur in the source.",
    }));
  };

  const handlers = createScientificAgentHandlers(deps);
  const ctx = runContext();

  ctx.outputs.SCOUT = (await handlers.SCOUT(ctx)).data;
  ctx.outputs.AEGIS = (await handlers.AEGIS(ctx)).data;

  expect((await handlers.LANTERN(ctx)).status).toBe("failed");
});

test("passage hash mismatch fails ingestion", async () => {
  const deps = await fixtureDependencies();
  const originalSearch = deps.search!;

  deps.search = async ctx =>
    (await originalSearch(ctx)).map(evidence => ({
      ...evidence,
      passage: "Changed without a new hash.",
    }));

  const handlers = createScientificAgentHandlers(deps);
  expect((await handlers.SCOUT(runContext())).status).toBe("failed");
});

test("model differences are not adjudicated contradictions", () => {
  const left: Finding = {
    id: "left",
    subject: "X",
    predicate: "changes",
    object: "Y",
    polarity: "positive",
    evidenceId: "source-a",
    quote: "Fixture quotation.",
    context: structuredClone(context),
  };

  const right: Finding = {
    ...left,
    id: "right",
    evidenceId: "source-b",
    polarity: "negative",
    context: {...context, species: "human"},
  };

  expect(classifyConflict(left, right)).toMatchObject({
    classification: "contextual_difference",
    independentlyAdjudicated: false,
  });

  right.context = structuredClone(context);

  expect(classifyConflict(left, right).classification)
    .toBe("candidate_contradiction");

  right.context.assay = null;

  expect(classifyConflict(left, right).classification)
    .toBe("insufficient_evidence");
});

test("high aggregate cannot override a critical evaluation failure", async () => {
  const deps = await fixtureDependencies();
  const originalEvaluate = deps.evaluate!;

  deps.evaluate = async ctx => ({
    ...await originalEvaluate(ctx),
    labelReceiptId: "fixture-label-receipt",
    criticalFailures: ["grounding_failed"],
  });

  const handlers = createScientificAgentHandlers(deps);
  const result = await handlers.CALIBER(runContext());

  expect(result.data).toMatchObject({
    aggregate: 1,
    releaseBlocked: true,
    releaseAuthorised: false,
  });
});

test("altered artifacts cannot reuse old provenance receipts", async () => {
  const deps = await fixtureDependencies();
  const {ctx} = await executeFixture(deps);

  ctx.outputs.VANTAGE = {silentlyChanged: true};

  await expect(createResearchBrief(ctx, deps)).rejects.toThrow(
    "Artifact changed after execution",
  );
});

test("cancelled runs are blocked", async () => {
  const controller = new AbortController();
  controller.abort();

  const ctx = runContext();
  ctx.signal = controller.signal;

  const handlers = createScientificAgentHandlers(
    await fixtureDependencies(),
  );

  expect((await handlers.SCOUT(ctx)).status).toBe("blocked");
});

async function groundingFixture(quote: string, passage?: string) {
  const deps = await fixtureDependencies();
  if (passage) {
    const search = deps.search!;
    deps.search = async ctx => Promise.all(
      (await search(ctx)).map(async e => ({
        ...e, passage, passageHash: await sha256(passage),
      })),
    );
  }
  const extract = deps.extract!;
  deps.extract = async (evidence, ctx) =>
    (await extract(evidence, ctx)).map(f => ({...f, quote}));
  return deps;
}

test("a one-character quotation cannot ground a finding", async () => {
  const handlers = createScientificAgentHandlers(await groundingFixture("X"));
  const ctx = runContext();
  ctx.outputs.SCOUT = (await handlers.SCOUT(ctx)).data;
  ctx.outputs.AEGIS = (await handlers.AEGIS(ctx)).data;
  expect((await handlers.LANTERN(ctx)).status).toBe("failed");
});

test("a quotation omitting either end of the relation is rejected", async () => {
  const handlers = createScientificAgentHandlers(
    await groundingFixture("reduced signal Y in mice"),
  );
  const ctx = runContext();
  ctx.outputs.SCOUT = (await handlers.SCOUT(ctx)).data;
  ctx.outputs.AEGIS = (await handlers.AEGIS(ctx)).data;
  expect((await handlers.LANTERN(ctx)).status).toBe("failed");
});

test("a negated passage is flagged when the finding is positive", async () => {
  const passage =
    "Software fixture only: metabolite X did not reduce signal Y in mice.";
  const {ctx} = await executeFixture(await groundingFixture(passage, passage));
  const verified = ctx.outputs.VERITAS as {
    claims: Array<{supportAssessment: string; polarityMismatchPossible: boolean}>;
  };
  expect(verified.claims[0]).toMatchObject({
    polarityMismatchPossible: true,
    supportAssessment: "possible_polarity_conflict_review_required",
  });
});

test("brief export is refused for an actor who is not authorised", async () => {
  const deps = await fixtureDependencies();
  const {ctx} = await executeFixture(deps);
  await expect(
    createResearchBrief({...ctx, actorId: "mallory"}, deps),
  ).rejects.toThrow("Operation not authorised");
});
