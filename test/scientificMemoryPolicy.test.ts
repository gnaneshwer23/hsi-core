import {describe,expect,test} from "bun:test";
import {SCIENTIFIC_MEMORY_RUNTIME_ENABLED,canReadMemoryFixture,authorisedMemoryFixtures,type MemoryRecord,type MemoryPolicyFixture,type MemoryGrant} from "../src/scientificMemoryPolicy";
const actor:MemoryPolicyFixture={principalId:"alice",tenantId:"t1",activeScopeIds:["s1"],sessionActive:true};
const record:MemoryRecord={id:"r1",tenantId:"t1",scopeId:"s1",ownerId:"alice",kind:"hypothesis",version:1,state:"active",visibility:"private",dataClass:"synthetic_demo",sourceRefs:[],retentionUntil:200,scientificClaimAllowed:false};
const grant:MemoryGrant={recordId:"r1",tenantId:"t1",scopeId:"s1",principalId:"bob",expiresAt:200,revoked:false};
describe("SME-02 synthetic memory policy",()=>{
 test("runtime disabled",()=>expect(SCIENTIFIC_MEMORY_RUNTIME_ENABLED).toBe(false));
 test("owner in active scope",()=>expect(canReadMemoryFixture(actor,record,[],100)).toBe(true));
 test("tenant and scope boundaries",()=>{
 expect(canReadMemoryFixture({...actor,tenantId:"t2"},record,[],100)).toBe(false);
 expect(canReadMemoryFixture({...actor,activeScopeIds:[]},record,[],100)).toBe(false);
 });
 test("explicit sharing only",()=>{
 const bob={...actor,principalId:"bob"};
 expect(canReadMemoryFixture(bob,record,[grant],100)).toBe(false);
 expect(canReadMemoryFixture(bob,{...record,visibility:"shared"},[],100)).toBe(false);
 expect(canReadMemoryFixture(bob,{...record,visibility:"shared"},[grant],100)).toBe(true);
 expect(canReadMemoryFixture(bob,{...record,visibility:"shared"},[{...grant,revoked:true}],100)).toBe(false);
 expect(canReadMemoryFixture(bob,{...record,visibility:"shared"},[{...grant,tenantId:"t2"}],100)).toBe(false);
 expect(canReadMemoryFixture(bob,{...record,visibility:"shared"},[{...grant,expiresAt:100}],100)).toBe(false);
 });
 test("revocation, deletion, expiry and session",()=>{
 for(const state of ["revoked","deleted"] as const)expect(canReadMemoryFixture(actor,{...record,state},[],100)).toBe(false);
 expect(canReadMemoryFixture(actor,record,[],200)).toBe(false);
 expect(canReadMemoryFixture({...actor,sessionActive:false},record,[],100)).toBe(false);
 });
 test("filter before ranking",()=>expect(authorisedMemoryFixtures(actor,[record,{...record,id:"r2",tenantId:"t2"}],[],100)).toEqual([record]));
});
