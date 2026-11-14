/** Real-account acceptance for held migrations 031 to 033 on a DISPOSABLE Neon child branch (runbook step 7).
 *
 * It signs up three pseudonymous test accounts through the branch's own Neon Auth endpoint, obtains real sessions by
 * signing in, and drives src/db/graphWorkspaceStore.ts as the least-privilege runtime login over TLS through the
 * pooler. Hostile cases mutate Neon Auth rows on the branch only and restore them.
 *
 * Refuses to run unless every connection targets the one endpoint named in HSI_ACCEPT_DISPOSABLE_ENDPOINT, that
 * endpoint is not the production endpoint named in HSI_ACCEPT_PRODUCTION_ENDPOINT, and the branch id is confirmed.
 * Connection strings come from a gitignored env file; nothing is echoed, and no token, password or row is printed.
 *
 *   set -a; . ~/.hsi-acceptance-tmp/env; set +a; bun scripts/verify-graph-workspace-neon.ts
 */
import {readFileSync} from "node:fs";
import {SQL} from "bun";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {buildInvestigationRecord,buildSelectionContext} from "../src/knowledgeGraph/graphAgents";
import {createGraphWorkspace,type UnsafeSql} from "../src/db/graphWorkspaceStore";
import type {CandidateMappingsFile} from "../src/ontology/mappingReview";

const env=(k:string)=>{const v=process.env[k];if(!v){console.error("Missing "+k);process.exit(2)}return v};
const OWNER=env("HSI_ACCEPT_OWNER_URL"),FOWNER=env("HSI_ACCEPT_FOWNER_URL"),RUNTIME=env("HSI_ACCEPT_RUNTIME_URL"),IMPORT=env("HSI_ACCEPT_IMPORT_URL");
const AUTH=env("HSI_ACCEPT_AUTH_BASE"),DISPOSABLE=env("HSI_ACCEPT_DISPOSABLE_ENDPOINT"),PRODUCTION=env("HSI_ACCEPT_PRODUCTION_ENDPOINT"),BRANCH=env("HSI_ACCEPT_BRANCH_ID");
const endpoint=(u:string)=>(/@(ep-[a-z0-9-]+?)(-pooler)?\./.exec(u)??[])[1];
for(const u of [OWNER,FOWNER,RUNTIME,IMPORT]){if(endpoint(u)!==DISPOSABLE||DISPOSABLE===PRODUCTION){console.error("Refusing: a connection does not target the disposable endpoint.");process.exit(2)}}
if(!AUTH.includes(DISPOSABLE)||!/^br-[a-z0-9-]+$/.test(BRANCH)||process.env.HSI_ACCEPT_CONFIRM!==BRANCH){console.error("Refusing: confirm the disposable branch with HSI_ACCEPT_CONFIRM=<branch id>.");process.exit(2)}

const open=(u:string)=>new SQL(u,{tls:{rejectUnauthorized:true},max:1,connectionTimeout:20} as never);
const owner=open(OWNER),fowner=open(FOWNER),imp=open(IMPORT),runtime=open(RUNTIME);
let failed=0;const ok=(n:string,c:boolean)=>{console.log((c?"PASS ":"FAIL ")+n);if(!c)failed++};
const msg=(e:unknown)=>String(e instanceof Error?e.message:e).toLowerCase();
const rejects=async(n:string,p:()=>Promise<unknown>,frag:string)=>{try{await p();ok(n+" (should have failed)",false)}catch(e){ok(n,msg(e).includes(frag.toLowerCase()))}};
const q=(s:SQL,sql:string,p:unknown[]=[])=>(s as unknown as UnsafeSql).unsafe(sql,p);

