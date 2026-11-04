import {parseResearchAccountAccess,type ResearchAccountAccess} from "../../../src/researchAccount";
export type AccountCheck={kind:"ready";account:ResearchAccountAccess}|{kind:"session_required"|"email_verification_required"|"unavailable"|"invalid_response"|"timeout";message:string};
export async function checkResearchAccount(principalId:string,request:typeof fetch=fetch,timeoutMs=8000):Promise<AccountCheck>{
 const controller=new AbortController();
 const timeout=new Promise<AccountCheck>(resolve=>controller.signal.addEventListener("abort",()=>resolve({kind:"timeout",message:"The research access check timed out. Please retry."}),{once:true}));
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const operation=(async():Promise<AccountCheck>=>{
   const response=await request("/api/research/account",{credentials:"same-origin",cache:"no-store",redirect:"error",headers:{Accept:"application/json"},signal:controller.signal});
   if(response.status===401){
    let code="";try{const body=await response.json();if(body&&typeof body.code==="string")code=body.code}catch{/* No provider text is displayed. */}
    if(code==="EMAIL_NOT_VERIFIED")return {kind:"email_verification_required",message:"Verify your email address before opening the research workspace. Your account is signed in, but research access requires a verified email."};
    if(code==="BACKEND_PROVIDER_SESSION_REQUIRED")return {kind:"session_required",message:"The research API did not receive a usable provider session. Sign out and sign in again on this exact website address. If it persists, the administrator must check the same-origin login configuration."};
    if(code==="BACKEND_DATABASE_SESSION_REQUIRED")return {kind:"session_required",message:"Your provider session could not be found as an eligible session in the configured HSI database. The administrator must check that Auth and database settings use the same branch, and that the session is still active."};
    return {kind:"session_required",message:"You are signed in, but the research API could not verify a backend session. Contact the HSI administrator to check the shared session configuration."};
   }
   if(!response.ok)return {kind:"unavailable",message:"The research API is unavailable or access could not be verified. Your permissions have not been confirmed."};
   if(!(response.headers.get("content-type")??"").toLowerCase().includes("application/json"))return {kind:"invalid_response",message:"The research API returned a website page instead of account data. The administrator must check the API deployment and routing."};
   try{return {kind:"ready",account:parseResearchAccountAccess(await response.json(),principalId)}}
   catch{return {kind:"invalid_response",message:"The research API returned invalid or mismatched account data. Access has not been confirmed."}}
  })();
  return await Promise.race([operation,timeout]);
 }catch{return {kind:"unavailable",message:"The research API could not be reached. Please retry or contact the HSI administrator."}}
 finally{clearTimeout(timer)}
}
