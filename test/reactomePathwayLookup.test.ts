import {describe, expect, test} from "bun:test";
import {lookupReactomePathway, lookupReactomePathwaysForUniProt, assertReactomeStableId} from "../src/evidence/reactomePathwayLookup";

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

describe("Reactome pathways for a UniProt protein", () => {
  const il21 = [
    {stId: "R-HSA-9020958", displayName: "Interleukin-21 signaling", speciesName: "Homo sapiens", schemaClass: "Pathway"},
    {stId: "R-HSA-9938027", displayName: "Affinity selection of immunoglobulins", speciesName: "Homo sapiens", schemaClass: "Pathway"},
    {stId: "R-HSA-9020958", displayName: "Interleukin-21 signaling", speciesName: "Homo sapiens", schemaClass: "Pathway"},
  ];
  const ok = (body: unknown) => async () => new Response(JSON.stringify(body), {status: 200});

  test("lists pathways as unreviewed, non-promotable, non-context-specific metadata and de-duplicates", async () => {
    let requested = "";
    const fetcher = async (url: unknown) => { requested = String(url); return new Response(JSON.stringify(il21), {status: 200}); };
    const out = await lookupReactomePathwaysForUniProt({accession: "q9hbe4", fetcher, retrievedAt: "2026-11-13T00:00:00.000Z"});
    expect(requested).toBe("https://reactome.org/ContentService/data/mapping/UniProt/Q9HBE4/pathways?species=9606");
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.pathways.map(p => p.stableId)).toEqual(["R-HSA-9020958", "R-HSA-9938027"]);
      expect(out.result.truncated).toBe(false);
      expect(out.result.membershipInterpretation).toBe("listed_by_provider_not_context_specific");
      expect(out.result.graphPromotable).toBe(false);
      expect(out.result.claimSupport).toBe(false);
      expect(out.result.pathways.every(p => p.reviewState === "unreviewed" && p.graphPromotable === false && p.claimSupport === false)).toBe(true);
    }
  });
  test("truncates to the requested limit and says so", async () => {
    const out = await lookupReactomePathwaysForUniProt({accession: "Q9HBE4", maxPathways: 1, fetcher: ok(il21)});
    expect(out.ok && out.result.pathways.length).toBe(1);
    expect(out.ok && out.result.truncated).toBe(true);
  });
  test("rejects bad accession, taxon and limit before any request", async () => {
    const never = async () => { throw new Error("no request expected"); };
    expect(await lookupReactomePathwaysForUniProt({accession: "../x", fetcher: never})).toMatchObject({ok: false, reason: "invalid_id"});
    expect(await lookupReactomePathwaysForUniProt({accession: "Q9HBE4", taxonId: -1, fetcher: never})).toMatchObject({ok: false, reason: "invalid_id"});
    expect(await lookupReactomePathwaysForUniProt({accession: "Q9HBE4", maxPathways: 0, fetcher: never})).toMatchObject({ok: false, reason: "invalid_id"});
  });
  test("fails closed on a malformed item, wrong class, non-array, oversize and provider errors", async () => {
    const bad = (body: unknown) => lookupReactomePathwaysForUniProt({accession: "Q9HBE4", fetcher: ok(body)});
    expect(await bad([{stId: "../evil", displayName: "x", schemaClass: "Pathway"}])).toMatchObject({ok: false, reason: "invalid_response"});
    expect(await bad([{stId: "R-HSA-1", displayName: "x", schemaClass: "Reaction"}])).toMatchObject({ok: false, reason: "invalid_response"});
    expect(await bad({stId: "R-HSA-1"})).toMatchObject({ok: false, reason: "invalid_response"});
    const big = async () => new Response("[]", {status: 200, headers: {"content-length": "9999999"}});
    expect(await lookupReactomePathwaysForUniProt({accession: "Q9HBE4", fetcher: big})).toMatchObject({ok: false, reason: "invalid_response"});
    const notFound = async () => new Response("{}", {status: 404});
    expect(await lookupReactomePathwaysForUniProt({accession: "Q9HBE4", fetcher: notFound})).toMatchObject({ok: false, reason: "provider_error"});
    const down = async () => { throw new Error("network"); };
    expect(await lookupReactomePathwaysForUniProt({accession: "Q9HBE4", fetcher: down})).toMatchObject({ok: false, reason: "network_error"});
  });
});
