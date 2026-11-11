import {describe,expect,test} from "bun:test";
import {createNeonEvidenceDatabase,type PostgresPool}
 from "../src/evidence/neonEvidenceDatabase";
describe("P1.7 Neon transaction bridge",()=>{
 test("commits successful scoped transaction and releases client",async()=>{
  const statements:string[]=[];let released=false;
  const pool:PostgresPool={connect:async()=>({
    query:async(sql,params)=>{statements.push(sql);
      if(sql.includes("set_config"))expect(params?.[0]).toBe("org-1");
      return {rows:[]};},
    release:()=>{released=true},
  })};
  await createNeonEvidenceDatabase(pool).transaction("org-1",async tx=>{
    await tx.query("SELECT 1",[]);
  });
  expect(statements).toEqual(["BEGIN",
    "SELECT set_config('hsi.organization_id', $1, true)","SELECT 1","COMMIT"]);
  expect(released).toBe(true);
 });
 test("rolls back failed transaction and releases client",async()=>{
  const statements:string[]=[];let released=false;
  const pool:PostgresPool={connect:async()=>({
    query:async(sql)=>{statements.push(sql);return {rows:[]}},
    release:()=>{released=true},
  })};
  await expect(createNeonEvidenceDatabase(pool).transaction("org-1",
    async()=>{throw new Error("failed write")})).rejects.toThrow("failed write");
  expect(statements.at(-1)).toBe("ROLLBACK");
  expect(released).toBe(true);
 });
 test("rejects invalid organization before opening connection",async()=>{
  const pool:PostgresPool={connect:async()=>{throw new Error("must not connect")}};
  await expect(createNeonEvidenceDatabase(pool).transaction("org 1",
    async()=>undefined)).rejects.toThrow("Invalid organization");
 });
});
