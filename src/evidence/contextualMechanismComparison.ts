/**
 * Step 5 — contextual evidence comparison, conservative contradiction detection.
 *
 * These are manually structured research leads, NOT verified publication claims.
 * Opposing directions are contradictions only when the biological context is
 * equivalent. Missing context blocks a contradiction verdict.
 */
export type EvidenceDirection = "supports" | "opposes" | "inconclusive";
export type EvidenceContext = {
  tissue: string; cellType: string; disease: string;
  species: string; experimentalSystem: string;
  intervention: string; endpoint: string;
};
export type MechanismEvidenceLead = {
  id: string; sourceReference: string; proteinAccession: string;
  pathwayStableId: string; direction: EvidenceDirection;
  context: EvidenceContext; sourceVerified: false;
  scientificApproval: false;
};
export type EvidenceComparison = {
  leftId: string; rightId: string;
  classification: "candidate_contradiction" | "context_mismatch" | "insufficient_context" | "no_opposition";
  differences: readonly (keyof EvidenceContext)[];
  needsSourceVerification: true; needsHumanReview: true;
  scientificConclusion: false;
};
const CONTEXT_KEYS = ["tissue","cellType","disease","species","experimentalSystem","intervention","endpoint"] as const;
const valid = (v:unknown) => typeof v === "string" && v.trim().length>0 && v.length<=200;
const known = (v:string) => !/^(unknown|unresolved|not reported|n\/a)$/i.test(v.trim());
export function validateMechanismLead(lead:MechanismEvidenceLead):void {
  if(!valid(lead.id)||!valid(lead.sourceReference)||!valid(lead.proteinAccession)||!valid(lead.pathwayStableId))
    throw new Error("Lead identity and source reference required");
  if(!["supports","opposes","inconclusive"].includes(lead.direction))
    throw new Error("Invalid direction");
  if(lead.sourceVerified!==false||lead.scientificApproval!==false)
    throw new Error("Only unverified leads may enter draft comparison");
  for(const key of CONTEXT_KEYS)if(!valid(lead.context[key]))throw new Error(`Missing context field: ${key}`);
}
export function compareMechanismLeads(left:MechanismEvidenceLead,right:MechanismEvidenceLead):EvidenceComparison {
  validateMechanismLead(left);validateMechanismLead(right);
  if(left.id===right.id)throw new Error("Cannot compare a lead to itself");
  const differences: (keyof EvidenceContext)[] = [];
  const incomplete=CONTEXT_KEYS.some(key=>!known(left.context[key])||!known(right.context[key]));
  for(const key of CONTEXT_KEYS)if(left.context[key].trim().toLowerCase()!==right.context[key].trim().toLowerCase())
    differences.push(key);
  const differentSubject=left.proteinAccession!==right.proteinAccession||
    left.pathwayStableId!==right.pathwayStableId;
  const opposed=(left.direction==="supports"&&right.direction==="opposes")||
    (left.direction==="opposes"&&right.direction==="supports");
  const classification:EvidenceComparison["classification"] =
    incomplete ? "insufficient_context" :
    differentSubject||differences.length ? "context_mismatch" :
    opposed ? "candidate_contradiction" : "no_opposition";
  return {leftId:left.id,rightId:right.id,classification,differences,
    needsSourceVerification:true,needsHumanReview:true,scientificConclusion:false};
}
export function compareMechanismEvidenceSet(leads:readonly MechanismEvidenceLead[]):EvidenceComparison[] {
  if(leads.length>100)throw new Error("Evidence comparison budget exceeded");
  const comparisons:EvidenceComparison[]=[];
  for(let i=0;i<leads.length;i++)for(let j=i+1;j<leads.length;j++)
    comparisons.push(compareMechanismLeads(leads[i]!,leads[j]!));
  return comparisons;
}
