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
     const code=record(value)&&typeof value.code==="string"?value.code:"";
     const safe:Record<string,string>={
      INVALID_EMAIL_OR_PASSWORD:"Email address or password is incorrect.",
      EMAIL_NOT_VERIFIED:"Verify your email address before signing in.",
      TOO_MANY_REQUESTS:"Too many authentication attempts. Please try again later.",
      USER_ALREADY_EXISTS:"An account already exists for this email. Try signing in.",
      USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:"An account already exists for this email. Try signing in.",
      EMAIL_ALREADY_EXISTS:"An account already exists for this email. Try signing in.",
      INVALID_EMAIL:"The authentication service did not accept this email address.",
      PASSWORD_TOO_SHORT:"The authentication service requires a longer password.",
      PASSWORD_TOO_LONG:"The authentication service requires a shorter password.",
      SIGN_UP_DISABLED:"The authentication service has registration disabled. The HSI administrator must enable account creation.",
      SIGNUP_DISABLED:"The authentication service has registration disabled. The HSI administrator must enable account creation.",
      INVALID_ORIGIN:"The authentication service has not approved this website’s origin. The HSI administrator must update its trusted origins.",
      ORIGIN_NOT_ALLOWED:"The authentication service has not approved this website’s origin. The HSI administrator must update its trusted origins.",
      UNTRUSTED_ORIGIN:"The authentication service has not approved this website’s origin. The HSI administrator must update its trusted origins.",
      FAILED_TO_CREATE_USER:"The authentication service could not create the account. Please try again or contact the HSI administrator.",
      AUTH_UNAVAILABLE:"Authentication service unavailable. Please retry or contact the HSI administrator.",
      AUTH_INVALID_RESPONSE:"Authentication service returned an unexpected response. Contact the HSI administrator.",
      AUTH_GATEWAY_NOT_CONFIGURED:"Authentication gateway configuration is incomplete. The HSI administrator must check the deployment settings.",
      DEPLOYMENT_ORIGIN_MISMATCH:"This website address does not match HSI_PUBLIC_ORIGIN in Vercel. Use the configured website address or ask the HSI administrator to correct it and redeploy.",
      INVALID_CALLBACK_URL:"The authentication service has not approved the verification callback address. The HSI administrator must check the site's trusted origins.",
      INVALID_REDIRECT_URL:"The authentication service has not approved the sign-in redirect address. The HSI administrator must check the site's trusted origins.",
      MISSING_OR_NULL_ORIGIN:"The authentication service could not verify the website origin. The HSI administrator must check its trusted origins and gateway configuration.",
     };
     return{data:null,error:{message:safe[code]??(response.status===429?"Too many authentication attempts. Please try again later.":"Authentication request was denied."),code:safe[code]?code:"auth_denied"}};
    }
    try{return{data:parse(value),error:null};}catch{return{data:null,error:{message:"Authentication service returned an invalid response. The operation could not be confirmed.",code:"auth_invalid_response"}};}
   })();
   // An abort-aware fetch normally rejects promptly. The race also covers a stalled body reader.
   const timeout=new Promise<AuthResult<T>>(resolve=>{controller.signal.addEventListener("abort",()=>resolve({data:null,error:{message:"Authentication request timed out. Please try again.",code:"auth_timeout"}}),{once:true});});
   return await Promise.race([operation,timeout]);
  }catch{return{data:null,error:{message:expired?"Authentication request timed out. Please try again.":"Authentication service unavailable. Check the approved origin and network configuration.",code:expired?"auth_timeout":"auth_unavailable"}};}finally{clearTimeout(timer);}
 }
 const action=(value:unknown)=>{if(!record(value))throw Error("Invalid authentication action response");return value;};
 return {baseUrl,
  signIn:(email:string,password:string)=>authRequest("/sign-in/email",{email,password},action),
  signUp:(name:string,email:string,password:string)=>authRequest<HsiRegistration>("/sign-up/email",{name,email,password},value=>parseAuthRegistration(value,email)),
  session:()=>authRequest<HsiAuthSession>("/get-session",undefined,value=>parseAuthSession(value)),
  signOut:()=>authRequest("/sign-out",{},action),
 };
}
