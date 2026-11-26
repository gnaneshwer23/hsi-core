import type {MemorySql} from "./scientificMemoryFixtureAdapter";
import type {adjudicateCapturedPublication} from "../scientificMemoryEnvelopeAdjudication";
type Candidate=Awaited<ReturnType<typeof adjudicateCapturedPublication>>;
/** Synthetic fixture only; inject restricted writer connection, never a client connection. */
export function createScientificMemoryAdjudicationAdapter(sql:MemorySql){
 return {async stage(id:string,result:Candidate){
 if(typeof id!=="string"||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw Error("Invalid decision ID");
 const {doi,version}=result.adjudication;
 if(! /^10[.]1234\/fixture-[a-z0-9-]{1,80}$/.test(doi)||! /^v[1-9][0-9]{0,8}$/.test(version)||!["quarantine","recheck_required","insufficient_verified_provenance"].includes(result.decision))throw Error("Invalid fixture decision");
 if(result.versionVerified!==false||result.authorityAuthenticated!==false||result.independentCorroborationVerified!==false||result.ingestionAllowed!==false||result.scientificClaimAllowed!==false)throw Error("Unapproved trust flags");
 const p=result.provenance;
 if(!Array.isArray(p)||p.length!==3||new Set(p.map(x=>x.authority)).size!==3||p.some(x=>!["crossref","pubmed","europe_pmc"].includes(x.authority)||! /^[a-f0-9]{64}$/.test(x.payloadSha256)||!Number.isInteger(x.byteLength)||x.byteLength<1||x.byteLength>2097152||!Number.isFinite(Date.parse(x.checkedAt))||x.authorityAuthenticated!==false||x.ingestionAllowed!==false||x.scientificClaimAllowed!==false))throw Error("Invalid provenance");
 const payload=JSON.stringify(p);
 if(new TextEncoder().encode(payload).length>32768)throw Error("Provenance too large");
 const rows=await sql.unsafe("SELECT hsi_memory.stage_adjudication($1::uuid,$2::text,$3::text,$4::text,$5::jsonb) AS decision_id",[id,doi,version,result.decision,payload]);
 const row=rows[0] as {decision_id?:unknown}|undefined;
 if(rows.length!==1||typeof row?.decision_id!=="string"||row.decision_id.toLowerCase()!==id.toLowerCase())throw Error("Unexpected persistence result");
 return {decisionId:row.decision_id,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
 }};
}
