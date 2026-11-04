import {test,expect} from "bun:test";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";
import {loadAuthenticatedInterrogativeInvestigation,saveAuthenticatedInterrogativeInvestigation} from "../src/db/authenticatedInterrogativeStore";
const i=planSscInterrogation({question:"SSc fibrosis mechanisms?",actorPrincipal:"untrusted-user",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:"ssc-release",version:"1.0.0",manifestHash:"a".repeat(64)}});
test("missing server session fails closed before any DB access on save",async()=>{
 await expect(saveAuthenticatedInterrogativeInvestigation({serverSessionToken:null,investigation:i,databaseUrl:"postgresql://invalid"})).rejects.toThrow("Verified research access required");
});
test("missing server session fails closed before any DB access on read",async()=>{
 await expect(loadAuthenticatedInterrogativeInvestigation({serverSessionToken:null,investigationId:i.id,databaseUrl:"postgresql://invalid"})).rejects.toThrow("Verified research access required");
});
test("client-supplied short session tokens cannot grant research access",async()=>{
 await expect(loadAuthenticatedInterrogativeInvestigation({serverSessionToken:"fake",investigationId:i.id,databaseUrl:"postgresql://invalid"})).rejects.toThrow("Verified research access required");
});
