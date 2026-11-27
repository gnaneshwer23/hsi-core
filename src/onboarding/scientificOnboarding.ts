/**
 * LEA-02A: personalised scientific onboarding contract (shared browser and tests).
 *
 * Pure and framework-free. Holds the option lists, the step graph with conditional
 * branching, the state reducer, field validation and the workspace plan derived from
 * the answers. Everything here is local to the device: nothing is sent to a server,
 * no identity is verified, and no access is granted. Role and sharing answers are
 * personalisation only; research access is provisioned by an administrator.
 */
import {parseOrcid} from "./researcherProfile";

export const ONBOARDING_SCHEMA="hsi-scientific-onboarding-1" as const;
export const ONBOARDING_KEY="hsi-scientific-onboarding-v1";

export type PersonaId="student"|"researcher"|"professor"|"laboratory"|"computational"|"clinical"|"biotech"|"institution";
export type RoleId="undergraduate"|"masters"|"phd"|"postdoc"|"independent"|"pi"|"lab"|"compbio"|"bioinf"|"clinical"|"biotech"|"pharma"|"admin";

export const ROLES:readonly {id:RoleId;label:string;persona:PersonaId;blurb:string}[]=[
 {id:"undergraduate",label:"Undergraduate student",persona:"student",blurb:"Learning biology and how to read evidence."},
 {id:"masters",label:"Master's student",persona:"student",blurb:"Coursework and a first research project."},
 {id:"phd",label:"PhD researcher",persona:"researcher",blurb:"A thesis, a literature and a gap to fill."},
 {id:"postdoc",label:"Postdoctoral researcher",persona:"researcher",blurb:"Mechanisms, conflicting results and next experiments."},
 {id:"independent",label:"Independent scientist",persona:"researcher",blurb:"Your own questions, outside an institution."},
 {id:"pi",label:"Professor or principal investigator",persona:"professor",blurb:"A group, its projects and its opportunities."},
 {id:"lab",label:"Laboratory scientist",persona:"laboratory",blurb:"Methods, protocols and what the bench observed."},
 {id:"compbio",label:"Computational biologist",persona:"computational",blurb:"Models, graphs and multi-omics."},
 {id:"bioinf",label:"Bioinformatician",persona:"computational",blurb:"Pipelines, datasets and reproducible analysis."},
 {id:"clinical",label:"Clinical researcher",persona:"clinical",blurb:"Disease mechanisms and translational evidence."},
 {id:"biotech",label:"Biotechnology researcher",persona:"biotech",blurb:"Targets, platforms and portfolios."},
 {id:"pharma",label:"Pharmaceutical researcher",persona:"biotech",blurb:"Targets, translation and portfolio decisions."},
 {id:"admin",label:"Institution administrator",persona:"institution",blurb:"Organisation structure and research governance."},
];
export const roleById=Object.fromEntries(ROLES.map(r=>[r.id,r])) as Record<RoleId,(typeof ROLES)[number]>;

export const PERSONA_LABEL:Record<PersonaId,string>={
 student:"Student",researcher:"Researcher",professor:"Professor or PI",laboratory:"Laboratory scientist",
 computational:"Computational scientist",clinical:"Clinical researcher",biotech:"Biotech and pharma researcher",institution:"Institution administrator",
};

/** The six domains are equal: one list, no weighting, no featured entry. */
export type DomainKey="immunology"|"neuroscience"|"microbiome"|"genomics"|"organ"|"disease";
export const DOMAINS:readonly {key:DomainKey;label:string;example:string}[]=[
 {key:"immunology",label:"Immunology & Inflammation",example:"Cytokines, T-cell states, checkpoints"},
 {key:"neuroscience",label:"Neuroscience",example:"Microglia, barriers, neuroinflammation"},
 {key:"microbiome",label:"Microbiome & Metabolism",example:"Gut microbiota, metabolites, host signalling"},
 {key:"genomics",label:"Genomics & Multi-omics",example:"Variants, expression, single-cell signatures"},
 {key:"organ",label:"Organ & Tissue Biology",example:"Barriers, stem cells, tissue repair"},
 {key:"disease",label:"Disease Mechanisms",example:"How processes go wrong in disease"},
];
export const DOMAIN_KEYS=DOMAINS.map(d=>d.key) as readonly DomainKey[];

