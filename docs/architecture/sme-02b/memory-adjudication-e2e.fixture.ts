// Disposable CI only; no external network.
import {SQL} from "bun";
import {createProvenanceCapture} from "../../../src/scientificMemoryProvenanceCapture";
import {adjudicateCapturedPublication} from "../../../src/scientificMemoryEnvelopeAdjudication";
import {createScientificMemoryAdjudicationAdapter} from "../../../src/db/scientificMemoryAdjudicationAdapter";
import type {PubmedXmlNode} from "../../../src/scientificMemoryPubmedXml";
if(process.env.SME_DISPOSABLE_FIXTURE!=="1")throw Error("Disposable fixture opt-in required");
const doi="10.1234/fixture-adjudication-e2e";
const node=(name:string,text="",children:PubmedXmlNode[]=[],attributes:Record<string,string>={}):PubmedXmlNode=>({name,text,children,attributes});
function gateway(otherDoi:string){
 return createProvenanceCapture(async url=>{
 const host=new URL(url).hostname;
 if(host==="api.crossref.org")return Response.json({status:"ok","message-type":"work",message:{DOI:doi}});
 if(host==="www.ebi.ac.uk")return Response.json({hitCount:1,resultList:{result:[{source:"MED",id:"123",pmid:"123",doi:otherDoi,commentCorrectionList:{commentCorrection:[{type:"Retraction in",source:"MED",id:"456"}]}}]}});
 return new Response("<fixture/>",{headers:{"content-type":"application/xml"}});
 },true,()=>0,{parse:()=>node("PubmedArticleSet","",[node("PubmedArticle","",[node("MedlineCitation","",[node("PMID","123")]),node("PubmedData","",[node("ArticleIdList","",[node("ArticleId",doi,[],{IdType:"doi"})])])])])});
}

const db=new SQL("postgres://postgres:fixture-only@127.0.0.1:5432/sme_fixture",{max:1});
const id="00000000-0000-4000-8000-000000000097",next="00000000-0000-4000-8000-000000000098";
function check(value:unknown,message:string){if(!value)throw Error(message);}
async function role<T>(name:"sme_fixture_adjudication_writer"|"sme_fixture_runtime",fn:()=>Promise<T>):Promise<T>{await db.unsafe("SET ROLE "+name);try{return await fn();}finally{await db.unsafe("RESET ROLE");}}
const adapter=createScientificMemoryAdjudicationAdapter({unsafe:async(query,params)=>await db.unsafe(query,params as never[])});
try{
 const first=await adjudicateCapturedPublication(gateway(doi),doi,"123","v1",()=>0);
 const second=await adjudicateCapturedPublication(gateway("10.1234/other"),doi,"123","v1",()=>0);
 check(first.decision==="quarantine"&&second.decision==="recheck_required","Adjudication mismatch");
 await role("sme_fixture_adjudication_writer",async()=>{await adapter.stage(id,first);await adapter.stage(id,first);await adapter.stage(next,second);});
 let conflict=false;
 try{await role("sme_fixture_adjudication_writer",()=>adapter.stage(id,second));}catch(e){conflict=String(e).includes("Decision replay conflict");}
 check(conflict,"Conflicting replay accepted");
 const rows=await db.unsafe("SELECT decision_id,decision,provenance,ingestion_allowed,scientific_claim_allowed FROM hsi_memory.adjudication_candidates WHERE doi=$1 AND source_version='v1'",[doi]);
 check(rows.length===2,"History or replay failure");
 for(const [key,result] of [[id,first],[next,second]] as const){
 const row=rows.find(r=>r.decision_id===key);
 check(row&&row.decision===result.decision&&row.ingestion_allowed===false&&row.scientific_claim_allowed===false,"Persisted decision mismatch");
 const p=typeof row.provenance==="string"?JSON.parse(row.provenance):row.provenance;
 check(Array.isArray(p)&&p.length===3&&result.provenance.every(x=>p.some(y=>y.authority===x.authority&&y.payloadSha256===x.payloadSha256)),"Fingerprint persistence mismatch");
 }
 let denied=false;
 try{await role("sme_fixture_runtime",()=>db.unsafe("SELECT * FROM hsi_memory.adjudication_candidates"));}catch(e){denied=String(e).includes("permission denied");}
 check(denied,"Runtime read allowed");
 const observations=await db.unsafe("SELECT observation_id FROM hsi_memory.evidence_observations WHERE source_id=$1",["doi:"+doi]);
 check(observations.length===0,"Unverified decision promoted");
 console.log("Synthetic three-provider adjudication persistence passed");
}finally{await db.close();}
