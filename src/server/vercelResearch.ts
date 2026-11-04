/** Vercel Bun Web-handler adapter. No listener, migrations, automatic grants or client identity trust. */
import {assertHsiNeonDatabaseUrl,HSI_STAGING_HOST_PREFIX} from "../db/neonGuard";
import {resolveProviderSessionToken} from "../db/providerSessionToken";
import {createNeonInterrogativeApiServices,handleInterrogativeApi} from "./interrogativeApi";
import {gatewayJson,handleAuthGateway,verifiedProviderSession} from "./neonAuthGateway";
type Environment=Record<string,string|undefined>;
function httpsUrl(value:string|undefined,originOnly=false):string|null{
 try{const u=new URL(value??"");if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash||(originOnly&&u.pathname!=="/"))return null;return originOnly?u.origin:u.href.replace(/\/+$/,"")}catch{return null}
}
export function readResearchDeploymentConfig(env:Environment){
 const publicOrigin=httpsUrl(env.HSI_PUBLIC_ORIGIN,true);
 const candidate=httpsUrl(env.HSI_AUTH_BASE_URL??env.VITE_HSI_AUTH_BASE_URL);
 // A provider URL pointing back to this gateway would recurse indefinitely.
 const authBaseUrl=candidate&&new URL(candidate).origin!==publicOrigin?candidate:null;
 const databaseUrl=env.HSI_DATABASE_URL;
 const missing=[...(!publicOrigin?["HSI_PUBLIC_ORIGIN"]:[]),...(!authBaseUrl?["HSI_AUTH_BASE_URL"]:[]),...(!databaseUrl||!assertHsiNeonDatabaseUrl(databaseUrl,{neonProjectId:env.HSI_NEON_PROJECT_ID}).ok?["HSI_DATABASE_URL"]:[])];
 if(missing.length)return {ok:false as const,missing};
 const endpoint=new URL(databaseUrl!).hostname.split(".")[0]?.replace(/-pooler$/,"");
 const writesEnabled=env.HSI_RESEARCH_WRITES_ENABLED==="true"&&env.HSI_NEON_BRANCH_ID==="br-rough-snow-zagxbvjp"&&endpoint===HSI_STAGING_HOST_PREFIX;
 return {ok:true as const,publicOrigin:publicOrigin!,authBaseUrl:authBaseUrl!,databaseUrl:databaseUrl!,neonProjectId:env.HSI_NEON_PROJECT_ID,writesEnabled};
}
export type VercelResearchDependencies={
 transport?:typeof fetch;
 resolveToken?:typeof resolveProviderSessionToken;
 services?:ReturnType<typeof createNeonInterrogativeApiServices>;
};
export async function handleVercelResearch(request:Request,env:Environment,dependencies:VercelResearchDependencies={}):Promise<Response>{
 const path=new URL(request.url).pathname;
 const config=readResearchDeploymentConfig(env);
 if(path==="/api/research/health"){
  if(request.method!=="GET")return gatewayJson({error:"Method not allowed"},405);
  const requestOrigin=new URL(request.url).origin;
  const originMatches=config.ok&&requestOrigin===config.publicOrigin;
  return gatewayJson({service:"hsi-research",status:!config.ok?"configuration_required":originMatches?"configuration_validated":"origin_mismatch",...(config.ok?{writesEnabled:config.writesEnabled,publicOrigin:config.publicOrigin,requestOrigin,originMatches}:{missing:config.missing}),databaseConnectionTested:false},config.ok&&originMatches?200:503);
 }
 if(!path.startsWith("/api/auth/")&&!path.startsWith("/api/research/"))return gatewayJson({error:"Not found"},404);
 if(path.startsWith("/api/research/")&&path!=="/api/research/account"&&!/^\/api\/research\/interrogative\/hsi-interrogative-[a-zA-Z0-9-]{8,100}(?:\/(?:submit-review|decision))?$/.test(path))return gatewayJson({error:"Not found"},404);
 if(!config.ok)return gatewayJson({code:"AUTH_GATEWAY_NOT_CONFIGURED",error:"Research service requires deployment configuration"},503);
 if(new URL(request.url).origin!==config.publicOrigin)return gatewayJson({code:"DEPLOYMENT_ORIGIN_MISMATCH",error:"Deployment origin mismatch"},403);
 if(path.startsWith("/api/auth/"))return handleAuthGateway(request,config,dependencies.transport);
 if(request.method==="POST"&&!config.writesEnabled)return gatewayJson({error:"Research writes are disabled on this deployment"},403);
 try{
  const provider=await verifiedProviderSession(config,request,dependencies.transport);
  let token:string|null=null;
  if(provider?.user.emailVerified)token=await (dependencies.resolveToken??resolveProviderSessionToken)({databaseUrl:config.databaseUrl,neonProjectId:config.neonProjectId,sessionId:provider.session.id,userId:provider.user.id});
  const headers=new Headers(request.headers);headers.delete("cookie");
  if(token)headers.set("cookie","__Secure-better-auth.session_token="+encodeURIComponent(token));
  return handleInterrogativeApi(new Request(request,{headers}),dependencies.services??createNeonInterrogativeApiServices(config));
 }catch{return gatewayJson({error:"Research session verification unavailable"},503)}
}
