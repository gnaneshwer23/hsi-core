/** Detailed candidate context over existing B-03 public excerpts. Not scientific or rights approval. */
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {createHash} from "node:crypto";
import {selectPublicEvidenceExcerpt} from "../contextualEvidenceExtraction";
import type {ResearchSource,ResearchPassage} from "../researchContracts";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
export const DETAILED_CONTEXT_FIELDS=["species","experimentalSystem","tissueCompartment","cellType","cellState","phenotype","diseaseStage","intervention","dose","timing","assay","readout","sampleSize","cohort","controls","uncertainty","estimand"] as const;
export type DetailedContextField=(typeof DETAILED_CONTEXT_FIELDS)[number];
export type ContextExtraction={status:"reported";start:number;end:number}|{status:"not_extracted"|"not_reported"|"not_applicable";reason:string};
export type NormalizedContextValue={kind:"ontology";system:string;value:string}|{kind:"quantity";value:string;unit:"nM"|"ng/mL"|"s"|"count"}|{kind:"text";value:string}|null;
export type ContextNormalizer={version:string;aliases:readonly {field:DetailedContextField;originalText:string;system:string;value:string}[]};
export type DetailedContextValue={status:ContextExtraction["status"];originalText:string|null;normalized:NormalizedContextValue;span:{start:number;end:number}|null;missingReason:string|null};
export type PassageLinkedContext={
 schemaVersion:"hsi-passage-linked-context-1";normalizationVersion:string;normalizationRegistry:ContextNormalizer;
 sourceId:string;sourceVersion:string;passageId:string;passageSha256:string;clearanceReceiptId:string;
 /** Permitted source content for the governed artifact, never an operational log. */
 passageText:string;locator:string;fields:Record<DetailedContextField,DetailedContextValue>;
 contextHash:string;scientificApproval:false;graphPromotable:false;needsHumanReview:true;
};
const sha=(s:string)=>createHash("sha256").update(s).digest("hex"),text=(s:string)=>s.trim().replace(/\s+/g," ").toLowerCase();
const ontologyFields=new Set<DetailedContextField>(["species","tissueCompartment","cellType","cellState","phenotype","diseaseStage","intervention"]);
const critical=new Set<DetailedContextField>(["species","experimentalSystem","tissueCompartment","cellType","phenotype","assay","readout","estimand","uncertainty","sampleSize"]);
function decimal(raw:string,multiplier:bigint,power=0){
 const [whole,part=""]=raw.split(".");let n=BigInt(whole!+part)*multiplier,scale=part.length+power;
 while(scale&&n%10n===0n){n/=10n;scale--;}
 const digits=n.toString().padStart(scale+1,"0");return scale?digits.slice(0,-scale)+"."+digits.slice(-scale):digits;
}
export function normalizeContextValue(field:DetailedContextField,raw:string,registry?:ContextNormalizer):NormalizedContextValue{
 const key=text(raw),alias=ontologyFields.has(field)?registry?.aliases.find(a=>a.field===field&&text(a.originalText)===key):undefined;
 if(alias)return {kind:"ontology",system:alias.system,value:alias.value};
 if(field==="species"){
  if(["human","humans","homo sapiens"].includes(key))return {kind:"ontology",system:"NCBITaxon",value:"9606"};
  if(["mouse","mice","mus musculus"].includes(key))return {kind:"ontology",system:"NCBITaxon",value:"10090"};
 }
 if(field==="dose"){
  const m=raw.trim().match(/^(\d{1,9}(?:\.\d{1,6})?)\s*(pM|nM|uM|µM|μM|mM|ng\/mL|ug\/mL|µg\/mL|μg\/mL|mg\/mL)$/);
  if(!m)return null;const unit=m[2]!;
  const mass=unit.endsWith("g/mL"),factor=unit.startsWith("m")?1000000n:/^[uµμ]/.test(unit)?1000n:1n;
  return {kind:"quantity",value:decimal(m[1]!,factor,unit==="pM"?3:0),unit:mass?"ng/mL":"nM"};
 }
 if(field==="timing"){
  const m=key.match(/^(\d{1,9}(?:\.\d{1,6})?)\s*(s|sec|seconds?|min|minutes?|h|hr|hours?|d|days?)$/);
  if(!m)return null;const unit=m[2]!;return {kind:"quantity",value:decimal(m[1]!,/^d/.test(unit)?86400n:/^(h|hr)/.test(unit)?3600n:/^min/.test(unit)?60n:1n),unit:"s"};
 }
 if(field==="sampleSize"){
  const m=key.match(/^(?:n\s*=\s*)?([1-9]\d{0,8})$/);return m?{kind:"quantity",value:m[1]!,unit:"count"}:null;
 }
 return {kind:"text",value:key};
}
export function buildPassageLinkedContext(input:{source:ResearchSource;passage:ResearchPassage;clearanceReceiptId:string;extractions:Partial<Record<DetailedContextField,ContextExtraction>>;normalizer?:ContextNormalizer}):PassageLinkedContext{
 input=structuredClone(input);
 const {source,passage,extractions,normalizer}=input;
 const excerpt=selectPublicEvidenceExcerpt(source,passage,0,passage.text.length);
 if(!rejectPhiPayload({textBlobs:[passage.text]}).ok||excerpt.exactText.length>3000||sha(passage.text)!==passage.sha256||!input.clearanceReceiptId?.trim()||input.clearanceReceiptId.length>256||Object.keys(extractions).some(k=>!DETAILED_CONTEXT_FIELDS.includes(k as DetailedContextField)))throw Error("Invalid detailed context source binding");
 if(normalizer){
  if(!normalizer.version?.trim()||normalizer.aliases.length>1000||new Set(normalizer.aliases.map(a=>a.field+":"+text(a.originalText))).size!==normalizer.aliases.length||normalizer.aliases.some(a=>!ontologyFields.has(a.field)||![a.originalText,a.system,a.value].every(s=>typeof s==="string"&&s.trim()&&s.length<=300)))throw Error("Invalid curated normalization registry");
 }
 const fields={} as Record<DetailedContextField,DetailedContextValue>;
 for(const field of DETAILED_CONTEXT_FIELDS){
  const value=extractions[field]??{status:"not_extracted",reason:"No passage-linked extraction recorded"};
  if(value.status==="reported"){
   if(!Number.isSafeInteger(value.start)||!Number.isSafeInteger(value.end)||value.start<0||value.end<=value.start||value.end>passage.text.length)throw Error("Invalid detailed context span");
   const raw=passage.text.slice(value.start,value.end);
   if(!raw.trim()||raw.length>500||/^(unknown|not reported|n\/a|unresolved)$/i.test(raw.trim()))throw Error("Missing context must be explicit");
   fields[field]={status:"reported",originalText:raw,normalized:normalizeContextValue(field,raw,normalizer),span:{start:value.start,end:value.end},missingReason:null};
  }else{
   if(!["not_extracted","not_reported","not_applicable"].includes(value.status)||!value.reason?.trim()||value.reason.length>500||value.status==="not_applicable"&&critical.has(field))throw Error("Invalid context missingness");
   fields[field]={status:value.status,originalText:null,normalized:null,span:null,missingReason:value.reason};
  }
 }
 const body={schemaVersion:"hsi-passage-linked-context-1" as const,normalizationVersion:normalizer?.version??"hsi-basic-units-taxa-1",normalizationRegistry:normalizer??{version:"hsi-basic-units-taxa-1",aliases:[]},sourceId:source.id,sourceVersion:passage.sourceVersion,passageId:passage.id,passageSha256:sha(passage.text),clearanceReceiptId:input.clearanceReceiptId,passageText:passage.text,locator:passage.locator,fields,scientificApproval:false as const,graphPromotable:false as const,needsHumanReview:true as const};
 return {...body,contextHash:sha(canonicalEvidenceJson(body))};
}
export function validatePassageLinkedContext(value:PassageLinkedContext):void{
 if(!value||value.schemaVersion!=="hsi-passage-linked-context-1"||value.scientificApproval!==false||value.graphPromotable!==false||value.needsHumanReview!==true||typeof value.passageText!=="string"||!rejectPhiPayload({textBlobs:[value.passageText]}).ok||value.passageText.length>3000||sha(value.passageText)!==value.passageSha256||![value.sourceId,value.sourceVersion,value.passageId,value.clearanceReceiptId,value.locator,value.normalizationVersion].every(s=>typeof s==="string"&&s.trim()&&s.length<=500))throw Error("Invalid passage-linked context");
 const {contextHash,...body}=value;if(!value.normalizationRegistry||value.normalizationRegistry.version!==value.normalizationVersion||!Array.isArray(value.normalizationRegistry.aliases)||value.normalizationRegistry.aliases.length>1000||value.normalizationRegistry.aliases.some(a=>!ontologyFields.has(a.field))||sha(canonicalEvidenceJson(body))!==contextHash||Object.keys(value.fields).sort().join(",")!==[...DETAILED_CONTEXT_FIELDS].sort().join(","))throw Error("Context content hash mismatch");
 for(const field of DETAILED_CONTEXT_FIELDS){
  const v=value.fields[field];
  if(v.status==="reported"){
   if(!v.span||!Number.isSafeInteger(v.span.start)||!Number.isSafeInteger(v.span.end)||v.span.start<0||v.span.end<=v.span.start||v.span.end>value.passageText.length||value.passageText.slice(v.span.start,v.span.end)!==v.originalText||!v.originalText?.trim()||v.originalText.length>500||v.missingReason!==null)throw Error("Unbound detailed context field");
   if(canonicalEvidenceJson(v.normalized)!==canonicalEvidenceJson(normalizeContextValue(field,v.originalText!,value.normalizationRegistry)))throw Error("Unreproducible context normalization");
  }else if(!["not_extracted","not_reported","not_applicable"].includes(v.status)||v.originalText!==null||v.span!==null||v.normalized!==null||!v.missingReason?.trim()||v.status==="not_applicable"&&critical.has(field))throw Error("Invalid detailed missingness");
 }
}
export type DetailedComparability={status:"aligned"|"context_difference"|"method_difference"|"not_comparable"|"insufficient_evidence";missing:DetailedContextField[];differences:DetailedContextField[];estimandAligned:boolean};
export function comparePassageLinkedContexts(a:PassageLinkedContext,b:PassageLinkedContext):DetailedComparability{
 validatePassageLinkedContext(a);validatePassageLinkedContext(b);
 const missing=DETAILED_CONTEXT_FIELDS.filter(k=>!["reported","not_applicable"].includes(a.fields[k].status)||!["reported","not_applicable"].includes(b.fields[k].status)||a.fields[k].status==="reported"&&!a.fields[k].normalized||b.fields[k].status==="reported"&&!b.fields[k].normalized);
 const differences=DETAILED_CONTEXT_FIELDS.filter(k=>canonicalEvidenceJson(a.fields[k].normalized)!==canonicalEvidenceJson(b.fields[k].normalized)||a.fields[k].status!==b.fields[k].status);
 const estimandAligned=!missing.includes("estimand")&&!differences.includes("estimand");
 const incompatibleUnits=["dose","timing","sampleSize"].some(k=>{const left=a.fields[k as DetailedContextField].normalized,right=b.fields[k as DetailedContextField].normalized;return left?.kind==="quantity"&&right?.kind==="quantity"&&left.unit!==right.unit});
 const methodDifference=differences.some(k=>["assay","readout","controls","sampleSize"].includes(k));
 return {status:missing.length?"insufficient_evidence":!estimandAligned||incompatibleUnits?"not_comparable":methodDifference?"method_difference":differences.some(k=>k!=="uncertainty")?"context_difference":"aligned",missing,differences,estimandAligned};
}
