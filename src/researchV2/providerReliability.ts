/** Provider configuration and bounded invocation, without hardcoded credentials. */
import type {EntailmentModelRunner} from "./modelEntailment";
export interface ProviderConfig {providerId:string;modelId:string;endpoint:string;timeoutMs:number;maxResponseBytes:number;}
export function validateProviderConfig(config:ProviderConfig):ProviderConfig{
 if(!config||!/^[a-z0-9_-]{2,40}$/i.test(config.providerId)||!config.modelId||config.modelId.length>128||!Number.isInteger(config.timeoutMs)||config.timeoutMs<1000||config.timeoutMs>30000||!Number.isInteger(config.maxResponseBytes)||config.maxResponseBytes<256||config.maxResponseBytes>65536)throw Error("Invalid provider config");
 const url=new URL(config.endpoint);
 if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||!url.hostname||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|::1)/i.test(url.hostname))throw Error("Untrusted provider endpoint");
 return config;
}
/** Caller supplies a trusted HTTP transport and secret; do not accept user-supplied endpoints. */
export function createProviderRunner(config:ProviderConfig,transport:(config:ProviderConfig,payload:{instruction:string;claim:string;passage:string})=>Promise<unknown>):EntailmentModelRunner{
 const checked=validateProviderConfig(config);
 return async payload=>{
  if(!payload||payload.passage.length>3000||payload.claim.length>2000||payload.instruction.length>2000)throw Error("Oversized model request");
  return transport(checked,payload);
 };
}
