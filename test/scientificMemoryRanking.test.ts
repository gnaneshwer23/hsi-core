import {expect,test} from "bun:test";
import {rankScientificMemory} from "../src/scientificMemoryRanking";
const a={id:"00000000-0000-4000-8000-000000000001",version:1,lexicalRank:1,semanticRank:null,graphRank:null};
const b={...a,id:"00000000-0000-4000-8000-000000000002",lexicalRank:3,semanticRank:2};
test("multi-channel agreement outranks single channel",()=>expect(rankScientificMemory([a,b])[0]?.id).toBe(b.id));
test("stable ties and limit",()=>expect(rankScientificMemory([{...a,id:b.id},a],1)[0]?.id).toBe(a.id));
test("no match excluded",()=>expect(rankScientificMemory([{...a,lexicalRank:null}])).toEqual([]));
test("invalid and duplicate inputs rejected",()=>{
 expect(()=>rankScientificMemory([a,a])).toThrow();
 expect(()=>rankScientificMemory([{...a,semanticRank:NaN}])).toThrow();
 expect(()=>rankScientificMemory([a],0)).toThrow();
});
test("ranking returns references not memory content",()=>expect(Object.keys(rankScientificMemory([a])[0]!).sort()).toEqual(["id","score","version"]));
