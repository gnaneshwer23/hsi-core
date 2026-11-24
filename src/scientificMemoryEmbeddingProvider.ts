/** Offline provider boundary. No external provider is approved or configured here. */
import type {MemoryEmbeddingProfile} from "./scientificMemorySemantic";
export interface ScientificEmbeddingProvider {
 readonly profile:MemoryEmbeddingProfile;
 readonly transport:"local_fixture"|"external";
 embed(text:string,signal:AbortSignal):Promise<readonly number[]>;
}
export interface EmbeddingInput { text:string; dataClass:"synthetic_demo"|"public_biomedical"|"private_research"|"clinical"; }
export function createScientificEmbeddingGateway(provider:ScientificEmbeddingProvider,timeoutMs=3000){
 const profile=Object.freeze({...provider.profile});
 if(!profile.model||profile.model.length>128||!Number.isInteger(profile.dimensions)||profile.dimensions<1||profile.dimensions>4096||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw Error("Invalid embedding configuration");
 return {profile,async embed(input:EmbeddingInput):Promise<number[]>{
  // Classification must come from trusted server context, not user input.
  if(provider.transport!=="local_fixture"||input.dataClass!=="synthetic_demo")throw Error("Embedding policy denied");
  if(typeof input.text!=="string"||!input.text.trim()||new TextEncoder().encode(input.text).length>65536)throw Error("Invalid embedding input");
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const vector=await Promise.race([
    Promise.resolve().then(()=>provider.embed(input.text,controller.signal)),
    new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Embedding timeout"));},timeoutMs);})
   ]);
   if(!Array.isArray(vector)||vector.length!==profile.dimensions||Array.from(vector).some(v=>typeof v!=="number"||!Number.isFinite(v))||!vector.some(v=>v!==0))throw Error("Invalid embedding output");
   return Array.from(vector);
  }catch{throw Error("Embedding unavailable");}
  finally{if(timer!==undefined)clearTimeout(timer);}
 }};
}
export function createSyntheticEmbeddingProvider():ScientificEmbeddingProvider{
 return {profile:{model:"hsi-synthetic-fixture-v1",dimensions:8},transport:"local_fixture",async embed(text,signal){
  if(signal.aborted)throw Error("Aborted");
  const vector=Array<number>(8).fill(0);
  for(const byte of new TextEncoder().encode(text)){const i=byte%8;vector[i]=(vector[i]??0)+1;}
  return vector;
 }};
}
