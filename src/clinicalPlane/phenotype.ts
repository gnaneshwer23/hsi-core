/**
 * Phenotype definitions and cohort evaluation for the clinical plane. A definition is PUBLIC science that flows DOWN from the
 * scientific plane; evaluation runs against patient-level records that never leave this module. Only the aggregate is returned,
 * and it must still pass the release gate before anything crosses back up.
 * Missing data is never silently excluded: each criterion is met, not met or UNKNOWN, and patients who might still qualify are
 * reported as indeterminate. Synthetic data only until the clinical-plane ADR is approved.
 */
export type Criterion=
 |{kind:"condition";equals:string}
 |{kind:"age";min?:number;max?:number}
 |{kind:"sex";equals:string}
 |{kind:"bmi";min?:number;max?:number}
 |{kind:"lab";test:string;op:">="|"<="|">"|"<";value:number;at:"latest"|"any"}
 |{kind:"medication";includes:string};
export type PhenotypeDefinition={schema:"hsi-phenotype-definition-1";id:string;title:string;origin:{kind:"graph_gap"|"hypothesis"|"authored";ref:string;graphVersion:string};include:Criterion[];exclude:Criterion[];summariseLabs:string[];note:string};
export type PlanePatient={id:string;condition:string;age:number|null;sex:string|null;bmi:number|null;labs:{test:string;visit:number;value:number}[];medications:string[]};
export type Tri="met"|"not_met"|"unknown";
const ID=/^[a-z0-9][a-z0-9:._-]{2,99}$/i,TXT=/^[\p{L}\p{N} _.,:;()%/+\-']{1,120}$/u;
const num=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)&&Math.abs(v)<1e6;

