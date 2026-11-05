import {test,expect} from "bun:test";
import {contextFixture,investigation,released,hash} from "./fixtures/investigationGraphContext";
import {verifyInvestigationGraphContext,projectInvestigationGraphContext,validateReleasedEvidence,canonicalGraphContext,type InvestigationGraphContext} from "../src/investigationGraphContext";
import {createInvestigationGraphContextService} from "../src/server/investigationGraphContextService";
import {loadOrCaptureInvestigationGraphContext} from "../src/db/investigationGraphContextStore";
function serviceFixture(writesEnabled=true){
 let saved:InvestigationGraphContext|null=null,changed=false,revoked=false,writes=0;const i=investigation();
 const handler=createInvestigationGraphContextService({writesEnabled,now:()=>"2026-11-05T03:00:00.000Z",workingIndex:{version:"d".repeat(64),claims:[{id:"HSI-C-SSC-001",pmid:"123",disease:"systemic_sclerosis"}]},
  authenticate:async token=>token&&!revoked?{authenticated:true,principalId:token,roles:token==="reviewer"?["scientific_reviewer"]:["researcher"]}:null,
  investigation:async(token,id)=>{if(id!==i.id||(token!=="alice"&&!(token==="reviewer"&&i.state==="awaiting_scientific_review")))throw Error("Denied");return i},
  evidence:async(_r,_q,d)=>{const e=released(d);if(changed)e.bundle.context.provenance.retrievedAt="2026-11-05T00:01:00.000Z";return e},comparison:async()=>released("rheumatoid_arthritis"),
  load:async()=>saved,save:async(_actor,_record,value)=>{writes++;saved??=structuredClone(value);return saved}
 });
 return {handler,i,change:()=>{changed=true},revoke:()=>{revoked=true},writes:()=>writes};
}
test("pinned snapshot projects graph, mechanism dossier and disease comparison with source context intact",async()=>{
 const c=contextFixture();await verifyInvestigationGraphContext(c,investigation(),async t=>hash(t));
 const p=projectInvestigationGraphContext(c);expect(p.graph.relationships[0]!.causalClaim).toBe(false);expect(p.dossier.edges[0]!.evidence[0]!.sources[0]!.sourceVersion).toBe("c".repeat(64));
 expect(p.dossier.status).toBe("research_draft");expect(p.comparison.sharedMechanismCandidates[0]!.interpretation).toBe("comparison_candidate_only");expect(c.primary.bundle.relationships[0]!.context.species).toBe("human");expect(c.comparison!.bundle.relationships[0]!.context.species).toBe("mouse");
});
test("capture is append-once and reopening returns the exact content hash",async()=>{
 const f=serviceFixture();const args={serverSessionToken:"alice",investigationId:f.i.id,capture:false};
 expect(await f.handler(args)).toMatchObject({status:"not_captured",canCapture:true,context:null});
 const first=await f.handler({...args,capture:true}),second=await f.handler(args),retry=await f.handler({...args,capture:true});
 expect(second.context!.contentHash).toBe(first.context!.contentHash);expect(retry.context!.contentHash).toBe(first.context!.contentHash);expect(f.writes()).toBe(1);
});
test("another researcher and reviewer cannot capture an owner's context",async()=>{
 const f=serviceFixture();for(const token of [null,"bob","reviewer"])await expect(f.handler({serverSessionToken:token,investigationId:f.i.id,capture:true})).rejects.toThrow();expect(f.writes()).toBe(0);
});
test("direct adapter capture refuses the production host even with a true internal write flag",async()=>{
 await expect(loadOrCaptureInvestigationGraphContext({serverSessionToken:null,investigationId:investigation().id,capture:true,writesEnabled:true,neonProjectId:"red-wave-06625195",databaseUrl:"postgresql://test:never-used@ep-restless-dew-zas989pv.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require"})).rejects.toThrow("approved HSI staging writes");
});
test("staging writes remain required, and review readers cannot capture or change the context",async()=>{
 const readonly=serviceFixture(false),args={serverSessionToken:"alice",investigationId:readonly.i.id,capture:false};expect((await readonly.handler(args)).canCapture).toBe(false);await expect(readonly.handler({...args,capture:true})).rejects.toThrow("denied");expect(readonly.writes()).toBe(0);
 const f=serviceFixture();await f.handler({...args,investigationId:f.i.id,capture:true});f.i.state="awaiting_scientific_review";
 expect((await f.handler({serverSessionToken:"reviewer",investigationId:f.i.id,capture:false})).status).toBe("saved");await expect(f.handler({serverSessionToken:"reviewer",investigationId:f.i.id,capture:true})).rejects.toThrow("denied");
});
test("revoked research access or changed source data denies an existing snapshot",async()=>{
 const f=serviceFixture(),args={serverSessionToken:"alice",investigationId:f.i.id,capture:true};await f.handler(args);f.change();await expect(f.handler({...args,capture:false})).rejects.toThrow("changed");f.revoke();await expect(f.handler({...args,capture:false})).rejects.toThrow("Verified research access");
});
test("snapshot mismatch and passage tampering fail even with a recomputed outer hash",async()=>{
 const c=contextFixture();await expect(verifyInvestigationGraphContext(c,{...investigation(),release:{...investigation().release,version:"9.0.0"}},async t=>hash(t))).rejects.toThrow();
 c.primary.bundle.passages[0]!.text="Tampered passage";const {contentHash,...body}=c;c.contentHash=hash(canonicalGraphContext(body));await expect(verifyInvestigationGraphContext(c,investigation(),async t=>hash(t))).rejects.toThrow("passage hash");
});
test("unreviewed, ambiguous, cross-disease, PHI and non-public evidence are refused",()=>{
 for(const mutate of [(e:ReturnType<typeof released>)=>{e.bundle.claims[0]!.curation="unreviewed"},(e:ReturnType<typeof released>)=>{e.studyContexts["rel-test"]="Systemic sclerosis and rheumatoid arthritis"},(e:ReturnType<typeof released>)=>{e.bundle.context.containsPhi=true as false},(e:ReturnType<typeof released>)=>{e.bundle.context.dataClass="licensed_real"}]){const e=released();mutate(e);expect(()=>validateReleasedEvidence(e)).toThrow()}
 const c=contextFixture();c.comparison=released();expect(()=>projectInvestigationGraphContext(c)).toThrow();
});
