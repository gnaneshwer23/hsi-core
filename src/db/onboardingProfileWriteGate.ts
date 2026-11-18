/**
 * Fail-closed gate for server onboarding-profile store (PR-E2E-08).
 * Default off → device-local localStorage. Staging-only when explicitly enabled
 * alongside research writes. Does not lift migration 023 or apply community tables.
 */
import {
  assertHsiNeonDatabaseUrl,
  isForbiddenNeonTarget,
  stagingHostPin,
} from "./neonGuard";

export type OnboardingProfileGateInput={
  /** Exact env: HSI_ONBOARDING_PROFILE_STORE_ENABLED==="true" */
  storeEnabled?:boolean;
  writesEnabled:boolean;
  databaseUrl?:string|null;
  neonProjectId?:string|null;
};

export type OnboardingProfileGateResult=
 |{enabled:false;reason:string;defaultPath:"localStorage";holdsUnchanged:true;acceptedForScope:false;schemaApplied:false}
 |{enabled:true;reason:"staging_flag_and_writes";hostPrefix:string;defaultPath:"server";holdsUnchanged:true;acceptedForScope:false;schemaApplied:false};

function hostPrefix(databaseUrl:string):string{
  return new URL(databaseUrl).hostname.split(".")[0]?.replace(/-pooler$/,"")??"";
}

export function assessOnboardingProfileStoreGate(input:OnboardingProfileGateInput):OnboardingProfileGateResult{
  const base={holdsUnchanged:true as const,acceptedForScope:false as const,schemaApplied:false as const};
  if(input.storeEnabled!==true){
    return{enabled:false,reason:"HSI_ONBOARDING_PROFILE_STORE_ENABLED is not true",defaultPath:"localStorage",...base};
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
    return{enabled:false,reason:`Onboarding profile store requires staging host ${pin}; got ${host||"unknown"}`,defaultPath:"localStorage",...base};
  }
  // Gate may open for rehearsal wiring; durable SQL for profiles is still not applied (023 held / additive packet pending).
  return{enabled:true,reason:"staging_flag_and_writes",hostPrefix:host,defaultPath:"server",...base};
}

export function assessOnboardingProfileGateSamples():{
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
    defaultOff:assessOnboardingProfileStoreGate({writesEnabled:true,databaseUrl:stagingUrl}).enabled===false,
    stagingFlagOn:assessOnboardingProfileStoreGate({storeEnabled:true,writesEnabled:true,databaseUrl:stagingUrl}).enabled===true,
    productionRefused:assessOnboardingProfileStoreGate({storeEnabled:true,writesEnabled:true,databaseUrl:productionUrl}).enabled===false,
    writesOffRefused:assessOnboardingProfileStoreGate({storeEnabled:true,writesEnabled:false,databaseUrl:stagingUrl}).enabled===false,
  };
}
