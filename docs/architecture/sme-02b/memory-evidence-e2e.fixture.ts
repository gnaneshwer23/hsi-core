// Disposable CI only; synthetic metadata, no external network requests.
import {SQL} from "bun";
import {createCrossrefTransport} from "../../../src/scientificMemoryCrossrefTransport";
import {prepareCrossrefRegistryCandidate} from "../../../src/scientificMemoryCrossrefRegistry";
import {assessPublicationVersion,type PublicationVersionAssertion} from "../../../src/scientificMemoryPublicationVersion";
if(process.env.SME_DISPOSABLE_FIXTURE!=="1")throw Error("Disposable fixture opt-in required");
const db=new SQL("postgres://postgres:fixture-only@127.0.0.1:5432/sme_fixture",{max:1});
const doi="10.1234/fixture-e2e",version="v1";
const id="00000000-0000-4000-8000-000000000096";
function check(value:unknown,message:string){if(!value)throw Error(message);}
async function role<T>(name:"sme_fixture_assertion_ingestor"|"sme_fixture_runtime",fn:()=>Promise<T>):Promise<T>{
 await db.unsafe("SET ROLE "+name);try{return await fn();}finally{await db.unsafe("RESET ROLE");}
}
const transport=createCrossrefTransport(async()=>new Response(JSON.stringify({status:"ok","message-type":"work",message:{DOI:doi,"updated-by":[{DOI:"10.1234/fixture-retraction",type:"retraction"}]}}),{headers:{"content-type":"application/json"}}),true);
try{
 const result=await transport.lookup(doi);
 if(result.kind!=="metadata")throw Error("Metadata lookup failed");
 const now=Date.now();
 const candidate=prepareCrossrefRegistryCandidate(result.candidate,version,new Date(now).toISOString(),now);
 check(candidate.status==="retracted"&&candidate.noticeRefs[0]==="doi:10.1234/fixture-retraction"&&!candidate.ingestionAllowed,"Candidate boundary failed");
 const assertion:PublicationVersionAssertion={doi,version,authority:"crossref",locator:"fixture:e2e-crossref",publicRecord:true};
 const publisher:PublicationVersionAssertion={...assertion,authority:"publisher",locator:"fixture:e2e-publisher"};
 check(assessPublicationVersion(doi,version,[assertion]).state==="insufficient","Single source accepted");
 const linkage=assessPublicationVersion(doi,version,[assertion,publisher]);
 check(linkage.state==="corroborated"&&!linkage.ingestionAllowed,"Corroboration boundary failed");
 check(assessPublicationVersion(doi,version,[assertion,{...publisher,version:"v2"}]).state==="ambiguous","Conflict missed");
 const stage=()=>role("sme_fixture_assertion_ingestor",async()=>db.unsafe("SELECT hsi_memory.stage_publication_assertion($1::uuid,$2,$3,$4,$5)",[id,assertion.doi,assertion.version,assertion.authority,assertion.locator]));
 await stage();await stage();
 const rows=await db.unsafe("SELECT doi,source_version,authority,locator,verification_state,scientific_claim_allowed FROM hsi_memory.publication_assertion_candidates WHERE assertion_id=$1::uuid",[id]);
 check(rows.length===1&&rows[0].doi===doi&&rows[0].source_version===version&&rows[0].authority===assertion.authority&&rows[0].locator===assertion.locator&&rows[0].verification_state==="unverified"&&rows[0].scientific_claim_allowed===false,"Staging persistence failed");
 let denied=false;
 try{await role("sme_fixture_runtime",async()=>db.unsafe("SELECT * FROM hsi_memory.publication_assertion_candidates WHERE assertion_id=$1::uuid",[id]));}catch(e){denied=String(e).includes("permission denied");}
 check(denied,"Runtime staging access allowed");
 const observations=await db.unsafe("SELECT observation_id FROM hsi_memory.evidence_observations WHERE source_id=$1",[candidate.sourceId]);
 check(observations.length===0,"Unverified candidate promoted");
 console.log("Synthetic Crossref interpretation and assertion staging lifecycle passed");
}finally{await db.close();}
