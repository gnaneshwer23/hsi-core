import type { FetchLike } from "../src/fetchLike";
import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {materializeN1QueueFromExpansion, parseN1CandidateQueue} from "../src/evidence/n1CandidateQueue";
import {
  bibliographicTitleSimilarity,
  normalizeBibliographicTitle,
  parseN1ImportReceipt,
  verifyN1CandidatesFromFixtures,
  verifyN1CandidatesLive,
} from "../src/evidence/n1SourceVerification";
import {parseEuropePmcBibliographicPayload} from "../src/evidence/europePmcBibliographicLookup";

const root = resolve(import.meta.dir, "..");
const expansion = JSON.parse(readFileSync(resolve(root, "research/domain-graph/expansion.v1.json"), "utf8"));
const queue = materializeN1QueueFromExpansion(expansion);

function fixture(queueId: string) {
  const path = resolve(
    root,
    "research/domain-graph/n1/fixtures",
    `${queueId.toLowerCase().replace(/-/g, "_")}.europepmc.json`,
  );
  return {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
}

describe("N1 candidate queue", () => {
  it("materialises exactly 12 unreverified bibliographic candidates", () => {
    const parsed = parseN1CandidateQueue(queue);
    expect(parsed.candidates).toHaveLength(12);
    expect(parsed.scientificApproval).toBe(false);
    expect(parsed.graphPromotable).toBe(false);
    expect(parsed.claimEntailmentAssessed).toBe(false);
    expect(parsed.candidates.every((c) => c.priorIdentityStatus === "bibliographic_candidate_not_retrieved")).toBe(true);
  });

  it("rejects invented approval flags on the queue", () => {
    expect(() => parseN1CandidateQueue({...queue, scientificApproval: true})).toThrow();
  });
});

describe("N1 identity checks", () => {
  it("treats compatible titles as a match and conflicting titles as incompatible", () => {
    expect(normalizeBibliographicTitle("Butyrate improves insulin sensitivity.")).toContain("butyrate");
    expect(
      bibliographicTitleSimilarity(
        "Butyrate improves insulin sensitivity and increases energy expenditure in mice",
        "Butyrate improves insulin sensitivity and increases energy expenditure in mice.",
      ),
    ).toBeGreaterThan(0.9);
    expect(
      bibliographicTitleSimilarity(
        "Gut microbial metabolites limit the frequency of autoimmune T cells and protect against type 1 diabetes",
        "Medicine: The final frontier in cancer diagnosis.",
      ),
    ).toBeLessThan(0.3);
  });

  it("matches corrected N1-C-02 / N1-C-03 DOIs and still fails closed on conflicting titles", () => {
    const fixtures = Object.fromEntries(queue.candidates.map((c) => [c.queueId, fixture(c.queueId)]));
    const receipt = verifyN1CandidatesFromFixtures({
      queue,
      fixtures,
      generatedAt: "2026-11-07T21:20:00.000Z",
    });
    parseN1ImportReceipt(receipt);
    expect(receipt.results).toHaveLength(12);
    expect(receipt.scientificApproval).toBe(false);
    expect(receipt.graphPromotable).toBe(false);
    expect(receipt.results.every((r) => r.passageTextImported === false)).toBe(true);
    expect(receipt.results.every((r) => r.claimEntailmentAssessed === false)).toBe(true);

    const mismatches = receipt.results.filter((r) => r.outcome === "identity_mismatch");
    expect(mismatches).toEqual([]);

    const byId = Object.fromEntries(receipt.results.map((r) => [r.queueId, r]));
    expect(byId["N1-C-02"]?.requestedDoi).toBe("10.1038/ni.3713");
    expect(byId["N1-C-03"]?.requestedDoi).toBe("10.1038/nature18646");
    expect(byId["N1-C-02"]?.outcome).toBe("metadata_matched_unreviewed");
    expect(byId["N1-C-03"]?.outcome).toBe("metadata_matched_unreviewed");

    const matched = receipt.results.filter((r) => r.outcome === "metadata_matched_unreviewed");
    expect(matched.length).toBe(12);
    expect(matched.every((r) => r.rightsStatus === "unverified_metadata_only")).toBe(true);
    // Offline fixture mode still blocks live scientific acceptance (rights uncleared).
    expect(receipt.liveAcceptance).toBe("blocked");
  });

  it("records provider 403 as unavailable rather than a verified source", () => {
    const parsed = parseEuropePmcBibliographicPayload({
      query: 'DOI:"10.2337/db08-1637"',
      bodyText: "Forbidden",
      httpStatus: 403,
      retrievedAt: "2026-11-07T21:20:00.000Z",
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.outcome).toBe("provider_unavailable");
  });

  it("does not treat a failed lookup as metadata matched", () => {
    const receipt = verifyN1CandidatesFromFixtures({
      queue,
      fixtures: Object.fromEntries(queue.candidates.slice(1).map((c) => [c.queueId, fixture(c.queueId)])),
      generatedAt: "2026-11-07T21:20:00.000Z",
    });
    const missing = receipt.results.find((r) => r.queueId === "N1-C-01");
    expect(missing?.outcome).toBe("lookup_failed");
    expect(missing?.matched).toBeNull();
  });

  it("live probe maps HTTP 403 to provider_unavailable without inventing metadata", async () => {
    const fetcher = (async () => new Response("Forbidden", {status: 403})) as FetchLike;
    const receipt = await verifyN1CandidatesLive({queue, fetcher, now: () => new Date("2026-11-07T21:20:00.000Z")});
    expect(receipt.liveAcceptance).toBe("blocked");
    expect(receipt.results.every((r) => r.outcome === "provider_unavailable")).toBe(true);
    expect(receipt.results.every((r) => r.matched === null)).toBe(true);
  });
});
