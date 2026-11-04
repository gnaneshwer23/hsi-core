/** Optional ecosystem adapters must never be a prerequisite for HSI research. */
export type OptionalProduct="aksh"|"isi";
export type AdapterResult<T>=
 |{status:"available";product:OptionalProduct;data:T}
 |{status:"unavailable";product:OptionalProduct;reason:"timeout"|"error"|"circuit_open"};
export type Clock=()=>number;
export class OptionalAdapterCircuit {
 private failures=0;
 private openUntil=0;
 constructor(private readonly threshold=3,private readonly cooldownMs=30000,private readonly clock:Clock=Date.now){
  if(!Number.isInteger(threshold)||threshold<1||!Number.isFinite(cooldownMs)||cooldownMs<1)throw Error("Invalid circuit settings");
 }
 isOpen(){return this.clock()<this.openUntil;}
 recordSuccess(){this.failures=0;this.openUntil=0;}
 recordFailure(){
  this.failures++;
  if(this.failures>=this.threshold){this.openUntil=this.clock()+this.cooldownMs;this.failures=0;}
 }
}
/** Timeout is cooperative: abort signal is passed to the adapter.
 * No retries on non-idempotent operations; only call this for read-only integrations.
 */
export async function readOptionalIntegration<T>(args:{
 product:OptionalProduct;read:(signal:AbortSignal)=>Promise<T>;
 timeoutMs:number;circuit:OptionalAdapterCircuit;
}):Promise<AdapterResult<T>>{
 if(!Number.isInteger(args.timeoutMs)||args.timeoutMs<1||args.timeoutMs>30000)throw Error("Invalid timeout");
 if(args.circuit.isOpen())return {status:"unavailable",product:args.product,reason:"circuit_open"};
 const controller=new AbortController();
 let timeoutHandle:ReturnType<typeof setTimeout>|undefined;
 let timedOut=false;
 const timeout=new Promise<never>((_,reject)=>{
  timeoutHandle=setTimeout(()=>{timedOut=true;controller.abort();reject(new Error("adapter_timeout"));},args.timeoutMs);
 });
 try{
  const data=await Promise.race([args.read(controller.signal),timeout]);
  args.circuit.recordSuccess();
  return {status:"available",product:args.product,data};
 }catch{
  args.circuit.recordFailure();
  return {status:"unavailable",product:args.product,reason:timedOut?"timeout":"error"};
 }finally{if(timeoutHandle!==undefined)clearTimeout(timeoutHandle);}
}
