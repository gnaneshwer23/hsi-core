/** Offline semantic retrieval rehearsal. No network provider or private-data egress. */
export interface MemoryEmbeddingProfile { model:string; dimensions:number }
export interface MemoryEmbeddingCandidate { id:string; version:number; model:string; vector:readonly number[] }
export interface SemanticMemoryReference { id:string; version:number; semanticRank:number }
function normalized(vector:readonly number[],dimensions:number):number[]{
 if(vector.length!==dimensions||vector.some(v=>!Number.isFinite(v)))throw Error("Invalid embedding");
 const scale=vector.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
 if(scale===0)throw Error("Zero embedding");
 const scaled=vector.map(v=>v/scale);
 const norm=Math.sqrt(scaled.reduce((s,v)=>s+v*v,0));
 return scaled.map(v=>v/norm);
}
/** Candidates must already be authorized and current. Revalidate references before delivery. */
export function rankMemoryEmbeddings(profile:MemoryEmbeddingProfile,query:readonly number[],candidates:readonly MemoryEmbeddingCandidate[],limit=10):SemanticMemoryReference[]{
 if(!profile.model||profile.model.length>128||!Number.isInteger(profile.dimensions)||profile.dimensions<1||profile.dimensions>4096||!Number.isInteger(limit)||limit<1||limit>100||candidates.length>1000)throw Error("Invalid semantic bounds");
 const q=normalized(query,profile.dimensions);
 const seen=new Set<string>();
 const scored=candidates.map(c=>{
  if(c.model!==profile.model||!Number.isSafeInteger(c.version)||c.version<1||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.id))throw Error("Invalid candidate");
  const id=c.id.toLowerCase();
  if(seen.has(id))throw Error("Duplicate candidate");
  seen.add(id);
  const vector=normalized(c.vector,profile.dimensions);
  return {id,version:c.version,score:vector.reduce((s,v,i)=>s+v*q[i]!,0)};
 });
 return scored.sort((a,b)=>b.score-a.score||(a.id<b.id?-1:a.id>b.id?1:0)).slice(0,limit).map((c,i)=>({id:c.id,version:c.version,semanticRank:i+1}));
}
