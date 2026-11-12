/** Engineering-only synthetic source/context fixtures. Not scientific gold or a real release. */
import {createHash} from "node:crypto";
import {released} from "./investigationGraphContext";
import {buildPassageLinkedContext,DETAILED_CONTEXT_FIELDS,type DetailedContextField,type ContextExtraction} from "../../src/evidence/passageLinkedContext";
import type {ComparableEvidenceUnit} from "../../src/evidence/structuredEvidenceComparison";
export const fixtureHash=(text:string)=>createHash("sha256").update(text).digest("hex");
export function contextUnit(id:string,values:Partial<Record<DetailedContextField,string>>={},missing:DetailedContextField[]=[]){
 const defaults:Record<DetailedContextField,string>={species:"human",experimentalSystem:"primary human cell culture",tissueCompartment:"skin",cellType:"fibroblasts",cellState:"activated",phenotype:"systemic sclerosis",diseaseStage:"early",intervention:"IL-21",dose:"1 uM",timing:"24 h",assay:"flow cytometry",readout:"marker expression",sampleSize:"n=20",cohort:"adult study cohort",controls:"vehicle",uncertainty:"confidence interval reported",estimand:"mean marker difference versus vehicle"};
 const fields={...defaults,...values},text=DETAILED_CONTEXT_FIELDS.map(k=>k+"="+fields[k]).join("; ");
 const source={...released().bundle.sources[0]!,id:"fixture-source-"+id,title:"Synthetic context fixture only",pmid:null,url:"https://example.org/fixture/"+id,licence:{status:"permitted" as const,identifier:"TEST-ONLY",passageUsePermitted:true}};
 const passage={...released().bundle.passages[0]!,id:"fixture-passage-"+id,sourceId:source.id,text,sha256:fixtureHash(text)};
 const extractions:Partial<Record<DetailedContextField,ContextExtraction>>={};
 for(const k of DETAILED_CONTEXT_FIELDS){if(missing.includes(k))continue;const start=text.indexOf(k+"=")+k.length+1;extractions[k]={status:"reported",start,end:start+fields[k].length};}
 const detailedContext=buildPassageLinkedContext({source,passage,clearanceReceiptId:"fixture-clearance-"+id,extractions});
 const unit:ComparableEvidenceUnit={id,label:"Synthetic finding "+id,subject:{system:"CL",value:"fixture-cell",label:null},predicate:"associated_with",object:{system:"UniProt",value:"fixture-protein",label:null},findingPolarity:id==="a"?"supporting":"opposing",biologicalContext:{diseasePhenotype:[],organTissueCellState:[],genesProteinsPathways:[],experimentalSystemsSpecies:[],interventionsTargets:[]},evidenceSourceIds:[source.id],sourceProvider:"fixture",responseIdentity:"fixture-version",methodologicalNote:null,detailedContext};
 return {source,passage,unit,extractions};
}
