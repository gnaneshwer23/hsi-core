import {SCIENCE_TYPED_GRAPH} from "./typedGraphData";
import {buildEvidenceDossier} from "./evidenceDossier";
import {detectConflictCandidates} from "./contradictionEngine";
import type {TypedGraph} from "./typedGraphSchema";
export type ResearchRole="evidence_investigator"|"mechanism_investigator"|"contradiction_investigator"|"gap_investigator"|"hypothesis_investigator";
export type WorkItem={id:string;role:ResearchRole;status:"complete"|"blocked";findings:string[];sourceEdgeIds:string[]};
export type ResearchRun={id:string;question:string;createdAt:string;datasetVersion:string;mode:"deterministic_local_analysis";workItems:WorkItem[];hypotheses:{text:string;status:"unvalidated_hypothesis";supportingEdgeIds:string[]}[];reviewStatus:"draft";limitations:string[]};
export function runResearchInvestigation(question:string,graph:TypedGraph=SCIENCE_TYPED_GRAPH):ResearchRun{
 const q=question.trim();if(!q||q.length>500)throw new Error("Research question must be 1–500 characters.");
 const tokens=q.toLowerCase().split(/\W+/).filter(w=>w.length>3);
 const nodes=graph.nodes.filter(n=>tokens.some(t=>n.label.toLowerCase().includes(t)||n.aliases?.some(a=>a.toLowerCase().includes(t)))).slice(0,12);
 const ids=new Set(nodes.map(n=>n.id));
 const relevant=graph.edges.filter(e=>ids.has(e.subjectId)||ids.has(e.objectId));
 const reviewed=relevant.filter(e=>e.reviewStatus==="approved");
 const dossiers=reviewed.map(e=>buildEvidenceDossier(graph,e.id)).filter(d=>d!==null);
 const tensions=detectConflictCandidates(graph).filter(c=>relevant.some(e=>e.id===c.edgeA.id||e.id===c.edgeB.id));
 const items:WorkItem[]=[
 {id:"evidence",role:"evidence_investigator",status:dossiers.some(d=>d.readyForReview)?"complete":"blocked",findings:[nodes.length+" matching entities; "+relevant.length+" related edges; "+reviewed.length+" approved edges.",dossiers.filter(d=>d.readyForReview).length+" approved-edge dossiers have directly reviewed support."],sourceEdgeIds:reviewed.map(e=>e.id)},
 {id:"mechanisms",role:"mechanism_investigator",status:reviewed.length?"complete":"blocked",findings:reviewed.length?["Approved relationships identified; individual mechanisms still require contextual interpretation."]:["No approved mechanistic relationships available for this question."],sourceEdgeIds:reviewed.map(e=>e.id)},
 {id:"contradictions",role:"contradiction_investigator",status:reviewed.length?"complete":"blocked",findings:[tensions.length+" candidate tensions among approved graph edges. No detected tension does not establish consensus."],sourceEdgeIds:tensions.flatMap(t=>[t.edgeA.id,t.edgeB.id])},
 {id:"gaps",role:"gap_investigator",status:"complete",findings:[relevant.filter(e=>e.reviewStatus!=="approved").length+" linked relationships require review.",reviewed.length===0?"Scientific interpretation blocked until independently reviewed evidence is available.":"Assess evidence coverage and unrepresented contexts before drawing conclusions."],sourceEdgeIds:relevant.filter(e=>e.reviewStatus!=="approved").map(e=>e.id)},
 {id:"hypotheses",role:"hypothesis_investigator",status:"blocked",findings:["No hypothesis generated: this local workflow does not use a scientific inference model and lacks reviewed supporting evidence."],sourceEdgeIds:[]}
 ];
 return {id:"local-"+q.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,60),question:q,createdAt:"not persisted",datasetVersion:graph.schemaVersion,mode:"deterministic_local_analysis",workItems:items,hypotheses:[],reviewStatus:"draft",limitations:["This is a deterministic analysis of the local graph, not autonomous AI agent execution.","No live literature retrieval, external model calls, persistence, scientific approvals, or publication.","A qualified scientific reviewer must assess sources, methods and claims before any graph promotion."]};
}
