import {describe,expect,test} from "bun:test";
import {resolveGraphWorkspaceMode} from "../site/src/lib/graphWorkspaceClient";

describe("graph workspace client dual-path (A3.3)",()=>{
 test("defaults to local when status is disabled or unreachable",async()=>{
  const disabled=await resolveGraphWorkspaceMode(async()=>Response.json({
   enabled:false,path:"localStorage",reason:"flag off",holdsUnchanged:true,acceptedForScope:false,scientificApproval:false,
  }));
  expect(disabled.mode).toBe("local");

  const down=await resolveGraphWorkspaceMode(async()=>{throw Error("offline")});
  expect(down.mode).toBe("local");
  expect(down.status).toBeNull();
 });

 test("selects server only when status reports enabled server path",async()=>{
  const enabled=await resolveGraphWorkspaceMode(async()=>Response.json({
   enabled:true,path:"server",reason:"staging_flag_and_writes",holdsUnchanged:true,acceptedForScope:false,scientificApproval:false,
  }));
  expect(enabled.mode).toBe("server");
  expect(enabled.status?.acceptedForScope).toBe(false);
 });
});
