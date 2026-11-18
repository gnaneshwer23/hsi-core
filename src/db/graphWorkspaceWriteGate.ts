/**
 * Fail-closed gate for the graph-workspace Neon adapter (A3.3).
 * Default off. Staging-only when explicitly enabled alongside research writes.
 * Never lifts migration holds 031–033; never enables production writes.
 */
import {
 assertHsiNeonDatabaseUrl,
 isForbiddenNeonTarget,
 stagingHostPin,
} from "./neonGuard";

export type GraphWorkspaceGateInput={
 /** Exact env: HSI_GRAPH_WORKSPACE_STORE_ENABLED==="true" */
 storeEnabled?:boolean;
 /** From readResearchDeploymentConfig — already staging-pinned when true. */
 writesEnabled:boolean;
 databaseUrl?:string|null;
 neonProjectId?:string|null;
};

export type GraphWorkspaceGateResult=
 |{enabled:false;reason:string;defaultPath:"localStorage";holdsUnchanged:true;acceptedForScope:false}
 |{enabled:true;reason:"staging_flag_and_writes";hostPrefix:string;defaultPath:"server";holdsUnchanged:true;acceptedForScope:false};

function hostPrefix(databaseUrl:string):string{
 return new URL(databaseUrl).hostname.split(".")[0]?.replace(/-pooler$/,"")??"";
}

/**
 * Server path is allowed only when the store flag is explicitly true, research
 * writes are enabled (staging pins), and the URL is the pinned HSI staging host.
 */
export function assessGraphWorkspaceStoreGate(input:GraphWorkspaceGateInput):GraphWorkspaceGateResult{
 const base={holdsUnchanged:true as const,acceptedForScope:false as const};
 if(input.storeEnabled!==true){
  return{enabled:false,reason:"HSI_GRAPH_WORKSPACE_STORE_ENABLED is not true",defaultPath:"localStorage",...base};
 }
 if(input.writesEnabled!==true){
  return{enabled:false,reason:"Research writes disabled or not staging-pinned",defaultPath:"localStorage",...base};
 }
 const url=input.databaseUrl?.trim()??"";
 if(!url){
  return{enabled:false,reason:"HSI_DATABASE_URL missing",defaultPath:"localStorage",...base};
 }
 if(isForbiddenNeonTarget(url)){
  return{enabled:false,reason:"Forbidden Neon target",defaultPath:"localStorage",...base};
 }
 const guard=assertHsiNeonDatabaseUrl(url,{neonProjectId:input.neonProjectId});
 if(!guard.ok){
  return{enabled:false,reason:`HSI database guard: ${guard.reason}`,defaultPath:"localStorage",...base};
 }
 const host=hostPrefix(url);
 const pin=stagingHostPin();
 if(host!==pin){
  return{enabled:false,reason:`Graph workspace store requires staging host ${pin}; got ${host||"unknown"}`,defaultPath:"localStorage",...base};
 }
 return{enabled:true,reason:"staging_flag_and_writes",hostPrefix:host,defaultPath:"server",...base};
}

/** Pure honesty samples for unit tests — no live Neon. */
export function assessGraphWorkspaceGateSamples():{
 defaultOff:boolean;
 stagingFlagOn:boolean;
 productionRefused:boolean;
 writesOffRefused:boolean;
}{
 const stagingUrl=
  "postgresql://test:never-used@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
 const productionUrl=
  "postgresql://test:never-used@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
 return{
  defaultOff:assessGraphWorkspaceStoreGate({writesEnabled:true,databaseUrl:stagingUrl}).enabled===false,
  stagingFlagOn:assessGraphWorkspaceStoreGate({storeEnabled:true,writesEnabled:true,databaseUrl:stagingUrl}).enabled===true,
  productionRefused:assessGraphWorkspaceStoreGate({storeEnabled:true,writesEnabled:true,databaseUrl:productionUrl}).enabled===false,
  writesOffRefused:assessGraphWorkspaceStoreGate({storeEnabled:true,writesEnabled:false,databaseUrl:stagingUrl}).enabled===false,
 };
}