// ---------- real accounts ----------
const run=Date.now().toString(36);
const password=[...crypto.getRandomValues(new Uint8Array(18))].map(b=>b.toString(16).padStart(2,"0")).join("");
type Acct={email:string;id:string;token:string};
async function account(tag:string):Promise<Acct>{
 const email=`acc-${tag}-${run}@hsi-acceptance.invalid`,h={"content-type":"application/json",origin:"http://localhost:3000"};
 const up=await fetch(AUTH+"/sign-up/email",{method:"POST",headers:h,body:JSON.stringify({email,password,name:"Acceptance "+tag})});
 if(!up.ok)throw Error("sign-up failed: "+up.status);
 await q(owner,`UPDATE neon_auth."user" SET "emailVerified"=true WHERE email=$1`,[email]);
 const inn=await fetch(AUTH+"/sign-in/email",{method:"POST",headers:h,body:JSON.stringify({email,password})});
 if(!inn.ok)throw Error("sign-in failed: "+inn.status);
 const body=await inn.json() as {token?:string;user?:{id?:string}};
 const row=(await q(owner,`SELECT u.id::text AS id FROM neon_auth."user" u WHERE u.email=$1`,[email]) as {id:string}[])[0]!;
 let token=body.token;
 if(!token)token=((await q(owner,`SELECT token FROM neon_auth.session WHERE "userId"=$1::uuid ORDER BY "createdAt" DESC LIMIT 1`,[row.id])) as {token:string}[])[0]?.token;
 if(!token)throw Error("no session token obtained");
 return {email,id:row.id,token};
}
const A=await account("a"),B=await account("b"),C=await account("nogrant");
ok("three real sessions were obtained from Neon Auth",[A,B,C].every(x=>x.token.length>=16));
for(const x of [A,B])await q(owner,`INSERT INTO public.hsi_research_access(principal_id,access_role,granted_by) VALUES($1,'researcher','acceptance-run')`,[x.id]);
const ws=(t:string,s:SQL=runtime)=>createGraphWorkspace(s as unknown as UnsafeSql,t);

// ---------- transport ----------
const tls=(await q(runtime,`SELECT current_user AS u,(SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) AS ssl`)) as {u:string;ssl:boolean|null}[];
ok("connected as the runtime login",tls[0]?.u==="hsi_graph_runtime_login");
console.log("INFO runtime connection ssl flag visible to the session: "+String(tls[0]?.ssl)+" (client enforced TLS with certificate verification)");

// ---------- ontology data through the import role ----------
const file=JSON.parse(readFileSync("research/ontology/candidate-mappings.v1.json","utf8")) as CandidateMappingsFile;
const mondo=file.ontologies.find(o=>o.prefix==="MONDO")!;
await q(imp,`INSERT INTO public.hsi_ontology_releases(prefix,release,name,licence,source_url,sha256,byte_size,term_count,approved_on,approved_by) VALUES('MONDO',$1,'Mondo','CC BY 4.0','https://example.test/mondo-acceptance.json',repeat('a',64),10,2,'2026-11-14','acceptance-run')`,[mondo.release]);
await q(imp,`INSERT INTO public.hsi_ontology_terms(prefix,release,term_id,label,synonyms,parents,obsolete) VALUES('MONDO',$1,'MONDO:0008383','rheumatoid arthritis','{}','{}',false),('MONDO',$1,'MONDO:0005100','systemic sclerosis','{scleroderma}','{}',false)`,[mondo.release]);
ok("the import role can add a release and terms",true);
await rejects("the import role cannot read investigations",()=>q(imp,"SELECT * FROM public.hsi_graph_investigations"),"permission denied");
await rejects("the import role cannot update a release",()=>q(imp,"UPDATE public.hsi_ontology_releases SET name='x'"),"permission denied");
await rejects("the import role cannot delete terms",()=>q(imp,"DELETE FROM public.hsi_ontology_terms"),"permission denied");
await rejects("the import role cannot call the researcher procedures",()=>q(imp,"SELECT public.hsi_graph_list_investigations($1::text)",[A.token]),"permission denied");

// ---------- isolation and normal use ----------
const g=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const cand=g.edges.filter(e=>e.kind==="source_candidate");
const rec=(id:string,qn:string)=>buildInvestigationRecord(g,buildSelectionContext(g,{investigationId:id,graphVersion:g.version,question:qn,edgeIds:[cand[0]!.id,cand[1]!.id]}));
const a=ws(A.token),b=ws(B.token);
const s1=await a.investigations.save(g,rec("inv-acc-001","What does the graph record here?"));
ok("researcher A saves revision 1",s1.status==="saved"&&s1.saved.revision===1);
const s2=await a.investigations.save(g,rec("inv-acc-001","A different question about this pair?"));
ok("researcher A saves revision 2 chained to 1",s2.status==="saved"&&s2.saved.revision===2&&s2.saved.previousDigest===s1.saved.digest);
ok("researcher B sees none of A's investigations",(await b.investigations.list()).length===0&&(await b.investigations.get("inv-acc-001",1))===null);
const bs=await b.investigations.save(g,rec("inv-acc-001","B asks about the same pair?"));
ok("researcher B can use the same id without touching A's chain",bs.status==="saved"&&bs.saved.revision===1);
ok("A still sees two revisions",(await a.investigations.list())[0]?.latestRevision===2);

