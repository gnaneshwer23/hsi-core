import {describe,expect,test} from "bun:test";
import {assertUniProtAccession,lookupUniProtProtein} from "../src/evidence/uniProtProteinLookup";
import {uniProtProteinDraftNode,resolveUniProtProteinDraft} from "../src/evidence/uniProtOntologyBridge";
import {validateHsiGraphNode} from "../src/livingHealthKnowledgeGraph";

describe("UniProt metadata and draft graph mapping",()=>{
  test("accepts existing ontology accession syntax and rejects invalid IDs",()=>{
    expect(assertUniProtAccession("p01375")).toBe("P01375");
    expect(()=>assertUniProtAccession("../../admin")).toThrow();
  });
  test("retrieves bounded protein metadata and never approves it",async()=>{
    const fetcher=async()=>new Response(JSON.stringify({
      primaryAccession:"P01375",entryType:"UniProtKB reviewed (Swiss-Prot)",
      proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}},
      organism:{scientificName:"Homo sapiens",taxonId:9606},
      genes:[{geneName:{value:"TNF"}}],
    }),{status:200});
    const result=await lookupUniProtProtein({accession:"P01375",fetcher,retrievedAt:"2026-11-10T00:00:00.000Z"});
    expect(result.ok).toBe(true);
    if(!result.ok)return;
    expect(result.protein.geneNames).toEqual(["TNF"]);
    expect(result.protein.graphPromotable).toBe(false);
    const draft=uniProtProteinDraftNode(result.protein);
    expect(()=>validateHsiGraphNode(draft)).not.toThrow();
    expect(draft.sourceIdentifiers[0]?.mapping).toBe("unreviewed");
    expect(resolveUniProtProteinDraft(result.protein,[]).resolution.status).toBe("unresolved");
  });
  test("rejects mismatched source identity",async()=>{
    const fetcher=async()=>new Response(JSON.stringify({
      primaryAccession:"P00000",
      proteinDescription:{recommendedName:{fullName:{value:"Wrong protein"}}},
    }),{status:200});
    expect(await lookupUniProtProtein({accession:"P01375",fetcher}))
      .toMatchObject({ok:false,reason:"invalid_response"});
  });
  test("fails closed on HTTP errors",async()=>{
    const fetcher=async()=>new Response("unavailable",{status:503});
    expect(await lookupUniProtProtein({accession:"P01375",fetcher}))
      .toMatchObject({ok:false,reason:"provider_error"});
  });
});
