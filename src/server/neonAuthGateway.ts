/** Same-origin, narrowly scoped Neon Better Auth gateway. No role provisioning.
 * Provider cookies stay HttpOnly; tokens and provider internals never enter JSON sent to the browser.
 */
import type { FetchLike } from "../fetchLike";
export type AuthGatewayConfig={authBaseUrl:string;publicOrigin:string};
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";
import {knownAuthErrorCode} from "../authErrors";
const COOKIE=/^(?:__Secure-|__Host-)?(?:better-auth|neon-auth)\.(?:session_token|session_data|dont_remember)$/;
const EMAIL=/^\S+@\S+\.\S+$/;
function validEmail(value:unknown):value is string{
 return typeof value==="string"&&!!value.trim()&&value.trim().length<=254&&EMAIL.test(value.trim());
}
export function providerCookies(request:Request):string{
 const raw=request.headers.get("cookie")??"";
 if(raw.length>16384)throw Error("Oversized cookie header");
 return raw.split(";").map(s=>s.trim()).filter(s=>COOKIE.test(s.split("=",1)[0]??"")).join("; ");
}
export function gatewayJson(body:unknown,status=200):Response{
 return Response.json(body,{status,headers:{"Cache-Control":"no-store","Vary":"Cookie","X-Content-Type-Options":"nosniff"}});
}
function safeUser(value:unknown){
 const u=value as Record<string,unknown>|null;
 if(!u||typeof u.id!=="string"||!u.id||u.id.length>256||typeof u.email!=="string"||u.email.length>254||typeof u.emailVerified!=="boolean")throw Error("Invalid provider user");
 return {id:u.id,email:u.email,emailVerified:u.emailVerified,...(typeof u.name==="string"?{name:u.name}:{})};
}
export function parseProviderSession(value:unknown){
 if(value===null)return null;
 const v=value as {session?:Record<string,unknown>;user?:unknown};const s=v?.session;
 const user=safeUser(v?.user);
 if(!s||typeof s.id!=="string"||!s.id||s.id.length>256||typeof s.expiresAt!=="string"||!Number.isFinite(Date.parse(s.expiresAt))||Date.parse(s.expiresAt)<=Date.now()||s.userId!==user.id)throw Error("Invalid provider session");
 return {session:{id:s.id,userId:user.id,expiresAt:s.expiresAt},user};
}
export async function requestProvider(config:AuthGatewayConfig,request:Request,path:string,body:unknown,transport:FetchLike=fetch):Promise<Response>{
 const cookies=providerCookies(request);
 return transport(config.authBaseUrl+path,{method:body===undefined?"GET":"POST",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(6000),headers:{Accept:"application/json",Origin:config.publicOrigin,"x-neon-auth-middleware":"true",...(cookies?{Cookie:cookies}:{}),...(body===undefined?{}:{"Content-Type":"application/json"})},...(body===undefined?{}:{body:JSON.stringify(body)})});
}
export async function verifiedProviderSession(config:AuthGatewayConfig,request:Request,transport:FetchLike=fetch){
 if(!providerCookies(request))return null;
 const response=await requestProvider(config,request,"/get-session",undefined,transport);
 if(response.status===401)return null;
 if(!response.ok||!(response.headers.get("content-type")??"").includes("application/json"))throw Error("Provider session unavailable");
 return parseProviderSession(await response.json());
}
function copyProviderCookies(source:Response,target:Response){
 for(const cookie of source.headers.getSetCookie()){
  const parts=cookie.split(";").map(s=>s.trim());const pair=parts[0]??"";
  if(!COOKIE.test(pair.split("=",1)[0]??""))continue;
  const expiry=parts.slice(1).filter(p=>/^(expires|max-age)=/i.test(p));
  // Host-only cookies work for both the same-origin auth gateway and research API.
  target.headers.append("Set-Cookie",[pair,...expiry,"Path=/","HttpOnly","Secure","SameSite=Lax"].join("; "));
 }
}
async function requestVerificationEmail(config:AuthGatewayConfig,request:Request,email:string,transport:FetchLike):Promise<boolean>{
 try{
  const response=await requestProvider(config,request,"/send-verification-email",{email,callbackURL:config.publicOrigin+"/sign-in"},transport);
  if(!(response.headers.get("content-type")??"").includes("application/json"))return false;
  const value=await response.json() as Record<string,unknown>|null;
  return response.ok&&(value?.status===true||value?.success===true);
 }catch{return false}
}
export async function handleAuthGateway(request:Request,config:AuthGatewayConfig,transport:FetchLike=fetch):Promise<Response>{
 const path=new URL(request.url).pathname.slice("/api/auth".length);
 const method=path==="/get-session"?"GET":["/sign-in/email","/sign-up/email","/sign-out","/send-verification-email","/email-otp/verify-email","/request-password-reset","/reset-password"].includes(path)?"POST":null;
 if(!method)return gatewayJson({code:"NOT_FOUND"},404);
 if(request.method!==method)return gatewayJson({code:"METHOD_NOT_ALLOWED"},405);
 if((request.headers.get("origin")&&request.headers.get("origin")!==config.publicOrigin)||(method==="POST"&&request.headers.get("origin")!==config.publicOrigin))return gatewayJson({code:"INVALID_ORIGIN"},403);
 let body:unknown;
 let verificationPrincipal:string|null=null;
 let verificationEmail:string|null=null;
 if(method==="POST"){
  if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")??""))return gatewayJson({code:"JSON_REQUIRED"},415);
  if(Number(request.headers.get("content-length")??0)>20000)return gatewayJson({code:"PAYLOAD_TOO_LARGE"},413);
  let raw:string;try{raw=await boundedRequestText(request,20000)}catch(error){return error instanceof RequestBodyTooLarge?gatewayJson({code:"PAYLOAD_TOO_LARGE"},413):error instanceof RequestBodyTimeout?gatewayJson({code:"REQUEST_TIMEOUT"},408):gatewayJson({code:"INVALID_JSON"},400)}
  if(raw.length>20000)return gatewayJson({code:"PAYLOAD_TOO_LARGE"},413);
  let v:Record<string,unknown>;try{v=JSON.parse(raw);if(!v||Array.isArray(v)||typeof v!=="object")throw Error()}catch{return gatewayJson({code:"INVALID_JSON"},400)}
  if(path==="/send-verification-email"||path==="/email-otp/verify-email"){
   // Prefer the authenticated account. When Neon requires email verification before
   // sign-in, signup/sign-in leave no session cookie — allow email(+otp) with a fixed callback.
   let identity:ReturnType<typeof parseProviderSession>;
   try{identity=await verifiedProviderSession(config,request,transport)}catch{return gatewayJson({code:"AUTH_UNAVAILABLE"},503)}
   if(identity){
    if(identity.user.emailVerified)return gatewayJson({success:true,alreadyVerified:true,...(path==="/email-otp/verify-email"?{verified:true}:{})});
    if(path==="/email-otp/verify-email"){
     if(typeof v.otp!=="string"||!/^\d{4,12}$/.test(v.otp.trim()))return gatewayJson({code:"INVALID_OTP_FORMAT"},400);
     verificationPrincipal=identity.user.id;verificationEmail=identity.user.email;body={email:identity.user.email,otp:v.otp.trim()};
    }else body={email:identity.user.email,callbackURL:config.publicOrigin+"/sign-in"};
   }else if(path==="/send-verification-email"){
    if(!validEmail(v.email))return gatewayJson({code:"INVALID_CREDENTIAL_FIELDS"},400);
    body={email:v.email.trim(),callbackURL:config.publicOrigin+"/sign-in"};
   }else{
    if(!validEmail(v.email)||typeof v.otp!=="string"||!/^\d{4,12}$/.test(v.otp.trim()))return gatewayJson({code:validEmail(v.email)?"INVALID_OTP_FORMAT":"INVALID_CREDENTIAL_FIELDS"},400);
    verificationEmail=v.email.trim();body={email:verificationEmail,otp:v.otp.trim()};
   }
  }
  else if(path==="/request-password-reset"){
   if(!validEmail(v.email))return gatewayJson({code:"INVALID_CREDENTIAL_FIELDS"},400);
   // Never trust a browser-provided redirect or role. The provider owns delivery and token validity.
   body={email:v.email.trim(),redirectTo:config.publicOrigin+"/reset-password"};
  }
  else if(path==="/reset-password"){
   if(typeof v.token!=="string"||!/^[A-Za-z0-9._~-]{16,2048}$/.test(v.token)||typeof v.newPassword!=="string"||v.newPassword.length<12||v.newPassword.length>128)return gatewayJson({code:"INVALID_CREDENTIAL_FIELDS"},400);
   body={token:v.token,newPassword:v.newPassword};
  }
  else if(path==="/sign-out")body={};
  else{
   if(typeof v.email!=="string"||!v.email.trim()||v.email.length>254||typeof v.password!=="string"||!v.password||v.password.length>128)return gatewayJson({code:"INVALID_CREDENTIAL_FIELDS"},400);
   if(path==="/sign-up/email"&&(typeof v.name!=="string"||!v.name.trim()||v.name.length>120))return gatewayJson({code:"INVALID_NAME"},400);
   body={email:v.email.trim(),password:v.password,...(path==="/sign-up/email"?{name:(v.name as string).trim(),callbackURL:config.publicOrigin+"/sign-in"}:{})};
  }
 }
 try{
  const response=await requestProvider(config,request,path,body,transport);
  if(!(response.headers.get("content-type")??"").includes("application/json"))return gatewayJson({code:"AUTH_INVALID_RESPONSE"},502);
  const value=await response.json() as Record<string,unknown>|null;
  if(!response.ok){
   // Neon may already resend verification on EMAIL_NOT_VERIFIED; still offer an explicit gateway path.
   const result=gatewayJson({code:knownAuthErrorCode(value)??"AUTH_PROVIDER_REJECTED"},response.status);copyProviderCookies(response,result);return result;
  }
  if(path==="/email-otp/verify-email"){
   const verifiedUser=safeUser(value?.user);
   const principalOk=verificationPrincipal?verifiedUser.id===verificationPrincipal:true;
   const emailOk=!verificationEmail||verifiedUser.email.trim().toLowerCase()===verificationEmail.trim().toLowerCase();
   if(value?.status!==true||!verifiedUser.emailVerified||!principalOk||!emailOk)return gatewayJson({code:"AUTH_INVALID_RESPONSE"},502);
   const result=gatewayJson({success:true,verified:true});copyProviderCookies(response,result);return result;
  }
  if(["/send-verification-email","/request-password-reset","/reset-password"].includes(path)&&value?.status!==true&&value?.success!==true)return gatewayJson({code:"AUTH_INVALID_RESPONSE"},502);
  if(path==="/sign-up/email"){
   const user=safeUser(value?.user);
   let verificationEmailRequested=user.emailVerified;
   if(!user.emailVerified)verificationEmailRequested=await requestVerificationEmail(config,request,user.email,transport);
   const result=gatewayJson({user,verificationEmailRequested});copyProviderCookies(response,result);return result;
  }
  const result=path==="/get-session"?gatewayJson(parseProviderSession(value)):["/sign-out","/send-verification-email","/request-password-reset","/reset-password"].includes(path)?gatewayJson({success:true}):gatewayJson({user:safeUser(value?.user)});
  copyProviderCookies(response,result);return result;
 }catch{return gatewayJson({code:"AUTH_UNAVAILABLE"},503)}
}

