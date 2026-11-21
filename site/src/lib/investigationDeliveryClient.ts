import {verifyDeliveryView,verifyReviewPackage,verifyDeliveryDecision,type DeliveryView,type EvidenceBrief} from "../../../src/investigationDelivery";
import {researchApiErrorMessage} from "./researchApiErrors";
export const deliveryDigest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text))),x=>x.toString(16).padStart(2,"0")).join("");
export async function fetchDeliveryView(id:string,signal:AbortSignal):Promise<DeliveryView>{
 const unavailable="The evidence brief could not be verified. Check research access, source permissions and deployment readiness.";
 const response=await fetch("/api/research/interrogative/"+encodeURIComponent(id)+"/review-package",{credentials:"same-origin",cache:"no-store",redirect:"error",signal,headers:{Accept:"application/json"}});
 if(!response.ok){
  throw Error(await researchApiErrorMessage(response,"delivery_load",unavailable));
 }
 const raw=await response.text();
 if(raw.length>2_100_000)throw Error(unavailable);
 try{
  return await verifyDeliveryView(JSON.parse(raw),id,deliveryDigest);
 }catch{
  throw Error(unavailable);
 }
}
export async function downloadEvidenceBrief(id:string,format:"json"|"markdown",expectedPackageHash:string){
 const downloadFailed="Download could not be verified. Refresh the brief and check access before retrying.";
 const response=await fetch("/api/research/interrogative/"+encodeURIComponent(id)+"/brief?format="+format,{credentials:"same-origin",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
 if(!response.ok){
  throw Error(await researchApiErrorMessage(response,"brief_download","Brief unavailable. Refresh the package and verify access before retrying."));
 }
 const text=await response.text(),hash=response.headers.get("x-hsi-content-sha256"),packageHash=response.headers.get("x-hsi-package-sha256");
 if(text.length>2_100_000||!hash||!/^[a-f0-9]{64}$/.test(hash)||packageHash!==expectedPackageHash||await deliveryDigest(text)!==hash)throw Error(downloadFailed);
 if(format==="json"){
  const brief=JSON.parse(text) as EvidenceBrief;
  if(brief.schemaVersion!=="hsi-investigation-brief-1"||brief.scope!=="research_only"||brief.graphPublicationApproved!==false||brief.package.investigation.id!==id||brief.package.packageHash!==expectedPackageHash)throw Error(downloadFailed);
  try{
   await verifyReviewPackage(brief.package,deliveryDigest);if(brief.decision){if(!brief.submission)throw Error(downloadFailed);await verifyDeliveryDecision(brief.decision,brief.package,brief.submission,deliveryDigest)}
  }catch(e){
   if(e instanceof Error&&e.message===downloadFailed)throw e;
   throw Error(downloadFailed);
  }
 }
 const filename=id+"-"+hash.slice(0,12)+(format==="json"?".json":".md");
 const url=URL.createObjectURL(new Blob([text],{type:format==="json"?"application/json":"text/markdown;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return filename;
}
