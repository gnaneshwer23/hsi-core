import {describe,expect,test} from "bun:test";
import {createRestrictedNeonEvidencePool} from "../src/evidence/restrictedNeonEvidencePool";

const old=process.env.HSI_NEON_HOST_ALLOWLIST;
const oldProject=process.env.HSI_NEON_CANONICAL_PROJECT_ID;
describe("P1.12.3 restricted Neon evidence connection",()=>{
 test("rejects invalid or non-HSI target before connecting",()=>{
  expect(()=>createRestrictedNeonEvidencePool({databaseUrl:"postgresql://hsi_evidence_app:secret@ep-other.eu-west-2.aws.neon.tech/neondb?sslmode=require",expectedRole:"hsi_evidence_app"})).toThrow("HSI evidence database target rejected");
 });
 test("rejects owner role even on approved target",()=>{
  try{
   process.env.HSI_NEON_HOST_ALLOWLIST="ep-hsi-staging";
   expect(()=>createRestrictedNeonEvidencePool({databaseUrl:"postgresql://neondb_owner:secret@ep-hsi-staging.eu-west-2.aws.neon.tech/neondb?sslmode=require",expectedRole:"neondb_owner"})).toThrow("Invalid restricted evidence role");
  }finally{if(old===undefined)delete process.env.HSI_NEON_HOST_ALLOWLIST;else process.env.HSI_NEON_HOST_ALLOWLIST=old;}
 });
 test("rejects URL user different from restricted role",()=>{
  try{
   process.env.HSI_NEON_HOST_ALLOWLIST="ep-hsi-staging";
   expect(()=>createRestrictedNeonEvidencePool({databaseUrl:"postgresql://other:secret@ep-hsi-staging.eu-west-2.aws.neon.tech/neondb?sslmode=require",expectedRole:"hsi_evidence_app"})).toThrow("authenticate as restricted role");
  }finally{if(old===undefined)delete process.env.HSI_NEON_HOST_ALLOWLIST;else process.env.HSI_NEON_HOST_ALLOWLIST=old;}
 });
});
