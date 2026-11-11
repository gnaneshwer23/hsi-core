import {describe,expect,it} from "bun:test";
import {createNeonLiveEvidenceDependencies} from "../src/db/neonLiveEvidenceStore";
describe("A-01 verified-session adapter gate",()=>{
 it("refuses caller-fabricated principal even when writes flag is enabled",async()=>{
  const deps=createNeonLiveEvidenceDependencies({databaseUrl:"",runtimeDatabaseUrl:"",writesEnabled:true});
  await expect(deps.database({authenticated:true,principalId:"another-user",roles:["researcher"]})).rejects.toThrow("unverified actor");
 });
 it("refuses unauthenticated caller before opening a database connection",async()=>{
  const deps=createNeonLiveEvidenceDependencies({databaseUrl:"",runtimeDatabaseUrl:"",writesEnabled:true});
  await expect(deps.database({authenticated:false as true,principalId:"user",roles:["researcher"]})).rejects.toThrow();
 });
});
