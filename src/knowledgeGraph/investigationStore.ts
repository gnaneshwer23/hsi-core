/**
 * Append-only store for graph investigations. A saved revision is the verified investigation record plus a content
 * digest and a link to the previous revision, so history cannot be edited without detection. Nothing here approves,
 * publishes or promotes anything: saving keeps a candidate record, it does not review it.
 *
 * The store is storage-agnostic (KeyValueStore). A browser adapter keeps records on this device only; a file adapter
 * lives in investigationFileStore.ts. A database adapter is deliberately absent: it needs an approved migration.
 */
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import type {DomainBundle} from "./domainGraph";
import {verifyInvestigationRecord,type InvestigationRecord} from "./graphAgents";

export interface KeyValueStore{get(key:string):string|null;/** Must refuse to replace an existing key. */create(key:string,value:string):void;keys():string[]}
export type SavedInvestigation={schemaVersion:"hsi-saved-investigation-1";investigationId:string;revision:number;savedAt:string;digest:string;previousDigest:string|null;record:InvestigationRecord;scientificApproval:false;reviewStatus:"unreviewed"};
export type SaveResult={status:"saved"|"unchanged";saved:SavedInvestigation};
export type LoadResult={saved:SavedInvestigation;intact:boolean;reproducible:boolean|null;problems:string[]};

const PREFIX="hsi-inv:";
const keyOf=(id:string,rev:number)=>`${PREFIX}${id}:${String(rev).padStart(6,"0")}`;
const ID=/^[A-Za-z0-9][A-Za-z0-9:_-]{2,80}$/;

export async function recordDigest(record:InvestigationRecord):Promise<string>{
 const hash=await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(canonicalEvidenceJson(record)));
 return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
function revisionsOf(store:KeyValueStore,id:string):number[]{
 const head=`${PREFIX}${id}:`;
 return store.keys().filter(k=>k.startsWith(head)&&/^\d{6}$/.test(k.slice(head.length))).map(k=>Number(k.slice(head.length))).sort((a,b)=>a-b);
}
function parse(raw:string|null):SavedInvestigation|null{
 if(!raw)return null;
 try{const v=JSON.parse(raw) as SavedInvestigation;return v&&v.schemaVersion==="hsi-saved-investigation-1"?v:null}catch{return null}
}

/** Saves a record only if it reproduces from the supplied graph. Saving the same record again is a no-op. */
export async function saveInvestigation(g:DomainBundle,store:KeyValueStore,record:InvestigationRecord,now:()=>Date=()=>new Date()):Promise<SaveResult>{
 const id=record.context.investigationId;
 if(!ID.test(id))throw Error("Invalid investigation id");
 const problems=verifyInvestigationRecord(g,record);
 if(problems.length)throw Error("Only a reproducible record can be saved: "+problems.join("; "));
 const digest=await recordDigest(record),revs=revisionsOf(store,id),last=revs.length?parse(store.get(keyOf(id,revs[revs.length-1]!))):null;
 if(revs.length&&!last)throw Error("The latest saved revision is unreadable; refusing to extend the history");
 if(last&&last.digest===digest)return {status:"unchanged",saved:last};
 const revision=(revs[revs.length-1]??0)+1;
 const saved:SavedInvestigation={schemaVersion:"hsi-saved-investigation-1",investigationId:id,revision,savedAt:now().toISOString(),digest,previousDigest:last?.digest??null,record,scientificApproval:false,reviewStatus:"unreviewed"};
 store.create(keyOf(id,revision),JSON.stringify(saved));
 return {status:"saved",saved};
}

export function listInvestigations(store:KeyValueStore):{investigationId:string;latestRevision:number;savedAt:string;question:string;graphVersion:string}[]{
 const ids=new Set<string>();
 for(const k of store.keys())if(k.startsWith(PREFIX)){const m=/^hsi-inv:(.+):\d{6}$/.exec(k);if(m)ids.add(m[1]!)}
 const out:ReturnType<typeof listInvestigations>=[];
 for(const id of [...ids].sort()){
  const revs=revisionsOf(store,id),last=revs.length?parse(store.get(keyOf(id,revs[revs.length-1]!))):null;
  if(last)out.push({investigationId:id,latestRevision:last.revision,savedAt:last.savedAt,question:last.record.context.question,graphVersion:last.record.graphVersion});
 }
 return out.sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
}

/** Loads one revision and checks it: content digest, chain link, and (when a graph is given) reproducibility. */
export async function loadInvestigation(store:KeyValueStore,id:string,revision:number,g?:DomainBundle):Promise<LoadResult|null>{
 const saved=parse(store.get(keyOf(id,revision)));
 if(!saved)return null;
 const problems:string[]=[];
 if(saved.investigationId!==id||saved.revision!==revision)problems.push("Stored identity does not match its key");
 if(await recordDigest(saved.record)!==saved.digest)problems.push("Record content does not match its digest");
 if(saved.scientificApproval!==false||saved.reviewStatus!=="unreviewed")problems.push("A saved record may not carry approval");
 if(revision>1){const prev=parse(store.get(keyOf(id,revision-1)));if(!prev)problems.push("Previous revision is missing");else if(prev.digest!==saved.previousDigest)problems.push("Revision chain is broken")}
 else if(saved.previousDigest!==null)problems.push("First revision must not link to a previous one");
 let reproducible:boolean|null=null;
 if(g){const p=verifyInvestigationRecord(g,saved.record);reproducible=p.length===0;if(p.length)problems.push("Not reproducible against this graph: "+p.join("; "))}
 return {saved,intact:!problems.some(p=>!p.startsWith("Not reproducible")),reproducible,problems};
}

export function memoryStore():KeyValueStore{
 const m=new Map<string,string>();
 return {get:k=>m.get(k)??null,create:(k,v)=>{if(m.has(k))throw Error("Revision already exists");m.set(k,v)},keys:()=>[...m.keys()]};
}
/** Device-local storage. Returns null when the browser blocks storage (private window, blocked site data). */
export function browserStore(storage?:Storage):KeyValueStore|null{
 try{
  const s=storage??globalThis.localStorage;if(!s)return null;
  s.setItem("hsi-inv:probe","1");s.removeItem("hsi-inv:probe");
  return {
   get:k=>{try{return s.getItem(k)}catch{return null}},
   create:(k,v)=>{if(s.getItem(k)!==null)throw Error("Revision already exists");s.setItem(k,v)},
   keys:()=>{const o:string[]=[];for(let i=0;i<s.length;i++){const k=s.key(i);if(k&&k.startsWith(PREFIX))o.push(k)}return o},
  };
 }catch{return null}
}
