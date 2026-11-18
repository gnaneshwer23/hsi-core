import {describe,expect,test} from "bun:test";
import {
 assessGraphWorkspaceGateSamples,
 assessGraphWorkspaceStoreGate,
} from "../src/db/graphWorkspaceWriteGate";
import {handleGraphWorkspaceApi} from "../src/server/graphWorkspaceApi";
import {HELD_MIGRATION_IDS} from "../src/db/migrationHolds";

describe("graph workspace write gate (A3.3)",()=>{
 test("fail-closed samples: default off, staging flag on, production refused",()=>{
  const s=assessGraphWorkspaceGateSamples();
  expect(s.defaultOff).toBe(true);
  expect(s.stagingFlagOn).toBe(true);
  expect(s.productionRefused).toBe(true);
  expect(s.writesOffRefused).toBe(true);
 });

 test("status endpoint reports localStorage when flag is off",async()=>{
  const response=await handleGraphWorkspaceApi(
   new Request("https://staging.invalid/api/research/graph-workspace/status"),
   {storeEnabled:false,writesEnabled:true,databaseUrl:"postgresql://test:x@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require"},
  );
  expect(response).not.toBeNull();
  expect(response!.status).toBe(200);
  const body=await response!.json() as {enabled:boolean;path:string;acceptedForScope:boolean;holdsUnchanged:boolean};
  expect(body.enabled).toBe(false);
  expect(body.path).toBe("localStorage");
  expect(body.acceptedForScope).toBe(false);
  expect(body.holdsUnchanged).toBe(true);
 });

 test("disabled store refuses authenticated investigation list without opening SQL",async()=>{
  let opened=false;
  const response=await handleGraphWorkspaceApi(
   new Request("https://staging.invalid/api/research/graph-workspace/investigations",{
    headers:{cookie:"__Secure-better-auth.session_token=tokenAAAAAAAAAAAAAAAA"},
   }),
   {storeEnabled:false,writesEnabled:true,databaseUrl:"postgresql://test:x@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require"},
   {openSql:async()=>{opened=true;return{sql:{unsafe:async()=>[]},close:()=>{}}}},
  );
  expect(response!.status).toBe(403);
  expect(opened).toBe(false);
  const body=await response!.json() as {code:string;path:string};
  expect(body.code).toBe("GRAPH_WORKSPACE_STORE_DISABLED");
  expect(body.path).toBe("localStorage");
 });

 test("enabled staging gate lists via injected SQL and never claims acceptance",async()=>{
  const response=await handleGraphWorkspaceApi(
   new Request("https://staging.invalid/api/research/graph-workspace/investigations",{
    headers:{cookie:"__Secure-better-auth.session_token=tokenAAAAAAAAAAAAAAAA"},
   }),
   {
    storeEnabled:true,
    writesEnabled:true,
    databaseUrl:"postgresql://test:x@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
   },
   {
    openSql:async()=>({
     sql:{
      async unsafe(q){
       if(q.includes("hsi_graph_list_investigations"))return[{r:[]}];
       throw Error("unexpected "+q);
      },
     },
     close:()=>{},
    }),
   },
  );
  expect(response!.status).toBe(200);
  const body=await response!.json() as {investigations:unknown[];path:string};
  expect(body.investigations).toEqual([]);
  expect(body.path).toBe("server");
  expect(assessGraphWorkspaceStoreGate({
   storeEnabled:true,
   writesEnabled:true,
   databaseUrl:"postgresql://test:x@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
  }).acceptedForScope).toBe(false);
 });

 test("holds 031–033 remain in HELD_MIGRATION_IDS",()=>{
  expect(HELD_MIGRATION_IDS).toContain("031_hsi_graph_workspace_storage");
  expect(HELD_MIGRATION_IDS).toContain("032_hsi_graph_workspace_procedures");
  expect(HELD_MIGRATION_IDS).toContain("033_hsi_ontology_import_role");
 });
});