export const INTEREST_KINDS=["Gene","Protein","Cell type","Tissue","Pathway","Disease","Biological process"] as const;

export type ObjectiveId="learn"|"mechanisms"|"review"|"conflicts"|"gaps"|"hypotheses"|"methods"|"plan"|"targets"|"translation"|"coordinate"|"collaborators";
export const OBJECTIVES:readonly {id:ObjectiveId;label:string;personas:readonly PersonaId[]}[]=[
 {id:"learn",label:"Learn scientific concepts",personas:["student"]},
 {id:"mechanisms",label:"Understand biological mechanisms",personas:["student","researcher","clinical","laboratory"]},
 {id:"review",label:"Conduct literature reviews",personas:["student","researcher","professor"]},
 {id:"conflicts",label:"Investigate conflicting evidence",personas:["researcher","professor","clinical","biotech"]},
 {id:"gaps",label:"Identify research gaps",personas:["researcher","professor","computational"]},
 {id:"hypotheses",label:"Generate testable hypotheses",personas:["researcher","laboratory","computational"]},
 {id:"methods",label:"Improve experimental methods",personas:["laboratory","researcher"]},
 {id:"plan",label:"Plan experiments",personas:["laboratory","researcher","computational"]},
 {id:"targets",label:"Explore drug targets",personas:["biotech","clinical","computational"]},
 {id:"translation",label:"Investigate translational opportunities",personas:["clinical","biotech"]},
 {id:"coordinate",label:"Coordinate research projects",personas:["professor","institution"]},
 {id:"collaborators",label:"Discover potential collaborators",personas:["professor","researcher","institution"]},
];
export const objectiveById=Object.fromEntries(OBJECTIVES.map(o=>[o.id,o])) as Record<ObjectiveId,(typeof OBJECTIVES)[number]>;

/** Objectives for a persona first, in their listed order; the rest follow. All twelve stay available. */
export function rankedObjectives(persona:PersonaId|null){
 if(!persona)return {suggested:[] as typeof OBJECTIVES[number][],others:[...OBJECTIVES]};
 const suggested=OBJECTIVES.filter(o=>o.personas.includes(persona));
 return {suggested,others:OBJECTIVES.filter(o=>!o.personas.includes(persona))};
}

export const TECHNIQUES=["Flow cytometry","Single-cell RNA sequencing","Western blot","qPCR","Imaging and microscopy","Mass spectrometry","CRISPR perturbation","Cell culture","Animal models","Clinical sampling"] as const;
export const COMPUTATIONAL_METHODS=["Differential expression","Network analysis","Machine learning","Statistical modelling","Pathway enrichment","Variant analysis","Text mining","Single-cell analysis"] as const;
export const MODEL_SYSTEMS=["Human","Mouse","Rat","Zebrafish","Organoid","Cell line","In silico"] as const;
export const DATASET_KINDS=["Transcriptomic","Genomic","Proteomic","Metabolomic","Imaging","Clinical (de-identified)","Literature-derived"] as const;
export const EVIDENCE_TYPES=["Randomised trials","Cohort studies","Mechanistic experiments","Genetic association","Systematic reviews","Preprints (flagged)"] as const;
export const EXPLANATION_LEVELS=[
 {id:"foundations",label:"Foundations",note:"Define terms and build up from basics."},
 {id:"working",label:"Working knowledge",note:"Assume the basics; explain the specifics."},
 {id:"expert",label:"Expert",note:"Concise, technical, citation-first."},
] as const;
export type ExplanationLevel=(typeof EXPLANATION_LEVELS)[number]["id"];

