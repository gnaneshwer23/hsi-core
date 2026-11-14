/**
 * Server-side adapter for held migrations 031 and 032 (graph workspace storage). It calls only the SECURITY DEFINER
 * procedures, passing the caller's session token, which the database validates inside the transaction. It never reads
 * or writes the tables directly and trusts no owner or principal supplied by the browser.
 *
 * NOT ACTIVE: the migrations are held and unapplied, nothing imports this module, and no environment enables it.
 * Digests are recomputed on every read; a stored record that fails its digest, chain or reproducibility check is
 * refused rather than shown.
 */
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {composeSavedInvestigation,recordDigest,type SaveResult,type SavedInvestigation} from "../knowledgeGraph/investigationStore";
import type {InvestigationRecord} from "../knowledgeGraph/graphAgents";
import type {DomainBundle} from "../knowledgeGraph/domainGraph";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {composeDecision,mappingsDigest,type CandidateMappingsFile,type CuratorDecision,type DecisionInput} from "../ontology/mappingReview";

/** The only database capability the adapter needs; Bun's SQL client satisfies it. */
export interface UnsafeSql{unsafe(query:string,params?:unknown[]):Promise<unknown[]>}
const CALLS={
 saveInvestigation:"SELECT public.hsi_graph_save_investigation($1::text,$2::text,$3::integer,$4::text,$5::text,$6::text,$7::jsonb) AS r",
 listInvestigations:"SELECT public.hsi_graph_list_investigations($1::text) AS r",
 getInvestigation:"SELECT public.hsi_graph_get_investigation($1::text,$2::text,$3::integer) AS r",
 recordRecommendation:"SELECT public.hsi_graph_record_recommendation($1::text,$2::text,$3::integer,$4::text,$5::text,$6::text,$7::text,$8::text,$9::text,$10::text,$11::text,$12::text,$13::timestamptz) AS r",
 listRecommendations:"SELECT public.hsi_graph_list_recommendations($1::text) AS r",
 ontologyLookup:"SELECT public.hsi_graph_ontology_lookup($1::text,$2::text,$3::text,$4::text,$5::integer) AS r",
} as const;
type Call=keyof typeof CALLS;

async function run<T>(sql:UnsafeSql,call:Call,params:unknown[]):Promise<T>{
 const rows=await sql.unsafe(CALLS[call],params) as {r:unknown}[];
 if(rows.length!==1)throw Error("Unexpected database response");
 const r=rows[0]!.r;
 return (typeof r==="string"?JSON.parse(r):r) as T;
}
const validToken=(t:string)=>typeof t==="string"&&t.length>=16&&t.length<=4096&&!/\s/.test(t);

export type InvestigationSummary={investigationId:string;latestRevision:number;savedAt:string;question:string;graphVersion:string};
type InvestigationRow={investigationId:string;revision:number;graphVersion:string;digest:string;previousDigest:string|null;savedAt:string;record:InvestigationRecord;reviewStatus:string};
export type RemoteDecision={decision:CuratorDecision;/** True when the server validated the session that recorded it. This is identity, not review authority. */identityVerifiedByServer:boolean};
type RecommendationRow={conceptId:string;revision:number;decision:CuratorDecision["decision"];ontologyPrefix:string|null;ontologyRelease:string|null;ontologyTermId:string|null;reason:string;reviewerLabel:string;reviewerVerified:boolean;candidatesDigest:string;digest:string;previousDigest:string|null;decidedAt:string};

