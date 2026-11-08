import {AUTH_ERROR_MESSAGES,knownAuthErrorCode} from "../../../src/authErrors";
/** Pure browser authentication transport. No database credentials, sessions or role grants are stored here. */
export type AuthError={message:string;code?:string};
export type AuthResult<T>={data:T|null;error:AuthError|null};
export type HsiAuthSession={session:{id:string;expiresAt:string;userId?:string};user:{id:string;name?:string;email:string;emailVerified:boolean}};
export type HsiRegistration={user:{id:string;email:string;emailVerified:boolean}};
function record(v:unknown):v is Record<string,unknown>{return !!v&&typeof v==="object"&&!Array.isArray(v);}
export function parseAuthBaseUrl(value:unknown):string|null {
 if(typeof value!=="string"||!value.trim())return null;
 try{const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)return null;return u.href.replace(/\/+$/,"");}catch{return null;}
}
export function parseAuthSession(value:unknown,now=Date.now()):HsiAuthSession|null {
 if(value===null)return null;
 if(!record(value)||!record(value.session)||!record(value.user))throw Error("Invalid authentication session response");
 const s=value.session,u=value.user;
 if(typeof s.id!=="string"||!s.id.trim()||s.id.length>256||typeof s.expiresAt!=="string"||!Number.isFinite(Date.parse(s.expiresAt))||Date.parse(s.expiresAt)<=now||typeof u.id!=="string"||!u.id.trim()||u.id.length>256||typeof u.email!=="string"||!u.email.trim()||u.email.length>254||typeof u.emailVerified!=="boolean"||(s.userId!==undefined&&s.userId!==u.id))throw Error("Invalid or expired authentication session");
 return {session:{id:s.id,expiresAt:s.expiresAt,...(typeof s.userId==="string"?{userId:s.userId}:{})},user:{id:u.id,email:u.email,emailVerified:u.emailVerified,...(typeof u.name==="string"?{name:u.name}:{})}};
}
export function parseAuthRegistration(value:unknown,submittedEmail:string):HsiRegistration {
 if(!record(value)||!record(value.user))throw Error("Registration was not confirmed by the provider");
 const user=value.user;
 if(typeof user.id!=="string"||!user.id.trim()||user.id.length>256||typeof user.email!=="string"||user.email.trim().toLowerCase()!==submittedEmail.trim().toLowerCase()||typeof user.emailVerified!=="boolean")throw Error("Invalid registration identity response");
 return {user:{id:user.id,email:user.email,emailVerified:user.emailVerified}};
}
export function createHsiAuthClient(configured:unknown,request:typeof fetch=fetch,timeoutMs=8000,transportMode:"provider"|"same-origin"="provider"){
 const baseUrl=parseAuthBaseUrl(configured);
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30_000)throw Error("Invalid authentication timeout");
 async function authRequest<T>(path:string,body:unknown,parse:(value:unknown)=>T|null):Promise<AuthResult<T>>{
  if(!baseUrl)return{data:null,error:{message:"Authentication service is not configured for this deployment.",code:"auth_not_configured"}};
  const controller=new AbortController();let expired=false;
  const timer=setTimeout(()=>{expired=true;controller.abort();},timeoutMs);
  try{
   const operation=(async()=>{
    const response=await request((transportMode==="same-origin"?"/api/auth":baseUrl)+path,{method:body===undefined?"GET":"POST",credentials:"include",cache:"no-store",redirect:"error",signal:controller.signal,headers:{Accept:"application/json",...(body===undefined?{}:{"Content-Type":"application/json"})},...(body===undefined?{}:{body:JSON.stringify(body)})});
    if(!(response.headers.get("content-type")??"").toLowerCase().includes("application/json"))return{data:null,error:{message:"Authentication endpoint returned an unexpected response. Check the approved auth URL and reverse proxy.",code:"auth_invalid_response"}};
    let value:unknown;try{value=await response.json();}catch{return{data:null,error:{message:"Authentication endpoint returned invalid JSON.",code:"auth_invalid_response"}};}
    if(!response.ok){
     const code=knownAuthErrorCode(value)??"";

     return{data:null,error:{message:code==="AUTH_PROVIDER_REJECTED"?`The authentication provider rejected the request (HTTP ${response.status}). Contact the HSI administrator with this status.`:AUTH_ERROR_MESSAGES[code]??(response.status===429?"Too many authentication attempts. Please try again later.":`Authentication failed (HTTP ${response.status}). Contact the HSI administrator with this status.`),code:AUTH_ERROR_MESSAGES[code]?code:"auth_denied"}};
    }
    try{return{data:parse(value),error:null};}catch{return{data:null,error:{message:"Authentication service returned an invalid response. The operation could not be confirmed.",code:"auth_invalid_response"}};}
   })();
   // An abort-aware fetch normally rejects promptly. The race also covers a stalled body reader.
   const timeout=new Promise<AuthResult<T>>(resolve=>{controller.signal.addEventListener("abort",()=>resolve({data:null,error:{message:"Authentication request timed out. Please try again.",code:"auth_timeout"}}),{once:true});});
   return await Promise.race([operation,timeout]);
  }catch{return{data:null,error:{message:expired?"Authentication request timed out. Please try again.":"Authentication service unavailable. Check the approved origin and network configuration.",code:expired?"auth_timeout":"auth_unavailable"}};}finally{clearTimeout(timer);}
 }
 const confirmedAction=(value:unknown)=>{if(!record(value)||(value.status!==true&&value.success!==true))throw Error("Action not confirmed");return {success:true as const}};
 const action=(value:unknown)=>{if(!record(value))throw Error("Invalid authentication action response");return value;};
 return {baseUrl,
  requestPasswordReset:(email:string,origin:string)=>{
   let redirectTo:string;try{const u=new URL(origin);if(u.protocol!=="https:"||u.origin!==origin)throw Error();redirectTo=u.origin+"/reset-password"}catch{return Promise.resolve({data:null,error:{message:"Password recovery requires an approved HTTPS website.",code:"auth_invalid_origin"}})}
   return authRequest("/request-password-reset",{email,redirectTo},confirmedAction);
  },
  resetPassword:(token:string,newPassword:string)=>authRequest("/reset-password",{token,newPassword},confirmedAction),
  signIn:(email:string,password:string)=>authRequest("/sign-in/email",{email,password},action),
  signUp:(name:string,email:string,password:string)=>authRequest<HsiRegistration>("/sign-up/email",{name,email,password},value=>parseAuthRegistration(value,email)),
  session:()=>authRequest<HsiAuthSession>("/get-session",undefined,value=>parseAuthSession(value)),
  signOut:()=>authRequest("/sign-out",{},action),
  sendVerificationEmail:()=>authRequest("/send-verification-email",{},value=>{
   if(!record(value)||(value.status!==true&&value.success!==true))throw Error("Verification email request not confirmed");
   return {success:true as const,...(value.alreadyVerified===true?{alreadyVerified:true as const}:{})};
  }),
  verifyEmailCode:(otp:string)=>authRequest("/email-otp/verify-email",{otp},value=>{if(!record(value)||value.verified!==true)throw Error("Email verification not confirmed");return {verified:true as const}}),
};
}
