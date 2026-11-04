import {test,expect} from "bun:test";
import {queryHsiGovernedGraph,type HsiGraphActor,type HsiGraphReadRepository} from "../src/hsiGovernedGraphQuery";
import type {HsiGraphNode} from "../src/livingHealthKnowledgeGraph";
const researcher:HsiGraphActor={principalId:"researcher:1",authenticated:true,roles:["researcher"],clinicalPurposeVerified:false};
const clinician:HsiGraphActor={principalId:"clinician:1",authenticated:true,roles:["clinician"],clinicalPurposeVerified:true};
const node=(visibility:HsiGraphNode["visibility"]):HsiGraphNode=>({schemaVersion:"hsi-lhkg-node-1",id:"cell:1",layer:visibility==="restricted_clinical"?"patient_context":"human_biology",kind:"cell",preferredLabel:"Cell",aliases:[],sourceIdentifiers:[],version:"1.0.0",visibility,reviewState:visibility==="public_biomedical"?"approved":"draft",sourceProvenance:[]});
const repo=(visibility:HsiGraphNode["visibility"]):HsiGraphReadRepository=>({list:async()=>({nodes:[node(visibility)],relationships:[]})});
test("unauthenticated access fails closed",async()=>{await expect(queryHsiGovernedGraph({actor:null,scope:"public_biomedical",query:{},repository:repo("public_biomedical")})).rejects.toThrow("Authenticated")});
test("researcher can access governed research graph",async()=>{const r=await queryHsiGovernedGraph({actor:researcher,scope:"governed_research",query:{limit:5},repository:repo("governed_research")});expect(r.nodes).toHaveLength(1)});
test("researcher cannot query restricted clinical scope",async()=>{await expect(queryHsiGovernedGraph({actor:researcher,scope:"restricted_clinical",query:{},repository:repo("restricted_clinical")})).rejects.toThrow("clinical")});
test("clinical access requires verified purpose",async()=>{await expect(queryHsiGovernedGraph({actor:{...clinician,clinicalPurposeVerified:false},scope:"restricted_clinical",query:{},repository:repo("restricted_clinical")})).rejects.toThrow("purpose")});
test("public queries fail closed on a leaking repository",async()=>{await expect(queryHsiGovernedGraph({actor:researcher,scope:"public_biomedical",query:{},repository:repo("restricted_clinical")})).rejects.toThrow("scope leakage")});
test("unbounded limits and patient context in research fail closed",async()=>{
 await expect(queryHsiGovernedGraph({actor:researcher,scope:"governed_research",query:{limit:101},repository:repo("governed_research")})).rejects.toThrow("limit");
 await expect(queryHsiGovernedGraph({actor:researcher,scope:"governed_research",query:{layer:"patient_context"},repository:repo("governed_research")})).rejects.toThrow("Patient");
});
