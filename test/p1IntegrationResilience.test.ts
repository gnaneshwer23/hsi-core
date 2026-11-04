import {test,expect} from "bun:test";
import {OptionalAdapterCircuit,readOptionalIntegration} from "../src/p1IntegrationResilience";
test("optional ISI outage does not throw into HSI core",async()=>{
 const circuit=new OptionalAdapterCircuit(2);
 const read=async()=>{throw Error("ISI unavailable")};
 expect(await readOptionalIntegration({product:"isi",read,timeoutMs:100,circuit})).toEqual({status:"unavailable",product:"isi",reason:"error"});
 expect(await readOptionalIntegration({product:"isi",read,timeoutMs:100,circuit})).toEqual({status:"unavailable",product:"isi",reason:"error"});
 expect(await readOptionalIntegration({product:"isi",read,timeoutMs:100,circuit})).toEqual({status:"unavailable",product:"isi",reason:"circuit_open"});
});
test("successful Aksh read is isolated and typed",async()=>{
 const result=await readOptionalIntegration({product:"aksh",read:async()=>({count:3}),timeoutMs:100,circuit:new OptionalAdapterCircuit()});
 expect(result).toEqual({status:"available",product:"aksh",data:{count:3}});
});
test("timeouts abort cooperative adapters and return unavailable",async()=>{
 let aborted=false;
 const result=await readOptionalIntegration({product:"isi",read:(signal)=>new Promise<string>((_,reject)=>{
  signal.addEventListener("abort",()=>{aborted=true;reject(Error("aborted"));},{once:true});
 }),timeoutMs:5,circuit:new OptionalAdapterCircuit()});
 expect(result.status).toBe("unavailable");
 expect(aborted).toBe(true);
});
test("circuit recovers after cooldown",async()=>{
 let now=1000;
 const circuit=new OptionalAdapterCircuit(1,50,()=>now);
 circuit.recordFailure();
 expect(circuit.isOpen()).toBe(true);
 now=1050;
 expect(circuit.isOpen()).toBe(false);
 circuit.recordSuccess();
 expect(circuit.isOpen()).toBe(false);
});
