import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {materializeN1QueueFromExpansion} from "../src/evidence/n1CandidateQueue";
import {parseEuropePmcBibliographicPayload} from "../src/evidence/europePmcBibliographicLookup";
import {
  buildN1PassageRightsInventory,
  parseN1PassageRightsInventory,
} from "../src/evidence/n1PassageRightsInventory";
import {verifyN1CandidatesFromFixtures} from "../src/evidence/n1SourceVerification";

const root = resolve(import.meta.dir, "..");
const expansion = JSON.parse(readFileSync(resolve(root, "research/domain-graph/expansion.v1.json"), "utf8"));
const queue = materializeN1QueueFromExpansion(expansion);
const generatedAt = "2026-11-07T21:20:00.000Z";

function fixtureBody(queueId: string): string {
  return readFileSync(
    resolve(root, "research/domain-graph/n1/fixtures", `${queueId.toLowerCase().replace(/-/g, "_")}.europepmc.json`),
    "utf8",
  );
}

describe("N1 passage rights inventory", () => {
  it("records provider OA/licence signals for all 12 sources without clearing reuse", () => {
    const fixtures = Object.fromEntries(
      queue.candidates.map((c) => [c.queueId, {httpStatus: 200, bodyText: fixtureBody(c.queueId)}]),
    );
    const lookups = Object.fromEntries(
      queue.candidates.map((c) => [
        c.queueId,
        parseEuropePmcBibliographicPayload({
          query: `DOI:"${c.doi}"`,
          bodyText: fixtureBody(c.queueId),
          httpStatus: 200,
          retrievedAt: generatedAt,
        }),
      ]),
    );
    const receipt = verifyN1CandidatesFromFixtures({queue, fixtures, generatedAt});
    const inventory = buildN1PassageRightsInventory({queue, receipt, lookups, generatedAt});
    parseN1PassageRightsInventory(inventory);

    expect(inventory.entries).toHaveLength(12);
    expect(inventory.anyPassageImported).toBe(false);
    expect(inventory.anyPassageUsePermitted).toBe(false);
    expect(inventory.summary.humanCleared).toBe(0);
    expect(inventory.summary.pendingHumanReview).toBe(12);
    expect(inventory.summary.withProviderSignals).toBe(12);
    expect(inventory.summary.openAccessReported).toBeGreaterThan(0);
    expect(inventory.summary.providerLicenseLabelPresent).toBeGreaterThan(0);
    expect(inventory.n1ReceiptHash).toBe(receipt.receiptHash);

    const byId = Object.fromEntries(inventory.entries.map((e) => [e.queueId, e]));
    expect(byId["N1-C-01"]?.providerSignals?.providerLicenseLabel).toBe("cc by-nc-nd");
    expect(byId["N1-C-01"]?.providerSignals?.isOpenAccess).toBe("N");
    expect(byId["N1-C-12"]?.providerSignals?.providerLicenseLabel).toBe("cc by");
    expect(byId["N1-C-12"]?.providerSignals?.isOpenAccess).toBe("Y");
    expect(inventory.entries.every((e) => e.humanAttestation.licenceEvidenceUri === null)).toBe(true);
    expect(inventory.entries.every((e) => e.decision === "pending_human_review")).toBe(true);
  });

  it("rejects invented human clearance or passage import flags", () => {
    const fixtures = Object.fromEntries(
      queue.candidates.map((c) => [c.queueId, {httpStatus: 200, bodyText: fixtureBody(c.queueId)}]),
    );
    const lookups = Object.fromEntries(
      queue.candidates.map((c) => [
        c.queueId,
        parseEuropePmcBibliographicPayload({
          query: `DOI:"${c.doi}"`,
          bodyText: fixtureBody(c.queueId),
          httpStatus: 200,
          retrievedAt: generatedAt,
        }),
      ]),
    );
    const receipt = verifyN1CandidatesFromFixtures({queue, fixtures, generatedAt});
    const inventory = buildN1PassageRightsInventory({queue, receipt, lookups, generatedAt});
    expect(() =>
      parseN1PassageRightsInventory({
        ...inventory,
        anyPassageUsePermitted: true,
        inventoryHash: "deadbeef",
      }),
    ).toThrow();
  });
});