export type CapabilityStatus="Prototype"|"In development"|"Planned"|"Illustrative";
export type ConnectionId="orcid"|"openalex"|"pubmed"|"crossref"|"reference-manager"|"documents"|"institutional-data";
export type DataClass="public"|"private"|"restricted";
/** Statuses mirror the public sources page; nothing here is connected in this prototype. */
export const CONNECTIONS:readonly {id:ConnectionId;label:string;dataClass:DataClass;status:CapabilityStatus;what:string}[]=[
 {id:"orcid",label:"ORCID",dataClass:"public",status:"Planned",what:"Public record: name, affiliations and works you choose to expose."},
 {id:"openalex",label:"OpenAlex",dataClass:"public",status:"Planned",what:"Public scholarly metadata for works, authors and institutions."},
 {id:"pubmed",label:"PubMed",dataClass:"public",status:"Prototype",what:"Public abstracts and metadata used by the literature prototype."},
 {id:"crossref",label:"Crossref",dataClass:"public",status:"Planned",what:"Public metadata, including retractions and corrections."},
 {id:"reference-manager",label:"Reference managers",dataClass:"private",status:"Planned",what:"Your own library. Private to you until you decide otherwise."},
 {id:"documents",label:"Research documents",dataClass:"private",status:"Planned",what:"Your papers and notes. Not accepted by this prototype."},
 {id:"institutional-data",label:"Authorised institutional datasets",dataClass:"restricted",status:"Planned",what:"Only after your institution authorises it and an administrator provisions access."},
];

export type Sharing="private"|"group"|"institution";
export type Memory="off"|"private"|"project";

export type OnboardingState={
 v:1;
 path:"individual"|"institution";
 account:"email"|"later"|null;
 primaryRole:RoleId|null;
 secondaryRoles:RoleId[];
 identity:{mode:"manual"|"orcid"|"publications"|"cv"|null;name:string;institution:string;department:string;orcid:string;cvFileName:string;publicationsPreviewed:boolean};
 primaryDomain:DomainKey|null;
 secondaryDomains:DomainKey[];
 interests:{kind:(typeof INTEREST_KINDS)[number];name:string}[];
 objectives:ObjectiveId[];
 question:string;
 methods:{techniques:string[];computational:string[];expertise:string;modelSystems:string[];datasets:string[];evidence:string[];level:ExplanationLevel|null};
 connections:Partial<Record<ConnectionId,"interested">>;
 privacy:{memory:Memory;sharing:Sharing;notifications:"off"|"weekly";external:"ask"|"never"};
 institutionInfo:{name:string;contact:string;size:""|"under-50"|"50-500"|"over-500";departments:string[];intendedData:DataClass[]};
 projects:{name:string;note:string}[];
 visited:string[];
 skipped:string[];
 done:boolean;
};

export const EMPTY_STATE:OnboardingState={
 v:1,path:"individual",account:null,primaryRole:null,secondaryRoles:[],
 identity:{mode:null,name:"",institution:"",department:"",orcid:"",cvFileName:"",publicationsPreviewed:false},
 primaryDomain:null,secondaryDomains:[],interests:[],objectives:[],question:"",
 methods:{techniques:[],computational:[],expertise:"",modelSystems:[],datasets:[],evidence:[],level:null},
 connections:{},
 privacy:{memory:"private",sharing:"private",notifications:"off",external:"ask"},
 institutionInfo:{name:"",contact:"",size:"",departments:[],intendedData:[]},
 projects:[],
 visited:[],skipped:[],done:false,
};

export const personaOf=(s:Pick<OnboardingState,"primaryRole">):PersonaId|null=>s.primaryRole?roleById[s.primaryRole].persona:null;

/* ----------------------------------------------------------------- steps */

export type StepId="welcome"|"role"|"institution"|"identity"|"science"|"objectives"|"methods"|"resources"|"preferences"|"review";
export const STEPS:readonly {id:StepId;path:string;label:string;optional:boolean}[]=[
 {id:"welcome",path:"/onboarding",label:"Welcome",optional:true},
 {id:"role",path:"/onboarding/role",label:"Role",optional:false},
 {id:"institution",path:"/onboarding/institution",label:"Institution",optional:true},
 {id:"identity",path:"/onboarding/identity",label:"Identity",optional:true},
 {id:"science",path:"/onboarding/science",label:"Science",optional:false},
 {id:"objectives",path:"/onboarding/objectives",label:"Objectives",optional:false},
 {id:"methods",path:"/onboarding/methods",label:"Methods",optional:true},
 {id:"resources",path:"/onboarding/resources",label:"Context",optional:true},
 {id:"preferences",path:"/onboarding/preferences",label:"Memory",optional:true},
 {id:"review",path:"/onboarding/review",label:"Workspace",optional:false},
];
export const stepById=Object.fromEntries(STEPS.map(s=>[s.id,s])) as Record<StepId,(typeof STEPS)[number]>;
export const stepForPath=(path:string)=>STEPS.find(s=>s.path===path.replace(/\/$/,""))?.id??null;

