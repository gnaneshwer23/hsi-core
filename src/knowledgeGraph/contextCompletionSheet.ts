/**
 * Curator context-completion sheet for D-01 candidates (A2.4 / KG-05 prep).
 * Export and import tissue / population / design values. Applying completions never
 * promotes edges: reviewStatus stays unreviewed and scientificClaimAllowed stays false.
 */
import {createHash} from "node:crypto";
import type {DomainBundle,DomainEdge} from "./domainGraph";

export const CONTEXT_COMPLETION_SCHEMA="hsi-context-completion-sheet-1" as const;
export const NOT_REPORTED="not_reported" as const;

export type ContextCompletionField="tissue"|"population"|"design";
export type ContextCompletionValue=string|typeof NOT_REPORTED|null;

export type ContextCompletionRow={
 edgeId:string;
 subject:string;
 object:string;
 predicate:string;
 sourceId:string|null;
 domains:string[];
 conditions:string[];
 model:string;
 /** Current published values (read-only on the sheet). */
 current:{tissue:string|null;population:string|null;design:string};
 /** Curator-supplied values. null = leave unchanged. */
 proposed:{tissue:ContextCompletionValue;population:ContextCompletionValue;design:ContextCompletionValue};
 note:string;
};

export type ContextCompletionSheet={
 schemaVersion:typeof CONTEXT_COMPLETION_SCHEMA;
 mappedAgainst:string;
 slice:"D-01";
 note:string;
 autoPromotion:false;
 scientificApproval:false;
 rows:ContextCompletionRow[];
 digest:string;
};

const D01_CONDITIONS=new Set(["Type 2 diabetes","Type 1 diabetes","Rheumatoid arthritis","Multiple sclerosis","Obesity"]);
const D01_QUESTION_IDS=new Set(["gut-t2d","gut-t1d","anti-tnf-ra-ms"]);

export function isD01CandidateEdge(edge:DomainEdge,questionEdgeIds?:ReadonlySet<string>):boolean{
 if(edge.kind!=="source_candidate")return false;
 if(questionEdgeIds?.has(edge.id))return true;
 if(edge.conditions.some(c=>D01_CONDITIONS.has(c)))return true;
 const d=new Set(edge.domains);
 return d.has("gut")&&d.has("metabolic");
}

export function d01QuestionEdgeIds(bundle:DomainBundle):Set<string>{
 const fromTo=new Set(bundle.questions.filter(q=>D01_QUESTION_IDS.has(q.id)||/diabetes|tnf|metabol/i.test(q.title)).flatMap(q=>[q.fromId,q.toId]));
 const ids=new Set<string>();
 for(const e of bundle.edges){
  if(e.kind!=="source_candidate")continue;
  if(fromTo.has(e.subjectId)||fromTo.has(e.objectId)||isD01CandidateEdge(e))ids.add(e.id);
 }
 return ids;
}

function nameOf(bundle:DomainBundle,id:string){return bundle.nodes.find(n=>n.id===id)?.name??id}

export function exportContextCompletionSheet(bundle:DomainBundle):Omit<ContextCompletionSheet,"digest">{
 const prefer=d01QuestionEdgeIds(bundle);
 const rows:ContextCompletionRow[]=[];
 for(const e of bundle.edges){
  if(!isD01CandidateEdge(e,prefer))continue;
  rows.push({
   edgeId:e.id,
   subject:nameOf(bundle,e.subjectId),
   object:nameOf(bundle,e.objectId),
   predicate:e.predicate,
   sourceId:e.sourceId,
   domains:[...e.domains],
   conditions:[...e.conditions],
   model:e.model,
   current:{tissue:e.tissue,population:e.population,design:e.design},
   proposed:{tissue:null,population:null,design:null},
   note:"",
  });
 }
 rows.sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
 return {
  schemaVersion:CONTEXT_COMPLETION_SCHEMA,
  mappedAgainst:bundle.version,
  slice:"D-01",
  note:"Curator sheet for tissue, population and design on D-01 source candidates. Fill proposed fields with a value or not_reported. null leaves the published value unchanged. Import never reviews or promotes edges.",
  autoPromotion:false,
  scientificApproval:false,
  rows,
 };
}

export function canonicalContextCompletionText(sheet:Omit<ContextCompletionSheet,"digest">):string{
 const body={
  schemaVersion:sheet.schemaVersion,
  mappedAgainst:sheet.mappedAgainst,
  slice:sheet.slice,
  note:sheet.note,
  autoPromotion:false as const,
  scientificApproval:false as const,
  rows:[...sheet.rows].sort((a,b)=>a.edgeId.localeCompare(b.edgeId)),
 };
 return JSON.stringify(body);
}

export function digestContextCompletionSheet(sheet:Omit<ContextCompletionSheet,"digest">):string{
 return createHash("sha256").update(canonicalContextCompletionText(sheet)).digest("hex");
}

