/**
 * Server-side adapter for migration 034: one investigation store (ADR-012), identity verified in the database
 * (ADR-013) and the scope registry (ADR-014). It calls only the SECURITY DEFINER procedures, passing the caller's
 * session token, which the database verifies inside the same transaction. It never reads or writes the tables, never
 * sends an owner or principal id of its own, and nothing it writes can carry scientific approval.
 * Migration 034 is held for production until the independent database review; see migrationHolds.ts.
 */

/** The only database capability the adapter needs; Bun's SQL client satisfies it. */
export interface StoreSql{unsafe(query:string,params?:unknown[]):Promise<unknown>}

export const OUTPUT_SECTIONS=["01","02","03","04","05","06"] as const;
export type OutputSection=typeof OUTPUT_SECTIONS[number];
export const USER_EVENT_KINDS=["note","stage","selection"] as const;
export type UserEventKind=typeof USER_EVENT_KINDS[number];
export type EventKind=UserEventKind|"created"|"status"|"shared"|"unshared"|"output";
export type MembershipRole="researcher"|"reviewer"|"adjudicator"|"admin";

export type StoredInvestigationSummary={id:string;question:string;scope:string|null;shared:boolean;status:"active"|"archived";graphVersion:string;createdAt:string;updatedAt:string;access:"owner"|"scope";owner:boolean};
export type StoredEvent={seq:number;kind:EventKind;payload:Record<string,unknown>;payloadDigest:string;runId:string|null;byOwner:boolean;at:string};
export type StoredOutput={section:OutputSection;version:number;body:Record<string,unknown>;lineage:Record<string,unknown>;digest:string;at:string};
export type StoredInvestigation=Omit<StoredInvestigationSummary,"owner">&{entities:string[];events:StoredEvent[];outputs:StoredOutput[]};
export type ScopeView={scopes:{id:string;name:string}[];memberships:{id:number;scope:string;role:MembershipRole;grantedAt:string}[];members:{id:number;principal:string;scope:string;role:MembershipRole;grantedBy:string}[]};

const CALLS={
 create:"SELECT public.hsi_inv_create($1::text,$2::text,$3::text,$4::text::jsonb,$5::text) AS r",
 appendEvent:"SELECT public.hsi_inv_append_event($1::text,$2::uuid,$3::text,$4::text::jsonb,$5::text) AS r",
 addOutput:"SELECT public.hsi_inv_add_output($1::text,$2::uuid,$3::text,$4::text::jsonb,$5::text::jsonb) AS r",
 setStatus:"SELECT public.hsi_inv_set_status($1::text,$2::uuid,$3::text) AS r",
 share:"SELECT public.hsi_inv_share($1::text,$2::uuid,$3::text,$4::boolean) AS r",
 list:"SELECT public.hsi_inv_list($1::text) AS r",
 get:"SELECT public.hsi_inv_get($1::text,$2::uuid) AS r",
 scopes:"SELECT public.hsi_scope_list($1::text) AS r",
 createScope:"SELECT public.hsi_scope_create($1::text,$2::text,$3::text) AS r",
 grant:"SELECT public.hsi_membership_grant($1::text,$2::text,$3::text,$4::text) AS r",
 revoke:"SELECT public.hsi_membership_revoke($1::text,$2::bigint) AS r",
} as const;
type Call=keyof typeof CALLS;

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SCOPE=/^[a-z][a-z0-9-]{1,47}$/;
const validToken=(t:string)=>typeof t==="string"&&t.length>=16&&t.length<=4096&&!/\s/.test(t);

/** Refuses anything that says it is approved, before the database does. */
export function carriesApproval(v:unknown):boolean{
 if(Array.isArray(v))return v.some(carriesApproval);
 if(v&&typeof v==="object")return Object.entries(v as Record<string,unknown>).some(([k,x])=>((k==="scientificApproval"||k==="scientificClaimAllowed")&&x===true)||carriesApproval(x));
 return false;
}

const JSON_CALLS=new Set<Call>(["list","get","scopes"]);
async function run(sql:StoreSql,call:Call,params:unknown[]):Promise<unknown>{
 const rows=await sql.unsafe(CALLS[call],params) as {r:unknown}[];
 if(!Array.isArray(rows)||rows.length!==1)throw Error("Unexpected database response");
 const r=rows[0]!.r;
 return JSON_CALLS.has(call)&&typeof r==="string"?JSON.parse(r):r;
}
/** Unknown and not-yours are the same answer: null. Other errors propagate. */
const isNotFound=(e:unknown)=>/investigation not found/i.test(String(e instanceof Error?e.message:e));

export function createInvestigationStore(sql:StoreSql,token:string){
 if(!validToken(token))throw Error("Invalid authenticated session");
 const id=(x:string)=>{if(!UUID.test(x))throw Error("Investigation not found");return x};
 const scope=(x:string)=>{if(!SCOPE.test(x))throw Error("Unknown scope");return x};
 return{
  async create(input:{question:string;entities?:string[];graphVersion:string;scope?:string|null}):Promise<string>{
   const q=input.question.trim();
   if(q.length<5||q.length>2000)throw Error("A question needs 5 to 2000 characters");
   if(!/^[a-f0-9]{64}$/.test(input.graphVersion))throw Error("Pin the graph version (a 64-character digest)");
   const ents=(input.entities??[]).slice(0,200).map(String);
   return String(await run(sql,"create",[token,input.scope?scope(input.scope):null,q,JSON.stringify(ents),input.graphVersion]));
  },
  async appendEvent(inv:string,e:{kind:UserEventKind|string;payload:Record<string,unknown>;runId?:string}):Promise<number>{
   if(carriesApproval(e.payload))throw Error("An event cannot carry scientific approval (check constraint)");
   return Number(await run(sql,"appendEvent",[token,id(inv),e.kind,JSON.stringify(e.payload),e.runId??null]));
  },
  async addOutput(inv:string,o:{section:OutputSection;body:Record<string,unknown>;lineage:Record<string,unknown>}):Promise<number>{
   if(!(OUTPUT_SECTIONS as readonly string[]).includes(o.section))throw Error("Unknown output section");
   if(carriesApproval(o.body)||carriesApproval(o.lineage))throw Error("An output cannot carry scientific approval (check constraint)");
   return Number(await run(sql,"addOutput",[token,id(inv),o.section,JSON.stringify(o.body),JSON.stringify(o.lineage)]));
  },
  async setStatus(inv:string,status:"active"|"archived"):Promise<void>{await run(sql,"setStatus",[token,id(inv),status])},
  async share(inv:string,scopeId:string,shared:boolean):Promise<void>{await run(sql,"share",[token,id(inv),scope(scopeId),shared])},
  async list():Promise<StoredInvestigationSummary[]>{return await run(sql,"list",[token]) as StoredInvestigationSummary[]},
  async get(inv:string):Promise<StoredInvestigation|null>{
   if(!UUID.test(inv))return null;
   try{return await run(sql,"get",[token,inv]) as StoredInvestigation}
   catch(e){if(isNotFound(e))return null;throw e}
  },
  async scopes():Promise<ScopeView>{return await run(sql,"scopes",[token]) as ScopeView},
  async createScope(scopeId:string,name:string):Promise<void>{await run(sql,"createScope",[token,scope(scopeId),name.trim()])},
  async grant(principal:string,scopeId:string,role:MembershipRole):Promise<number>{return Number(await run(sql,"grant",[token,principal,scope(scopeId),role]))},
  async revoke(membership:number):Promise<void>{await run(sql,"revoke",[token,membership])},
 };
}
export type InvestigationStore=ReturnType<typeof createInvestigationStore>;
