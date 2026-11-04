import {test,expect} from "bun:test";
import {linkHsiClinicalContextToBiology,type HsiClinicalAccessDecision} from "../src/hsiClinicalBiologyBridge";
import type {HsiGraphNode} from "../src/livingHealthKnowledgeGraph";
const access:HsiClinicalAccessDecision={authenticated:true,principalId:"clinician:1",patientRef:"patient:1",purpose:"direct_care",permitted:true,authorisationId:"grant:1",expiresAt:"2026-11-05T00:00:00Z"};
const clinical={readFacts:async()=>[{factRef:"fact:1",patientRef:"patient:1",kind:"observation" as const,codeSystem:"LOINC",code:"1234-5",recordedAt:"2026-11-04T00:00:00Z"}]};
const node=(visibility:HsiGraphNode["visibility"]="public_biomedical"):HsiGraphNode=>({schemaVersion:"hsi-lhkg-node-1",id:"biology:1",layer:"human_biology",kind:"pathway",preferredLabel:"Biological pathway",aliases:[],sourceIdentifiers:[],version:"1.0.0",visibility,reviewState:visibility==="public_biomedical"?"approved":"draft",sourceProvenance:[]});
const biology={findByClinicalCode:async()=>({nodes:[node()],relationships:[]})};
const args=()=>({access,patientRef:"patient:1",clinical,biology,now:"2026-11-04T12:00:00Z"});
test("authorised direct care returns only approved biology concept summaries",async()=>{
 const r=await linkHsiClinicalContextToBiology(args());expect(r.factCount).toBe(1);expect(r.concepts[0]?.nodeId).toBe("biology:1");expect(JSON.stringify(r)).not.toContain("1234-5");
});
test("missing, expired or mismatched patient authorisation denied before clinical read",async()=>{
 await expect(linkHsiClinicalContextToBiology({...args(),access:null})).rejects.toThrow("authorisation");
 await expect(linkHsiClinicalContextToBiology({...args(),access:{...access,patientRef:"patient:2"}})).rejects.toThrow("authorisation");
 await expect(linkHsiClinicalContextToBiology({...args(),now:"2026-11-06T00:00:00Z"})).rejects.toThrow("expired");
});
test("cross-patient clinical facts rejected",async()=>{
 await expect(linkHsiClinicalContextToBiology({...args(),clinical:{readFacts:async()=>[{factRef:"fact:1",patientRef:"patient:2",kind:"observation" as const,codeSystem:"LOINC",code:"1234-5",recordedAt:"2026-11-04T00:00:00Z"}]}})).rejects.toThrow("cross-patient");
});
test("restricted biology and oversized clinical responses fail closed",async()=>{
 await expect(linkHsiClinicalContextToBiology({...args(),biology:{findByClinicalCode:async()=>({nodes:[node("governed_research")],relationships:[]})}})).rejects.toThrow("restricted");
 await expect(linkHsiClinicalContextToBiology({...args(),maxFacts:0})).rejects.toThrow("limit");
});
