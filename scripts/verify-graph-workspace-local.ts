/** End-to-end check of src/db/graphWorkspaceStore.ts against a DISPOSABLE local PostgreSQL prepared with
 *  db/verify/graph_workspace_integration_setup.sql. Never run it against Neon: it connects as the least-privilege
 *  runtime role over a local socket, and it refuses any host that is not a local socket path.
 *    HSI_LOCAL_PG_SOCKET_DIR=/tmp/pgtest HSI_LOCAL_PG_DB=hsi_graph_it bun scripts/verify-graph-workspace-local.ts
 */
import {readFileSync} from "node:fs";
import {SQL} from "bun";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {buildInvestigationRecord,buildSelectionContext} from "../src/knowledgeGraph/graphAgents";
import {createGraphWorkspace,type UnsafeSql} from "../src/db/graphWorkspaceStore";
import type {CandidateMappingsFile} from "../src/ontology/mappingReview";

const dir=process.env.HSI_LOCAL_PG_SOCKET_DIR,db=process.env.HSI_LOCAL_PG_DB;
if(!dir||!db||!dir.startsWith("/")||/neon|amazonaws|\./.test(dir)){console.error("Set HSI_LOCAL_PG_SOCKET_DIR (an absolute local directory) and HSI_LOCAL_PG_DB.");process.exit(2)}
const connect=(user:string)=>new SQL({path:`${dir}/.s.PGSQL.5432`,database:db,username:user,max:1} as never);
const runtime=connect("hsi_graph_runtime"),admin=connect(process.env.USER??"postgres");
const A="tokenAAAAAAAAAAAAAAAA",B="tokenBBBBBBBBBBBBBBBB";
let failed=0;const ok=(name:string,cond:boolean)=>{console.log((cond?"PASS ":"FAIL ")+name);if(!cond)failed++};
const rejects=async(name:string,p:()=>Promise<unknown>,frag:string)=>{try{await p();ok(name+" (should have failed)",false)}catch(e){ok(name,String(e instanceof Error?e.message:e).toLowerCase().includes(frag.toLowerCase()))}};

const g=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const file=JSON.parse(readFileSync("research/ontology/candidate-mappings.v1.json","utf8")) as CandidateMappingsFile;
const cand=g.edges.filter(e=>e.kind==="source_candidate");
const rec=(q:string)=>buildInvestigationRecord(g,buildSelectionContext(g,{investigationId:"inv-it-001",graphVersion:g.version,question:q,edgeIds:[cand[0]!.id,cand[1]!.id]}));
const a=createGraphWorkspace(runtime as unknown as UnsafeSql,A),b=createGraphWorkspace(runtime as unknown as UnsafeSql,B);

const r1=await a.investigations.save(g,rec("What does the graph record here?"));ok("save revision 1",r1.status==="saved"&&r1.saved.revision===1);
ok("saving the identical record is a no-op",(await a.investigations.save(g,rec("What does the graph record here?"))).status==="unchanged");
const r2=await a.investigations.save(g,rec("A different question about this pair?"));ok("save revision 2 chained to 1",r2.status==="saved"&&r2.saved.revision===2&&r2.saved.previousDigest===r1.saved.digest);
const list=await a.investigations.list();ok("list shows one investigation at revision 2",list.length===1&&list[0]!.latestRevision===2);
const got=await a.investigations.get("inv-it-001",1);ok("get returns an intact revision with unchanged digest",got?.digest===r1.saved.digest&&got.reviewStatus==="unreviewed");
ok("another researcher sees nothing of it",(await b.investigations.list()).length===0&&(await b.investigations.get("inv-it-001",1))===null);
await rejects("a forged token is refused by the database",()=>createGraphWorkspace(runtime as unknown as UnsafeSql,"forgedtokenforgedtoken").investigations.list(),"invalid authenticated session");
await rejects("the runtime role cannot read tables directly",()=>runtime.unsafe("SELECT * FROM public.hsi_graph_investigations"),"permission denied");

const withCand=file.mappings.filter(m=>m.candidates.length>0),target=withCand.find(m=>m.candidates[0]!.id==="MONDO:0008383")??withCand[0]!;
const input={conceptId:target.conceptId,decision:"accept_candidate" as const,ontologyId:target.candidates[0]!.id,reason:"Label and definition match the disease concept.",reviewerLabel:"Curator A"};
if(!target.candidates[0]!.id.startsWith("MONDO:")){console.log("SKIP recommendations: first candidate is not a MONDO term seeded by the setup script");}
else{
 const d1=await a.recommendations.record(file,input);ok("record a recommendation",d1.status==="saved"&&d1.decision.revision===1&&d1.decision.exactMappingApproved===false);
 ok("same recommendation again is a no-op",(await a.recommendations.record(file,input)).status==="unchanged");
 const d2=await a.recommendations.record(file,{...input,decision:"reject_candidate",reason:"On reflection the term is broader than the concept."});ok("a changed decision chains to the first",d2.decision.revision===2&&d2.decision.previousDigest===d1.decision.digest);
 const listed=(await a.recommendations.list(file)).get(target.conceptId)!;ok("list returns both revisions, identity verified by the server",listed.length===2&&listed.every(x=>x.identityVerifiedByServer)&&listed.every(x=>x.decision.status==="curator_recommendation_unverified"));
 ok("another researcher sees none",(await b.recommendations.list(file)).size===0);
}
const hits=await a.ontology.lookup("MONDO","v2026-11-03","Scleroderma");ok("ontology lookup finds a term by exact synonym",hits.length===1&&hits[0]!.id==="MONDO:0005100");
await rejects("an unreasonably short lookup is refused",()=>a.ontology.lookup("MONDO","v2026-11-03","ab"),"label must be");

// Tampering below the application: a superuser edits a stored record. The adapter must refuse to return it.
await admin.unsafe("ALTER TABLE public.hsi_graph_investigations DISABLE TRIGGER hsi_graph_investigations_append_only");
await admin.unsafe(`UPDATE public.hsi_graph_investigations SET record=jsonb_set(record,'{context,question}','"Edited underneath the application"') WHERE investigation_id='inv-it-001' AND revision=1`);
await rejects("a record edited in the database is refused (digest mismatch)",()=>a.investigations.get("inv-it-001",1),"digest");
await admin.unsafe("ALTER TABLE public.hsi_graph_investigations ENABLE TRIGGER hsi_graph_investigations_append_only");

await runtime.close();await admin.close();
console.log(failed?`${failed} check(s) failed`:"ALL INTEGRATION CHECKS PASSED");process.exit(failed?1:0);
