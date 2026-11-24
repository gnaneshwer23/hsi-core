import {test,expect} from "bun:test";
import {createScientificMemoryFixtureAdapter} from "../src/db/scientificMemoryFixtureAdapter";
test("mutation procedure parameters and invalid input",async()=>{
 const calls:{query:string;params:unknown[]}[]=[];
 const a=createScientificMemoryFixtureAdapter({async unsafe(query,params){calls.push({query,params});return [];}},"synthetic-token-alice");
 const id="00000000-0000-4000-8000-000000000001",until="2030-01-01T00:00:00Z";
 await a.create("a","s",id,"note","fixture",[],until,id);
 await a.share("a","s",id,"bob",until,id);
 await a.revoke("a","s",id,"bob",id);
 await a.delete("a","s",id,id);
 expect(calls.map(c=>c.query.match(/hsi_memory\.([a-z_]+)/)?.[1])).toEqual(["create_record","set_share","set_share","delete_record"]);
 expect(calls[1]?.params.slice(4)).toEqual(["bob",until,false,id]);
 expect(calls[2]?.params.slice(4)).toEqual(["bob",null,true,id]);
 await expect(a.create("a","s",id,"verified_claim","x",[],until,id)).rejects.toThrow();
 await expect(a.delete("a","s",id,"invalid")).rejects.toThrow();
 expect(calls.length).toBe(4);
});
