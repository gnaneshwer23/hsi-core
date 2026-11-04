import {test,expect} from "bun:test";
import {INTERROGATIVE_SCHEMA_VERSION,validateInterrogativeInvestigation,type InterrogativeInvestigation} from "../src/interrogativeContracts";
const base:InterrogativeInvestigation={schemaVersion:INTERROGATIVE_SCHEMA_VERSION,id:"hsi-interrogative-ssc-0001",actorPrincipal:"researcher",question:"What explains SSc fibrosis?",createdAt:"2026-11-04T14:00:00Z",dataClass:"public_biomedical",release:{id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)},state:"draft",questions:[{id:"q1",parentId:null,text:"Which pathways?",purpose:"clarify",depth:0,status:"pending"}],branches:[],conclusion:{text:"Insufficient evidence",assessment:"insufficient_evidence",limitations:[]},provenance:{agentRuns:[],retrievalIds:[]},review:null};
test("valid draft",()=>expect(()=>validateInterrogativeInvestigation(base)).not.toThrow());
test("rejects reviewed without human decision",()=>expect(()=>validateInterrogativeInvestigation({...base,state:"reviewed"})).toThrow());
test("rejects synthetic as evidence",()=>expect(()=>validateInterrogativeInvestigation({...base,dataClass:"synthetic" as "public_biomedical"})).toThrow());
test("rejects unbounded questions",()=>expect(()=>validateInterrogativeInvestigation({...base,questions:Array.from({length:25},(_,i)=>({...base.questions[0]!,id:"q"+i}))})).toThrow());
test("rejects orphan question",()=>expect(()=>validateInterrogativeInvestigation({...base,questions:[{...base.questions[0]!,parentId:"missing",depth:1}]})).toThrow());