/**
 * Branching. The institution step appears for the institutional path and for administrators.
 * The resources step is skipped for the institution administrator, who connects nothing personal.
 */
export function isStepVisible(step:StepId,s:OnboardingState):boolean{
 if(step==="institution")return s.path==="institution"||s.primaryRole==="admin";
 if(step==="resources")return personaOf(s)!=="institution";
 return true;
}
export const visibleSteps=(s:OnboardingState)=>STEPS.filter(x=>isStepVisible(x.id,s));
export function nextStep(from:StepId,s:OnboardingState):StepId|null{
 const v=visibleSteps(s);const i=v.findIndex(x=>x.id===from);return i>=0&&i<v.length-1?v[i+1]!.id:null;
}
export function previousStep(from:StepId,s:OnboardingState):StepId|null{
 const v=visibleSteps(s);const i=v.findIndex(x=>x.id===from);return i>0?v[i-1]!.id:null;
}

/** Which method groups lead, by persona: the questions adapt, nothing is removed. */
export function methodsFocus(p:PersonaId|null):("techniques"|"computational"|"level"|"evidence")[]{
 switch(p){
  case "student":return ["level","evidence","techniques","computational"];
  case "computational":return ["computational","techniques","evidence","level"];
  case "clinical":return ["evidence","techniques","computational","level"];
  case "laboratory":return ["techniques","computational","evidence","level"];
  default:return ["evidence","techniques","computational","level"];
 }
}

/* ------------------------------------------------------------ validation */

export type Errors=Record<string,string>;
const MAX={name:120,text:200,question:500};

export function validateStep(step:StepId,s:OnboardingState):Errors{
 const e:Errors={};
 if(step==="role"&&!s.primaryRole)e.primaryRole="Choose the role that best describes you. You can change it later.";
 if(step==="identity"){
  if(s.identity.name.length>MAX.name)e.name="Keep the name under 120 characters.";
  if(s.identity.institution.length>MAX.text)e.institution="Keep this under 200 characters.";
  if(s.identity.department.length>MAX.text)e.department="Keep this under 200 characters.";
  if(s.identity.orcid.trim()&&!parseOrcid(s.identity.orcid))e.orcid="That is not a valid ORCID iD (for example 0000-0002-1825-0097). The check digit does not match.";
 }
 if(step==="institution"){
  if(!s.institutionInfo.name.trim())e.institutionName="Enter the organisation's name.";
  if(s.institutionInfo.contact.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.institutionInfo.contact.trim()))e.contact="Enter a valid email address, or leave it blank.";
 }
 if(step==="science"&&!s.primaryDomain)e.primaryDomain="Choose a primary domain. You can add others and change this later.";
 if(step==="objectives"){
  if(s.objectives.length===0)e.objectives="Choose at least one thing you want to accomplish.";
  if(s.question.length>MAX.question)e.question="Keep the question under 500 characters.";
 }
 return e;
}
export const canAdvance=(step:StepId,s:OnboardingState)=>Object.keys(validateStep(step,s)).length===0;
export const isRequired=(step:StepId)=>!stepById[step].optional;

/** The iD as typed, only if its format and check digit are valid; otherwise null. Never a claim of verification. */
export function parseOrcidForDisplay(input:string):string|null{return parseOrcid(input)}

/** Text that must never enter the prototype. Flags obvious identifiers so the interface can warn. */
const NHS=/\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/,EMAIL=/[^\s@]+@[^\s@]+\.[^\s@]+/,MRN=/\b(mrn|nhs number|patient id|dob|date of birth)\b/i;
export function looksIdentifying(text:string):boolean{return NHS.test(text)||EMAIL.test(text)||MRN.test(text)}

/* --------------------------------------------------------------- reducer */

