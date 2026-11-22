/**
 * Fail-closed HTTP surface for researcher onboarding profile (PR-E2E-08).
 * Status is public honesty. GET/PUT require a verified principal when routed here.
 * Without an injected store, enabled gate still refuses writes as SCHEMA_NOT_APPLIED
 * (023 community / additive profile SQL not applied).
 */
import {assessOnboardingProfileStoreGate} from "../db/onboardingProfileWriteGate";
import {normalizeProfile,RESEARCHER_PROFILE_SCHEMA,type Profile} from "../onboarding/researcherProfile";
import type {OnboardingProfileStore} from "../onboarding/onboardingProfileStore";
import {gatewayJson} from "./neonAuthGateway";
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";
import {rejectPhiPayload} from "../cdsPhiBoundary";

export type OnboardingProfileApiConfig={
  storeEnabled:boolean;
  writesEnabled:boolean;
  databaseUrl:string;
  neonProjectId?:string|null;
  /** Injected for tests / explicit memory rehearsal. Absent → schema not applied. */
  store?:OnboardingProfileStore|null;
  now?:()=>Date;
};

export type OnboardingProfilePrincipal={id:string;emailVerified:boolean};

const STATUS_PATH="/api/research/onboarding-profile/status";
const PROFILE_PATH="/api/research/onboarding-profile";

function statusBody(config:OnboardingProfileApiConfig){
  const gate=assessOnboardingProfileStoreGate({
    storeEnabled:config.storeEnabled,
    writesEnabled:config.writesEnabled,
    databaseUrl:config.databaseUrl,
    neonProjectId:config.neonProjectId,
  });
  const storeReady=gate.enabled&&!!config.store;
  return{
    schemaVersion:RESEARCHER_PROFILE_SCHEMA,
    enabled:storeReady,
    path:storeReady?"server":"localStorage",
    reason:storeReady
      ?"staging_flag_writes_and_injected_store"
      :gate.enabled
        ?"SCHEMA_NOT_APPLIED — additive onboarding profile SQL / 023 packet not applied; use localStorage"
        :gate.reason,
    holdsUnchanged:true as const,
    schemaApplied:false as const,
    acceptedForScope:false as const,
    scientificApproval:false as const,
    note:"Default path is device-local localStorage. Server sync stays fail-closed until an owner applies an additive profile store under staging pins. Migration 023 community tables remain held.",
  };
}

export async function handleOnboardingProfileApi(
  request:Request,
  config:OnboardingProfileApiConfig,
  principal:OnboardingProfilePrincipal|null=null,
):Promise<Response|null>{
  const path=new URL(request.url).pathname;
  if(path===STATUS_PATH){
    if(request.method!=="GET")return gatewayJson({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405);
    return gatewayJson(statusBody(config));
  }
  if(path!==PROFILE_PATH)return null;
  if(request.method!=="GET"&&request.method!=="PUT")return gatewayJson({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405);

  const status=statusBody(config);
  if(!status.enabled||!config.store){
    return gatewayJson({
      ok:false,
      code:status.reason.startsWith("SCHEMA_NOT_APPLIED")?"SCHEMA_NOT_APPLIED":"ONBOARDING_PROFILE_STORE_DISABLED",
      path:"localStorage",
      holdsUnchanged:true,
      schemaApplied:false,
      error:"Server onboarding profile store is not available. Preferences stay on this device only.",
      note:status.note,
    },403);
  }
  if(!principal)return gatewayJson({code:"BACKEND_PROVIDER_SESSION_REQUIRED",error:"A provider-verified session cookie is required"},401);
  if(!principal.emailVerified)return gatewayJson({code:"EMAIL_NOT_VERIFIED",error:"Email verification required before research access"},401);

  if(request.method==="GET"){
    const row=await config.store.get(principal.id);
    return gatewayJson({
      schemaVersion:RESEARCHER_PROFILE_SCHEMA,
      path:"server",
      persisted:!!row,
      updatedAt:row?.updatedAt??null,
      profile:row?.profile??null,
      holdsUnchanged:true,
      schemaApplied:false,
      acceptedForScope:false,
      scientificApproval:false,
    });
  }

  if(!/^application\/json/i.test(request.headers.get("content-type")??""))return gatewayJson({code:"JSON_REQUIRED",error:"JSON body required"},415);
  if(Number(request.headers.get("content-length")??0)>12_000)return gatewayJson({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
  let raw:string;
  try{raw=await boundedRequestText(request,12_000)}
  catch(error){
    if(error instanceof RequestBodyTooLarge)return gatewayJson({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
    if(error instanceof RequestBodyTimeout)return gatewayJson({code:"REQUEST_TIMEOUT",error:"Request body timed out"},408);
    return gatewayJson({code:"INVALID_JSON",error:"Invalid JSON"},400);
  }
  let body:unknown;try{body=JSON.parse(raw)}catch{return gatewayJson({code:"INVALID_JSON",error:"Invalid JSON"},400)}
  const envelope=body&&typeof body==="object"&&!Array.isArray(body)?body as Record<string,unknown>:{};
  const profile=normalizeProfile(envelope.profile??envelope);
  const phi=rejectPhiPayload({textBlobs:[profile.background,profile.question,profile.role??"",profile.stage??"",...profile.goals,...profile.interests,...profile.papers]});
  if(!phi.ok){
    return gatewayJson({code:"PHI_REFUSED",error:"Do not include patient identifiers or clinical records in onboarding preferences."},400);
  }
  const saved=await config.store.put(principal.id,profile,config.now??(()=>new Date()));
  return gatewayJson({
    ok:true,
    schemaVersion:RESEARCHER_PROFILE_SCHEMA,
    path:"server",
    persisted:true,
    updatedAt:saved.updatedAt,
    profile:saved.profile,
    holdsUnchanged:true,
    schemaApplied:false,
    acceptedForScope:false,
    scientificApproval:false,
    note:"Stored in the injected rehearsal store only. Durable multi-device SQL is not applied.",
  });
}

export type {Profile};
