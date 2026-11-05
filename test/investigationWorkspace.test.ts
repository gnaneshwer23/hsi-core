import {test,expect} from "bun:test";
import {createInvestigationWorkspaceService} from "../src/server/investigationWorkspaceService";
import {parseCreateInvestigation,parseInvestigationCursor,parseInvestigationWorkspace} from "../src/interrogativeWorkspace";
import {createNeonInvestigationWorkspace} from "../src/db/investigationWorkspaceStore";
import type {InterrogativeInvestigation} from "../src/interrogativeContracts";
import type {TrustedResearchActor} from "../src/db/researchInvestigationStore";
const release={id:"ssc-reviewed-test-release",version:"1.0.0",manifestHash:"a".repeat(64)};
const request={question:"What contributes to fibrosis in systemic sclerosis?",releaseId:release.id,requestId:"a65bd046-cccd-4dda-a957-b8fbb169e062"};
function fixture(loseSaveAcknowledgement=false){
 const records=new Map<string,InterrogativeInvestigation>();let published=true,writes=0,closes=0;
 const identities:Record<string,TrustedResearchActor>={alice:{authenticated:true,principalId:"alice",roles:["researcher"]},bob:{authenticated:true,principalId:"bob",roles:["researcher"]},reviewer:{authenticated:true,principalId:"reviewer",roles:["scientific_reviewer"]},ungranted:{authenticated:true,principalId:"ungranted",roles:[]}};
 const service=createInvestigationWorkspaceService({writesEnabled:true,now:()=>"2026-11-05T12:00:00.000Z",authenticate:async token=>token?identities[token]??null:null,
  repository:()=>({
   releases:async()=>published?[release]:[],
   listOwn:async principal=>({items:[...records.values()].filter(i=>i.actorPrincipal===principal).map(i=>({id:i.id,question:i.question,createdAt:i.createdAt,state:i.state,release:i.release})),nextCursor:null}),
   findOwn:async(principal,id)=>{const i=records.get(id);return i?.actorPrincipal===principal?i:null},
   save:async i=>{writes++;if(records.has(i.id))throw Error("immutable conflict");records.set(i.id,structuredClone(i));if(loseSaveAcknowledgement)throw Error("acknowledgement lost")},close:async()=>{closes++}
  })});
 return {service,records,identities,revokeRelease:()=>{published=false},writes:()=>writes,closes:()=>closes};
}
test("researcher creates, lists and retries the same durable request without inventing evidence",async()=>{
 const f=fixture();const first=await f.service.create({serverSessionToken:"alice",request});
 expect(first.created).toBe(true);const saved=f.records.get(first.id)!;
 expect(saved.actorPrincipal).toBe("alice");expect(saved.release).toEqual(release);expect(saved.state).toBe("draft");expect(saved.review).toBeNull();expect(saved.branches.every(b=>!b.supporting.length&&!b.opposing.length)).toBe(true);
 expect((await f.service.list({serverSessionToken:"alice",cursor:null})).items.map(i=>i.id)).toEqual([first.id]);
 expect(await f.service.create({serverSessionToken:"alice",request})).toEqual({id:first.id,created:false});expect(f.writes()).toBe(1);expect(f.closes()).toBe(3);
});
test("each identity sees only its own list, including reviewer identities",async()=>{
 const f=fixture();const a=await f.service.create({serverSessionToken:"alice",request});
 expect((await f.service.list({serverSessionToken:"bob",cursor:null})).items).toEqual([]);
 expect((await f.service.list({serverSessionToken:"reviewer",cursor:null})).items).toEqual([]);
 const b=await f.service.create({serverSessionToken:"bob",request});expect(b.id).not.toBe(a.id);
 expect((await f.service.list({serverSessionToken:"alice",cursor:null})).items.map(i=>i.id)).toEqual([a.id]);
});
test("reviewer-only, missing and ungranted identities cannot create",async()=>{
 const f=fixture();for(const token of ["reviewer","ungranted","unknown",null])await expect(f.service.create({serverSessionToken:token,request})).rejects.toThrow();
 expect(f.writes()).toBe(0);
 for(const token of [null,"unknown","ungranted"])await expect(f.service.list({serverSessionToken:token,cursor:null})).rejects.toThrow();
});
test("reuse with changed question fails; a fresh request creates a distinct draft",async()=>{
 const f=fixture();await f.service.create({serverSessionToken:"alice",request});
 await expect(f.service.create({serverSessionToken:"alice",request:{...request,question:"A different research question"}})).rejects.toThrow("different investigation");
 await f.service.create({serverSessionToken:"alice",request:{...request,requestId:"b65bd046-cccd-4dda-a957-b8fbb169e062"}});expect(f.records.size).toBe(2);
});
test("revoked or arbitrary releases cannot be used, even on a retry",async()=>{
 const f=fixture();await f.service.create({serverSessionToken:"alice",request});f.revokeRelease();
 await expect(f.service.create({serverSessionToken:"alice",request})).rejects.toThrow("release is unavailable");
 expect((await f.service.list({serverSessionToken:"alice",cursor:null})).canCreate).toBe(false);expect(f.writes()).toBe(1);
 const fresh=fixture();await expect(fresh.service.create({serverSessionToken:"alice",request:{...request,releaseId:"ra-other-release"}})).rejects.toThrow("release is unavailable");
});
test("request cannot inject actor, state, evidence, data class or release hash",()=>{
 for(const extra of [{actorPrincipal:"admin"},{state:"reviewed"},{dataClass:"licensed_partner"},{branches:[]},{manifestHash:"b".repeat(64)}])expect(()=>parseCreateInvestigation({...request,...extra})).toThrow();
 for(const question of [" ","x".repeat(501)])expect(()=>parseCreateInvestigation({...request,question})).toThrow();
 expect(()=>parseCreateInvestigation({...request,requestId:"not-a-uuid"})).toThrow();
});
test("PHI marker questions are rejected without persistence",async()=>{
 const f=fixture();await expect(f.service.create({serverSessionToken:"alice",request:{...request,question:"Patient name and NHS number for review"}})).rejects.toThrow("Patient information");expect(f.writes()).toBe(0);
});
test("lost persistence acknowledgement resolves the committed draft instead of creating another",async()=>{
 const f=fixture(true);const result=await f.service.create({serverSessionToken:"alice",request});expect(result.created).toBe(false);expect(f.records.has(result.id)).toBe(true);expect(f.records.size).toBe(1);
 expect(await f.service.create({serverSessionToken:"alice",request})).toEqual(result);expect(f.writes()).toBe(1);
});
test("read-only service permits listing but rejects creation before opening a repository",async()=>{
 let opened=0;
 const service=createInvestigationWorkspaceService({writesEnabled:false,authenticate:async()=>({authenticated:true,principalId:"alice",roles:["researcher"]}),repository:()=>{opened++;throw Error("must not open")}});
 await expect(service.create({serverSessionToken:"alice",request})).rejects.toThrow("enabled research writes");expect(opened).toBe(0);
});
test("listing forwards the verified owner and exact cursor; repository closes on failures",async()=>{
 const cursor={createdAt:"2026-11-05T12:00:00.123456Z",id:"hsi-interrogative-12345678"};let closed=false;
 const service=createInvestigationWorkspaceService({writesEnabled:false,authenticate:async()=>({authenticated:true,principalId:"verified-owner",roles:["researcher"]}),repository:()=>({
  releases:async()=>[],listOwn:async(principal,received)=>{expect(principal).toBe("verified-owner");expect(received).toEqual(cursor);throw Error("storage unavailable")},findOwn:async()=>null,save:async()=>{},close:async()=>{closed=true}
 })});
 await expect(service.list({serverSessionToken:"server-token",cursor})).rejects.toThrow("storage unavailable");expect(closed).toBe(true);
});
test("database adapter fails closed without a usable session and never opens the invalid target",async()=>{
 const service=createNeonInvestigationWorkspace({databaseUrl:"postgresql://invalid"});
 await expect(service.list({serverSessionToken:null,cursor:null})).rejects.toThrow("Verified research access");
 await expect(service.create({serverSessionToken:null,request})).rejects.toThrow("Verified research access");
});
test("cursor and workspace contracts reject tampered pagination and keep timestamp precision",()=>{
 const cursor={createdAt:"2026-11-05T12:00:00.123456Z",id:"hsi-interrogative-12345678"};
 expect(parseInvestigationCursor(cursor)).toEqual(cursor);
 expect(()=>parseInvestigationCursor({...cursor,principal:"alice"})).toThrow();
 expect(()=>parseInvestigationWorkspace({items:[],releases:[release],nextCursor:cursor,writesEnabled:true,canCreate:true})).toThrow();
 expect(()=>parseInvestigationWorkspace({items:[],releases:[],nextCursor:null,writesEnabled:false,canCreate:true})).toThrow();
});