export type Action=
 |{type:"set";patch:Partial<OnboardingState>}
 |{type:"toggleSecondaryRole";role:RoleId}
 |{type:"setPrimaryRole";role:RoleId}
 |{type:"setIdentity";patch:Partial<OnboardingState["identity"]>}
 |{type:"setPrimaryDomain";domain:DomainKey}
 |{type:"toggleSecondaryDomain";domain:DomainKey}
 |{type:"toggleObjective";id:ObjectiveId}
 |{type:"toggleMethod";group:"techniques"|"computational"|"modelSystems"|"datasets"|"evidence";value:string}
 |{type:"setMethods";patch:Partial<OnboardingState["methods"]>}
 |{type:"addInterest";kind:(typeof INTEREST_KINDS)[number];name:string}
 |{type:"removeInterest";index:number}
 |{type:"toggleConnection";id:ConnectionId}
 |{type:"setPrivacy";patch:Partial<OnboardingState["privacy"]>}
 |{type:"setInstitution";patch:Partial<OnboardingState["institutionInfo"]>}
 |{type:"addDepartment";name:string}
 |{type:"removeDepartment";index:number}
 |{type:"addProject";name:string;note:string}
 |{type:"removeProject";index:number}
 |{type:"setObjectives";ids:ObjectiveId[]}
 |{type:"visit";step:StepId}
 |{type:"skip";step:StepId}
 |{type:"finish"}
 |{type:"reset"};

const toggle=<T,>(xs:T[],x:T)=>xs.includes(x)?xs.filter(y=>y!==x):[...xs,x];

export function reduce(s:OnboardingState,a:Action):OnboardingState{
 switch(a.type){
  case "set":return {...s,...a.patch};
  case "setPrimaryRole":return {...s,primaryRole:a.role,secondaryRoles:s.secondaryRoles.filter(r=>r!==a.role),path:a.role==="admin"?"institution":s.path};
  case "toggleSecondaryRole":return a.role===s.primaryRole?s:{...s,secondaryRoles:toggle(s.secondaryRoles,a.role)};
  case "setIdentity":return {...s,identity:{...s.identity,...a.patch}};
  case "setPrimaryDomain":return {...s,primaryDomain:a.domain,secondaryDomains:s.secondaryDomains.filter(d=>d!==a.domain)};
  case "toggleSecondaryDomain":return a.domain===s.primaryDomain?s:{...s,secondaryDomains:toggle(s.secondaryDomains,a.domain)};
  case "toggleObjective":return {...s,objectives:toggle(s.objectives,a.id)};
  case "toggleMethod":return {...s,methods:{...s.methods,[a.group]:toggle(s.methods[a.group],a.value)}};
  case "setMethods":return {...s,methods:{...s.methods,...a.patch}};
  case "addInterest":{
   const name=a.name.trim().slice(0,80);
   if(!name||s.interests.length>=20||s.interests.some(i=>i.kind===a.kind&&i.name.toLowerCase()===name.toLowerCase()))return s;
   return {...s,interests:[...s.interests,{kind:a.kind,name}]};
  }
  case "removeInterest":return {...s,interests:s.interests.filter((_,i)=>i!==a.index)};
  case "toggleConnection":{
   const c={...s.connections};if(c[a.id])delete c[a.id];else c[a.id]="interested";return {...s,connections:c};
  }
  case "setPrivacy":return {...s,privacy:{...s.privacy,...a.patch}};
  case "setInstitution":return {...s,institutionInfo:{...s.institutionInfo,...a.patch}};
  case "addDepartment":{
   const name=a.name.trim().slice(0,80),d=s.institutionInfo.departments;
   if(!name||d.length>=20||d.some(x=>x.toLowerCase()===name.toLowerCase()))return s;
   return {...s,institutionInfo:{...s.institutionInfo,departments:[...d,name]}};
  }
  case "removeDepartment":return {...s,institutionInfo:{...s.institutionInfo,departments:s.institutionInfo.departments.filter((_,i)=>i!==a.index)}};
  case "addProject":{
   const name=a.name.trim().slice(0,80);
   if(!name||s.projects.length>=10||s.projects.some(p=>p.name.toLowerCase()===name.toLowerCase()))return s;
   return {...s,projects:[...s.projects,{name,note:a.note.trim().slice(0,200)}]};
  }
  case "removeProject":return {...s,projects:s.projects.filter((_,i)=>i!==a.index)};
  case "setObjectives":return {...s,objectives:[...new Set(a.ids)].filter(id=>id in objectiveById)};
  case "visit":return s.visited.includes(a.step)?s:{...s,visited:[...s.visited,a.step]};
  case "skip":return {...s,skipped:s.skipped.includes(a.step)?s.skipped:[...s.skipped,a.step],visited:s.visited.includes(a.step)?s.visited:[...s.visited,a.step]};
  case "finish":return {...s,done:true};
  case "reset":return {...EMPTY_STATE};
 }
}

