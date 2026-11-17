/**
 * Build request-control options from deployment env.
 * processAdmission (default or injected) is per isolate — cross-instance / cross-route budgets need
 * HSI_SHARED_ADMISSION_URL (D-111). Redis/Postgres store choice remains deferred.
 */
import {createSharedAdmissionClient} from "../operations/pilotOperationsService";
import {researchOperationalLogger,type ResearchControls} from "./researchRequestControls";

type Env=Readonly<Record<string,string|undefined>>;

export function resolveResearchControls(env:Env,overrides:ResearchControls={}):ResearchControls{
 let sharedAdmission=overrides.sharedAdmission;
 const requireShared=env.HSI_PILOT_REQUIRE_SHARED_LIMITER==="true"||overrides.requireShared===true;
 if(!sharedAdmission&&env.HSI_SHARED_ADMISSION_URL){
  try{sharedAdmission=createSharedAdmissionClient({endpoint:env.HSI_SHARED_ADMISSION_URL,serviceCredential:()=>env.HSI_SHARED_ADMISSION_SERVICE_KEY??""})}
  catch(error){
   // Required shared limiter must fail closed at construction (startup), not only on first request.
   if(requireShared)throw error instanceof Error?error:Error("Shared admission configuration invalid");
   sharedAdmission=async()=>{throw Error("Shared admission configuration invalid")};
  }
 }
 return {
  ...overrides,
  sharedAdmission,
  requireShared,
  emit:overrides.emit??researchOperationalLogger(env.HSI_OPERATIONAL_LOGGING==="true"),
 };
}