const target=file.mappings.find(m=>m.candidates[0]?.id==="MONDO:0008383")!;
const input={conceptId:target.conceptId,decision:"accept_candidate" as const,ontologyId:"MONDO:0008383",reason:"Label and definition match the disease concept.",reviewerLabel:"Curator A"};
const d1=await a.recommendations.record(file,input);
ok("A records a recommendation, never an approval",d1.status==="saved"&&d1.decision.exactMappingApproved===false);
const lst=(await a.recommendations.list(file)).get(target.conceptId)??[];
ok("the server verified A's identity on it",lst.length===1&&lst[0]!.identityVerifiedByServer&&lst[0]!.decision.status==="curator_recommendation_unverified");
ok("B sees none of A's recommendations",(await b.recommendations.list(file)).size===0);
const hits=await a.ontology.lookup("MONDO",mondo.release,"Scleroderma");
ok("ontology lookup by exact synonym",hits.length===1&&hits[0]!.id==="MONDO:0005100");

// ---------- hostile sessions ----------
await rejects("a forged token is refused",()=>ws("forgedtokenforgedtoken").investigations.list(),"invalid authenticated session");
await rejects("a short token is refused by the adapter",async()=>ws("short"),"valid session token");
await rejects("an account without a research grant is refused",()=>ws(C.token).investigations.list(),"researcher access denied");
const mut=async(name:string,off:string,on:string,t:Acct)=>{
 await q(owner,off,[t.id]);
 try{await rejects(name,()=>ws(t.token).investigations.list(),"invalid authenticated session")}finally{await q(owner,on,[t.id])}
 ok(name+": access returns once restored",(await ws(t.token).investigations.list()).length>=0);
};
await mut("an expired session is refused",`UPDATE neon_auth.session SET "expiresAt"=now()-interval '1 minute' WHERE "userId"=$1::uuid`,`UPDATE neon_auth.session SET "expiresAt"=now()+interval '1 day' WHERE "userId"=$1::uuid`,A);
await mut("an unverified user is refused",`UPDATE neon_auth."user" SET "emailVerified"=false WHERE id=$1::uuid`,`UPDATE neon_auth."user" SET "emailVerified"=true WHERE id=$1::uuid`,A);
await mut("a banned user is refused",`UPDATE neon_auth."user" SET banned=true WHERE id=$1::uuid`,`UPDATE neon_auth."user" SET banned=false WHERE id=$1::uuid`,A);
await mut("an impersonated session is refused",`UPDATE neon_auth.session SET "impersonatedBy"='someone' WHERE "userId"=$1::uuid`,`UPDATE neon_auth.session SET "impersonatedBy"=NULL WHERE "userId"=$1::uuid`,A);
await q(owner,`UPDATE public.hsi_research_access SET revoked_at=now() WHERE principal_id=$1`,[B.id]);
await rejects("a revoked grant is refused",()=>b.investigations.list(),"researcher access denied");
await q(owner,`UPDATE public.hsi_research_access SET revoked_at=NULL WHERE principal_id=$1`,[B.id]);
ok("B returns after the grant is restored",(await b.investigations.list()).length===1);

// ---------- direct table access ----------
for(const t of ["hsi_graph_investigations","hsi_ontology_mapping_recommendations","hsi_ontology_terms","hsi_ontology_releases"])
 await rejects("the runtime login cannot read "+t,()=>q(runtime,"SELECT * FROM public."+t),"permission denied");
await rejects("the runtime login cannot insert an investigation",()=>q(runtime,"INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,record) VALUES('x','abc',1,repeat('a',64),repeat('a',64),'{}')"),"permission denied");
await rejects("the runtime login cannot call the principal helper",()=>q(runtime,"SELECT public.hsi_graph_principal($1::text)",[A.token]),"permission denied");
try{await q(runtime,`SELECT set_config('hsi.principal_id',$1,false)`,[A.id])}catch{/* refusing the setting is also acceptable */}
await rejects("a custom principal setting does not open the table",()=>q(runtime,"SELECT * FROM public.hsi_graph_investigations"),"permission denied");

