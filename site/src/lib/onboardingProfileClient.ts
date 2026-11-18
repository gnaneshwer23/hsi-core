/**
 * Client dual-path for onboarding profile (PR-E2E-08).
 * Default: device-local localStorage. Server path only when /status reports enabled.
 */
import type {FetchLike} from "../../../src/fetchLike";
import {
  EMPTY_PROFILE,
  type Profile,
} from "../../../src/onboarding/researcherProfile";
import {loadProfile,saveProfile} from "./researchHome";

export type OnboardingProfileClientMode="local"|"server";

export type OnboardingProfileStatus={
  enabled:boolean;
  path:"localStorage"|"server";
  reason:string;
  holdsUnchanged:true;
  schemaApplied:false;
  acceptedForScope:false;
  scientificApproval:false;
  note?:string;
};

const STATUS_URL="/api/research/onboarding-profile/status";
const PROFILE_URL="/api/research/onboarding-profile";

export async function resolveOnboardingProfileMode(
  fetchImpl:FetchLike=fetch,
):Promise<{mode:OnboardingProfileClientMode;status:OnboardingProfileStatus|null}>{
  try{
    const response=await fetchImpl(STATUS_URL,{method:"GET",credentials:"same-origin",cache:"no-store"});
    if(!response.ok)return{mode:"local",status:null};
    const body=await response.json() as Partial<OnboardingProfileStatus>&{note?:string};
    if(body.enabled===true&&body.path==="server"){
      return{
        mode:"server",
        status:{
          enabled:true,
          path:"server",
          reason:typeof body.reason==="string"?body.reason:"staging_flag_writes_and_injected_store",
          holdsUnchanged:true,
          schemaApplied:false,
          acceptedForScope:false,
          scientificApproval:false,
          note:body.note,
        },
      };
    }
    return{
      mode:"local",
      status:{
        enabled:false,
        path:"localStorage",
        reason:typeof body.reason==="string"?body.reason:"disabled",
        holdsUnchanged:true,
        schemaApplied:false,
        acceptedForScope:false,
        scientificApproval:false,
        note:body.note,
      },
    };
  }catch{
    return{mode:"local",status:null};
  }
}

export async function loadOnboardingProfile(
  mode:OnboardingProfileClientMode,
  fetchImpl:FetchLike=fetch,
):Promise<{profile:Profile;path:OnboardingProfileClientMode;persisted:boolean}>{
  if(mode==="local"){
    return{profile:loadProfile(),path:"local",persisted:true};
  }
  const response=await fetchImpl(PROFILE_URL,{method:"GET",credentials:"same-origin",cache:"no-store"});
  if(!response.ok){
    return{profile:loadProfile(),path:"local",persisted:false};
  }
  const body=await response.json() as {profile?:Profile|null;persisted?:boolean};
  if(body.profile){
    saveProfile(body.profile);
    return{profile:body.profile,path:"server",persisted:body.persisted===true};
  }
  return{profile:loadProfile(),path:"server",persisted:false};
}

export async function saveOnboardingProfile(
  mode:OnboardingProfileClientMode,
  profile:Profile,
  fetchImpl:FetchLike=fetch,
):Promise<{ok:boolean;path:OnboardingProfileClientMode;error?:string}>{
  const localOk=saveProfile(profile);
  if(mode==="local")return{ok:localOk,path:"local",error:localOk?undefined:"This browser blocked local storage"};
  const response=await fetchImpl(PROFILE_URL,{
    method:"PUT",
    credentials:"same-origin",
    cache:"no-store",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({profile}),
  });
  if(!response.ok){
    const body=await response.json().catch(()=>({})) as {error?:string};
    return{
      ok:localOk,
      path:"local",
      error:body.error??"Server profile store unavailable; kept on this device only.",
    };
  }
  return{ok:true,path:"server"};
}

export function pathHonestyLabel(mode:OnboardingProfileClientMode,status:OnboardingProfileStatus|null):string{
  if(mode==="server")return "Preferences can sync to your research account on this staging store (rehearsal). Durable multi-device SQL is not applied.";
  if(status?.reason?.startsWith("SCHEMA_NOT_APPLIED")){
    return "Preferences stay on this device only. Server profile SQL is not applied yet.";
  }
  return "Preferences stay on this device only. Nothing is synced to an account until a server store is enabled.";
}

export {EMPTY_PROFILE};
