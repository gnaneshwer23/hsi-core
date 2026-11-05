/** ARCH-003 standalone Bun API server. Deploy behind a trusted same-origin
 * reverse proxy forwarding /api/research/account and /api/research/interrogative/*.
 * Never deploy from the static site build or expose database credentials to Vite.
 */
import {createNeonInterrogativeApiServices,handleInterrogativeApi} from "./interrogativeApi";
import {readResearchDeploymentConfig} from "./vercelResearch";
const databaseUrl=process.env.HSI_DATABASE_URL;
const publicOrigin=process.env.HSI_PUBLIC_ORIGIN;
const port=Number(process.env.HSI_API_PORT??"3100");
if(!databaseUrl||!publicOrigin||!/^https:\/\//.test(publicOrigin)||!Number.isInteger(port)||port<1||port>65535)
 throw Error("HSI_DATABASE_URL, HTTPS HSI_PUBLIC_ORIGIN and valid HSI_API_PORT required");
const origin=new URL(publicOrigin).origin;
const deployment=readResearchDeploymentConfig(process.env);
const services=createNeonInterrogativeApiServices({databaseUrl,neonProjectId:process.env.HSI_NEON_PROJECT_ID,
 writesEnabled:deployment.ok&&deployment.writesEnabled,sscReleaseId:process.env.HSI_SSC_RESEARCH_RELEASE_ID});
Bun.serve({hostname:"127.0.0.1",port,fetch(request){
 // The reverse proxy must preserve the original Host and HTTPS forwarding.
 const url=new URL(request.url);
 const forwardedProto=request.headers.get("x-forwarded-proto");
 const forwardedHost=request.headers.get("x-forwarded-host");
 if(forwardedProto!=="https"||forwardedHost!==new URL(origin).host)
  return Response.json({error:"Trusted HTTPS proxy required"},{status:403});
 const publicRequest=new Request(origin+url.pathname+url.search,request);
 return handleInterrogativeApi(publicRequest,services);
}});
