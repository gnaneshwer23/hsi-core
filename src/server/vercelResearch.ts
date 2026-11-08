import {withResearchRequestControls,researchOperationalLogger,type ResearchControls} from "./researchRequestControls";
/** Vercel Bun Web-handler adapter. No listener, migrations, automatic grants or client identity trust. */
import {assertHsiNeonDatabaseUrl,HSI_STAGING_HOST_PREFIX} from "../db/neonGuard";
import {resolveProviderSessionToken} from "../db/providerSessionToken";
import {inspectProviderDatabaseSession} from "../db/providerSessionDiagnostics";
import {createNeonInterrogativeApiServices,handleInterrogativeApi} from "./interrogativeApi";
import {gatewayJson,handleAuthGateway,verifiedProviderSession,diagnoseAuthProvider} from "./neonAuthGateway";
type Environment=Record<string,string|undefined>;
function httpsUrl(value:string|undefined,originOnly=false):string|null{
 try{const u=new URL(value?.trim()??"");if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash||(originOnly&&u.pathname!=="/"))return null;return originOnly?u.origin:u.href.replace(/\/+$/,"")}catch{return null}
}
/** Neon Auth host `ep-….neonauth.…` and DB host `ep-…[-pooler].…` share one compute prefix per branch. */
export function neonComputeEndpointPrefix(hostname:string):string|null{
 const label=hostname.split(".")[0]?.replace(/-pooler$/,"")??"";
 return /^ep-[a-z0-9-]+$/i.test(label)?label:null;
}
export function readResearchDeploymentConfig(env:Environment){
 const publicOrigin=httpsUrl(env.HSI_PUBLIC_ORIGIN,true);
 const candidate=httpsUrl(env.HSI_AUTH_BASE_URL??env.VITE_HSI_AUTH_BASE_URL);
 // A provider URL pointing back to this gateway would recurse indefinitely.
 const provider=candidate?new URL(candidate):null;
 const neonAuthHost=Boolean(provider?.hostname.includes(".neonauth.")&&provider.hostname.endsWith(".neon.tech"));
 const validProviderPath=provider&&!provider.pathname.endsWith(".")&&(!neonAuthHost||provider.pathname==="/neondb/auth");
 const authBaseUrl=candidate&&provider?.origin!==publicOrigin&&validProviderPath?candidate:null;
 const browserAuthUrl=env.VITE_HSI_AUTH_BASE_URL===undefined?authBaseUrl:httpsUrl(env.VITE_HSI_AUTH_BASE_URL);
 const authUrlsMatch=Boolean(authBaseUrl&&browserAuthUrl===authBaseUrl);
 const databaseUrl=env.HSI_DATABASE_URL;
 const databaseOk=Boolean(databaseUrl&&assertHsiNeonDatabaseUrl(databaseUrl,{neonProjectId:env.HSI_NEON_PROJECT_ID}).ok);
 const authEndpointPrefix=authBaseUrl?neonComputeEndpointPrefix(new URL(authBaseUrl).hostname):null;
 const databaseEndpointPrefix=databaseOk?neonComputeEndpointPrefix(new URL(databaseUrl!).hostname):null;
 // Managed Neon Auth must target the same branch compute as HSI_DATABASE_URL; mixed staging/production prefixes fail closed.
 const endpointPrefixesMatch=!neonAuthHost||(Boolean(authEndpointPrefix&&databaseEndpointPrefix&&authEndpointPrefix===databaseEndpointPrefix));
 const missing=[...(!publicOrigin?["HSI_PUBLIC_ORIGIN"]:[]),...(!authBaseUrl||!authUrlsMatch?["HSI_AUTH_BASE_URL"]:[]),...(!databaseOk?["HSI_DATABASE_URL"]:[]),...(!endpointPrefixesMatch?["HSI_AUTH_BASE_URL","HSI_DATABASE_URL"]:[])];
 const alignment={authUrlsMatch,authEndpointPrefix,databaseEndpointPrefix,endpointPrefixesMatch};
 if(missing.length)return {ok:false as const,missing,...alignment};
 const writesEnabled=env.HSI_RESEARCH_WRITES_ENABLED==="true"&&env.HSI_NEON_BRANCH_ID==="br-rough-snow-zagxbvjp"&&databaseEndpointPrefix===HSI_STAGING_HOST_PREFIX;
 const sscReleaseId=env.HSI_SSC_RESEARCH_RELEASE_ID;
 return {ok:true as const,publicOrigin:publicOrigin!,authBaseUrl:authBaseUrl!,databaseUrl:databaseUrl!,neonProjectId:env.HSI_NEON_PROJECT_ID,writesEnabled,sscReleaseId,raComparisonReleaseId:env.HSI_RA_COMPARISON_RELEASE_ID,...alignment};
}
export type VercelResearchDependencies={
 controls?:ResearchControls;
 transport?:typeof fetch;
 resolveToken?:typeof resolveProviderSessionToken;
 inspectSession?:typeof inspectProviderDatabaseSession;
 services?:ReturnType<typeof createNeonInterrogativeApiServices>;
};
export async function handleVercelResearch(request:Request,env:Environment,dependencies:VercelResearchDependencies={}):Promise<Response>{
 return withResearchRequestControls(request,()=>handleVercelResearchCore(request,env,dependencies),{...dependencies.controls,requireShared:env.HSI_PILOT_REQUIRE_SHARED_LIMITER==="true"||dependencies.controls?.requireShared===true,emit:dependencies.controls?.emit??researchOperationalLogger(env.HSI_OPERATIONAL_LOGGING==="true")});
}
async function handleVercelResearchCore(request:Request,env:Environment,dependencies:VercelResearchDependencies):Promise<Response>{
 const path=new URL(request.url).pathname;
 const config=readResearchDeploymentConfig(env);
 if(path==="/api/research/health"){
  if(request.method!=="GET")return gatewayJson({error:"Method not allowed"},405);
  const requestOrigin=new URL(request.url).origin;
  const originMatches=config.ok&&requestOrigin===config.publicOrigin;
  const maintenance=env.HSI_RESEARCH_MAINTENANCE==="true";
  return gatewayJson({service:"hsi-research",status:!config.ok?"configuration_required":originMatches?(maintenance?"maintenance":"configuration_validated"):"origin_mismatch",...(config.ok?{writesEnabled:config.writesEnabled,publicOrigin:config.publicOrigin,requestOrigin,originMatches}:{missing:config.missing}),authUrlsMatch:config.authUrlsMatch,authEndpointPrefix:config.authEndpointPrefix,databaseEndpointPrefix:config.databaseEndpointPrefix,endpointPrefixesMatch:config.endpointPrefixesMatch,maintenance,databaseConnectionTested:false},config.ok&&originMatches&&!maintenance?200:503);
 }
 if(!path.startsWith("/api/auth/")&&!path.startsWith("/api/research/"))return gatewayJson({error:"Not found"},404);
 if(path.startsWith("/api/research/")&&path!=="/api/research/investigations"&&path!=="/api/research/account"&&path!=="/api/research/session-diagnostics"&&path!=="/api/research/scientific-review/queue"&&path!=="/api/research/scientific-review/history"&&path!=="/api/research/graph/ssc"&&path!=="/api/research/discovery/ssc"&&!/^\/api\/research\/interrogative\/hsi-interrogative-[a-zA-Z0-9-]{8,100}(?:\/(?:submit-review|decision|graph-context|review-package|brief|revision|outcome))?$/.test(path))return gatewayJson({error:"Not found"},404);
 if(!config.ok)return gatewayJson({code:"AUTH_GATEWAY_NOT_CONFIGURED",error:"Research service requires deployment configuration"},503);
 if(new URL(request.url).origin!==config.publicOrigin)return gatewayJson({code:"DEPLOYMENT_ORIGIN_MISMATCH",error:"Deployment origin mismatch"},403);
 if(path==="/api/auth/diagnostics")return diagnoseAuthProvider(request,config,dependencies.transport);
 if(path.startsWith("/api/auth/"))return handleAuthGateway(request,config,dependencies.transport);
 if(env.HSI_RESEARCH_MAINTENANCE==="true")return gatewayJson({code:"RESEARCH_MAINTENANCE",error:"Research access temporarily unavailable"},503);
 if(path==="/api/research/session-diagnostics"&&request.method!=="GET")return gatewayJson({error:"Method not allowed"},405);
 if(request.method==="POST"&&!config.writesEnabled)return gatewayJson({error:"Research writes are disabled on this deployment"},403);
 try{
  const provider=await verifiedProviderSession(config,request,dependencies.transport);
  if(!provider)return gatewayJson({code:"BACKEND_PROVIDER_SESSION_REQUIRED",error:"A provider-verified session cookie is required"},401);
  if(!provider.user.emailVerified)return gatewayJson({code:"EMAIL_NOT_VERIFIED",error:"Email verification required before research access"},401);
  if(path==="/api/research/session-diagnostics"){
   const result=await (dependencies.inspectSession??inspectProviderDatabaseSession)({databaseUrl:config.databaseUrl,neonProjectId:config.neonProjectId,sessionId:provider.session.id,userId:provider.user.id});
   return gatewayJson({service:"hsi-session",...result,authEndpointPrefix:config.authEndpointPrefix,databaseEndpointPrefix:config.databaseEndpointPrefix,endpointPrefixesMatch:config.endpointPrefixesMatch,databaseConnectionTested:true});
  }
  const token=await (dependencies.resolveToken??resolveProviderSessionToken)({databaseUrl:config.databaseUrl,neonProjectId:config.neonProjectId,sessionId:provider.session.id,userId:provider.user.id});
  if(!token)return gatewayJson({code:"BACKEND_DATABASE_SESSION_REQUIRED",error:"Provider session could not be resolved in the configured HSI database"},401);
  const headers=new Headers(request.headers);headers.delete("cookie");
  headers.set("cookie","__Secure-better-auth.session_token="+encodeURIComponent(token));
  return handleInterrogativeApi(new Request(request,{headers}),dependencies.services??createNeonInterrogativeApiServices(config));
 }catch{return gatewayJson({error:"Research session verification unavailable"},503)}
}
