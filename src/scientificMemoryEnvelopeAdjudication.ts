import type {createProvenanceCapture} from "./scientificMemoryProvenanceCapture";
import {normalizeEvidenceDoi} from "./scientificMemoryCrossref";
import {normalizePmid} from "./scientificMemoryPubmed";
import {adjudicatePublication,type PublicationObservation} from "./scientificMemoryPublicationAdjudication";
type Gateway=ReturnType<typeof createProvenanceCapture>;
/** Fixture-only orchestration. Requested version is a label, not verified publication version. */
export async function adjudicateCapturedPublication(gateway:Gateway,doiInput:string,pmidInput:string,version:string,clock:()=>number=Date.now){
 const doi=normalizeEvidenceDoi(doiInput),pmid=normalizePmid(pmidInput);
 if(typeof version!=="string"||!version.trim()||version.length>128)throw Error("Invalid version label");
 const [crossref,europe,pubmed]=await Promise.all([gateway.captureCrossref(doi),gateway.captureEuropePmc(pmid),gateway.capturePubmed(pmid)]);
 const envelopes=[crossref.provenance,europe.provenance,pubmed.provenance];
 if(envelopes.some(p=>! /^[a-f0-9]{64}$/.test(p.payloadSha256)||!Number.isInteger(p.byteLength)||p.byteLength<1||p.byteLength>2097152)||crossref.provenance.authority!=="crossref"||europe.provenance.authority!=="europe_pmc"||pubmed.provenance.authority!=="pubmed")throw Error("Invalid capture provenance");
 if(crossref.candidate.doi!==doi||europe.candidate.pmid!==pmid||pubmed.candidate.status.pmid!==pmid)throw Error("Capture identity mismatch");
 const identityConflict=[europe.candidate.doi,pubmed.candidate.doi].some(d=>d!==null&&d!==doi)||!!(europe.candidate.pmcid&&pubmed.candidate.pmcid&&europe.candidate.pmcid!==pubmed.candidate.pmcid);
 const observations:PublicationObservation[]=[{authority:"crossref",doi,version,status:crossref.candidate.status,checkedAt:crossref.provenance.checkedAt,noticeRefs:crossref.candidate.noticeDois.map(d=>"doi:"+d)}];
 if(!identityConflict&&europe.candidate.doi===doi)observations.push({authority:"europe_pmc",doi,version,status:europe.candidate.status,checkedAt:europe.provenance.checkedAt,noticeRefs:europe.candidate.noticePmids.map(p=>"pmid:"+p)});
 if(!identityConflict&&pubmed.candidate.doi===doi)observations.push({authority:"pubmed",doi,version,status:pubmed.candidate.status.status,checkedAt:pubmed.provenance.checkedAt,noticeRefs:pubmed.candidate.status.noticePmids.map(p=>"pmid:"+p)});
 const decision=adjudicatePublication(doi,version,observations,clock());
 const unlinkedAdverse=[europe.candidate.status,pubmed.candidate.status.status].some(s=>s!=="unknown"&&s!=="current")&&observations.length<3;
 return {adjudication:decision,decision:decision.decision==="quarantine"?"quarantine":identityConflict||unlinkedAdverse?"recheck_required":decision.decision,identityConflict,unlinkedAdverse,provenance:envelopes,linkedAuthorities:observations.map(o=>o.authority),versionVerified:false as const,authorityAuthenticated:false as const,independentCorroborationVerified:false as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
}
