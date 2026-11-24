import {describe,expect,test} from "bun:test";
import {handleScientificMemoryApi,SCIENTIFIC_MEMORY_API_ENABLED,scientificMemoryOperations} from "../src/server/scientificMemoryApi";
describe("unmounted scientific memory API",()=>{
 test("status is disabled and non-cacheable",async()=>{
 const r=handleScientificMemoryApi(new Request("https://fixture.invalid/api/research/memory/status"))!;
 expect(SCIENTIFIC_MEMORY_API_ENABLED).toBe(false);
 expect(r.status).toBe(200);expect(r.headers.get("cache-control")).toBe("no-store");
 expect(await r.json()).toEqual({enabled:false,persisted:false,scientificApproval:false});
 });
 for(const [method,path,operation] of scientificMemoryOperations){
 test(operation+" is disabled",async()=>{
 const r=handleScientificMemoryApi(new Request("https://fixture.invalid/api/research/memory"+path.replace(":id","fixture"),{method,headers:{"x-hsi-owner":"forged","x-hsi-enabled":"true"}}))!;
 expect(r.status).toBe(503);expect((await r.json()).code).toBe("SCIENTIFIC_MEMORY_DISABLED");
 });
 }
 test("unrelated paths are not captured",()=>{
 expect(handleScientificMemoryApi(new Request("https://fixture.invalid/api/research/memory-other"))).toBeNull();
 });
});
