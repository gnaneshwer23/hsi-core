import {normalizePmid} from "./scientificMemoryPubmed";
type Transport=(url:string,init:RequestInit)=>Promise<Response>;
export type PubmedFetchResult={kind:"xml";pmid:string;xml:string}|{kind:"unavailable";reason:"disabled"|"rate_limited"|"not_found"|"transport_or_response"};
/** Unmounted public-only transport. XML remains untrusted until parsed and identity checked. */
export function createPubmedTransport(fetcher:Transport,enabled=false,timeoutMs=5000){
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw Error("Invalid timeout");
 return {async lookup(input:string):Promise<PubmedFetchResult>{
  if(!enabled)return {kind:"unavailable",reason:"disabled"};
  const pmid=normalizePmid(input);
  const url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id="+pmid;
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  const run=async():Promise<PubmedFetchResult>=>{
   const response=await fetcher(url,{method:"GET",redirect:"error",credentials:"omit",headers:{Accept:"application/xml,text/xml"},signal:controller.signal});
   if(response.status===429)return {kind:"unavailable",reason:"rate_limited"};
   if(response.status===404)return {kind:"unavailable",reason:"not_found"};
   if(!response.ok||!response.body||! /^(?:application|text)\/xml(?:\s*;|$)/i.test(response.headers.get("content-type")??""))throw Error();
   const reader=response.body.getReader();const decoder=new TextDecoder("utf-8",{fatal:true});let bytes=0;let xml="";
   try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>2097152){controller.abort();throw Error();}xml+=decoder.decode(chunk.value,{stream:true});}xml+=decoder.decode();}finally{reader.releaseLock();}
   if(!xml.trim())throw Error();
   return {kind:"xml",pmid,xml};
  };
  try{return await Promise.race([run(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error());},timeoutMs);})]);}
  catch{return {kind:"unavailable",reason:"transport_or_response"};}finally{if(timer!==undefined)clearTimeout(timer);}
 }};
}
