import { describe, expect, test } from "bun:test";
import {
  EDGE_EMBEDDING_SLOT_SCHEMA,
  assertSafeEmbeddingSidecar,
  buildEmbeddingSidecarsBundle,
  buildExampleEmbeddingSidecars,
  buildGateCChecklist,
  contentHashOfPayload,
  serializeEmbeddingSidecars,
} from "../src/index";

describe("P2.2 edge embedding sidecars", () => {
  test("schema is wired for hash/ref sidecars and forbids grade flips", () => {
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.status).toBe("wired_hash_ref_sidecars");
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.doesNotSetHsiGrade).toBe(true);
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.mayFlipEvidenceGrade).toBe(false);
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.autoApprove).toBe(false);
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.autoApproveIntoKg).toBe(false);
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.containsPhi).toBe(false);
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.vendorsModelWeights).toBe(false);
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.exportArtifact).toBe(
      "hsi-embedding-sidecars.json",
    );
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.fields).toContain("contentHash");
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.fields).toContain("vectorRef");
    expect(EDGE_EMBEDDING_SLOT_SCHEMA.fields).toContain("doesNotSetHsiGrade");
  });

  test("sample mapping prefers hash/ref; tiny demo dim capped; invariants hold", () => {
    const generatedAt = "2026-11-01T18:40:00.000Z";
    const byEdgeId = buildExampleEmbeddingSidecars({ createdAt: generatedAt });
    expect(Object.keys(byEdgeId).length).toBeGreaterThanOrEqual(4);
    expect(byEdgeId["HSI-E-RA-001"]).toBeDefined();
    expect(byEdgeId["HSI-E-SSC-001"]).toBeDefined();
    expect(byEdgeId["HSI-E-GUT-003"]).toBeDefined();
    expect(byEdgeId["HSI-E-NI-001"]).toBeDefined();

    for (const [edgeId, slot] of Object.entries(byEdgeId)) {
      expect(slot.doesNotSetHsiGrade).toBe(true);
      expect(slot.autoApprove).toBe(false);
      expect(slot.autoApproveIntoKg).toBe(false);
      expect(slot.mayFlipEvidenceGrade).toBe(false);
      expect(slot.invalidatesOnModelBump).toBe(true);
      expect(slot.createdAt).toBe(generatedAt);
      expect(Boolean(slot.vectorRef) || Boolean(slot.contentHash)).toBe(true);
      expect("hsiGrade" in slot).toBe(false);
      expect(edgeId.startsWith("HSI-E-")).toBe(true);
      if (slot.tinyDemoVector) {
        expect(slot.tinyDemoVector.length).toBeLessThanOrEqual(
          EDGE_EMBEDDING_SLOT_SCHEMA.maxTinyDemoDim,
        );
        expect(slot.contentHash).toBe(contentHashOfPayload(slot.tinyDemoVector));
      }
    }

    const bundle = buildEmbeddingSidecarsBundle({ generatedAt });
    expect(bundle.schemaVersion).toBe("hsi-embedding-sidecars-1");
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.summary.edgeCount).toBe(Object.keys(byEdgeId).length);
    expect(bundle.summary.withContentHash).toBe(bundle.summary.edgeCount);
    expect(bundle.summary.withTinyDemo).toBe(1);
    expect(bundle.summary.maxTinyDemoDim).toBe(16);

    const json = JSON.parse(serializeEmbeddingSidecars(bundle)) as {
      byEdgeId: Record<string, unknown>;
    };
    expect(Object.keys(json.byEdgeId).length).toBe(bundle.summary.edgeCount);
  });

  test("rejects sidecars that try to set grades or omit locators", () => {
    const badGrade = {
      modelId: "x",
      dim: 8,
      contentHash: "sha256:abc",
      doesNotSetHsiGrade: true,
      hsiGrade: "established",
    };
    expect(assertSafeEmbeddingSidecar(badGrade).ok).toBe(false);

    const badFlip = {
      modelId: "x",
      dim: 8,
      contentHash: "sha256:abc",
      doesNotSetHsiGrade: true,
      mayFlipEvidenceGrade: true,
    };
    expect(assertSafeEmbeddingSidecar(badFlip).ok).toBe(false);

    const noLocator = {
      modelId: "x",
      dim: 8,
      vectorRef: null,
      contentHash: null,
      doesNotSetHsiGrade: true,
    };
    expect(assertSafeEmbeddingSidecar(noLocator).ok).toBe(false);

    const hugeDemo = {
      modelId: "x",
      dim: 32,
      contentHash: "sha256:abc",
      doesNotSetHsiGrade: true,
      tinyDemoVector: Array.from({ length: 32 }, (_, i) => i),
    };
    expect(assertSafeEmbeddingSidecar(hugeDemo).ok).toBe(false);

    const good = buildExampleEmbeddingSidecars({
      createdAt: "2026-11-01T18:40:00.000Z",
    })["HSI-E-RA-001"]!;
    expect(
      assertSafeEmbeddingSidecar(good as unknown as Record<string, unknown>).ok,
    ).toBe(true);
  });

  test("Gate C instructions note embedding sidecars never auto-approve", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T18:40:00.000Z",
    });
    expect(checklist.autoApproveIntoKg).toBe(false);
    expect(
      checklist.instructions.some((s) => s.includes("embedding sidecars")),
    ).toBe(true);
    expect(checklist.summary.modelProposalsAutoApprove).toBe(0);
  });
});
