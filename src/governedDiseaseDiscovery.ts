/** Phase 4: supervised, deterministic discovery screening over authorised graph results.
 * Does not assert scientific truth, causal effects, trial eligibility or clinical advice.
 */
import type {HsiGraphPage} from "./hsiGovernedGraphQuery";
export type DiseaseInvestigation="systemic_sclerosis"|"rheumatoid_arthritis";
export type DiscoveryCandidate={id:string;kind:"missing_provenance"|"contextual_tension"|"comparison_gap";relationshipIds:string[];sourceEvidenceIds:string[];explanation:string;reviewState:"requires_independent_review"};
export type GovernedDiscoveryDossier={schemaVersion:"hsi-governed-discovery-1";disease:DiseaseInvestigation;scope:"governed_research";candidateCount:number;relationshipCount:number;candidates:DiscoveryCandidate[];readOnly:true;graphPromotable:false};
const opposing:Record<string,string>={activates:"inhibits",inhibits:"activates",promotes:"suppresses",suppresses:"promotes",increased_in:"decreased_in",decreased_in:"increased_in"};
export function investigateGovernedDiseaseGraph(page:HsiGraphPage,disease:DiseaseInvestigation):GovernedDiscoveryDossier{
 if(!["systemic_sclerosis","rheumatoid_arthritis"].includes(disease)||page.scope!=="governed_research"||page.limit<1||page.limit>100||page.relationships.length>page.limit)throw Error("Invalid governed research input");
 const nodes=new Set(page.nodes.map(n=>n.id));if(nodes.size!==page.nodes.length)throw Error("Duplicate nodes");
 const edges=[...page.relationships].sort((a,b)=>a.id.localeCompare(b.id));
 if(edges.some(e=>!nodes.has(e.subjectId)||!nodes.has(e.objectId)||e.visibility==="restricted_clinical"||e.layer==="patient_context"))throw Error("Clinical or unresolved graph content");
 const out:DiscoveryCandidate[]=[];
 for(const e of edges){
  if(!e.sourceEvidenceIds.length||!e.context.sourceLocator?.trim()||!e.context.studyContext?.trim())out.push({id:"provenance:"+e.id,kind:"missing_provenance",relationshipIds:[e.id],sourceEvidenceIds:[...e.sourceEvidenceIds],explanation:"Evidence identifier, precise locator or study context is missing; relationship must not be promoted.",reviewState:"requires_independent_review"});
  if(disease==="rheumatoid_arthritis"&&!/rheumatoid arthritis|\bra\b/i.test(e.context.studyContext??""))out.push({id:"ra-context:"+e.id,kind:"comparison_gap",relationshipIds:[e.id],sourceEvidenceIds:[...e.sourceEvidenceIds],explanation:"No explicit RA study context. SSc evidence cannot be transferred to RA without independently reviewed disease-specific sources.",reviewState:"requires_independent_review"});
 }
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const a=edges[i]!,b=edges[j]!;
  if(a.subjectId===b.subjectId&&a.objectId===b.objectId&&opposing[a.predicate.toLowerCase()]===b.predicate.toLowerCase())out.push({id:"tension:"+a.id+":"+b.id,kind:"contextual_tension",relationshipIds:[a.id,b.id],sourceEvidenceIds:[...new Set([...a.sourceEvidenceIds,...b.sourceEvidenceIds])],explanation:"Opposing candidate predicates require assay, tissue, population and disease-stage comparison; not a validated contradiction.",reviewState:"requires_independent_review"});
 }
 return {schemaVersion:"hsi-governed-discovery-1",disease,scope:"governed_research",candidateCount:out.length,relationshipCount:edges.length,candidates:out.sort((a,b)=>a.id.localeCompare(b.id)),readOnly:true,graphPromotable:false};
}
