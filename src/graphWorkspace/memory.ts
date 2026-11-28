/**
 * LEA-04G: Scientific Memory in the graph workspace. One investigation shape (ADR-012): an investigation, an
 * append-only event log and immutable section versions. The same shape is kept in this browser when the account
 * store is not switched on, so nothing is lost and nothing pretends to be shared. Nothing here records scientific
 * approval: a save is a researcher's working record, not a finding.
 */
export const MEMORY_STORAGE_KEY="hsi.scientificMemory.v1";
export const MEMORY_LIMITS={investigations:50,eventsPerInvestigation:200,outputBytes:200_000} as const;

export type MemoryEventKind="created"|"note"|"stage"|"selection"|"status"|"shared"|"unshared"|"output";
export type MemorySection="01"|"02"|"03"|"04"|"05"|"06";
export const SECTION_LABEL:Record<MemorySection,string>={"01":"Investigation record","02":"Findings","03":"Evidence","04":"Uncertainty","05":"Next study","06":"Notes"};
export type MemoryEvent={seq:number;kind:MemoryEventKind;payload:Record<string,unknown>;at:string;byOwner:boolean};
export type MemoryOutput={section:MemorySection;version:number;body:Record<string,unknown>;lineage:Record<string,unknown>;at:string};
export type MemoryInvestigation={
 id:string;question:string;entities:string[];edgeIds:string[];graphVersion:string;
 scope:string|null;shared:boolean;status:"active"|"archived";access:"owner"|"scope";
 createdAt:string;updatedAt:string;events:MemoryEvent[];outputs:MemoryOutput[];
 /** Where the record lives. "browser" means this device only. */
 where:"browser"|"account";
};
export type MemoryFile={version:1;investigations:MemoryInvestigation[]};
export interface MemoryStorage{getItem(k:string):string|null;setItem(k:string,v:string):void}

/** True when any nested value claims scientific approval. Such a record is refused. */
export function claimsApproval(v:unknown):boolean{
 if(Array.isArray(v))return v.some(claimsApproval);
 if(v&&typeof v==="object")return Object.entries(v as Record<string,unknown>).some(([k,x])=>((k==="scientificApproval"||k==="scientificClaimAllowed")&&x===true)||claimsApproval(x));
 return false;
}
const now=()=>new Date().toISOString();
const isObj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
function validInvestigation(x:unknown):x is MemoryInvestigation{
 if(!isObj(x))return false;
 return typeof x.id==="string"&&typeof x.question==="string"&&Array.isArray(x.entities)&&Array.isArray(x.events)&&Array.isArray(x.outputs)&&/^[a-f0-9]{64}$/.test(String(x.graphVersion))&&!claimsApproval(x);
}

/** Read the browser record. A damaged or approval-claiming entry is dropped, never repaired by guessing. */
export function readMemory(s:MemoryStorage|null):{file:MemoryFile;dropped:number}{
 if(!s)return{file:{version:1,investigations:[]},dropped:0};
 try{
  const raw=s.getItem(MEMORY_STORAGE_KEY);if(!raw)return{file:{version:1,investigations:[]},dropped:0};
  const p=JSON.parse(raw) as unknown;
  if(!isObj(p)||p.version!==1||!Array.isArray(p.investigations))return{file:{version:1,investigations:[]},dropped:1};
  const ok=p.investigations.filter(validInvestigation);
  return{file:{version:1,investigations:ok.map(i=>({...i,where:"browser" as const,access:"owner" as const}))},dropped:p.investigations.length-ok.length};
 }catch{return{file:{version:1,investigations:[]},dropped:1}}
}
function write(s:MemoryStorage,f:MemoryFile):void{s.setItem(MEMORY_STORAGE_KEY,JSON.stringify(f))}
function log(i:MemoryInvestigation,kind:MemoryEventKind,payload:Record<string,unknown>):MemoryInvestigation{
 if(i.events.length>=MEMORY_LIMITS.eventsPerInvestigation)throw Error("This investigation has reached its event limit in this browser.");
 const at=now();
 return{...i,updatedAt:at,events:[...i.events,{seq:i.events.length+1,kind,payload,at,byOwner:true}]};
}

