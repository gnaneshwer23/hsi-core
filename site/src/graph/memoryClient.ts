import {browserMemory,type MemoryInvestigation,type MemoryOutput,type MemoryEvent,type NewInvestigation,type MemoryStorage} from "../../../src/graphWorkspace";

/**
 * LEA-04G/04K client. Asks the server whether the account store is switched on; if not, investigations are kept in
 * this browser in the same shape. The server derives the owner from the verified session; this client never sends
 * an owner id. Sharing into a scope exists only on the account store.
 */
export type StoreStatus={where:"browser"|"account";reason:string};
export type ScopeInfo={scopes:{id:string;name:string}[];memberships:{id:number;scope:string;role:string}[]};
export type MemoryClient={
 status:StoreStatus;
 list():Promise<MemoryInvestigation[]>;
 get(id:string):Promise<MemoryInvestigation|null>;
 create(n:NewInvestigation):Promise<MemoryInvestigation>;
 note(id:string,text:string):Promise<void>;
 setStatus(id:string,s:"active"|"archived"):Promise<void>;
 scopes():Promise<ScopeInfo|null>;
 share(id:string,scope:string,shared:boolean):Promise<void>;
};

const BASE="/api/research/investigation-store";
function storage():MemoryStorage|null{try{const s=window.localStorage;s.getItem("x");return s}catch{return null}}
async function call<T>(path:string,init?:RequestInit):Promise<T>{
 const r=await fetch(BASE+path,{credentials:"same-origin",...init,headers:{...(init?.body?{"content-type":"application/json"}:{}),...(init?.headers??{})}});
 const body=await r.json().catch(()=>({})) as {error?:string}&T;
 if(!r.ok)throw Error(body.error||"The account store refused the request.");
 return body;
}
type ServerInv={id:string;question:string;entities?:string[];scope:string|null;shared:boolean;status:"active"|"archived";graphVersion:string;createdAt:string;updatedAt:string;access:"owner"|"scope";events?:(MemoryEvent&{payloadDigest:string})[];outputs?:MemoryOutput[]};
const fromServer=(x:ServerInv):MemoryInvestigation=>{
 const sel=x.events?.find(e=>e.kind==="selection")?.payload as {nodeIds?:string[];edgeIds?:string[]}|undefined;
 return{id:x.id,question:x.question,entities:x.entities??sel?.nodeIds??[],edgeIds:sel?.edgeIds??[],graphVersion:x.graphVersion,scope:x.scope,shared:x.shared,status:x.status,access:x.access,createdAt:x.createdAt,updatedAt:x.updatedAt,events:x.events??[],outputs:x.outputs??[],where:"account"};
};

function browserClient(reason:string):MemoryClient{
 const s=storage();
 const m=s?browserMemory(s):null;
 const need=()=>{if(!m)throw Error("This browser does not allow local storage, so nothing can be kept here.");return m};
 return{
  status:{where:"browser",reason},
  list:async()=>m?m.list():[],
  get:async id=>m?.get(id)??null,
  create:async n=>need().create(n),
  note:async(id,t)=>{need().note(id,t)},
  setStatus:async(id,st)=>{need().setStatus(id,st)},
  scopes:async()=>null,
  share:async()=>{throw Error("Sharing needs a signed-in account and the account store, which is not switched on here.")},
 };
}

function accountClient():MemoryClient{
 return{
  status:{where:"account",reason:"Saved to your HSI account. The owner is taken from your verified session."},
  list:async()=>(await call<{investigations:ServerInv[]}>("/investigations")).investigations.map(fromServer),
  get:async id=>{try{return fromServer((await call<{investigation:ServerInv}>(`/investigations/${id}`)).investigation)}catch{return null}},
  create:async n=>{
   const {id}=await call<{id:string}>("/investigations",{method:"POST",body:JSON.stringify({question:n.question,entities:n.entities,graphVersion:n.graphVersion})});
   await call(`/investigations/${id}/events`,{method:"POST",body:JSON.stringify({kind:"selection",payload:{nodeIds:n.entities,edgeIds:n.edgeIds}})});
   if(n.record)await call(`/investigations/${id}/outputs`,{method:"POST",body:JSON.stringify({section:"01",body:n.record,lineage:n.lineage??{graphVersion:n.graphVersion}})});
   return fromServer((await call<{investigation:ServerInv}>(`/investigations/${id}`)).investigation);
  },
  note:async(id,text)=>{await call(`/investigations/${id}/events`,{method:"POST",body:JSON.stringify({kind:"note",payload:{text}})})},
  setStatus:async(id,status)=>{await call(`/investigations/${id}/status`,{method:"POST",body:JSON.stringify({status})})},
  scopes:async()=>call<ScopeInfo>("/scopes"),
  share:async(id,scope,shared)=>{await call(`/investigations/${id}/share`,{method:"POST",body:JSON.stringify({scope,shared})})},
 };
}

const BROWSER_REASON="Kept in this browser only. Saving to your account switches on after the independent database review.";
/** Never throws: any doubt about the server means the browser store. */
export async function openMemory():Promise<MemoryClient>{
 try{
  const r=await fetch(BASE+"/status",{credentials:"same-origin"});
  if(!r.ok)return browserClient(BROWSER_REASON);
  const s=await r.json() as {enabled?:boolean};
  return s.enabled===true?accountClient():browserClient(BROWSER_REASON);
 }catch{return browserClient(BROWSER_REASON)}
}