/** Anonymous GET-only provider check. Never forwards browser cookies or returns session data. */
export async function diagnoseAuthProvider(request:Request,config:AuthGatewayConfig,transport:FetchLike=fetch):Promise<Response>{
 if(request.method!=="GET")return gatewayJson({error:"Method not allowed"},405);
 try{
  const response=await requestProvider(config,new Request(config.publicOrigin+"/api/auth/diagnostics"),"/get-session",undefined,transport);
  if(!(response.headers.get("content-type")??"").toLowerCase().includes("application/json"))return gatewayJson({service:"hsi-auth",status:"provider_invalid_response",providerHttpStatus:response.status},502);
  const value=await response.json();
  if(!response.ok)return gatewayJson({service:"hsi-auth",status:"provider_rejected",providerHttpStatus:response.status,code:knownAuthErrorCode(value)??"AUTH_PROVIDER_REJECTED"},502);
  // An anonymous session check must return null. Do not expose any unexpected identity.
  if(value!==null)return gatewayJson({service:"hsi-auth",status:"provider_unexpected_session_shape",providerHttpStatus:response.status},502);
  return gatewayJson({service:"hsi-auth",status:"provider_reachable",providerHttpStatus:response.status,credentialsTested:false,databaseConnectionTested:false});
 }catch{return gatewayJson({service:"hsi-auth",status:"provider_unavailable"},503)}
}
