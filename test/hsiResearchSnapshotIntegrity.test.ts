import {test,expect} from "bun:test";
import {assertHsiResearchSnapshot} from "../src/hsiResearchSnapshotIntegrity";
import type {HsiGraphNode,HsiGraphRelationship} from "../src/livingHealthKnowledgeGraph";
const n=(id:string):HsiGraphNode=>({schemaVersion:"hsi-lhkg-node-1",id,layer:"human_biology",kind:"cell",preferredLabel:id,aliases:[],sourceIdentifiers:[],version:"1.0.0",visibility:"governed_research",reviewState:"draft",sourceProvenance:[]});
const e:HsiGraphRelationship={schemaVersion:"hsi-lhkg-edge-1",id:"edge:1",subjectId:"cell:1",objectId:"cell:2",predicate:"ASSOCIATED_WITH",layer:"human_biology",epistemicType:"association",visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:[],version:"1.0.0",context:{},causalClaim:false};
const base=()=>({nodes:[n("cell:1"),n("cell:2")],relationships:[e],dossiers:[]});
test("consistent research graph snapshot accepted",()=>expect(()=>assertHsiResearchSnapshot(base())).not.toThrow());
test("ambiguous node versions fail closed",()=>expect(()=>assertHsiResearchSnapshot({...base(),nodes:[...base().nodes,n("cell:1")]})).toThrow("Ambiguous"));
test("dangling graph edge fails closed",()=>expect(()=>assertHsiResearchSnapshot({...base(),nodes:[n("cell:1")]})).toThrow("edge"));
test("patient context cannot enter research snapshot",()=>expect(()=>assertHsiResearchSnapshot({...base(),nodes:[{...n("cell:1"),visibility:"restricted_clinical",layer:"patient_context"},n("cell:2")]})).toThrow("restricted"));

test("mismatched dossier revision fails closed",()=>{
 const dossier={schemaVersion:"hsi-lhkg-dossier-1" as const,relationship:{...e,version:"2.0.0"},temporal:{assertedAt:"2026-11-04T00:00:00Z",sourceAsOf:"2026-11-04T00:00:00Z"},observations:[],reviews:[],generationMethod:"human_curated" as const};
 expect(()=>assertHsiResearchSnapshot({...base(),dossiers:[dossier]})).toThrow("mismatch");
});
test("changed edge identity in dossier fails closed",()=>{
 const dossier={schemaVersion:"hsi-lhkg-dossier-1" as const,relationship:{...e,objectId:"cell:other"},temporal:{assertedAt:"2026-11-04T00:00:00Z",sourceAsOf:"2026-11-04T00:00:00Z"},observations:[],reviews:[],generationMethod:"human_curated" as const};
 expect(()=>assertHsiResearchSnapshot({...base(),dossiers:[dossier]})).toThrow("mismatch");
});