/* ----------------------------------------------------------- persistence */

const inList=<T extends string>(v:unknown,list:readonly T[]):v is T=>typeof v==="string"&&(list as readonly string[]).includes(v);
const strs=(v:unknown,allowed:readonly string[]|null,n:number,len=80):string[]=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==="string"&&x.length<=len&&(!allowed||allowed.includes(x))))].slice(0,n):[];
const str=(v:unknown,n:number)=>typeof v==="string"?v.slice(0,n):"";

/** Fail closed: anything malformed falls back to the default, field by field. */
export function parseState(raw:string|null):OnboardingState{
 if(!raw)return {...EMPTY_STATE};
 let j:any;try{j=JSON.parse(raw)}catch{return {...EMPTY_STATE}}
 if(!j||typeof j!=="object"||j.v!==1)return {...EMPTY_STATE};
 const roleIds=ROLES.map(r=>r.id),stepIds=STEPS.map(x=>x.id) as StepId[],connIds=CONNECTIONS.map(c=>c.id);
 const primaryRole=inList(j.primaryRole,roleIds)?j.primaryRole:null;
 const primaryDomain=inList(j.primaryDomain,DOMAIN_KEYS)?j.primaryDomain:null;
 const id=j.identity&&typeof j.identity==="object"?j.identity:{};
 const m=j.methods&&typeof j.methods==="object"?j.methods:{};
 const p=j.privacy&&typeof j.privacy==="object"?j.privacy:{};
 const inst=j.institutionInfo&&typeof j.institutionInfo==="object"?j.institutionInfo:{};
 const connections:OnboardingState["connections"]={};
 if(j.connections&&typeof j.connections==="object")for(const c of connIds)if(j.connections[c]==="interested")connections[c]="interested";
 return {
  v:1,
  path:j.path==="institution"?"institution":"individual",
  account:j.account==="email"||j.account==="later"?j.account:null,
  primaryRole,
  secondaryRoles:strs(j.secondaryRoles,roleIds,12).filter(r=>r!==primaryRole) as RoleId[],
  identity:{
   mode:inList(id.mode,["manual","orcid","publications","cv"] as const)?id.mode:null,
   name:str(id.name,MAX.name),institution:str(id.institution,MAX.text),department:str(id.department,MAX.text),
   orcid:str(id.orcid,40),cvFileName:str(id.cvFileName,120),publicationsPreviewed:id.publicationsPreviewed===true,
  },
  primaryDomain,
  secondaryDomains:strs(j.secondaryDomains,DOMAIN_KEYS,6).filter(d=>d!==primaryDomain) as DomainKey[],
  interests:Array.isArray(j.interests)?j.interests.filter((i:any)=>i&&inList(i.kind,INTEREST_KINDS)&&typeof i.name==="string"&&i.name.trim()&&i.name.length<=80).slice(0,20).map((i:any)=>({kind:i.kind,name:i.name.trim()})):[],
  objectives:strs(j.objectives,OBJECTIVES.map(o=>o.id),12) as ObjectiveId[],
  question:str(j.question,MAX.question),
  methods:{
   techniques:strs(m.techniques,TECHNIQUES,10),computational:strs(m.computational,COMPUTATIONAL_METHODS,10),
   expertise:str(m.expertise,MAX.text),modelSystems:strs(m.modelSystems,MODEL_SYSTEMS,10),datasets:strs(m.datasets,DATASET_KINDS,10),
   evidence:strs(m.evidence,EVIDENCE_TYPES,10),level:inList(m.level,EXPLANATION_LEVELS.map(l=>l.id))?m.level:null,
  },
  connections,
  privacy:{
   memory:inList(p.memory,["off","private","project"] as const)?p.memory:"private",
   sharing:inList(p.sharing,["private","group","institution"] as const)?p.sharing:"private",
   notifications:p.notifications==="weekly"?"weekly":"off",
   external:p.external==="never"?"never":"ask",
  },
  institutionInfo:{name:str(inst.name,MAX.text),contact:str(inst.contact,MAX.text),size:inList(inst.size,["under-50","50-500","over-500"] as const)?inst.size:"",departments:strs(inst.departments,null,20),intendedData:strs(inst.intendedData,["public","private","restricted"],3) as DataClass[]},
  projects:Array.isArray(j.projects)?j.projects.filter((p:any)=>p&&typeof p.name==="string"&&p.name.trim()&&p.name.length<=80).slice(0,10).map((p:any)=>({name:p.name.trim(),note:str(p.note,200)})):[],
  visited:strs(j.visited,stepIds,STEPS.length) as string[],
  skipped:strs(j.skipped,stepIds,STEPS.length) as string[],
  done:j.done===true,
 };
}
export const serializeState=(s:OnboardingState)=>JSON.stringify(s);