export type NewInvestigation={question:string;entities:readonly string[];edgeIds:readonly string[];graphVersion:string;record?:Record<string,unknown>;lineage?:Record<string,unknown>};

/** Pure: the browser store with the same rules as the account store. */
export function browserMemory(s:MemoryStorage,idFactory:()=>string=()=>crypto.randomUUID()){
 const load=()=>readMemory(s).file;
 const save=(f:MemoryFile)=>write(s,f);
 const update=(id:string,fn:(i:MemoryInvestigation)=>MemoryInvestigation)=>{
  const f=load(),idx=f.investigations.findIndex(x=>x.id===id);
  if(idx<0)throw Error("Investigation not found");
  const next=fn(f.investigations[idx]!);f.investigations[idx]=next;save(f);return next;
 };
 return{
  where:"browser" as const,
  list:():MemoryInvestigation[]=>[...load().investigations].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),
  get:(id:string)=>load().investigations.find(x=>x.id===id)??null,
  create(n:NewInvestigation):MemoryInvestigation{
   const q=n.question.trim();
   if(q.length<5||q.length>2000)throw Error("A question needs 5 to 2000 characters.");
   if(!/^[a-f0-9]{64}$/.test(n.graphVersion))throw Error("The graph version must be pinned.");
   if(claimsApproval(n.record)||claimsApproval(n.lineage))throw Error("A saved investigation cannot carry scientific approval.");
   if(n.record&&JSON.stringify(n.record).length>MEMORY_LIMITS.outputBytes)throw Error("The record is too large to keep in this browser.");
   const f=load();
   if(f.investigations.filter(i=>i.status==="active").length>=MEMORY_LIMITS.investigations)throw Error(`This browser keeps up to ${MEMORY_LIMITS.investigations} active investigations. Archive one first.`);
   const at=now();
   let inv:MemoryInvestigation={id:idFactory(),question:q,entities:[...new Set(n.entities)].slice(0,200),edgeIds:[...new Set(n.edgeIds)].slice(0,200),graphVersion:n.graphVersion,scope:null,shared:false,status:"active",access:"owner",createdAt:at,updatedAt:at,events:[],outputs:[],where:"browser"};
   inv=log(inv,"created",{graphVersion:n.graphVersion});
   inv=log(inv,"selection",{nodeIds:inv.entities,edgeIds:inv.edgeIds});
   if(n.record){inv={...inv,outputs:[{section:"01",version:1,body:n.record,lineage:n.lineage??{graphVersion:n.graphVersion},at}]};inv=log(inv,"output",{section:"01",version:1})}
   f.investigations.push(inv);save(f);return inv;
  },
  note:(id:string,text:string)=>{
   const t=text.trim();if(!t||t.length>4000)throw Error("A note needs 1 to 4000 characters.");
   return update(id,i=>log(i,"note",{text:t}));
  },
  addOutput:(id:string,section:MemorySection,body:Record<string,unknown>,lineage:Record<string,unknown>)=>{
   if(claimsApproval(body)||claimsApproval(lineage))throw Error("An output cannot carry scientific approval.");
   return update(id,i=>{const v=i.outputs.filter(o=>o.section===section).length+1;return log({...i,outputs:[...i.outputs,{section,version:v,body,lineage,at:now()}]},"output",{section,version:v})});
  },
  setStatus:(id:string,status:"active"|"archived")=>update(id,i=>log({...i,status},"status",{status})),
 };
}
export type BrowserMemory=ReturnType<typeof browserMemory>;

/** The latest version of each section, in section order. Earlier versions stay in the record. */
export function latestOutputs(i:MemoryInvestigation):MemoryOutput[]{
 const by=new Map<MemorySection,MemoryOutput>();
 for(const o of i.outputs){const c=by.get(o.section);if(!c||o.version>c.version)by.set(o.section,o)}
 return [...by.values()].sort((a,b)=>a.section.localeCompare(b.section));
}
/** Saved against another graph version: show it, but say the graph has moved on. */
export const isStale=(i:MemoryInvestigation,currentVersion:string)=>i.graphVersion!==currentVersion;
