import {normalizePmid} from "./scientificMemoryPubmed";
import {interpretEuropePmcIdentity,type EuropePmcCandidate} from "./scientificMemoryEuropePmc";
type Fetcher=(url:string,init:RequestInit)=>Promise<Response>;
export type EuropePmcResult={kind:"metadata";candidate:EuropePmcCandidate}|{kind:"unavailable";reason:"disabled"|"rate_limited"|"not_found"|"transport_or_response"};
export function createEuropePmcTransport(fetcher:Fetcher,enabled=false,timeoutMs=5000){
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw Error("Invalid timeout");
 return {async lookup(input:string):Promise<EuropePmcResult>{
 if(!enabled)return {kind:"unavailable",reason:"disabled"};
 const pmid=normalizePmid(input);
 const url="https://www.ebi.ac.uk/europepmc/webservices/rest/search?"+new URLSearchParams({query:"EXT_ID:"+pmid+" AND SRC:MED",format:"json",resultType:"core",pageSize:"2"}).toString();
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 const run=async():Promise<EuropePmcResult>=>{
 const r=await fetcher(url,{method:"GET",redirect:"error",credentials:"omit",headers:{Accept:"application/json"},signal:controller.signal});
 if(r.status===429)return {kind:"unavailable",reason:"rate_limited"};
 if(r.status===404)return {kind:"unavailable",reason:"not_found"};
 if(!r.ok||!r.body||!/^application\/json(?:\s*;|$)/i.test(r.headers.get("content-type")??""))throw Error("Invalid response");
 const reader=r.body.getReader(),decoder=new TextDecoder("utf-8",{fatal:true});let bytes=0,body="";
 try{while(true){const c=await reader.read();if(c.done)break;bytes+=c.value.byteLength;if(bytes>2097152){controller.abort();throw Error("Response too large");}body+=decoder.decode(c.value,{stream:true});}body+=decoder.decode();}finally{reader.releaseLock();}
 const payload=JSON.parse(body);
 if(payload?.hitCount===0&&Array.isArray(payload?.resultList?.result)&&payload.resultList.result.length===0)return {kind:"unavailable",reason:"not_found"};
 return {kind:"metadata",candidate:interpretEuropePmcIdentity(pmid,payload)};
 };
 try{return await Promise.race([run(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Timeout"));},timeoutMs);})]);}catch{return {kind:"unavailable",reason:"transport_or_response"};}finally{if(timer!==undefined)clearTimeout(timer);}
 }};
}
