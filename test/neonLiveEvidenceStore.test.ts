import {describe,it,expect} from "bun:test";
import {createNeonLiveEvidenceDependencies} from "../src/db/neonLiveEvidenceStore";
import {createNeonInterrogativeApiServices,handleInterrogativeApi} from "../src/server/interrogativeApi";

describe("A-01 Neon live persistence deployment gate",()=>{
 it("defaults to disabled even when a runtime database URL is configured",()=>{
  const deps=createNeonLiveEvidenceDependencies({databaseUrl:"",runtimeDatabaseUrl:""});
  expect(deps.writesEnabled).toBe(false);
 });
 it("does not expose live persistence when the runtime database is not configured",async()=>{
  const services=createNeonInterrogativeApiServices({databaseUrl:""});
  const response=await handleInterrogativeApi(new Request("https://hsi.example/api/research/live-investigations"),services);
  expect(response.status).toBe(503);
 });
 it("does not connect to Neon while the write gate is disabled",async()=>{
  const deps=createNeonLiveEvidenceDependencies({databaseUrl:"",runtimeDatabaseUrl:""});
  await expect(deps.database({principalId:"researcher-1",roles:["researcher"],authenticated:true})).rejects.toThrow("disabled");
 });
});