export function sealContextCompletionSheet(sheet:Omit<ContextCompletionSheet,"digest">):ContextCompletionSheet{
 return {...sheet,autoPromotion:false,scientificApproval:false,digest:digestContextCompletionSheet(sheet)};
}

function textOrNull(v:unknown,max=300):v is string|null{
 return v===null||(typeof v==="string"&&v.length<=max&&!/[\u0000-\u0008]/.test(v)&&(v===NOT_REPORTED||v.trim().length>0));
}

export function parseContextCompletionSheet(value:unknown,bundle?:Pick<DomainBundle,"version"|"edges">):ContextCompletionSheet{
 if(!value||typeof value!=="object"||Array.isArray(value))throw Error("Context completion sheet must be an object");
 const s=value as Record<string,unknown>;
 const keys=["schemaVersion","mappedAgainst","slice","note","autoPromotion","scientificApproval","rows","digest"];
 if(Object.keys(s).sort().join("|")!==[...keys].sort().join("|"))throw Error("Context completion sheet has unexpected fields");
 if(s.schemaVersion!==CONTEXT_COMPLETION_SCHEMA)throw Error("Unsupported context completion schemaVersion");
 if(s.slice!=="D-01")throw Error("Only the D-01 slice sheet is accepted");
 if(s.autoPromotion!==false||s.scientificApproval!==false)throw Error("Context completion sheet cannot claim promotion or scientific approval");
 if(typeof s.mappedAgainst!=="string"||!/^[a-f0-9]{64}$/.test(s.mappedAgainst))throw Error("mappedAgainst must be a graph version");
 if(typeof s.note!=="string"||!s.note.trim()||s.note.length>2000)throw Error("note required");
 if(typeof s.digest!=="string"||!/^[a-f0-9]{64}$/.test(s.digest))throw Error("digest required");
 if(!Array.isArray(s.rows)||s.rows.length>500)throw Error("rows must be a bounded array");
 if(bundle&&s.mappedAgainst!==bundle.version)throw Error("Sheet mappedAgainst does not match the published graph version");
 const edgeIds=bundle?new Set(bundle.edges.map(e=>e.id)):null;
 const seen=new Set<string>(),rows:ContextCompletionRow[]=[];
 for(const raw of s.rows){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Malformed completion row");
  const r=raw as Record<string,unknown>;
  const need=["edgeId","subject","object","predicate","sourceId","domains","conditions","model","current","proposed","note"];
  if(Object.keys(r).sort().join("|")!==[...need].sort().join("|"))throw Error("Malformed completion row fields");
  if(typeof r.edgeId!=="string"||!r.edgeId.trim()||r.edgeId.length>220)throw Error("edgeId required");
  if(seen.has(r.edgeId))throw Error(`Duplicate edgeId ${r.edgeId}`);
  seen.add(r.edgeId);
  if(edgeIds&&!edgeIds.has(r.edgeId))throw Error(`Unknown edgeId ${r.edgeId}`);
  if(typeof r.subject!=="string"||typeof r.object!=="string"||typeof r.predicate!=="string"||typeof r.model!=="string")throw Error("row labels required");
  if(!(r.sourceId===null||typeof r.sourceId==="string"))throw Error("sourceId must be string or null");
  if(!Array.isArray(r.domains)||!Array.isArray(r.conditions)||!r.domains.every(x=>typeof x==="string")||!r.conditions.every(x=>typeof x==="string"))throw Error("domains/conditions required");
  const current=r.current as Record<string,unknown>,proposed=r.proposed as Record<string,unknown>;
  if(!current||!proposed||typeof current!=="object"||typeof proposed!=="object")throw Error("current/proposed required");
  for(const f of ["tissue","population","design"] as const){
   if(f==="design"){
    if(typeof current.design!=="string"||!current.design.trim())throw Error("current.design required");
    if(!textOrNull(proposed.design))throw Error("proposed.design invalid");
   }else{
    if(!(current[f]===null||typeof current[f]==="string"))throw Error(`current.${f} invalid`);
    if(!textOrNull(proposed[f]))throw Error(`proposed.${f} invalid`);
   }
  }
  if(typeof r.note!=="string"||r.note.length>1000)throw Error("note must be a short string");
  rows.push({
   edgeId:r.edgeId,
   subject:r.subject,
   object:r.object,
   predicate:r.predicate,
   sourceId:r.sourceId,
   domains:r.domains as string[],
   conditions:r.conditions as string[],
   model:r.model,
   current:{tissue:current.tissue as string|null,population:current.population as string|null,design:current.design as string},
   proposed:{tissue:proposed.tissue as ContextCompletionValue,population:proposed.population as ContextCompletionValue,design:proposed.design as ContextCompletionValue},
   note:r.note,
  });
 }
 const sealed=sealContextCompletionSheet({
  schemaVersion:CONTEXT_COMPLETION_SCHEMA,
  mappedAgainst:s.mappedAgainst as string,
  slice:"D-01",
  note:s.note as string,
  autoPromotion:false,
  scientificApproval:false,
  rows,
 });
 if(sealed.digest!==s.digest)throw Error("Context completion digest does not match content");
 return sealed;
}

