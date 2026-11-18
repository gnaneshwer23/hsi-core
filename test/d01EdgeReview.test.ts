import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {
  acceptSheetForReview,
  exportDecisions,
  history,
  latestDecisions,
  memoryStore,
  recordDecision,
  verifyDecisions,
  type D01EdgeReviewSheet,
  type KeyValueStore,
} from "../src/knowledgeGraph/d01EdgeReview";

const sheet = acceptSheetForReview(
  JSON.parse(readFileSync("research/domain-graph/context-completions.v1.json", "utf8")),
) as D01EdgeReviewSheet;
const r0 = sheet.rows[0]!;
const r1 = sheet.rows[1]!;
const at = () => new Date("2026-11-18T12:00:00Z");
const accept = (row = r0, reason = "Source and context support keeping this candidate.") => ({
  edgeId: row.edgeId,
  decision: "accept_candidate" as const,
  reason,
  reviewerLabel: "Curator A",
});

describe("D-01 edge review", () => {
  test("accepts the sealed sheet and records an unverified non-promoting recommendation", async () => {
    const s = memoryStore();
    const r = await recordDecision(sheet, s, accept(), at);
    expect(r.status).toBe("saved");
    expect(r.decision).toMatchObject({
      revision: 1,
      previousDigest: null,
      reviewerVerified: false,
      scientificClaimAllowed: false,
      graphPromotion: false,
      autoPromotion: false,
      status: "curator_recommendation_unverified",
      sheetMappedAgainst: sheet.mappedAgainst,
    });
    expect(latestDecisions(sheet, s).get(r0.edgeId)?.decision).toBe("accept_candidate");
  });

  test("identical decision is a no-op; a change adds a chained revision", async () => {
    const s = memoryStore();
    await recordDecision(sheet, s, accept(), at);
    expect((await recordDecision(sheet, s, accept(), at)).status).toBe("unchanged");
    const second = await recordDecision(
      sheet,
      s,
      {...accept(), decision: "reject_candidate", reason: "On reflection the claim is too broad for this source."},
      at,
    );
    expect(second.decision.revision).toBe(2);
    expect(second.decision.previousDigest).toBe(history(s, r0.edgeId)[0]!.digest);
    expect(await verifyDecisions(sheet, s)).toEqual([]);
  });

  test("refuses unknown edges, short or identifying reasons, and bad reviewer labels", async () => {
    const s = memoryStore();
    await expect(recordDecision(sheet, s, {...accept(), edgeId: "edge:nope"}, at)).rejects.toThrow("Unknown edge");
    await expect(recordDecision(sheet, s, {...accept(), reason: "short"}, at)).rejects.toThrow("reason");
    await expect(
      recordDecision(sheet, s, {...accept(), reason: "Seen in patient 943 476 5919 notes, so accept."}, at),
    ).rejects.toThrow("identifiers");
    await expect(recordDecision(sheet, s, {...accept(), reviewerLabel: "<script>"}, at)).rejects.toThrow(
      "reviewer label",
    );
    expect(s.keys()).toEqual([]);
  });

  test("supports revise and insufficient without claiming promotion", async () => {
    const s = memoryStore();
    const rev = await recordDecision(
      sheet,
      s,
      {
        edgeId: r1.edgeId,
        decision: "revise",
        reason: "Need a clearer tissue and population annotation first.",
        reviewerLabel: "Curator B",
      },
      at,
    );
    expect(rev.decision).toMatchObject({
      decision: "revise",
      scientificClaimAllowed: false,
      graphPromotion: false,
    });
    const insuff = await recordDecision(
      sheet,
      s,
      {
        edgeId: r0.edgeId,
        decision: "insufficient",
        reason: "Abstract alone does not support a durable relationship.",
        reviewerLabel: "Curator B",
      },
      at,
    );
    expect(insuff.decision.decision).toBe("insufficient");
  });

  test("detects tampering, forged approval and a broken chain", async () => {
    const s = memoryStore();
    await recordDecision(sheet, s, accept(), at);
    await recordDecision(sheet, s, {...accept(), reason: "A different but sufficient reason."}, at);
    const key = s.keys().sort()[0]!;
    const v = JSON.parse(s.get(key)!);
    v.reason = "Edited after recording, no longer matching.";
    const t1: KeyValueStore = {get: (k) => (k === key ? JSON.stringify(v) : s.get(k)), create: s.create, keys: s.keys};
    expect((await verifyDecisions(sheet, t1)).join()).toContain("digest");
    const forged = JSON.parse(s.get(key)!);
    forged.scientificClaimAllowed = true;
    const t2: KeyValueStore = {
      get: (k) => (k === key ? JSON.stringify(forged) : s.get(k)),
      create: s.create,
      keys: s.keys,
    };
    expect((await verifyDecisions(sheet, t2)).join()).toContain("claims approval");
    const k2 = s.keys().sort()[1]!;
    const broken = JSON.parse(s.get(k2)!);
    broken.previousDigest = "0".repeat(64);
    const t3: KeyValueStore = {
      get: (k) => (k === k2 ? JSON.stringify(broken) : s.get(k)),
      create: s.create,
      keys: s.keys,
    };
    expect((await verifyDecisions(sheet, t3)).join()).toContain("breaks the chain");
  });

  test("export carries counts and the no-promotion statement; refuses tampered history", async () => {
    const s = memoryStore();
    await recordDecision(sheet, s, accept(), at);
    await recordDecision(
      sheet,
      s,
      {
        edgeId: r1.edgeId,
        decision: "insufficient",
        reason: "Abstract alone does not support a durable relationship.",
        reviewerLabel: "Curator B",
      },
      at,
    );
    const e = await exportDecisions(sheet, s, at);
    expect(e.counts).toMatchObject({
      edges: sheet.rows.length,
      decided: 2,
      accept_candidate: 1,
      insufficient: 1,
      pending: sheet.rows.length - 2,
    });
    expect(e.sheetDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(e.decisions.every((d) => d.scientificClaimAllowed === false && d.graphPromotion === false)).toBe(true);
    expect(e.statement).toContain("published graph");
    const key = s.keys()[0]!;
    const v = JSON.parse(s.get(key)!);
    v.reason = "Tampered text after the fact.";
    await expect(
      exportDecisions(sheet, {get: (k) => (k === key ? JSON.stringify(v) : s.get(k)), create: s.create, keys: s.keys}, at),
    ).rejects.toThrow("failed verification");
  });

  test("never overwrites a stored revision", () => {
    const s = memoryStore();
    s.create("hsi-d01-edge:x:000001", "a");
    expect(() => s.create("hsi-d01-edge:x:000001", "b")).toThrow();
  });
});
