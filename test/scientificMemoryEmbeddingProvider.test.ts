import {expect,test} from "bun:test";
import {createScientificEmbeddingGateway,createSyntheticEmbeddingProvider} from "../src/scientificMemoryEmbeddingProvider";
test("deterministic synthetic vectors",async()=>{
 const g=createScientificEmbeddingGateway(createSyntheticEmbeddingProvider());
 const input={text:"synthetic science",dataClass:"synthetic_demo" as const};
 const a=await g.embed(input);
 expect(a.length).toBe(8);expect(await g.embed(input)).toEqual(a);
});
test("deny external and non-synthetic before invocation",async()=>{
 let calls=0;
 const p={...createSyntheticEmbeddingProvider(),async embed(){calls++;return Array<number>(8).fill(1);}};
 const g=createScientificEmbeddingGateway(p);
 for(const dataClass of ["private_research","clinical","public_biomedical"] as const)await expect(g.embed({text:"test",dataClass})).rejects.toThrow("Embedding policy denied");
 await expect(createScientificEmbeddingGateway({...p,transport:"external"}).embed({text:"test",dataClass:"synthetic_demo"})).rejects.toThrow();
 expect(calls).toBe(0);
});
test("reject malformed provider output",async()=>{
 const p={...createSyntheticEmbeddingProvider(),async embed(){return [NaN];}};
 await expect(createScientificEmbeddingGateway(p).embed({text:"test",dataClass:"synthetic_demo"})).rejects.toThrow("Embedding unavailable");
});
test("timeout aborts provider",async()=>{
 let aborted=false;
 const p={...createSyntheticEmbeddingProvider(),embed(_text:string,signal:AbortSignal):Promise<number[]>{return new Promise((_,reject)=>signal.addEventListener("abort",()=>{aborted=true;reject(Error("aborted"));},{once:true}));}};
 await expect(createScientificEmbeddingGateway(p,10).embed({text:"test",dataClass:"synthetic_demo"})).rejects.toThrow("Embedding unavailable");
 expect(aborted).toBe(true);
});
