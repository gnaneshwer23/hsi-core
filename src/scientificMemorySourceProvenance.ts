export interface SourceProvenanceCandidate {
 id:string; authority:"publisher"|"crossref"|"pubmed"|"europe_pmc";
 upstreamIds:readonly string[]; payloadSha256:string;
}
const authorities=new Set(["publisher","crossref","pubmed","europe_pmc"]);
/** Structural dependency assessment only; caller-supplied lineage is not authenticated. */
export function assessSourceProvenance(rows:readonly SourceProvenanceCandidate[]){
 if(!Array.isArray(rows)||rows.length>100)throw Error("Invalid provenance set");
 const byId=new Map<string,SourceProvenanceCandidate>();
 for(const r of rows){
 if(!r||typeof r.id!=="string"||! /^[a-zA-Z0-9_-]{1,128}$/.test(r.id)||!authorities.has(r.authority)||! /^[a-f0-9]{64}$/.test(r.payloadSha256)||!Array.isArray(r.upstreamIds)||r.upstreamIds.length>100||r.upstreamIds.some((x:unknown)=>typeof x!=="string"||! /^[a-zA-Z0-9_-]{1,128}$/.test(x))||byId.has(r.id))throw Error("Invalid provenance record");
 byId.set(r.id,r);
 }
 const missing=new Set<string>(),visiting=new Set<string>(),done=new Set<string>();
 function visit(id:string){
 if(visiting.has(id))throw Error("Cyclic provenance");
 if(done.has(id))return;
 const r=byId.get(id);if(!r){missing.add(id);return;}
 visiting.add(id);for(const parent of r.upstreamIds)visit(parent);visiting.delete(id);done.add(id);
 }
 for(const id of byId.keys())visit(id);
 const groups=new Map<string,string[]>();
 for(const r of rows){const g=groups.get(r.payloadSha256)??[];g.push(r.id);groups.set(r.payloadSha256,g);}
 return {recordCount:rows.length,declaredDependencies:rows.filter(r=>r.upstreamIds.length>0).map(r=>r.id).sort(),missingUpstreamIds:[...missing].sort(),duplicatePayloadGroups:[...groups.values()].filter(g=>g.length>1).map(g=>g.sort()).sort((a,b)=>a.join(",").localeCompare(b.join(","))),authorityAuthenticated:false as const,independentCorroborationVerified:false as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
}
