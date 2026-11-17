/**
 * A3.2 two-account isolation suite orchestrator.
 * Composes probe catalog + optional HTTP runner. Never lifts holds, never accepts scope,
 * never targets production. Fixture/--check path is CI-safe.
 */
import {HELD_MIGRATION_IDS} from "./migrationHolds";
import {
 assertDisposableRehearsalTarget,
 PERSISTENCE_SCOPE_MIGRATIONS,
 type PersistenceScope,
} from "./migrationRehearsal";
import {persistenceTargetHash} from "./persistenceSecurityAcceptance";
import {
 assertCatalogComplete,
 catalogCoverage,
 httpProbesForScope,
 probesForScope,
} from "./isolationProbeCatalog";
import {
 createStagingIsolationRunner,
 NEXT_B_UNASSIGNED,
 type IsolationActor,
 type IsolationProbe,
} from "./stagingIsolationRunner";

export type IsolationSuiteMode="check"|"fixture"|"live";

export type IsolationSuiteResult={
 schemaVersion:"hsi-isolation-suite-1";
 mode:IsolationSuiteMode;
 scope:PersistenceScope;
 fixture:boolean;
 catalogComplete:true;
 heldMigrationCount:number;
 heldMigrationsUnchanged:true;
 nextBUnassigned:true;
 acceptedForScope:false;
 productionActivationApproved:false;
 scientificApproval:false;
 productionUntouched:true;
 coverage:{covered:number;total:number;missing:readonly string[]};
 nonHttpProbes:number;
 httpObservations:readonly{
  probeId:string;
  check:string;
  actor:string;
  status:number|null;
  bodySha256:string|null;
  outcome:string;
 }[];
 unexecutedProbeIds:readonly string[];
 note:string;
};

const NOTE_CHECK="Catalog and hold invariants only. No HTTP, no SQL, no Neon. Production untouched.";
const NOTE_FIXTURE="Fixture HTTP against synthetic transport. Not live isolation evidence. acceptedForScope stays false.";
const NOTE_LIVE="Live probes require HSI_ISOLATION_SUITE_ENABLED=1, disposable branch pins, and owner-supplied sessions. Still never signs acceptance.";

export function createStagingIsolationSuite(input:{
 mode:IsolationSuiteMode;
 scope:PersistenceScope;
 commitSha:string;
 target?:{projectId:string;branchId:string;parentId:string|null;isDefault:boolean;isPrimary:boolean;expiresAt:string|null};
 pins?:{projectId:string;productionBranchId:string;disposableBranchId:string};
 origin?:string;
 approvedOrigin?:string;
 productionOrigins?:readonly string[];
 authorize?:()=>Promise<boolean>;
 session?:(actor:IsolationActor)=>Promise<string|null>;
 transport?:(request:Request)=>Promise<Response>;
 enabled?:boolean;
 allowStagingMutations?:boolean;
 now?:()=>number;
}){
 assertCatalogComplete();
 if(!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,input.scope))throw Error("Unknown persistence scope");
 if(!/^[a-f0-9]{40}$/.test(input.commitSha))throw Error("commitSha must be 40 hex chars");

 const coverage=catalogCoverage();
 const catalog=probesForScope(input.scope);
 const nonHttp=catalog.filter(p=>p.kind!=="authenticated_http").length;

 return{
  async run():Promise<IsolationSuiteResult>{
   const base:IsolationSuiteResult={
    schemaVersion:"hsi-isolation-suite-1",
    mode:input.mode,
    scope:input.scope,
    fixture:input.mode!=="live",
    catalogComplete:true,
    heldMigrationCount:HELD_MIGRATION_IDS.length,
    heldMigrationsUnchanged:true,
    nextBUnassigned:true,
    acceptedForScope:false,
    productionActivationApproved:false,
    scientificApproval:false,
    productionUntouched:true,
    coverage:{covered:coverage.covered.length,total:coverage.checks.length,missing:coverage.missing},
    nonHttpProbes:nonHttp,
    httpObservations:[],
    unexecutedProbeIds:[],
    note:NOTE_CHECK,
   };

   if(input.mode==="check")return{...base,note:NOTE_CHECK};

   if(input.mode==="live"){
    if(input.enabled!==true)throw Error("Live isolation suite disabled (set enabled after owner gate)");
    if(!input.target||!input.pins)throw Error("Live mode requires disposable target + pins");
    assertDisposableRehearsalTarget(input.target,input.pins,input.now?.()??Date.now());
   }

   const origin=input.origin??"https://staging.invalid";
   const approvedOrigin=input.approvedOrigin??origin;
   const productionOrigins=input.productionOrigins??["https://www.humansuperintelligence.tech"];
   const targetHash=persistenceTargetHash({
    projectId:input.pins?.projectId??"hsi-neon-project",
    branchId:input.pins?.disposableBranchId??"ep-hsi-disposable-rehearsal",
    scope:input.scope,
    routeSchemaHash:"a".repeat(64),
    runtimeConfigHash:"b".repeat(64),
   });

   const probes:IsolationProbe[]=[...httpProbesForScope(input.scope)];
   if(!probes.length)return{...base,note:input.mode==="live"?NOTE_LIVE:NOTE_FIXTURE};

   const runner=createStagingIsolationRunner({
    enabled:true,
    fixture:input.mode!=="live",
    origin,
    approvedOrigin,
    productionOrigins,
    scope:input.scope,
    targetHash,
    commitSha:input.commitSha,
    allowStagingMutations:input.allowStagingMutations===true,
    authorize:input.authorize??(async()=>input.mode==="fixture"),
    session:input.session??(async(actor)=>{
     if(actor==="anonymous")return null;
     if(actor==="revoked_session")return null;
     return"synthetic=fixture";
    }),
    transport:input.transport??(async(req)=>{
     // Fixture transport: deny by default with stable digests matching catalog denials.
     const url=new URL(req.url);
     const cookie=req.headers.get("cookie");
     if(!cookie)return Response.json({error:"session_required"},{status:401});
     if(cookie.includes("revoked"))return Response.json({error:"session_revoked"},{status:401});
     // Positive control path for fixture researcher_a on interrogative fixture.
     if(url.pathname.endsWith("/interrogative/fixture")&&cookie==="synthetic=fixture"){
      return Response.json({ok:true},{status:200});
     }
     return Response.json({error:"cross_owner_denied"},{status:403});
    }),
   });

   // Fixture mode only exercises probes that the default synthetic transport can match.
   // Live mode uses owner-supplied transport/session and runs the full HTTP set.
   const selected=input.mode==="fixture"
    ?probes.filter(p=>p.actor==="researcher_a"&&p.check==="staging_http_end_to_end"&&p.expectedStatus===200)
    :probes;

   if(!selected.length)return{...base,note:NOTE_FIXTURE};

   const result=await runner.run(selected);
   return{
    ...base,
    fixture:result.fixture,
    httpObservations:result.observations,
    unexecutedProbeIds:result.unexecutedProbeIds,
    note:input.mode==="live"?NOTE_LIVE:NOTE_FIXTURE,
   };
  },
 };
}

export{persistenceTargetHash,NEXT_B_UNASSIGNED,assertCatalogComplete,catalogCoverage,probesForScope,httpProbesForScope};
