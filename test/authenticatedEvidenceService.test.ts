import {describe,expect,test} from "bun:test";
import {createAuthenticatedEvidenceService} from "../src/evidence/authenticatedEvidenceService";
import type {EvidenceDatabase} from "../src/evidence/transactionalEvidenceReview";
describe("P1.8 trusted authentication boundary",()=>{
 test("rejects missing session before database transaction",async()=>{
  let used=false;
  const database:EvidenceDatabase={transaction:async()=>{used=true;throw Error("unexpected")}};
  const service=createAuthenticatedEvidenceService({
   database,gateway:{verifySession:async()=>null},
  });
  await expect(service.review({sessionToken:"invalid",snapshotId:"invalid",
   decision:"accepted",decisionId:"invalid",notes:"note"}))
   .rejects.toThrow("Authentication required");
  expect(used).toBe(false);
 });
 test("rejects blank token without gateway lookup",async()=>{
  let called=false;
  const service=createAuthenticatedEvidenceService({
   database:{transaction:async()=>{throw Error("unexpected")}},
   gateway:{verifySession:async()=>{called=true;return null}},
  });
  await expect(service.review({sessionToken:" ",snapshotId:"invalid",
   decision:"accepted",decisionId:"invalid",notes:"note"}))
   .rejects.toThrow("Authentication required");
  expect(called).toBe(false);
 });
});
