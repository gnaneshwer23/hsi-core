/** Two-account isolation suite for migration 034 (ADR-012/013/014) against a DISPOSABLE local PostgreSQL prepared
 *  with db/verify/034_investigation_store_setup.sql. It connects as the least-privilege runtime role and refuses any
 *  host that is not a local socket directory or 127.0.0.1. Never point it at Neon.
 *    HSI_LOCAL_PG_SOCKET_DIR=/tmp HSI_LOCAL_PG_DB=hsi_store_it bun scripts/verify-investigation-store-local.ts
 *    HSI_LOCAL_PG_HOST=127.0.0.1 HSI_LOCAL_PG_DB=hsi_store_it bun scripts/verify-investigation-store-local.ts   (CI)
 */
import {SQL} from "bun";
import {createInvestigationStore,type StoreSql} from "../src/db/investigationStore";

const dir=process.env.HSI_LOCAL_PG_SOCKET_DIR,host=process.env.HSI_LOCAL_PG_HOST,db=process.env.HSI_LOCAL_PG_DB;
const localHost=host==="127.0.0.1"||host==="localhost";
if(!db||(!localHost&&(!dir||!dir.startsWith("/")||/neon|amazonaws/.test(dir)))){
 console.error("Set HSI_LOCAL_PG_DB and either HSI_LOCAL_PG_SOCKET_DIR (an absolute local directory) or HSI_LOCAL_PG_HOST=127.0.0.1.");process.exit(2);
}
const connect=(user:string)=>localHost
 ?new SQL({hostname:host,port:5432,database:db,username:user,password:process.env.PGPASSWORD,max:1} as never)
 :new SQL({path:`${dir}/.s.PGSQL.5432`,database:db,username:user,max:1} as never);
const runtime=connect("hsi_graph_runtime"),owner=connect("hsi_store_owner");
const sql=runtime as unknown as StoreSql;
const T={A:"tokenAAAAAAAAAAAAAAAA",B:"tokenBBBBBBBBBBBBBBBB",C:"tokenCCCCCCCCCCCCCCCC",D:"tokenDDDDDDDDDDDDDDDD",E:"tokenEEEEEEEEEEEEEEEE",F:"tokenFFFFFFFFFFFFFFFF",X:"tokenEXPIREDEXPIRED00",I:"tokenIMPERSONATED0000"};
const B_ID="00000000-0000-4000-8000-00000000000b";
const GV="a".repeat(64);
let failed=0,passed=0;
const ok=(name:string,cond:boolean)=>{console.log((cond?"PASS ":"FAIL ")+name);cond?passed++:failed++};
const rejects=async(name:string,p:()=>Promise<unknown>,frag:string)=>{
 try{await p();ok(name+" (should have failed)",false)}
 catch(e){const m=String(e instanceof Error?e.message:e).toLowerCase();ok(name+(m.includes(frag.toLowerCase())?"":` [got: ${m}]`),m.includes(frag.toLowerCase()))}
};
const a=createInvestigationStore(sql,T.A),b=createInvestigationStore(sql,T.B),f=createInvestigationStore(sql,T.F);