export function validateDefinition(d:unknown):{ok:true;def:PhenotypeDefinition}|{ok:false;error:string}{
 const x=d as PhenotypeDefinition;
 if(!x||typeof x!=="object"||x.schema!=="hsi-phenotype-definition-1")return {ok:false,error:"Wrong schema"};
 if(!ID.test(String(x.id))||typeof x.title!=="string"||x.title.length<3||x.title.length>160||typeof x.note!=="string"||x.note.length>400)return {ok:false,error:"Invalid id, title or note"};
 if(!x.origin||!["graph_gap","hypothesis","authored"].includes(x.origin.kind)||!ID.test(String(x.origin.ref))||typeof x.origin.graphVersion!=="string"||!/^[a-f0-9]{8,64}$/.test(x.origin.graphVersion))return {ok:false,error:"Invalid origin"};
 if(!Array.isArray(x.include)||x.include.length<1||x.include.length>12||!Array.isArray(x.exclude)||x.exclude.length>12)return {ok:false,error:"Needs 1 to 12 include and at most 12 exclude criteria"};
 if(!Array.isArray(x.summariseLabs)||x.summariseLabs.length>4||x.summariseLabs.some(t=>typeof t!=="string"||!TXT.test(t)))return {ok:false,error:"Invalid summariseLabs"};
 for(const c of [...x.include,...x.exclude]){
  if(!c||typeof c!=="object")return {ok:false,error:"Invalid criterion"};
  switch(c.kind){
   case "condition":case "sex":if(typeof c.equals!=="string"||!TXT.test(c.equals))return {ok:false,error:"Invalid "+c.kind+" criterion"};break;
   case "age":case "bmi":if((c.min!==undefined&&!num(c.min))||(c.max!==undefined&&!num(c.max))||(c.min===undefined&&c.max===undefined)||(c.min!==undefined&&c.max!==undefined&&c.min>c.max))return {ok:false,error:"Invalid "+c.kind+" range"};break;
   case "lab":if(typeof c.test!=="string"||!TXT.test(c.test)||![">=","<=",">","<"].includes(c.op)||!num(c.value)||!["latest","any"].includes(c.at))return {ok:false,error:"Invalid lab criterion"};break;
   case "medication":if(typeof c.includes!=="string"||!TXT.test(c.includes))return {ok:false,error:"Invalid medication criterion"};break;
   default:return {ok:false,error:"Unknown criterion kind"};
  }
 }
 return {ok:true,def:x};
}
export const labelOf=(c:Criterion):string=>{
 switch(c.kind){
  case "condition":return `Condition is ${c.equals}`;case "sex":return `Sex is ${c.equals}`;
  case "age":case "bmi":return `${c.kind==="age"?"Age":"BMI"} ${c.min!==undefined?"≥ "+c.min:""}${c.min!==undefined&&c.max!==undefined?" and ":""}${c.max!==undefined?"≤ "+c.max:""}`;
  case "lab":return `${c.test} (${c.at==="latest"?"latest":"any visit"}) ${c.op} ${c.value}`;
  case "medication":return `On ${c.includes}`;
 }
};
const cmp=(a:number,op:string,b:number)=>op===">="?a>=b:op==="<="?a<=b:op===">"?a>b:a<b;
const range=(v:number|null,c:{min?:number;max?:number}):Tri=>v===null?"unknown":(c.min===undefined||v>=c.min)&&(c.max===undefined||v<=c.max)?"met":"not_met";
export function evalCriterion(c:Criterion,p:PlanePatient):Tri{
 switch(c.kind){
  case "condition":return p.condition?(p.condition===c.equals?"met":"not_met"):"unknown";
  case "sex":return p.sex===null?"unknown":p.sex===c.equals?"met":"not_met";
  case "age":return range(p.age,c);case "bmi":return range(p.bmi,c);
  case "lab":{
   const ls=p.labs.filter(l=>l.test===c.test&&Number.isFinite(l.value));if(ls.length===0)return "unknown";
   if(c.at==="latest"){const last=ls.reduce((a,b)=>b.visit>a.visit?b:a);return cmp(last.value,c.op,c.value)?"met":"not_met"}
   return ls.some(l=>cmp(l.value,c.op,c.value))?"met":"not_met";
  }
  case "medication":return p.medications.some(m=>m.toLowerCase()===c.includes.toLowerCase())?"met":"not_met";
 }
}
export type Triplet={met:number;notMet:number;unknown:number};
export type CohortAggregate={
 schema:"hsi-cohort-aggregate-1";definitionId:string;dataClass:"synthetic";
 counts:{evaluated:number;matched:number;excluded:number;indeterminate:number};
 attrition:{kind:"include"|"exclude";label:string;counts:Triplet}[];
 matchedBySex:Record<string,number>;matchedByCondition:Record<string,number>;
 labSummary:{test:string;n:number;median:number|null;p25:number|null;p75:number|null}[];
};
const q=(s:number[],p:number)=>{const i=(s.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(s[lo]!+(s[hi]!-s[lo]!)*(i-lo)).toFixed(2)};
/** Runs inside the plane. Returns the aggregate plus the matched ids, which MUST NOT be released (the gate refuses any id). */
export function evaluateCohort(def:PhenotypeDefinition,patients:readonly PlanePatient[]):{aggregate:CohortAggregate;matchedIds:string[]}{
 const attr=new Map<string,Triplet>(),bump=(k:string,t:Tri)=>{const a=attr.get(k)??{met:0,notMet:0,unknown:0};if(t==="met")a.met++;else if(t==="not_met")a.notMet++;else a.unknown++;attr.set(k,a)};
 const counts={evaluated:patients.length,matched:0,excluded:0,indeterminate:0},sex:Record<string,number>={},cond:Record<string,number>={},matched:PlanePatient[]=[];
 for(const p of patients){
  const inc=def.include.map(c=>{const t=evalCriterion(c,p);bump("include|"+labelOf(c),t);return t}),exc=def.exclude.map(c=>{const t=evalCriterion(c,p);bump("exclude|"+labelOf(c),t);return t});
  if(inc.includes("not_met")||exc.includes("met"))counts.excluded++;
  else if(inc.includes("unknown")||exc.includes("unknown"))counts.indeterminate++;
  else{counts.matched++;matched.push(p);const s=p.sex??"not recorded";sex[s]=(sex[s]??0)+1;cond[p.condition]=(cond[p.condition]??0)+1}
 }
 const labSummary=def.summariseLabs.map(test=>{
  const v=matched.map(p=>{const ls=p.labs.filter(l=>l.test===test&&Number.isFinite(l.value));return ls.length?ls.reduce((a,b)=>b.visit>a.visit?b:a).value:null}).filter((x):x is number=>x!==null).sort((a,b)=>a-b);
  return v.length?{test,n:v.length,median:q(v,.5),p25:q(v,.25),p75:q(v,.75)}:{test,n:0,median:null,p25:null,p75:null};
 });
 return {matchedIds:matched.map(p=>p.id),aggregate:{schema:"hsi-cohort-aggregate-1",definitionId:def.id,dataClass:"synthetic",counts,
  attrition:[...attr.entries()].map(([k,counts])=>({kind:k.startsWith("include")?"include" as const:"exclude" as const,label:k.slice(k.indexOf("|")+1),counts})),
  matchedBySex:sex,matchedByCondition:cond,labSummary}};
}