/** The furthest step the person can resume at: the first visible required step that is not yet satisfied. */
export function resumeStep(s:OnboardingState):StepId{
 for(const st of visibleSteps(s)){
  if(st.id==="welcome"||st.id==="review")continue;
  if(!s.visited.includes(st.id)&&!s.skipped.includes(st.id))return st.id;
  if(isRequired(st.id)&&!canAdvance(st.id,s))return st.id;
 }
 return "review";
}

/* ---------------------------------------------------- workspace planning */

export type Capability={id:string;name:string;to:string;status:CapabilityStatus;why:string;/** The answers that caused this recommendation. */because:string[]};
const CAP={
 literature:{id:"literature",name:"Literature Synthesis",to:"/platform/agents",status:"Prototype" as CapabilityStatus},
 verification:{id:"verification",name:"Evidence Verification",to:"/platform/agents",status:"In development" as CapabilityStatus},
 contradiction:{id:"contradiction",name:"Contradiction analysis",to:"/workspace/graph",status:"Prototype" as CapabilityStatus},
 hypothesis:{id:"hypothesis",name:"Candidate hypotheses",to:"/workspace/graph",status:"Prototype" as CapabilityStatus},
 design:{id:"design",name:"Experimental Design",to:"/platform/agents",status:"Planned" as CapabilityStatus},
 omics:{id:"omics",name:"Multi-omics Correlation",to:"/platform/agents",status:"Planned" as CapabilityStatus},
 discovery:{id:"discovery",name:"Evidence gaps and discovery",to:"/platform/discovery-engine",status:"In development" as CapabilityStatus},
 memory:{id:"memory",name:"Scientific memory",to:"/platform/memory",status:"In development" as CapabilityStatus},
 graph:{id:"graph",name:"Living Intelligence Graph",to:"/workspace/graph",status:"Prototype" as CapabilityStatus},
 record:{id:"record",name:"Investigation record",to:"/platform/workbench",status:"In development" as CapabilityStatus},
};
const BY_OBJECTIVE:Record<ObjectiveId,(keyof typeof CAP)[]>={
 learn:["graph","literature"],mechanisms:["graph","literature"],review:["literature","verification"],conflicts:["contradiction","verification"],
 gaps:["discovery","literature"],hypotheses:["hypothesis","record"],methods:["design","literature"],plan:["design","record"],
 targets:["graph","omics"],translation:["literature","contradiction"],coordinate:["memory","record"],collaborators:["discovery","memory"],
};
const WHY:Record<string,string>={
 literature:"For reading and summarising papers with passage-level citations.",verification:"To check claims against the source.",
 contradiction:"To compare findings that disagree, side by side, without resolving them.",hypothesis:"To work from recorded candidate questions, with what would count against them.",design:"To draft experiment options for your review.",
 omics:"To relate evidence across data layers.",discovery:"To find where evidence is thin or conflicting.",memory:"To keep your questions, sources and decisions.",
 graph:"To explore connected biology on the published graph, in 2D, 3D or a table.",record:"To keep a reviewable trail of an investigation.",
};

export type WorkspacePlan={
 persona:PersonaId;personaLabel:string;primaryRoleLabel:string;secondaryRoleLabels:string[];
 domains:string[];interests:string[];objectives:string[];tools:Capability[];
 firstInvestigation:{title:string;detail:string;basis:"your question"|"your objectives"|"your role"};
 firstAction:{label:string;to:string};
 /** The graph workspace on the real published graph; it opens where the answers point. */
 graphAction:{label:string;to:string};
 notes:string[];
};

