import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {handleInvestigationStoreApi,INVESTIGATION_STORE_PATH} from "../src/server/investigationStoreApi";
import {boundedNeighbourhood,createGraphNeighbourhoodHandler,NEIGHBOURHOOD_LIMITS} from "../src/server/graphNeighbourhoodService";
import {buildGraphModel} from "../src/graphWorkspace/assertionView";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";

const STAGING="postgresql://test:x@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
const PROD="postgresql://test:x@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
const cookie={cookie:"__Secure-better-auth.session_token=tokenAAAAAAAAAAAAAAAA"};
const ID="00000000-0000-4000-8000-000000000001";
const req=(path:string,init:RequestInit={})=>new Request("https://staging.invalid/api/research/investigation-store"+path,init);
const on={storeEnabled:true,writesEnabled:true,databaseUrl:STAGING};
function fakeDb(answer:(q:string,p:unknown[])=>unknown){const calls:{q:string;p:unknown[]}[]=[];return{calls,openSql:async()=>({sql:{async unsafe(q:string,p?:unknown[]){calls.push({q,p:p??[]});return [{r:answer(q,p??[])}]}},close:()=>{}})}}

test("the path pattern covers the store and nothing else",()=>{
 for(const p of ["status","scopes","scopes/members","scopes/members/12","investigations",`investigations/${ID}`,`investigations/${ID}/events`,`investigations/${ID}/share`])expect(INVESTIGATION_STORE_PATH.test("/api/research/investigation-store/"+p)).toBe(true);
 for(const p of ["investigations/not-an-id","investigations/"+ID+"/delete","../graph-workspace/status"])expect(INVESTIGATION_STORE_PATH.test("/api/research/investigation-store/"+p)).toBe(false);
});
test("status says off by default, names the held migration and claims no approval",async()=>{
 const r=await handleInvestigationStoreApi(req("/status"),{storeEnabled:false,writesEnabled:true,databaseUrl:STAGING});
 const b=await r!.json() as Record<string,unknown>;
 expect(b.enabled).toBe(false);expect(b.path).toBe("localStorage");expect(b.migrationHeldForProduction).toBe(true);expect(b.scientificApproval).toBe(false);
 expect(String(b.reason)).toContain("HSI_INVESTIGATION_STORE_ENABLED");
});
test("off, or pointed at production, it refuses without opening the database",async()=>{
 for(const cfg of [{...on,storeEnabled:false},{...on,databaseUrl:PROD},{...on,writesEnabled:false}]){
  const db=fakeDb(()=>"[]");
  const r=await handleInvestigationStoreApi(req("/investigations",{headers:cookie}),cfg,db);
  expect(r!.status).toBe(403);expect(db.calls.length).toBe(0);
  expect((await r!.json() as {code:string}).code).toBe("INVESTIGATION_STORE_DISABLED");
 }
});
test("no session cookie, no database call",async()=>{
 const db=fakeDb(()=>"[]");
 expect((await handleInvestigationStoreApi(req("/investigations"),on,db))!.status).toBe(401);expect(db.calls.length).toBe(0);
});
test("create passes the verified token and refuses an owner id or approval in the body",async()=>{
 const db=fakeDb(q=>q.includes("hsi_inv_create")?ID:1);
 const post=(body:unknown)=>req("/investigations",{method:"POST",headers:{...cookie,"content-type":"application/json"},body:JSON.stringify(body)});
 const r=await handleInvestigationStoreApi(post({question:"Does IL-21 drive this?",graphVersion:"a".repeat(64)}),on,db);
 expect(r!.status).toBe(201);expect(db.calls[0]!.p[0]).toBe("tokenAAAAAAAAAAAAAAAA");
 expect((await handleInvestigationStoreApi(post({question:"x is a question",graphVersion:"a".repeat(64),ownerId:"someone-else"}),on,db))!.status).toBe(400);
 expect((await handleInvestigationStoreApi(post({question:"x is a question",graphVersion:"a".repeat(64),meta:{scientificApproval:true}}),on,db))!.status).toBe(422);
 expect(db.calls.length).toBe(1);
});
test("database refusals become plain codes and never leak details",async()=>{
 const boom=(m:string)=>({openSql:async()=>({sql:{async unsafe(){throw Error(m)}},close:()=>{}})});
 const get=req(`/investigations/${ID}`,{headers:cookie});
 expect((await handleInvestigationStoreApi(get,on,boom("Investigation not found")))!.status).toBe(404);
 expect((await handleInvestigationStoreApi(req("/investigations",{headers:cookie}),on,boom("Invalid authenticated session")))!.status).toBe(401);
 const r=await handleInvestigationStoreApi(req("/investigations",{headers:cookie}),on,boom("connection to ep-secret-host failed password=hunter2"));
 expect(r!.status).toBe(503);expect(await r!.text()).not.toContain("hunter2");
 const g=await handleInvestigationStoreApi(req("/scopes/members",{method:"POST",headers:{...cookie,"content-type":"application/json"},body:JSON.stringify({member:"u",scope:"ssc",role:"admin"})}),on,boom("Self-grant is not permitted"));
 expect(g!.status).toBe(403);expect((await g!.json() as {code:string}).code).toBe("SELF_GRANT_REFUSED");
});

const g=parseDomainBundle(JSON.parse(readFileSync("site/public/research/domain-graph/graph.v1.json","utf8")));
const m=buildGraphModel(g);
const seed=m.assertions[0]!.subject.id;
test("a bounded neighbourhood stays inside its budget and every relationship stays a candidate",()=>{
 const r=boundedNeighbourhood(m,[seed],2,5);
 expect(r.assertions.length).toBeLessThanOrEqual(5);expect(r.seeds).toEqual([seed]);
 expect(r.assertions.every(a=>a.status.level==="candidate"&&a.status.approved===false)).toBe(true);
 expect(r.scientificApproval).toBe(false);
 const big=boundedNeighbourhood(m,[seed],99,99999);
 expect(big.depth).toBe(NEIGHBOURHOOD_LIMITS.maxDepth);expect(big.limit).toBe(NEIGHBOURHOOD_LIMITS.maxAssertions);
 expect(boundedNeighbourhood(m,["no-such-concept"],1,10).seeds).toEqual([]);
});
test("the endpoint verifies the snapshot, validates input and says when nothing matches",async()=>{
 const raw=JSON.parse(readFileSync("site/public/research/domain-graph/graph.v1.json","utf8"));
 const h=createGraphNeighbourhoodHandler({currentVersion:raw.version,readPublishedSnapshot:async()=>raw});
 const call=(q:string)=>h(new Request("https://x.invalid/api/research/graph-workspace/neighbourhood?"+q));
 const ok=await call("node="+encodeURIComponent(seed)+"&depth=1&limit=10");
 expect(ok.status).toBe(200);const b=await ok.json() as {assertions:unknown[];status:string};expect(b.status).toBe("candidate_unreviewed");expect(b.assertions.length).toBeGreaterThan(0);
 expect((await call("")).status).toBe(400);
 expect((await call("node=x&sql=1")).status).toBe(400);
 expect((await call("node=no-such-concept")).status).toBe(404);
 expect((await call("node=a&version=latest")).status).toBe(400);
 const tampered=createGraphNeighbourhoodHandler({currentVersion:raw.version,readPublishedSnapshot:async()=>({...raw,edges:raw.edges.slice(1)})});
 expect((await tampered(new Request("https://x.invalid/?node="+encodeURIComponent(seed)))).status).toBe(503);
});
