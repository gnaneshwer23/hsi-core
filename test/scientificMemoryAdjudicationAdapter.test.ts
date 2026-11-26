import {test,expect} from "bun:test";
import {createScientificMemoryAdjudicationAdapter} from "../src/db/scientificMemoryAdjudicationAdapter";
import type {adjudicateCapturedPublication} from "../src/scientificMemoryEnvelopeAdjudication";
type Candidate=Awaited<ReturnType<typeof adjudicateCapturedPublication>>;
const id="12345678-1234-1234-1234-123456789abc";
function candidate():Candidate{
 return {adjudication:{doi:"10.1234/fixture-paper",version:"v1"},decision:"quarantine",versionVerified:false,authorityAuthenticated:false,independentCorroborationVerified:false,ingestionAllowed:false,scientificClaimAllowed:false,provenance:["crossref","pubmed","europe_pmc"].map(authority=>({authority,payloadSha256:"a".repeat(64),byteLength:1,checkedAt:"2026-01-01T00:00:00Z",authorityAuthenticated:false,ingestionAllowed:false,scientificClaimAllowed:false}))} as Candidate;
}
test("parameterized staging returns matching decision ID",async()=>{const adapter=createScientificMemoryAdjudicationAdapter({async unsafe(query,params){expect(query).toContain("stage_adjudication($1::uuid");expect(params.slice(0,4)).toEqual([id,"10.1234/fixture-paper","v1","quarantine"]);return [{decision_id:id}];}});expect((await adapter.stage(id,candidate())).decisionId).toBe(id);});
test("invalid fixture ID and duplicate authority never reach database",async()=>{const adapter=createScientificMemoryAdjudicationAdapter({async unsafe(){throw Error("unexpected SQL");}});await expect(adapter.stage("bad",candidate())).rejects.toThrow("Invalid decision ID");const c=candidate();c.provenance[1]=c.provenance[0]!;await expect(adapter.stage(id,c)).rejects.toThrow("Invalid provenance");});
test("unexpected database result rejected",async()=>{const adapter=createScientificMemoryAdjudicationAdapter({async unsafe(){return [];}});await expect(adapter.stage(id,candidate())).rejects.toThrow("Unexpected persistence result");});
