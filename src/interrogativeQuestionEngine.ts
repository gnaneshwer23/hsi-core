/** ARCH-003 Step 3: bounded, deterministic question planning.
 * This planner proposes questions; it never asserts evidence, invokes an LLM,
 * retrieves patient records, publishes claims or grants scientific approval.
 */
import {createHash} from "node:crypto";
import {INTERROGATION_LIMITS,INTERROGATIVE_SCHEMA_VERSION,validateInterrogativeInvestigation,type InterrogativeInvestigation,type QuestionNode,type HypothesisBranch} from "./interrogativeContracts";
export type QuestionPlanInput={
 question:string;actorPrincipal:string;createdAt:string;
 dataClass:"public_biomedical"|"licensed_partner";
 release:{id:string;version:string;manifestHash:string};
 focus:"systemic_sclerosis";
};
type Mechanism={id:string;label:string;test:string;alternative:string};
const SSC_MECHANISMS:readonly Mechanism[]=[
 {id:"fibroblast",label:"fibroblast activation and extracellular matrix deposition",test:"Which controlled experiments or longitudinal observations would refute the proposed fibroblast contribution?",alternative:"Could observed fibrosis arise through another cellular process?"},
 {id:"tgfb",label:"TGF-beta-associated signalling",test:"Does pathway perturbation fail to alter the specified fibrotic phenotype in an appropriate model?",alternative:"Could the observed signalling be a consequence rather than a driver of fibrosis?"},
 {id:"vascular",label:"microvascular injury and endothelial dysfunction",test:"Do temporally resolved vascular measurements contradict a proposed upstream vascular contribution?",alternative:"Could vascular changes be secondary to established tissue fibrosis?"},
 {id:"immune",label:"immune-cell and inflammatory signalling",test:"Do cell-specific perturbation or matched cohort findings refute the proposed immune contribution?",alternative:"Are inflammatory findings explained by treatment, tissue context or disease stage?"}
];
function id(prefix:string,text:string){return prefix+"-"+createHash("sha256").update(text).digest("hex").slice(0,12)}
export function planSscInterrogation(input:QuestionPlanInput):InterrogativeInvestigation{
 const question=input.question.trim();
 if(!question||question.length>500||!input.actorPrincipal.trim())throw Error("Invalid research question or actor");
 if(input.focus!=="systemic_sclerosis")throw Error("Only the approved SSc planning scope is supported");
 if(!Number.isFinite(Date.parse(input.createdAt)))throw Error("Invalid timestamp");
 const seed=JSON.stringify({question,actor:input.actorPrincipal,release:input.release,focus:input.focus});
 const rootId=id("q",seed+"root");
 const questions:QuestionNode[]=[{id:rootId,parentId:null,text:question,purpose:"clarify",depth:0,status:"pending"}];
 const branches:HypothesisBranch[]=[];
 for(const m of SSC_MECHANISMS){
  const discriminate=id("q",seed+m.id+"discriminate");
  const falsify=id("q",seed+m.id+"falsify");
  questions.push({id:discriminate,parentId:rootId,text:"What disease-stage, tissue, assay and temporal evidence distinguishes "+m.label+" from competing explanations?",purpose:"discriminate",depth:1,status:"pending"});
  questions.push({id:falsify,parentId:discriminate,text:m.test+" "+m.alternative,purpose:"falsify",depth:2,status:"pending"});
  branches.push({id:id("b",seed+m.id),questionId:discriminate,statement:"Candidate mechanism to investigate: "+m.label,classification:"unvalidated_hypothesis",supporting:[],opposing:[],missingEvidence:["Approved source-linked claims for the mechanism","Evidence addressing disease stage, tissue and assay context","Independent contradictory or null findings"],falsificationTest:m.test,assessment:"insufficient_evidence",uncertainty:["No evidence retrieval performed by question planner","Mechanism is not established by its inclusion in the question plan"]});
 }
 if(questions.length>INTERROGATION_LIMITS.maxQuestions||branches.length>INTERROGATION_LIMITS.maxBranches)throw Error("Planning budget exceeded");
 const plan:InterrogativeInvestigation={
  schemaVersion:INTERROGATIVE_SCHEMA_VERSION,
  id:id("hsi-interrogative",seed),actorPrincipal:input.actorPrincipal,question,createdAt:input.createdAt,
  dataClass:input.dataClass,release:input.release,state:"draft",questions,branches,
  conclusion:{text:"No scientific conclusion: candidate mechanisms require evidence retrieval, falsification and human review.",assessment:"insufficient_evidence",limitations:["Question planning only; no live evidence retrieval","All mechanisms are unvalidated candidates","Not clinical diagnosis or treatment advice"]},
  provenance:{agentRuns:[{agentId:"hsi-ssc-question-planner",version:"1.0.0",modelVersion:"deterministic-template-1",promptVersion:"none",toolCalls:[]}],retrievalIds:[]},review:null
 };
 validateInterrogativeInvestigation(plan);
 return plan;
}
