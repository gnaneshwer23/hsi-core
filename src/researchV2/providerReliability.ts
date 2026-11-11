/** Server-only approved provider boundary. No credentials, retries or live activation. */
import type {EntailmentModelRunner} from "./modelEntailment";
export interface ProviderConfig {providerId:string;modelId:string;endpoint:string;timeoutMs:number;maxResponseBytes:number;}
// New endpoints require code/security review, never a request or model-supplied allowlist.
const ENDPOINTS:Readonly<Record<string,readonly string[]>> = Object.freeze({
 openai:Object.freeze(["https://api.openai.com/v1/responses","https://api.openai.com/v1/chat/completions"]),
 anthropic:Object.freeze(["https://api.anthropic.com/v1/messages"]),
});
export type ProviderPayload={instruction:string;claim:string;passage:string};
/** Trusted transport supplies auth/wire encoding and must disable redirects.
 * Deployment network policy must additionally restrict DNS and provider egress.
 */
export type ProviderTransport=(config:Readonly<ProviderConfig>,payload:ProviderPayload,options:{signal:AbortSignal;redirect:"error"})=>Promise<Response>;
export function validateProviderConfig(config:ProviderConfig):Readonly<ProviderConfig>{
 if(!config||typeof config.providerId!=="string"||typeof config.modelId!=="string"||!config.modelId.trim()||config.modelId.length>128||!Number.isInteger(config.timeoutMs)||config.timeoutMs<1000||config.timeoutMs>30000||!Number.isInteger(config.maxResponseBytes)||config.maxResponseBytes<256||config.maxResponseBytes>65536)throw Error("Invalid provider config");
 if(!Object.hasOwn(ENDPOINTS,config.providerId)||!ENDPOINTS[config.providerId]!.includes(config.endpoint))throw Error("Unapproved provider endpoint");
 return Object.freeze({...config});
}
export function createProviderRunner(config:ProviderConfig,transport:ProviderTransport):EntailmentModelRunner{
 const checked=validateProviderConfig(config);
 if(typeof transport!=="function")throw Error("Trusted provider transport required");
 return async payload=>{
  if(!payload||[payload.instruction,payload.claim,payload.passage].some(s=>typeof s!=="string"||!s.trim())||payload.passage.length>3000||payload.claim.length>2000||payload.instruction.length>2000)throw Error("Invalid model request");
  const controller=new AbortController();
  let reader:ReadableStreamDefaultReader<Uint8Array>|undefined;
  let body:ReadableStream<Uint8Array>|null=null;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const cancel=()=>{controller.abort();void (reader?reader.cancel():body?.cancel())?.catch(()=>{});};
  const execution=(async()=>{
   const response=await transport(checked,{...payload},{signal:controller.signal,redirect:"error"});
   if(!(response instanceof Response))throw Error("Invalid provider response");
   body=response.body;
   if(controller.signal.aborted){cancel();throw Error("Provider deadline exceeded");}
   if(!response.ok||response.redirected||(response.url&&response.url!==checked.endpoint))throw Error("Provider request failed");
   if(!/^application\/(?:json|[a-z0-9.+-]+\+json)(?:\s*;|$)/i.test(response.headers.get("content-type")??""))throw Error("Provider JSON response required");
   const declared=response.headers.get("content-length");
   if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>checked.maxResponseBytes))throw Error("Provider response exceeds byte limit");
   if(!body)throw Error("Empty provider response");
   reader=body.getReader();
   const chunks:Uint8Array[]=[];let size=0;
   while(true){
    const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;if(size>checked.maxResponseBytes)throw Error("Provider response exceeds byte limit");
    chunks.push(value);
   }
   const bytes=new Uint8Array(size);let offset=0;
   for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
   const result:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
   if(!result||typeof result!=="object"||Array.isArray(result))throw Error("Invalid provider JSON");
   return result;
  })();
  try{
   return await Promise.race([execution,new Promise<never>((_,reject)=>{
    timer=setTimeout(()=>{cancel();reject(Error("Provider deadline exceeded"));},checked.timeoutMs);
   })]);
  }finally{if(timer)clearTimeout(timer);cancel();}
 };
}
