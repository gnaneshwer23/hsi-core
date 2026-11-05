import {verifyResearchOutcome,renderResearchOutcome,type ResearchOutcome} from "../../../src/researchOutcome";
import type {EvidenceBrief} from "../../../src/investigationDelivery";
import {deliveryDigest} from "./investigationDeliveryClient";
async function read(response:Response){
 if(!response.ok||!response.body)throw Error("Outcome unavailable");
 const reader=response.body.getReader(),chunks:Uint8Array[]=[];let bytes=0;
 try{while(true){const item=await reader.read();if(item.done)break;bytes+=item.value.byteLength;if(bytes>2_100_000)throw Error("Outcome exceeds display budget");chunks.push(item.value)}}finally{await reader.cancel()}
 const buffer=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength}return new TextDecoder("utf-8",{fatal:true}).decode(buffer);
}
function url(brief:EvidenceBrief){return "/api/research/interrogative/"+encodeURIComponent(brief.package.investigation.id)+"/outcome"}
export async function fetchResearchOutcome(brief:EvidenceBrief,signal:AbortSignal):Promise<ResearchOutcome>{
 const response=await fetch(url(brief),{credentials:"same-origin",cache:"no-store",redirect:"error",signal,headers:{Accept:"application/json"}});
 return verifyResearchOutcome(JSON.parse(await read(response)),brief,deliveryDigest);
}
export async function downloadResearchOutcome(brief:EvidenceBrief,outcome:ResearchOutcome,format:"json"|"markdown"){
 const response=await fetch(url(brief)+"?format="+format,{credentials:"same-origin",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
 const content=await read(response),hash=await deliveryDigest(content);
 if(response.headers.get("x-hsi-content-sha256")!==hash||response.headers.get("x-hsi-package-sha256")!==brief.package.packageHash||response.headers.get("x-hsi-outcome-sha256")!==outcome.outcomeHash||content!==renderResearchOutcome(outcome,format))throw Error("Outcome download changed");
 const blob=URL.createObjectURL(new Blob([content],{type:format==="json"?"application/json":"text/markdown;charset=utf-8"})),a=document.createElement("a");
 a.href=blob;a.download=outcome.investigationId+"-outcome-"+hash.slice(0,12)+(format==="json"?".json":".md");document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(blob),1000);
}