/** Apply curator proposals onto edges. Never changes review or approval flags. */
export function applyContextCompletions<T extends DomainEdge>(edges:readonly T[],sheet:ContextCompletionSheet):T[]{
 const byId=new Map(sheet.rows.map(r=>[r.edgeId,r]));
 return edges.map(e=>{
  const row=byId.get(e.id);
  if(!row)return e;
  const next={...e};
  if(row.proposed.tissue!==null)next.tissue=row.proposed.tissue;
  if(row.proposed.population!==null)next.population=row.proposed.population;
  if(row.proposed.design!==null)next.design=row.proposed.design;
  next.reviewStatus="unreviewed";
  next.confidence="not_calibrated";
  next.scientificClaimAllowed=false;
  return next;
 });
}

export function sheetToCsv(sheet:ContextCompletionSheet):string{
 const esc=(v:string)=>`"${v.replaceAll('"','""')}"`;
 const cell=(v:string|null)=>v===null?"":esc(v);
 const header=["edgeId","subject","object","predicate","sourceId","model","domains","conditions","current_tissue","current_population","current_design","proposed_tissue","proposed_population","proposed_design","note"];
 const lines=[header.join(",")];
 for(const r of sheet.rows){
  lines.push([
   esc(r.edgeId),esc(r.subject),esc(r.object),esc(r.predicate),cell(r.sourceId),esc(r.model),
   esc(r.domains.join("|")),esc(r.conditions.join("|")),
   cell(r.current.tissue),cell(r.current.population),esc(r.current.design),
   cell(r.proposed.tissue),cell(r.proposed.population),cell(r.proposed.design),
   esc(r.note),
  ].join(","));
 }
 return lines.join("\n")+"\n";
}

/** Minimal CSV parser for the exported sheet shape (quoted fields, no multiline). */
export function csvToProposedUpdates(csv:string):Map<string,{tissue:ContextCompletionValue;population:ContextCompletionValue;design:ContextCompletionValue;note:string}>{
 const lines=csv.replace(/^\uFEFF/,"").split(/\r?\n/).filter(l=>l.length>0);
 if(lines.length<1)throw Error("Empty CSV");
 const parseLine=(line:string)=>{
  const out:string[]=[];let i=0;while(i<line.length){
   if(line[i]==='"'){let j=i+1,buf="";while(j<line.length){if(line[j]==='"'&&line[j+1]==='"'){buf+='"';j+=2;continue}if(line[j]==='"'){j++;break}buf+=line[j++];}out.push(buf);if(line[j]===",")j++;i=j;continue}
   const j=line.indexOf(",",i);if(j<0){out.push(line.slice(i));break}out.push(line.slice(i,j));i=j+1;
  }
  return out;
 };
 const header=parseLine(lines[0]!);
 const idx=(name:string)=>{const i=header.indexOf(name);if(i<0)throw Error(`CSV missing column ${name}`);return i};
 const iEdge=idx("edgeId"),iT=idx("proposed_tissue"),iP=idx("proposed_population"),iD=idx("proposed_design"),iN=idx("note");
 const blank=(s:string):ContextCompletionValue=>s===""?null:s;
 const map=new Map<string,{tissue:ContextCompletionValue;population:ContextCompletionValue;design:ContextCompletionValue;note:string}>();
 for(const line of lines.slice(1)){
  const cols=parseLine(line);const edgeId=cols[iEdge];if(!edgeId)continue;
  map.set(edgeId,{tissue:blank(cols[iT]??""),population:blank(cols[iP]??""),design:blank(cols[iD]??""),note:cols[iN]??""});
 }
 return map;
}

export function mergeCsvProposalsIntoSheet(sheet:ContextCompletionSheet,csv:string):ContextCompletionSheet{
 const updates=csvToProposedUpdates(csv);
 const rows=sheet.rows.map(r=>{
  const u=updates.get(r.edgeId);if(!u)return r;
  return {...r,proposed:{tissue:u.tissue,population:u.population,design:u.design},note:u.note};
 });
 return sealContextCompletionSheet({...sheet,rows,autoPromotion:false,scientificApproval:false});
}

export type {ContextCompletionProgress,ContextCompletionProgressInput} from "./contextCompletionProgress";
export {summarizeContextCompletionProgress,acceptSealedSheetForUi} from "./contextCompletionProgress";