try{
 // Identity (ADR-013)
 for(const [name,t] of [["forged token",'forgedtokenforgedtoken'],["expired session",T.X],["impersonated session",T.I],["unverified email",T.D],["banned user",T.E]] as const)
  await rejects(`a ${name} is refused by the database`,()=>createInvestigationStore(sql,t).list(),"invalid authenticated session");
 await rejects("a verified user without research access is refused",()=>createInvestigationStore(sql,T.C).list(),"researcher access denied");
 await rejects("a forged session setting changes nothing",async()=>{await runtime.unsafe("SELECT set_config('hsi.live_owner_id',$1,false)",[B_ID]);return createInvestigationStore(sql,"forgedtokenforgedtoken").list()},"invalid authenticated session");
 for(const t of ["hsi_investigations","hsi_investigation_events","hsi_investigation_outputs","hsi_memberships","hsi_scopes"])
  await rejects(`the runtime role cannot read ${t} directly`,()=>runtime.unsafe(`SELECT * FROM public.${t}`),"permission denied");
 await rejects("the runtime role cannot call the operator bootstrap",()=>runtime.unsafe("SELECT public.hsi_membership_bootstrap($1,'ra','x')",[B_ID]),"permission denied");

 // One investigation store (ADR-012)
 const id=await a.create({question:"Does IL-21 drive CD28null expansion in SSc?",entities:["IL21","CD28"],graphVersion:GV});
 ok("A creates an investigation",/^[0-9a-f-]{36}$/.test(id));
 const s1=await a.appendEvent(id,{kind:"note",payload:{text:"Start from the published neighbourhood."}});
 ok("events are numbered in order after the created event",s1===2);
 const v1=await a.addOutput(id,{section:"01",body:{summary:"candidate only"},lineage:{graphVersion:GV,edges:["e1"]}});
 const v2=await a.addOutput(id,{section:"01",body:{summary:"revised, still candidate"},lineage:{graphVersion:GV,edges:["e1","e2"]}});
 ok("a section gets a new version instead of an edit",v1===1&&v2===2);
 const got=await a.get(id);
 ok("A reads back the whole record",got!==null&&got.access==="owner"&&got.outputs.length===2&&got.events.map(e=>e.kind).join()==="created,note,output,output");
 ok("each event carries a payload digest",got!.events.every(e=>/^[a-f0-9]{64}$/.test(e.payloadDigest)));
 ok("B cannot see A's private investigation",(await b.list()).length===0&&(await b.get(id))===null);
 await rejects("B cannot append to A's investigation",()=>b.appendEvent(id,{kind:"note",payload:{text:"x"}}),"not found");
 await rejects("B cannot add an output to A's investigation",()=>b.addOutput(id,{section:"02",body:{},lineage:{}}),"not found");
 await rejects("B cannot archive A's investigation",()=>b.setStatus(id,"archived"),"not found");
 await rejects("an unknown id and a not-yours id give the same answer",()=>b.appendEvent("00000000-0000-4000-8000-000000000999",{kind:"note",payload:{}}),"not found");
 await rejects("a caller cannot write a system event kind",()=>a.appendEvent(id,{kind:"shared",payload:{}}),"not allowed");
 await rejects("an output cannot claim scientific approval",()=>a.addOutput(id,{section:"02",body:{nested:{scientificApproval:true}},lineage:{}}),"check constraint");
 await rejects("an event cannot set scientificClaimAllowed",()=>a.appendEvent(id,{kind:"note",payload:{scientificClaimAllowed:true}}),"check constraint");
 await rejects("the database itself refuses an approved output",()=>runtime.unsafe("SELECT public.hsi_inv_add_output($1,$2::uuid,'02',$3::text::jsonb,'{}'::jsonb)",[T.A,id,JSON.stringify({a:[{scientificApproval:true}]})]),"check constraint");
 await rejects("the database itself refuses scientificClaimAllowed on an event",()=>runtime.unsafe("SELECT public.hsi_inv_append_event($1,$2::uuid,'note',$3::text::jsonb,NULL)",[T.A,id,JSON.stringify({scientificClaimAllowed:true})]),"check constraint");
 await rejects("events are append-only, even for the owner role",()=>owner.unsafe("UPDATE public.hsi_investigation_events SET kind='note' WHERE seq=1"),"append-only");
 await rejects("outputs are immutable",()=>owner.unsafe("DELETE FROM public.hsi_investigation_outputs"),"append-only");
 await rejects("an investigation's question cannot be rewritten",()=>owner.unsafe("UPDATE public.hsi_investigations SET question='Something else entirely'"),"only status");
 await rejects("investigations are archived, not deleted",()=>owner.unsafe("DELETE FROM public.hsi_investigations"),"archive instead");
 await rejects("the event log cannot be truncated",()=>owner.unsafe("TRUNCATE public.hsi_investigation_events CASCADE"),"append-only");

 // Scope registry and collaboration (ADR-014)
 const sc=await a.scopes();
 ok("the registry is seeded with today's two scopes only",sc.scopes.map(s=>s.id).sort().join()==="ra,ssc");
 ok("A holds the bootstrapped admin membership in ssc",sc.memberships.some(m=>m.scope==="ssc"&&m.role==="admin"));
 await rejects("A cannot share into a scope A does not belong to",()=>a.share(id,"ra",true),"not a member");
 await rejects("B cannot grant B a membership",()=>b.grant(B_ID,"ssc","researcher"),"self-grant");
 await rejects("B, who is not an admin, cannot grant anyone",()=>b.grant("00000000-0000-4000-8000-00000000000f","ssc","researcher"),"scope admin required");
 await rejects("A, an admin, cannot grant A another role",()=>a.grant("00000000-0000-4000-8000-00000000000a","ssc","reviewer"),"self-grant");
 await rejects("a membership cannot be granted to an account without research access",()=>a.grant("00000000-0000-4000-8000-00000000000c","ssc","researcher"),"cannot be added");
 await rejects("a membership cannot be granted to an account that does not exist",()=>a.grant("00000000-0000-4000-8000-000000000999","ssc","researcher"),"cannot be added");
 await rejects("a membership cannot be granted to an unverified account",()=>a.grant("00000000-0000-4000-8000-00000000000d","ssc","researcher"),"cannot be added");
 await rejects("entities must be short strings",()=>runtime.unsafe("SELECT public.hsi_inv_create($1,NULL,'A fair question here','[1,2]'::jsonb,$2)",[T.A,GV]),"check constraint");
 await a.share(id,"ssc",true);
 ok("sharing into a scope is not visible to non-members",(await b.get(id))===null);
 const mid=await a.grant(B_ID,"ssc","researcher");
 const seen=await b.get(id);
 ok("a member of the scope reads the shared investigation",seen?.access==="scope"&&seen.outputs.length===2);
 ok("shared reads do not expose another person's principal id on events",seen!.events.every(e=>!("actorId" in e)));
 await rejects("a scope member still cannot write to someone else's investigation",()=>b.addOutput(id,{section:"03",body:{},lineage:{}}),"not found");
 await rejects("B cannot share A's investigation elsewhere",()=>b.share(id,"ssc",false),"not found");
 await rejects("B cannot revoke memberships without admin",()=>b.revoke(mid),"not found");
 await a.revoke(mid);
 ok("a revoked membership loses access at once",(await b.get(id))===null&&(await b.list()).length===0);
 await rejects("a membership is revoked only once",()=>a.revoke(mid),"not found");
 await rejects("a revocation cannot be undone below the API",()=>owner.unsafe("UPDATE public.hsi_memberships SET revoked_at=NULL,revoked_by=NULL WHERE id=$1",[mid]),"revoked once");
 await rejects("only a research admin can add a scope",()=>a.createScope("t2d","Type 2 diabetes"),"research admin");
 await f.createScope("t2d","Type 2 diabetes");
 ok("a research admin adds a scope as data, not a migration",(await a.scopes()).scopes.some(s=>s.id==="t2d"));
 const mid2=await a.grant(B_ID,"ssc","researcher");
 await owner.unsafe("UPDATE public.hsi_scopes SET active=false WHERE id='ssc'");
 ok("an inactive scope grants nothing",(await b.get(id))===null);
 await owner.unsafe("UPDATE public.hsi_scopes SET active=true WHERE id='ssc'");
 ok("membership returns with the scope",(await b.get(id))?.access==="scope");
 // The owner leaves the scope: their sharing stops for everyone at once. F (an admin) is made admin by A first.
 await a.grant("00000000-0000-4000-8000-00000000000f","ssc","admin");
 const aAdmin=(await a.scopes()).memberships.find(x=>x.scope==="ssc"&&x.role==="admin")!.id;
 await f.revoke(aAdmin);
 ok("when the owner leaves the scope, the shared investigation is no longer visible there",(await b.get(id))===null&&(await b.list()).length===0);
 ok("the owner still sees their own investigation",(await a.get(id))?.access==="owner");
 await f.revoke(mid2);
 await rejects("an owner who left the scope cannot share into it again",()=>a.share(id,"ssc",true),"not a member");
 await a.share(id,"ssc",false);
 ok("unsharing hides it from the scope and is logged",(await a.get(id))!.events.some(e=>e.kind==="unshared"));
 await a.setStatus(id,"archived");
 ok("archiving is a status change with an event",(await a.get(id))!.status==="archived");
}catch(e){console.error("Suite stopped:",e);failed++}
finally{await runtime.close();await owner.close();}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed?1:0);
