/** Build request-control options from deployment env. Shared admission is optional until D-111. */
import {createSharedAdmissionClient} from "../operations/pilotOperationsService";
import {researchOperationalLogger,type ResearchControls} from "./researchRequestControls";

type Env=Readonly<Record<string,string|undefined>>;

export function resolveResearchControls(env:Env,overrides:ResearchControls={}):ResearchControls{
 let sharedAdmission=overrides.sharedAdmission;
 if(!sharedAdmission&&env.HSI_SHARED_ADMISSION_URL){
  try{sharedAdmission=createSharedAdmissionClient({endpoint:env.HSI_SHARED_ADMISSION_URL,serviceCredential:()=>env.HSI_SHARED_ADMISSION_SERVICE_KEY??""})}
  catch{sharedAdmission=async()=>{throw Error("Shared admission configuration invalid")}}
 }
 return {
  ...overrides,
  sharedAdmission,
  requireShared:env.HSI_PILOT_REQUIRE_SHARED_LIMITER==="true"||overrides.requireShared===true,
  emit:overrides.emit??researchOperationalLogger(env.HSI_OPERATIONAL_LOGGING==="true"),
 };
}
