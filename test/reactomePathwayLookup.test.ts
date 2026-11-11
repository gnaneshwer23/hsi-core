import {describe, expect, test} from "bun:test";
import {lookupReactomePathway, assertReactomeStableId} from "../src/evidence/reactomePathwayLookup";

describe("Reactome pathway metadata adapter", () => {
  test("validates stable identifiers", () => {
    expect(assertReactomeStableId("r-hsa-199420")).toBe("R-HSA-199420");
    expect(() => assertReactomeStableId("../admin")).toThrow();
  });
  test("returns unreviewed, non-promotable pathway metadata", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      stId: "R-HSA-199420", displayName: "Apoptosis", schemaClass: "Pathway",
      species: [{displayName: "Homo sapiens"}],
    }), {status: 200, headers: {"content-type": "application/json"}});
    const result = await lookupReactomePathway({stableId:"R-HSA-199420", fetcher, retrievedAt:"2026-11-10T00:00:00.000Z"});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pathway.displayName).toBe("Apoptosis");
      expect(result.pathway.speciesName).toBe("Homo sapiens");
      expect(result.pathway.graphPromotable).toBe(false);
      expect(result.pathway.scientificApproval).toBe(false);
      expect(result.pathway.claimSupport).toBe(false);
    }
  });
  test("rejects mismatched provider identity", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      stId: "R-HSA-111111", displayName: "Different pathway", schemaClass: "Pathway",
    }), {status: 200});
    const result = await lookupReactomePathway({stableId:"R-HSA-199420", fetcher});
    expect(result).toMatchObject({ok:false, reason:"invalid_response"});
  });
  test("fails closed on provider errors", async () => {
    const fetcher = async () => new Response("Unavailable", {status:503});
    const result = await lookupReactomePathway({stableId:"R-HSA-199420", fetcher});
    expect(result).toMatchObject({ok:false, reason:"provider_error"});
  });
});
