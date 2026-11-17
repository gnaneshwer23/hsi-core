/**
 * Evidence Context Passport — one inspectable context sheet per claim/edge.
 * Missing fields stay explicit. Never invents values, scores, or scientific approval.
 */
import type {DomainEdge,DomainModel} from "./domainGraph";
import type {DetailedContextField,PassageLinkedContext} from "../evidence/passageLinkedContext";
import {DETAILED_CONTEXT_FIELDS} from "../evidence/passageLinkedContext";

export const PASSPORT_SCHEMA="hsi-evidence-context-passport-1" as const;

export const EDGE_PASSPORT_FIELDS=[
 "studySystem",
 "design",
 "tissue",
 "population",
 "assay",
 "timepoint",
 "intervention",
 "outcome",
 "diseaseContexts",
 "limitations",
 "annotationBasis",
] as const;
export type EdgePassportField=(typeof EDGE_PASSPORT_FIELDS)[number];

/** Detailed fields that domain-edge annotations do not carry; shown as not extracted. */
export const PASSAGE_ONLY_PASSPORT_FIELDS=[
 "species",
 "cellType",
 "cellState",
 "phenotype",
 "diseaseStage",
 "dose",
 "sampleSize",
 "cohort",
 "controls",
 "uncertainty",
 "estimand",
] as const satisfies readonly DetailedContextField[];
export type PassageOnlyPassportField=(typeof PASSAGE_ONLY_PASSPORT_FIELDS)[number];

export type PassportFieldStatus="reported"|"not_stated"|"not_extracted"|"not_applicable";

export type PassportField={
 id:string;
 label:string;
 status:PassportFieldStatus;
 value:string|null;
 missingReason:string|null;
 source:"edge_annotation"|"passage_linked"|"snapshot_gap";
};

export type EvidenceContextPassport={
 schemaVersion:typeof PASSPORT_SCHEMA;
 edgeId:string;
 kind:DomainEdge["kind"];
 assertion:string;
 fields:PassportField[];
 reportedCount:number;
 missingCount:number;
 missingFieldIds:string[];
 scientificApproval:false;
 graphPromotable:false;
 needsHumanReview:true;
 note:string;
};

const MODEL_LABEL:Record<DomainModel,string>={
 human_in_vivo:"Human participants",
 human_ex_vivo:"Human cells (ex vivo)",
 human_cell_line:"Human cell line",
 mouse:"Mouse",
 rodent:"Rodent",
 mixed:"Mixed systems",
 unspecified:"Not stated",
};

const EDGE_LABELS:Record<EdgePassportField,string>={
 studySystem:"Study system",
 design:"Study design",
 tissue:"Tissue",
 population:"Population",
 assay:"Assay",
 timepoint:"Timepoint",
 intervention:"Intervention",
 outcome:"Outcome / readout",
 diseaseContexts:"Disease contexts",
 limitations:"Interpretation limits",
 annotationBasis:"Annotation basis",
};

const PASSAGE_LABELS:Record<PassageOnlyPassportField,string>={
 species:"Species",
 cellType:"Cell type",
 cellState:"Cell state",
 phenotype:"Phenotype",
 diseaseStage:"Disease stage",
 dose:"Dose / units",
 sampleSize:"Sample size",
 cohort:"Cohort",
 controls:"Controls",
 uncertainty:"Quantitative uncertainty",
 estimand:"Estimand",
};

const pretty=(s:string)=>s.replaceAll("_"," ");

function edgeValue(edge:DomainEdge,field:EdgePassportField):{status:PassportFieldStatus;value:string|null;missingReason:string|null}{
 switch(field){
  case"studySystem":
   return edge.model==="unspecified"
    ?{status:"not_stated",value:null,missingReason:"Study system is unspecified on this edge annotation."}
    :{status:"reported",value:MODEL_LABEL[edge.model],missingReason:null};
  case"design":
   return{status:"reported",value:edge.design,missingReason:null};
  case"tissue":
  case"population":
  case"assay":
  case"timepoint":
  case"intervention":
  case"outcome":{
   const raw=edge[field];
   return raw
    ?{status:"reported",value:raw,missingReason:null}
    :{status:"not_stated",value:null,missingReason:`${EDGE_LABELS[field]} is not stated on this edge annotation.`};
  }
  case"diseaseContexts":
   return edge.conditions.length
    ?{status:"reported",value:edge.conditions.join(", "),missingReason:null}
    :{status:"not_stated",value:null,missingReason:"No disease context is recorded on this edge."};
  case"limitations":
   return{status:"reported",value:edge.limitations,missingReason:null};
  case"annotationBasis":
   return{status:"reported",value:pretty(edge.contextStatus),missingReason:null};
  default:{
   const _exhaustive:never=field;
   return _exhaustive;
  }
 }
}

function passageGapField(id:PassageOnlyPassportField):PassportField{
 return{
  id,
  label:PASSAGE_LABELS[id],
  status:"not_extracted",
  value:null,
  missingReason:"Not extracted in this graph snapshot. Requires passage-linked curation.",
  source:"snapshot_gap",
 };
}

function fromPassageField(ctx:PassageLinkedContext,field:DetailedContextField,label:string):PassportField{
 const v=ctx.fields[field];
 if(v.status==="reported"){
  return{id:field,label,status:"reported",value:v.originalText,missingReason:null,source:"passage_linked"};
 }
 const status:PassportFieldStatus=v.status==="not_applicable"?"not_applicable":v.status==="not_reported"?"not_stated":"not_extracted";
 return{id:field,label,status,value:null,missingReason:v.missingReason,source:"passage_linked"};
}

/** Build one passport for a domain-graph edge. Optional passage-linked context fills detailed fields. */
export function buildEvidenceContextPassport(edge:DomainEdge,passage?:PassageLinkedContext):EvidenceContextPassport{
 const fields:PassportField[]=[];
 for(const id of EDGE_PASSPORT_FIELDS){
  const slot=edgeValue(edge,id);
  fields.push({id,label:EDGE_LABELS[id],...slot,source:"edge_annotation"});
 }
 if(passage){
  for(const id of DETAILED_CONTEXT_FIELDS){
   if((EDGE_PASSPORT_FIELDS as readonly string[]).includes(id))continue;
   const label=PASSAGE_LABELS[id as PassageOnlyPassportField]??pretty(id);
   fields.push(fromPassageField(passage,id,label));
  }
 }else{
  for(const id of PASSAGE_ONLY_PASSPORT_FIELDS)fields.push(passageGapField(id));
 }
 const missingFieldIds=fields.filter(f=>f.status==="not_stated"||f.status==="not_extracted").map(f=>f.id);
 const reportedCount=fields.filter(f=>f.status==="reported").length;
 return{
  schemaVersion:PASSPORT_SCHEMA,
  edgeId:edge.id,
  kind:edge.kind,
  assertion:edge.assertion,
  fields,
  reportedCount,
  missingCount:missingFieldIds.length,
  missingFieldIds,
  scientificApproval:false,
  graphPromotable:false,
  needsHumanReview:true,
  note:passage
   ?"Passport mixes edge annotations with passage-linked extractions. Missing fields stay explicit. Not scientific approval."
   :"Passport from edge annotations only. Passage-linked fields are marked not extracted. Not scientific approval.",
 };
}

export function exportEvidenceContextPassport(passport:EvidenceContextPassport):EvidenceContextPassport{
 return structuredClone(passport);
}
