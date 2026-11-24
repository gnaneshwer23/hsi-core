import {test,expect} from "bun:test";
import {handleScientificMemoryHttpFixture} from "../src/server/scientificMemoryHttpFixture";
test("all existing mutations use verified fixture session and reject cross-origin requests",async()=>{
 const calls:string[]=[];
 const deps={origin:"https://fixture.invalid",verifyFixtureSession:async()=>"synthetic-token-alice",sql:{async unsafe(query:string){calls.push(query);return [];}}};
 const id="00000000-0000-4000-8000-000000000001",until="2030-01-01T00:00:00Z";
 const cases=[["POST","",{id,kind:"note",body:"fixture",sourceRefs:[],until,requestId:id},201],["POST","/"+id+"/share",{grantee:"bob",until,requestId:id},200],["POST","/"+id+"/revoke",{grantee:"bob",requestId:id},200],["DELETE","/"+id,{requestId:id},200]] as const;
 for(const [method,path,body,status] of cases){
 const url=deps.origin+"/api/research/memory/records"+path+"?tenant=a&scope=s";
 const make=(origin:string)=>new Request(url,{method,headers:{origin,"content-type":"application/json"},body:JSON.stringify(body)});
 expect((await handleScientificMemoryHttpFixture(make("https://other.invalid"),deps))?.status).toBe(403);
 expect((await handleScientificMemoryHttpFixture(make(deps.origin),deps))?.status).toBe(status);
 }
 expect(calls.map(q=>q.match(/hsi_memory\.([a-z_]+)/)?.[1])).toEqual(["create_record","set_share","set_share","delete_record"]);
});
