import {expect,it} from "bun:test";
import {evaluateDatabaseAuthorization} from "../src/db/contradictionAuthorizationAudit";
const names=["hsi_contradiction_records","hsi_contradiction_review_events",
"hsi_contradiction_tenant_memberships"];
const tables=names.map(name=>({name,exists:true,rlsEnabled:true,rlsForced:true,
 ownedByRole:false,canSelect:false,canInsert:false,canUpdate:false,canDelete:false}));
const role={name:"restricted",superuser:false,bypassRls:false,canLogin:true};
it("fails when schema is not installed",()=>{
 const x=evaluateDatabaseAuthorization({role,tables:[]});
 expect(x.ready).toBe(false);
});
it("fails for BYPASSRLS or table ownership",()=>{
 expect(evaluateDatabaseAuthorization({role:{...role,bypassRls:true},tables}).ready).toBe(false);
 expect(evaluateDatabaseAuthorization({role,tables:[{...tables[0]!,ownedByRole:true},...tables.slice(1)]}).ready).toBe(false);
});
it("fails when UPDATE is granted on immutable records",()=>{
 expect(evaluateDatabaseAuthorization({role,tables:[{...tables[0]!,canUpdate:true},...tables.slice(1)]}).ready).toBe(false);
});
it("passes only the narrow structural checks, not full activation",()=>{
 expect(evaluateDatabaseAuthorization({role,tables}).ready).toBe(true);
});
