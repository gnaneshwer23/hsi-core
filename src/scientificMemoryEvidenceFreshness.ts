/** Offline policy only. Status observations must come from a trusted source adapter.
 * Freshness refers to status verification, not the age or scientific validity of a paper.
 */
export type EvidenceStatus="current"|"corrected"|"retracted"|"superseded"|"expression_of_concern"|"unknown";
export interface EvidenceReference {sourceId:string;sourceVersion:string}
export interface EvidenceObservation extends EvidenceReference {status:EvidenceStatus;checkedAt:string;authority:string}
export type EvidenceDisposition="eligible_for_review"|"quarantine"|"recheck_required";
export function assessMemoryEvidence(refs:readonly EvidenceReference[],observations:readonly EvidenceObservation[],nowMs:number,maxAgeMs:number){
 if(!Number.isSafeInteger(nowMs)||nowMs<0||!Number.isSafeInteger(maxAgeMs)||maxAgeMs<1||maxAgeMs>30*86400000||!Array.isArray(refs)||refs.length>100||!Array.isArray(observations)||observations.length>1000)throw Error("Invalid evidence assessment");
 const valid=(s:unknown):s is string=>typeof s==="string"&&s.trim().length>0&&s.length<=1000;
 const key=(r:EvidenceReference)=>JSON.stringify([r.sourceId,r.sourceVersion]);
 const byKey=new Map<string,EvidenceObservation[]>();
 for(const o of observations){
  if(!o||!valid(o.sourceId)||!valid(o.sourceVersion)||!valid(o.authority)||!["current","corrected","retracted","superseded","expression_of_concern","unknown"].includes(o.status)||typeof o.checkedAt!=="string"||!Number.isFinite(Date.parse(o.checkedAt))||Date.parse(o.checkedAt)>nowMs)throw Error("Invalid evidence observation");
  const k=key(o);const list=byKey.get(k)??[];list.push(o);byKey.set(k,list);
 }
 const seen=new Set<string>();
 const sources=refs.map(r=>{
  if(!r||!valid(r.sourceId)||!valid(r.sourceVersion)||seen.has(key(r)))throw Error("Invalid evidence reference");seen.add(key(r));
  const records=byKey.get(key(r))??[];
  // Adverse observations are sticky until a separately governed resolution exists.
  const adverse=records.filter(o=>["corrected","retracted","superseded","expression_of_concern"].includes(o.status));
  const latest=records.reduce((n,o)=>Math.max(n,Date.parse(o.checkedAt)),-Infinity);
  const recent=records.filter(o=>Date.parse(o.checkedAt)===latest);
  const disposition:EvidenceDisposition=adverse.length?"quarantine":!recent.length||nowMs-latest>maxAgeMs||recent.some(o=>o.status!=="current")?"recheck_required":"eligible_for_review";
  return {...r,disposition,observations:records.map(o=>({...o}))};
 });
 const disposition:EvidenceDisposition=sources.some(s=>s.disposition==="quarantine")?"quarantine":!sources.length||sources.some(s=>s.disposition==="recheck_required")?"recheck_required":"eligible_for_review";
 return {disposition,sources,scientificClaimAllowed:false as const};
}
