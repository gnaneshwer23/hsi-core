/** Public Science catalogue v1. Editorial draft, not an approved biomedical graph. */
export type SystemId = "all" | "endocrine" | "cardiovascular" | "digestive" | "immune" | "nervous" | "respiratory" | "urinary";
export type ReviewState = "draft" | "in_review" | "approved" | "retired";
export type EntityKind = "organ" | "tissue" | "cell" | "molecule" | "pathway" | "process" | "disease";
export type EvidenceRef = { id: string; url: string; title: string; claimScope: string };
export type BiologyEntity = {
 id: string; kind: EntityKind; preferredLabel: string; aliases: string[]; definition: string;
 reviewState: ReviewState; version: string; reviewedAt?: string; reviewer?: string; sourceRefs: string[];
 system?: Exclude<SystemId,"all">; position?: {x:number;y:number}; next?: string;
};
export type BiologyClaim = { id:string; entityId:string; text:string; evidenceRefs:string[]; reviewState:ReviewState; evidenceScope:"background"|"claim_level"; reviewedAt?:string; reviewer?:string };
export type BiologyRelation = {
 id: string; subjectId: string; predicate: string; objectId: string;
 evidenceRefs: string[]; reviewState: ReviewState;
 assertionType: "established_mechanism" | "reported_association" | "inference" | "hypothesis";
 context?: {tissue?:string;species?:string;experimentalSetting?:string};
};
const ref=(id:string,url:string,title:string):EvidenceRef=>({id,url,title,claimScope:"General background reading; not a claim-level validation"});
export const SCIENCE_SOURCES: EvidenceRef[]=[
 ref("neuro","https://www.ncbi.nlm.nih.gov/books/NBK10799/","NCBI Bookshelf — neuroscience"),
 ref("resp","https://openstax.org/books/anatomy-and-physiology-2e/pages/22-introduction","OpenStax — respiratory system"),
 ref("cardio","https://openstax.org/books/anatomy-and-physiology-2e/pages/19-introduction","OpenStax — cardiovascular system"),
 ref("digest","https://openstax.org/books/anatomy-and-physiology-2e/pages/23-introduction","OpenStax — digestive system"),
 ref("endocrine","https://www.ncbi.nlm.nih.gov/books/NBK279144/","NCBI Bookshelf — endocrine physiology"),
 ref("renal","https://openstax.org/books/anatomy-and-physiology-2e/pages/25-introduction","OpenStax — urinary system"),
 ref("immune","https://www.ncbi.nlm.nih.gov/books/NBK10757/","NCBI Bookshelf — immunobiology")
];
const organ=(id:string,label:string,system:Exclude<SystemId,"all">,x:number,y:number,definition:string,next:string,source:string):BiologyEntity=>({id,kind:id==="muscle"||id==="adipose"?"tissue":"organ",preferredLabel:label,aliases:[],system,position:{x,y},definition,next,sourceRefs:[source],reviewState:"draft",version:"0.1.0"});
export const BIOLOGY_ENTITIES: BiologyEntity[]=[
 organ("brain","Brain","nervous",150,57,"Coordinates neural signalling, sensory processing and physiological regulation through connected neural and endocrine pathways.","Neurons and neuroendocrine signalling","neuro"),
 organ("lungs","Lungs","respiratory",184,143,"Exchange oxygen and carbon dioxide through the alveoli and pulmonary circulation.","Alveoli and gas exchange","resp"),
 organ("heart","Heart","cardiovascular",137,158,"Pumps blood through pulmonary and systemic circulation, supporting oxygen and nutrient delivery.","Cardiac muscle and circulation","cardio"),
 organ("liver","Liver","digestive",116,218,"Processes nutrients, stores glycogen and helps regulate circulating glucose and lipids.","Hepatocytes and glucose metabolism","digest"),
 organ("pancreas","Pancreas","endocrine",168,244,"Endocrine islets release insulin, glucagon and other hormones. Exocrine tissue produces digestive enzymes.","Islets → beta cells → insulin secretion","endocrine"),
 organ("kidneys","Kidneys","urinary",196,267,"Filter blood, regulate fluid and electrolyte balance, and contribute to blood pressure and endocrine control.","Nephrons and filtration","renal"),
 organ("intestine","Intestine","digestive",150,278,"Absorbs nutrients and interfaces with microbial communities, epithelial barriers and mucosal immunity.","Intestinal epithelium and microbiome","digest"),
 organ("spleen","Spleen","immune",205,225,"Filters blood and contributes to immune surveillance and responses to blood-borne antigens.","Immune cells and splenic tissue","immune"),
 organ("muscle","Skeletal muscle","endocrine",91,369,"Supports movement and is a major site of insulin-stimulated glucose disposal.","Myocytes and glucose transport","endocrine"),
 organ("adipose","Adipose tissue","endocrine",209,365,"Stores energy and releases signals that interact with metabolic and immune regulation.","Adipocytes and endocrine signalling","endocrine")
];
/** Each displayed organ definition is tracked as a discrete draft claim. References are background-level until reviewed against the precise statement. */
export const BIOLOGY_CLAIMS:BiologyClaim[]=BIOLOGY_ENTITIES.map(e=>({id:`definition:${e.id}`,entityId:e.id,text:e.definition,evidenceRefs:e.sourceRefs,reviewState:"draft",evidenceScope:"background"}));
/** Navigation associations only. Not asserted as mechanistic, causal, or reviewed evidence. */
const ASSOCIATIONS: Record<string,string[]>={
 brain:["heart","pancreas"],lungs:["heart"],heart:["lungs","kidneys"],liver:["pancreas","intestine"],pancreas:["liver","intestine","muscle","adipose"],kidneys:["heart"],intestine:["liver","pancreas","spleen"],spleen:["intestine"],muscle:["pancreas"],adipose:["pancreas"]
};
export const BIOLOGY_RELATIONS:BiologyRelation[]=Object.entries(ASSOCIATIONS).flatMap(([subjectId,ids])=>ids.map(objectId=>({id:`navigation:${subjectId}:${objectId}`,subjectId,objectId,predicate:"RELATED_TOPIC",evidenceRefs:[],reviewState:"draft" as const,assertionType:"inference" as const})));
export const SYSTEM_OPTIONS:{id:SystemId;label:string}[]=[{id:"all",label:"All systems"},{id:"endocrine",label:"Endocrine / metabolic"},{id:"cardiovascular",label:"Cardiovascular"},{id:"digestive",label:"Digestive"},{id:"immune",label:"Immune"},{id:"nervous",label:"Nervous"},{id:"respiratory",label:"Respiratory"},{id:"urinary",label:"Urinary"}];
export const getEntity=(id:string)=>BIOLOGY_ENTITIES.find(e=>e.id===id);
export function validateScienceCatalogue():string[]{
 const errors:string[]=[];const ids=new Set(BIOLOGY_ENTITIES.map(e=>e.id));const refs=new Set(SCIENCE_SOURCES.map(s=>s.id));
 if(ids.size!==BIOLOGY_ENTITIES.length)errors.push("Duplicate entity identifiers");
 for(const e of BIOLOGY_ENTITIES){if(!e.definition||!e.version||!e.reviewState)errors.push(`Incomplete entity ${e.id}`);for(const s of e.sourceRefs)if(!refs.has(s))errors.push(`Unknown reference ${s}`);}
 for(const r of BIOLOGY_RELATIONS)if(!ids.has(r.subjectId)||!ids.has(r.objectId))errors.push(`Invalid relation ${r.id}`);
 for(const c of BIOLOGY_CLAIMS){if(!ids.has(c.entityId)||!c.text)errors.push(`Invalid claim ${c.id}`);for(const id of c.evidenceRefs)if(!refs.has(id))errors.push(`Invalid claim source ${c.id}`);if(c.reviewState==="approved"&&(c.evidenceScope!=="claim_level"||!c.reviewer||!c.reviewedAt))errors.push(`Approved claim lacks scientific review ${c.id}`);}
 for(const r of BIOLOGY_RELATIONS)if(r.reviewState==="approved"&&r.evidenceRefs.length===0)errors.push(`Approved relation missing evidence ${r.id}`);
 return errors;
}