export function createGraphWorkspace(sql:UnsafeSql,sessionToken:string){
 if(!validToken(sessionToken))throw Error("A valid session token is required");
 const toSaved=async(row:InvestigationRow):Promise<SavedInvestigation>=>{
  const saved:SavedInvestigation={schemaVersion:"hsi-saved-investigation-1",investigationId:row.investigationId,revision:row.revision,savedAt:new Date(row.savedAt).toISOString(),digest:row.digest,previousDigest:row.previousDigest,record:row.record,scientificApproval:false,reviewStatus:"unreviewed"};
  if(row.reviewStatus!=="unreviewed"||row.record.scientificApproval!==false)throw Error("A stored investigation carries approval; refusing it");
  if(await recordDigest(row.record)!==row.digest)throw Error("A stored investigation does not match its digest; refusing it");
  return saved;
 };
 const investigations={
  list:()=>run<InvestigationSummary[]>(sql,"listInvestigations",[sessionToken]),
  async get(id:string,revision:number):Promise<SavedInvestigation|null>{
   const row=await run<InvestigationRow|null>(sql,"getInvestigation",[sessionToken,id,revision]);
   return row?toSaved(row):null;
  },
  async latest(id:string):Promise<SavedInvestigation|null>{
   const item=(await investigations.list()).find(x=>x.investigationId===id);
   return item?investigations.get(id,item.latestRevision):null;
  },
  /** Verifies the record against the graph, builds the next revision, and lets the database enforce the chain. */
  async save(g:DomainBundle,record:InvestigationRecord,now:()=>Date=()=>new Date()):Promise<SaveResult>{
   const last=await investigations.latest(record.context.investigationId);
   const r=await composeSavedInvestigation(g,record,last,now);
   if(r.status==="saved"){
    const s=r.saved;
    await run<number>(sql,"saveInvestigation",[sessionToken,s.investigationId,s.revision,s.record.graphVersion,s.digest,s.previousDigest,s.record]);
   }
   return r;
  },
 };
 const recommendations={
  /** Rebuilds each decision exactly as it was composed and checks its digest and chain before returning it. */
  async list(f:CandidateMappingsFile):Promise<Map<string,RemoteDecision[]>>{
   const rows=await run<RecommendationRow[]>(sql,"listRecommendations",[sessionToken]);
   const names=new Map(f.mappings.map(m=>[m.conceptId,m.conceptName]));
   const out=new Map<string,RemoteDecision[]>();
   for(const r of rows){
    const base:Omit<CuratorDecision,"digest">={schemaVersion:"hsi-curator-decision-1",conceptId:r.conceptId,conceptName:names.get(r.conceptId)??"",decision:r.decision,ontologyId:r.ontologyTermId,reason:r.reason,reviewerLabel:r.reviewerLabel,reviewerVerified:false,decidedAt:new Date(r.decidedAt).toISOString(),revision:r.revision,previousDigest:r.previousDigest,mappingsDigest:r.candidatesDigest,status:"curator_recommendation_unverified",exactMappingApproved:false};
    const digest=await shaOf(base);
    if(digest!==r.digest)throw Error("A stored recommendation does not match its digest; refusing it");
    const list=out.get(r.conceptId)??[];
    const prev=list[list.length-1]?.decision.digest??null;
    if(r.previousDigest!==prev||r.revision!==list.length+1)throw Error("A stored recommendation breaks its revision chain; refusing it");
    list.push({decision:{...base,digest},identityVerifiedByServer:r.reviewerVerified});out.set(r.conceptId,list);
   }
   return out;
  },
  async record(f:CandidateMappingsFile,input:DecisionInput,now:()=>Date=()=>new Date()):Promise<{status:"saved"|"unchanged";decision:CuratorDecision}>{
   const existing=(await recommendations.list(f)).get(input.conceptId)??[];
   const r=await composeDecision(f,input,existing[existing.length-1]?.decision??null,now);
   if(r.status==="saved"){
    const d=r.decision,prefix=d.ontologyId?d.ontologyId.split(":")[0]!:null,release=prefix?f.ontologies.find(o=>o.prefix===prefix)?.release??null:null;
    if(d.ontologyId&&!release)throw Error("The ontology release for this term is not recorded");
    await run<number>(sql,"recordRecommendation",[sessionToken,d.conceptId,d.revision,d.decision,prefix,release,d.ontologyId,d.reason,d.reviewerLabel,d.mappingsDigest,d.digest,d.previousDigest,d.decidedAt]);
   }
   return r;
  },
 };
 const ontology={lookup:(prefix:string,release:string,label:string,limit=25)=>run<{id:string;label:string;obsolete:boolean;parents:string[]}[]>(sql,"ontologyLookup",[sessionToken,prefix,release,label,limit])};
 return {investigations,recommendations,ontology};
}
async function shaOf(x:unknown){const h=await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(canonicalEvidenceJson(x)));return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,"0")).join("")}

/** Opens a guarded connection to the HSI Neon project only (never ISI, Akeno or another product). Not wired anywhere. */
export async function connectGraphWorkspace(input:{databaseUrl:string;neonProjectId?:string|null;sessionToken:string}){
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const {SQL}=await import("bun");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 return {...createGraphWorkspace(sql as unknown as UnsafeSql,input.sessionToken),close:()=>sql.close()};
}