const FIRST_ACTION:Record<PersonaId,{title:string;label:string}>={
 student:{title:"Explore a biological mechanism",label:"Explore a mechanism in the atlas"},
 researcher:{title:"Investigate a research gap",label:"Open an illustrative gap investigation"},
 professor:{title:"Create a research-group project",label:"Sketch an authorised group project"},
 laboratory:{title:"Plan an experiment",label:"Open an illustrative method plan"},
 computational:{title:"Explore a dataset and its context",label:"Open an illustrative multi-omics view"},
 clinical:{title:"Trace a disease mechanism to the evidence",label:"Open an illustrative mechanism trace"},
 biotech:{title:"Explore evidence for a target",label:"Open an illustrative target brief"},
 institution:{title:"Configure an organisation workspace",label:"Review organisation structure"},
};

/** Builds the plan from the answers only. It never invents findings and never claims anything was created. */
export function deriveWorkspacePlan(s:OnboardingState):WorkspacePlan|null{
 const persona=personaOf(s);if(!persona||!s.primaryRole)return null;
 const tools:Capability[]=[];
 for(const o of s.objectives)for(const k of BY_OBJECTIVE[o]??[]){
  const label=objectiveById[o].label,have=tools.find(t=>t.id===k);
  if(have)have.because.push(label);else tools.push({...CAP[k],why:WHY[k]!,because:[label]});
 }
 if(s.privacy.memory!=="off"&&!tools.some(t=>t.id==="memory"))tools.push({...CAP.memory,why:WHY.memory!,because:["You chose to keep scientific memory"]});
 if(tools.length===0)tools.push({...CAP.graph,why:WHY.graph!,because:["No objective chosen yet, so a general starting point"]});
 const domains=[s.primaryDomain,...s.secondaryDomains].filter((d):d is DomainKey=>!!d).map(d=>DOMAINS.find(x=>x.key===d)!.label);
 const fa=s.primaryRole==="postdoc"?{title:"Compare conflicting scientific findings",label:"Open an illustrative conflict comparison"}:FIRST_ACTION[persona];
 const q=s.question.trim();
 const objectives=s.objectives.map(o=>objectiveById[o].label);
 const firstInvestigation=q
  ?{title:q,detail:`Starts from your own question, framed for ${PERSONA_LABEL[persona].toLowerCase()} work${domains[0]?` in ${domains[0]}`:""}.`,basis:"your question" as const}
  :objectives.length
   ?{title:fa.title,detail:`Suggested from your objectives: ${objectives.slice(0,2).join("; ").toLowerCase()}.`,basis:"your objectives" as const}
   :{title:fa.title,detail:"Suggested for your role.",basis:"your role" as const};
 const notes=[
  "Nothing has been created on a server. These choices stay in this browser until your account is connected.",
  "Your role personalises the workspace. It does not grant access to any group, institution or dataset.",
 ];
 if(s.identity.orcid.trim()&&parseOrcid(s.identity.orcid))notes.push("Your ORCID iD is stored as typed. It has not been verified with ORCID.");
 return {
  persona,personaLabel:PERSONA_LABEL[persona],primaryRoleLabel:roleById[s.primaryRole].label,
  secondaryRoleLabels:s.secondaryRoles.map(r=>roleById[r].label),domains,
  interests:s.interests.map(i=>i.name),objectives,tools:tools.slice(0,6),firstInvestigation,
  firstAction:{label:fa.label,to:`/workspace/preview/${persona}`},
  graphAction:{label:"Open the Living Intelligence Graph",to:"/workspace/graph"},notes,
 };
}

/** Synthetic records for the publication-import preview. Labelled as such wherever shown. */
export const SYNTHETIC_PUBLICATIONS:readonly {id:string;title:string;venue:string;year:number}[]=[
 {id:"syn-1",title:"Sample record A: a placeholder title for an example paper",venue:"Example Journal",year:2022},
 {id:"syn-2",title:"Sample record B: a placeholder title for an example paper",venue:"Example Journal",year:2023},
 {id:"syn-3",title:"Sample record C: a placeholder title for an example preprint",venue:"Example Preprint Server",year:2024},
];
