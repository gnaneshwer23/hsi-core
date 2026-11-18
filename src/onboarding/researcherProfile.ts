/**
 * Researcher onboarding profile contract (shared browser + server).
 * Device-local by default. Server sync is fail-closed until an additive store
 * is enabled under staging pins — migration 023 community tables stay held.
 */
export const RESEARCHER_PROFILE_SCHEMA="hsi-researcher-profile-1" as const;
export const PROFILE_KEY="hsi-research-profile-v1";

export const ROLES=["Research scientist","Clinical researcher","Biotech or pharma scientist","Academic","Student","Other"] as const;
export const GOALS=["Understand biological mechanisms","Investigate disease biology","Identify therapeutic targets","Explore biomarkers","Compare scientific evidence","Investigate clinical trials","Generate hypotheses","Monitor emerging research"] as const;
export const STAGES=["Student","Early-career researcher","Established researcher","Principal investigator","Industry scientist","Clinician researcher","Other"] as const;
export const CADENCES=["off","weekly","daily"] as const;

export type Profile={
  v:1;
  role:string|null;
  stage:string|null;
  background:string;
  question:string;
  orcid:string|null;
  papers:string[];
  cadence:"off"|"weekly"|"daily";
  goals:string[];
  interests:string[];
  followed:{id:string;name:string}[];
  dismissed:string[];
  onboarded:boolean;
};

export const EMPTY_PROFILE:Profile={
  v:1,role:null,stage:null,background:"",question:"",orcid:null,papers:[],
  cadence:"off",goals:[],interests:[],followed:[],dismissed:[],onboarded:false,
};

const ORCID_RE=/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

/** Accepts an ORCID iD or its URL; returns the bare iD or null. Checks the ISO 7064 check digit. */
export function parseOrcid(input:string):string|null{
  const m=input.trim().replace(/^https?:\/\/orcid\.org\//i,"");
  if(!ORCID_RE.test(m))return null;
  const d=m.replaceAll("-","");let t=0;for(let i=0;i<15;i++)t=(t+Number(d[i]!))*2;
  const c=(12-t%11)%11;return d[15]===(c===10?"X":String(c))?m:null;
}

/** Splits pasted DOIs and PMIDs. Unrecognised items are returned separately. */
export function parsePaperIds(input:string):{ids:string[];rejected:string[]}{
  const ids:string[]=[],rejected:string[]=[];
  for(const raw of input.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean)){
    const t=raw.replace(/^https?:\/\/(dx\.)?doi\.org\//i,"").replace(/^doi:/i,"").replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i,"").replace(/\/$/,"").replace(/^pmid:/i,"");
    const id=/^10\.\d{4,9}\/\S{1,180}$/.test(t)?"doi:"+t.toLowerCase():/^\d{1,9}$/.test(t)?"pmid:"+t:null;
    if(!id)rejected.push(raw.slice(0,40));else if(!ids.includes(id))ids.push(id);
  }
  return {ids:ids.slice(0,20),rejected:rejected.slice(0,10)};
}

const cap=(xs:unknown,n:number,len=80)=>Array.isArray(xs)?[...new Set(xs.filter((x):x is string=>typeof x==="string"&&!!x.trim()&&x.length<=len).map(x=>x.trim()))].slice(0,n):[];

export function parseProfile(raw:string|null):Profile{
  if(!raw)return {...EMPTY_PROFILE};
  try{
    const x=JSON.parse(raw);
    if(!x||typeof x!=="object"||x.v!==1)return {...EMPTY_PROFILE};
    const followed=Array.isArray(x.followed)?x.followed.filter((f:unknown)=>{
      const o=f as {id?:unknown;name?:unknown};
      return !!o&&typeof o.id==="string"&&typeof o.name==="string"&&o.id.length<=220&&o.name.length<=200;
    }).slice(0,50).map((f:{id:string;name:string})=>({id:f.id,name:f.name})):[];
    const str=(v:unknown,n:number)=>typeof v==="string"?v.slice(0,n):"";
    return {
      v:1,
      role:typeof x.role==="string"&&x.role.length<=60?x.role:null,
      stage:typeof x.stage==="string"&&x.stage.length<=60?x.stage:null,
      background:str(x.background,600),
      question:str(x.question,600),
      orcid:typeof x.orcid==="string"?parseOrcid(x.orcid):null,
      papers:cap(x.papers,20,200),
      cadence:(CADENCES as readonly unknown[]).includes(x.cadence)?x.cadence as Profile["cadence"]:"off",
      goals:cap(x.goals,8),
      interests:cap(x.interests,20),
      followed,
      dismissed:cap(x.dismissed,200,230),
      onboarded:x.onboarded===true,
    };
  }catch{return {...EMPTY_PROFILE}}
}

/** Sanitize an already-parsed object (API body). */
export function normalizeProfile(value:unknown):Profile{
  if(!value||typeof value!=="object"||Array.isArray(value))return {...EMPTY_PROFILE};
  return parseProfile(JSON.stringify(value));
}

export function exportProfile(profile:Profile):Profile{
  return structuredClone(normalizeProfile(profile));
}