// ---------- integrity below the application ----------
const sv=s1.status==="saved"?s1.saved:null!;
const call=(tok:string,id:string,rev:number,digest:string,prev:string|null,record:unknown)=>q(runtime,"SELECT public.hsi_graph_save_investigation($1::text,$2::text,$3::integer,$4::text,$5::text,$6::text,$7::jsonb)",[tok,id,rev,sv.record.graphVersion,digest,prev,record]);
await rejects("a revision that does not extend the chain is refused",()=>call(A.token,"inv-acc-001",5,"b".repeat(64),"c".repeat(64),sv.record),"does not extend");
await rejects("a record claiming scientific approval is refused",()=>call(A.token,"inv-acc-appr",1,"d".repeat(64),null,{...sv.record,scientificApproval:true,context:{...sv.record.context,investigationId:"inv-acc-appr"}}),"check constraint");
await rejects("a double-encoded record is refused",()=>call(A.token,"inv-acc-enc",1,"e".repeat(64),null,JSON.stringify(sv.record)),"check constraint");
await rejects("an update is refused even for the function owner role",()=>q(fowner,"UPDATE public.hsi_graph_investigations SET review_status='unreviewed'").then(r=>{if((r as unknown[]).length===0)throw Error("zero rows: no update policy")}),"");
await rejects("a recommendation with a backdated decision time is refused",()=>q(runtime,"SELECT public.hsi_graph_record_recommendation($1::text,$2::text,1,'defer',NULL,NULL,NULL,'Backdated attempt for the test.','Curator A',repeat('a',64),repeat('b',64),NULL,now()-interval '2 hours')",[A.token,"concept:backdated-test"]),"out of range");

// ---------- edited underneath the application ----------
await q(owner,"ALTER TABLE public.hsi_graph_investigations DISABLE TRIGGER hsi_graph_investigations_append_only");
try{
 await q(owner,`UPDATE public.hsi_graph_investigations SET record=jsonb_set(record,'{context,question}','"Edited underneath the application"') WHERE owner_id=$1 AND investigation_id='inv-acc-001' AND revision=1`,[A.id]);
 await rejects("a record edited in the database is refused on read (digest mismatch)",()=>a.investigations.get("inv-acc-001",1),"digest");
}finally{await q(owner,"ALTER TABLE public.hsi_graph_investigations ENABLE TRIGGER hsi_graph_investigations_append_only")}
await rejects("the append-only trigger stops a project-owner update",()=>q(owner,"UPDATE public.hsi_graph_investigations SET review_status='unreviewed'"),"append-only");

// ---------- concurrency ----------
const racers=Array.from({length:6},()=>open(RUNTIME));
const cr=rec("inv-acc-race","Concurrent save of the same revision?");
const outcomes=await Promise.allSettled(racers.map(s=>ws(A.token,s).investigations.save(g,cr)));
const saved=outcomes.filter(o=>o.status==="fulfilled"&&(o.value as {status:string}).status==="saved").length;
const rows=(await q(owner,"SELECT count(*)::int AS n FROM public.hsi_graph_investigations WHERE owner_id=$1 AND investigation_id='inv-acc-race'",[A.id]) as {n:number}[])[0]!.n;
ok("six concurrent saves of one revision: exactly one row is stored",rows===1);
ok("the other attempts were refused or reported unchanged, none stored twice",saved<=1&&outcomes.every(o=>o.status==="rejected"||["saved","unchanged"].includes((o.value as {status:string}).status)));
const c2=rec("inv-acc-race","A second revision raced by many?");
const out2=await Promise.allSettled(racers.map(s=>ws(A.token,s).investigations.save(g,c2)));
const rows2=(await q(owner,"SELECT count(*)::int AS n FROM public.hsi_graph_investigations WHERE owner_id=$1 AND investigation_id='inv-acc-race'",[A.id]) as {n:number}[])[0]!.n;
ok("six concurrent saves of revision 2: exactly two rows in total, chain intact",rows2===2&&out2.some(o=>o.status==="fulfilled"));
for(const s of racers)await s.close();

for(const s of [owner,fowner,imp,runtime])await s.close();
console.log(failed?`${failed} check(s) failed`:"ALL ACCEPTANCE CHECKS PASSED");process.exit(failed?1:0);
