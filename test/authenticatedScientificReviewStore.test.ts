import {test,expect} from "bun:test";
import {submitInterrogativeForReview,recordAuthenticatedScientificReview} from "../src/db/authenticatedScientificReviewStore";
import type {HsiScientificReviewDecision} from "../src/interrogativeScientificReview";
const cfg={databaseUrl:"postgresql://invalid",serverSessionToken:null};
test("review submission denies missing session before opening database",async()=>{
 await expect(submitInterrogativeForReview({...cfg,investigationId:"hsi-interrogative-example-1234"})).rejects.toThrow("Verified HSI session required");
});
test("human decision denies missing session before opening database",async()=>{
 const decision={reviewerPrincipal:"agent",decisionId:"r",investigationId:"i"} as HsiScientificReviewDecision;
 await expect(recordAuthenticatedScientificReview({...cfg,decision})).rejects.toThrow("Verified HSI session required");
});
