import {test,expect} from "bun:test";
import {createScientificMemoryFixtureAdapter} from "../src/db/scientificMemoryFixtureAdapter";
const id="00000000-0000-4000-8000-000000000001";
test("read uses fixed parameterised procedure",async()=>{
 const calls:{query:string;params:unknown[]}[]=[];
 const a=createScientificMemoryFixtureAdapter({async unsafe(query,params){calls.push({query,params});return [];}},"synthetic-token-alice");
 await a.read("tenant-a","scope-a",id);
 expect(calls[0]?.params).toEqual(["synthetic-token-alice","tenant-a","scope-a",id]);
 expect(calls[0]?.query).toContain("hsi_memory.read_current($1");
 await expect(a.read("bad'","scope-a",id)).rejects.toThrow();
 expect(calls.length).toBe(1);
});
test("revision passes content as parameter and rejects invalid version",async()=>{
 const calls:unknown[][]=[];
 const a=createScientificMemoryFixtureAdapter({async unsafe(_query,params){calls.push(params);return [{version:2}];}},"synthetic-token-alice");
 await a.revise("tenant-a","scope-a",id,1,"' synthetic",["PMID:123"],id);
 expect(calls[0]?.[5]).toBe("' synthetic");
 await expect(a.revise("tenant-a","scope-a",id,0,"x",[],id)).rejects.toThrow();
 expect(calls.length).toBe(1);
});
