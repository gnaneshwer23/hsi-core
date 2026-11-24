import {expect,test} from "bun:test";
import {rankMemoryEmbeddings} from "../src/scientificMemorySemantic";
const profile={model:"synthetic-v1",dimensions:2};
const a={id:"00000000-0000-4000-8000-000000000001",version:1,model:profile.model,vector:[0,1]};
const b={...a,id:"00000000-0000-4000-8000-000000000002",vector:[2,0]};
test("cosine rank and version reference",()=>expect(rankMemoryEmbeddings(profile,[1,0],[a,b],1)).toEqual([{id:b.id,version:1,semanticRank:1}]));
test("reject incompatible models and invalid vectors",()=>{
 expect(()=>rankMemoryEmbeddings(profile,[1,0],[{...a,model:"other"}])).toThrow();
 expect(()=>rankMemoryEmbeddings(profile,[0,0],[a])).toThrow();
 expect(()=>rankMemoryEmbeddings(profile,[1,0],[{...a,vector:[NaN,1]}])).toThrow();
 expect(()=>rankMemoryEmbeddings(profile,[1,0],[a,a])).toThrow();
});
test("stable ties",()=>expect(rankMemoryEmbeddings(profile,[1,0],[{...b,vector:a.vector},a])[0]?.id).toBe(a.id));
