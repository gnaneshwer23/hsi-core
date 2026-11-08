import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildR3ConnectedResearchWorkbench,
  parseR3ConnectedResearchWorkbench,
} from "../src/evidence/r3ConnectedResearchWorkbench";
import {
  R3_JOURNEY_STAGES,
  extractInspectablePassages,
  parseR3ConnectedWorkbenchJourney,
  buildR3ConnectedWorkbenchJourney,
} from "../src/researchConnectedWorkbench";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../src/researchWorkspaceTestFixture";
import {RESEARCH_MECHANISM_STEPS} from "../src/researchMechanismWorkflow";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-08T16:00:00.000Z";

describe("R3 connected research workbench", () => {
  test("builds eng-CLEARED journey with science BLOCKED", async () => {
    const manifest = await buildR3ConnectedResearchWorkbench({generatedAt, repoRoot: root});
    expect(manifest.engineeringScaffold).toBe("CLEARED");
    expect(manifest.scientificAcceptance).toBe("BLOCKED");
    expect(manifest.rightsAcceptance).toBe("BLOCKED");
    expect(manifest.researcherJourneyCompleteClaimed).toBe(false);
    expect(manifest.productionReadyClaimed).toBe(false);
    expect(manifest.writesEnabledClaimed).toBe(false);
    expect(manifest.stages).toHaveLength(6);
    expect(manifest.stages.map((s) => s.id)).toEqual([...R3_JOURNEY_STAGES]);
    expect(manifest.stages.every((s) => s.consumesBackend && !s.hardCodedDemoContent)).toBe(true);
    expect(manifest.summary.hardCodedDemoContent).toBe(0);
    expect(manifest.summary.inspectablePassageStages).toBeGreaterThanOrEqual(3);
    expect(manifest.syntheticFixture.investigationId).toBe(
      RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
    );
    expect(manifest.syntheticFixture.honestyBanner).toBe(
      RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
    );
    expect(manifest.recordedPilotDecisionUnchanged).toBe(true);
    expect(manifest.mechanismWorkflow.stepCount).toBe(RESEARCH_MECHANISM_STEPS.length);
    expect(
      RESEARCH_MECHANISM_STEPS.every((id) =>
        manifest.stages.some((s) => s.mechanismStepIds.includes(id)),
      ),
    ).toBe(true);
    expect(
      manifest.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED"),
    ).toBe(true);
    expect(
      manifest.checks
        .filter((c) => c.plane === "human")
        .every((c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED"),
    ).toBe(true);
    expect(parseR3ConnectedResearchWorkbench(manifest).inventoryHash).toBe(manifest.inventoryHash);
  });

  test("refuses claiming scientificAcceptance CLEARED", async () => {
    const manifest = await buildR3ConnectedResearchWorkbench({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest & {scientificAcceptance: string};
    bad.scientificAcceptance = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR3ConnectedResearchWorkbench(sealed)).toThrow();
  });

  test("refuses researcherJourneyCompleteClaimed=true", async () => {
    const manifest = await buildR3ConnectedResearchWorkbench({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.researcherJourneyCompleteClaimed = true as unknown as false;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR3ConnectedResearchWorkbench(sealed)).toThrow();
  });

  test("refuses hard-coded demo content on stages", async () => {
    const manifest = await buildR3ConnectedResearchWorkbench({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.stages[0]!.hardCodedDemoContent = true as unknown as false;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR3ConnectedResearchWorkbench(sealed)).toThrow("real research APIs");
  });

  test("refuses CLEARED human checks", async () => {
    const manifest = await buildR3ConnectedResearchWorkbench({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    const human = bad.checks.find((c) => c.plane === "human");
    expect(human).toBeDefined();
    human!.status = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR3ConnectedResearchWorkbench(sealed)).toThrow("cannot be CLEARED");
  });

  test("browser-safe journey honesty gates", () => {
    const journey = parseR3ConnectedWorkbenchJourney(buildR3ConnectedWorkbenchJourney());
    expect(journey.stages).toHaveLength(6);
    expect(journey.scientificAcceptance).toBe("BLOCKED");
    expect(journey.researcherJourneyCompleteClaimed).toBe(false);
    expect(journey.stages.every((s) => s.consumesBackend && !s.hardCodedDemoContent)).toBe(true);
  });

  test("extractInspectablePassages reads backend payloads only", () => {
    expect(extractInspectablePassages(null)).toEqual([]);
    expect(extractInspectablePassages({question: "x"})).toEqual([]);
    const fromOutcome = extractInspectablePassages({
      passages: [
        {
          id: "p1",
          locator: "p.1",
          sha256: "a".repeat(64),
          text: "Backend passage text for inspectability.",
        },
      ],
    });
    expect(fromOutcome).toHaveLength(1);
    expect(fromOutcome[0]!.id).toBe("p1");
    expect(fromOutcome[0]!.textPreview).toContain("Backend passage");
    expect(fromOutcome[0]!.source).toBe("outcome.passages");

    const fromContext = extractInspectablePassages({
      context: {
        primary: {
          bundle: {
            passages: [{id: "p2", locator: "abs", sha256: "b".repeat(64), text: "Graph context passage."}],
          },
        },
      },
    });
    expect(fromContext[0]!.source).toBe("graph-context.primary.bundle.passages");
  });

  test("on-disk journey matches rebuild", async () => {
    const onDisk = parseR3ConnectedResearchWorkbench(
      JSON.parse(
        readFileSync(resolve(root, "research/connected-workbench/r3/workbench-journey.v1.json"), "utf8"),
      ),
    );
    const rebuilt = await buildR3ConnectedResearchWorkbench({
      generatedAt: onDisk.generatedAt,
      repoRoot: root,
    });
    expect(onDisk.inventoryHash).toBe(rebuilt.inventoryHash);
  });
});
