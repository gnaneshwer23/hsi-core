import {test,expect} from "bun:test";
import {validateScientificReviewEvent} from "../src/adapters/isiScientificReviewEvent";
const valid=()=>({releaseHash:"a".repeat(64),subjectId:"isi:C001",decision:"needs_evidence" as const,reviewerPrincipal:"scientist-2",submittedBy:"researcher-1",sourceLocator:"PMID:30760472; Results",rationale:"Requires independent full-text assessment"});
test("accepts a provenance-bearing independent review event",()=>expect(validateScientificReviewEvent(valid()).subjectId).toBe("isi:C001"));
test("rejects self-approval",()=>expect(()=>validateScientificReviewEvent({...valid(),submittedBy:"scientist-2"})).toThrow());
test("rejects missing source locator",()=>expect(()=>validateScientificReviewEvent({...valid(),sourceLocator:" "})).toThrow());
test("rejects invalid release hash",()=>expect(()=>validateScientificReviewEvent({...valid(),releaseHash:"main"})).toThrow());
test("rejects missing rationale",()=>expect(()=>validateScientificReviewEvent({...valid(),rationale:""})).toThrow());
