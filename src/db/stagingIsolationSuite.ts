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
 fixtureIsolationTransport,
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
 coverage:{
  covered:number;
  total:number;
  missing:readonly string[];
  scopeCovered:number;
  scopeMissing:readonly string[];
 };
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
const NOTE_LIVE="Live probes require HSI_ISOLATION_SUITE_ENABLED=1, disposable branch pins, approved origin, and owner-supplied transport/sessions. Still never signs acceptance.";

const HEX64=/^[a-f0-9]{64}$/;

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
 routeSchemaHash?:string;
 runtimeConfigHash?:string;
 now?:()=>number;
}){
 assertCatalogComplete();
 if(!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,input.scope))throw Error("Unknown persistence scope");
 if(!/^[a-f0-9]{40}$/.test(input.commitSha))throw Error("commitSha must be 40 hex chars");

 const globalCoverage=catalogCoverage();
 const scopeCoverage=catalogCoverage(input.scope);
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
    coverage:{
     covered:globalCoverage.covered.length,
     total:globalCoverage.checks.length,
     missing:globalCoverage.missing,
     scopeCovered:scopeCoverage.covered.length,
     scopeMissing:scopeCoverage.missing,
    },
    nonHttpProbes:nonHttp,
    httpObservations:[],
    unexecutedProbeIds:[],
    note:NOTE_CHECK,
   };

   if(input.mode==="check")return{...base,note:NOTE_CHECK};

   if(input.mode==="live"){
    if(input.enabled!==true)throw Error("Live isolation suite disabled (set enabled after owner gate)");
    if(!input.target||!input.pins)throw Error("Live mode requires disposable target + pins");
    if(typeof input.transport!=="function")throw Error("Live mode requires owner-supplied transport");
    if(typeof input.session!=="function")throw Error("Live mode requires owner-supplied session callback");
    if(typeof input.authorize!=="function")throw Error("Live mode requires owner-supplied authorize callback");
    if(!input.origin||!input.approvedOrigin)throw Error("Live mode requires origin and approvedOrigin");
    if(input.origin!==input.approvedOrigin)throw Error("Live origin must equal independently configured approvedOrigin");
    if(!input.routeSchemaHash||!HEX64.test(input.routeSchemaHash))throw Error("Live mode requires 64-hex routeSchemaHash");
    if(!input.runtimeConfigHash||!HEX64.test(input.runtimeConfigHash))throw Error("Live mode requires 64-hex runtimeConfigHash");
    assertDisposableRehearsalTarget(input.target,input.pins,input.now?.()??Date.now());
   }

   const origin=input.origin??"https://staging.invalid";
   const approvedOrigin=input.mode==="live"
    ?(input.approvedOrigin as string)
    :(input.approvedOrigin??origin);
   const productionOrigins=input.productionOrigins??["https://www.humansuperintelligence.tech"];
   const routeSchemaHash=input.mode==="live"
    ?(input.routeSchemaHash as string)
    :(input.routeSchemaHash&&HEX64.test(input.routeSchemaHash)?input.routeSchemaHash:"a".repeat(64));
   const runtimeConfigHash=input.mode==="live"
    ?(input.runtimeConfigHash as string)
    :(input.runtimeConfigHash&&HEX64.test(input.runtimeConfigHash)?input.runtimeConfigHash:"b".repeat(64));
   const targetHash=persistenceTargetHash({
    projectId:input.pins?.projectId??"hsi-neon-project",
    branchId:input.pins?.disposableBranchId??"ep-hsi-disposable-rehearsal",
    scope:input.scope,
    routeSchemaHash,
    runtimeConfigHash,
   });

   const probes:IsolationProbe[]=[...httpProbesForScope(input.scope)];
   if(input.mode==="fixture"&&!probes.some(p=>p.actor==="researcher_a"&&p.check==="staging_http_end_to_end"&&p.expectedStatus===200)){
    throw Error("Fixture mode requires a positive-control HTTP probe for this scope");
   }
   if(!probes.length){
    if(input.mode==="fixture")throw Error("Fixture mode requires HTTP probes");
    return{...base,note:input.mode==="live"?NOTE_LIVE:NOTE_FIXTURE};
   }

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
     if(actor==="revoked_session")return"synthetic=revoked";
     return"synthetic=fixture";
    }),
    transport:input.transport??(async(req)=>fixtureIsolationTransport(req)),
   });

   // Fixture mode only exercises probes that the default synthetic transport can match.
   // Live mode uses owner-supplied transport/session and runs the full HTTP set.
   const selected=input.mode==="fixture"
    ?probes.filter(p=>p.actor==="researcher_a"&&p.check==="staging_http_end_to_end"&&p.expectedStatus===200)
    :probes;

   if(!selected.length)throw Error("No HTTP probes selected for isolation suite run");

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

export{persistenceTargetHash,NEXT_B_UNASSIGNED,assertCatalogComplete,catalogCoverage,probesForScope,httpProbesForScope,fixtureIsolationTransport};
