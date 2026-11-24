import {test,expect} from "bun:test";
import {handleScientificMemoryHttpFixture} from "../src/server/scientificMemoryHttpFixture";
const url="https://fixture.invalid/api/research/memory/records/00000000-0000-4000-8000-000000000001?tenant=a&scope=s";
test("fixture rejects unauthenticated and cross-origin requests before SQL",async()=>{
 let calls=0;
 const deps={origin:"https://fixture.invalid",verifyFixtureSession:async()=>null,sql:{async unsafe(){calls++;return [];}}};
 expect((await handleScientificMemoryHttpFixture(new Request(url),deps))?.status).toBe(401);
 expect((await handleScientificMemoryHttpFixture(new Request(url,{method:"PATCH",headers:{origin:"https://other.invalid"}}),deps))?.status).toBe(403);
 expect(calls).toBe(0);
});
test("fixture reads with injected session and rejects forged body identity",async()=>{
 let calls=0;
 const deps={origin:"https://fixture.invalid",verifyFixtureSession:async()=>"synthetic-token-alice",sql:{async unsafe(){calls++;return [{version:1}];}}};
 expect((await handleScientificMemoryHttpFixture(new Request(url),deps))?.status).toBe(200);
 expect((await handleScientificMemoryHttpFixture(new Request(url,{method:"PATCH",headers:{origin:deps.origin,"content-type":"application/json"},body:JSON.stringify({ownerId:"forged"})}),deps))?.status).toBe(400);
 expect(calls).toBe(1);
});
