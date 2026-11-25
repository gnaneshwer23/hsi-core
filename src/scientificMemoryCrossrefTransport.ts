import {normalizeEvidenceDoi,interpretCrossrefStatus,type CrossrefStatusCandidate} from "./scientificMemoryCrossref";
type Transport=(url:string,init:RequestInit)=>Promise<Response>;
export type CrossrefLookup={kind:"metadata";candidate:CrossrefStatusCandidate}|{kind:"unavailable";reason:"disabled"|"rate_limited"|"not_found"|"transport_or_response"};
/** Unmounted transport; caller must establish public DOI provenance before enabling. */
export function createCrossrefTransport(fetcher:Transport,enabled=false,timeoutMs=5000){
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw Error("Invalid timeout");
 return {async lookup(doiInput:string):Promise<CrossrefLookup>{
  if(!enabled)return {kind:"unavailable",reason:"disabled"};
  const doi=normalizeEvidenceDoi(doiInput);
  const url="https://api.crossref.org/works/"+encodeURIComponent(doi);
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  const run=async():Promise<CrossrefLookup>=>{
   const response=await fetcher(url,{method:"GET",redirect:"error",credentials:"omit",headers:{Accept:"application/json"},signal:controller.signal});
   if(response.status===429)return {kind:"unavailable",reason:"rate_limited"};
   if(response.status===404)return {kind:"unavailable",reason:"not_found"};
   if(!response.ok||!response.body||!/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type")??""))throw Error();
   const reader=response.body.getReader();const decoder=new TextDecoder("utf-8",{fatal:true});let bytes=0;let body="";
   try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>1048576){controller.abort();throw Error();}body+=decoder.decode(chunk.value,{stream:true});}body+=decoder.decode();}finally{reader.releaseLock();}
   return {kind:"metadata",candidate:interpretCrossrefStatus(doi,JSON.parse(body))};
  };
  try{return await Promise.race([run(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error());},timeoutMs);})]);}
  catch{return {kind:"unavailable",reason:"transport_or_response"};}finally{if(timer!==undefined)clearTimeout(timer);}
 }};
}
