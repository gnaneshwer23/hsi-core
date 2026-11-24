import {test,expect} from "bun:test";
import {handleScientificMemoryHttpFixture} from "../src/server/scientificMemoryHttpFixture";
test("lifecycle HTTP operations use restricted procedures",async()=>{
 const calls:string[]=[];
 const deps={origin:"https://fixture.invalid",verifyFixtureSession:async()=>"synthetic-token-alice",sql:{async unsafe(query:string){calls.push(query);return [{version:1}];}}};
 const id="00000000-0000-4000-8000-000000000001",root=deps.origin+"/api/research/memory/records",query="?tenant=a&scope=s";
 expect((await handleScientificMemoryHttpFixture(new Request(root+query+"&limit=101"),deps))?.status).toBe(400);
 expect((await handleScientificMemoryHttpFixture(new Request(root+query),deps))?.status).toBe(200);
 for(const [suffix,body,status] of [["export",{requestId:id},200],["corrections",{requestId:id,expectedVersion:1,body:"proposal"},201]] as const){
 const response=await handleScientificMemoryHttpFixture(new Request(root+"/"+id+"/"+suffix+query,{method:"POST",headers:{origin:deps.origin,"content-type":"application/json"},body:JSON.stringify(body)}),deps);
 expect(response?.status).toBe(status);
 }
 expect(calls.map(q=>q.match(/hsi_memory\.([a-z_]+)/)?.[1])).toEqual(["list_current","export_current","propose_correction"]);
});
