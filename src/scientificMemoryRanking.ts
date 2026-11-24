/** Offline ranking only. Callers must authorize candidates before ranking and re-read before delivery. */
export interface MemoryRankCandidate { id:string; version:number; lexicalRank:number|null; semanticRank:number|null; graphRank:number|null }
export interface RankedMemory { id:string; version:number; score:number }
export function rankScientificMemory(candidates:readonly MemoryRankCandidate[],limit=10):RankedMemory[]{
 if(!Number.isInteger(limit)||limit<1||limit>100||candidates.length>1000)throw Error("Invalid retrieval bounds");
 const seen=new Set<string>();
 const ranked:RankedMemory[]=[];
 for(const c of candidates){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.id)||!Number.isSafeInteger(c.version)||c.version<1)throw Error("Invalid candidate");
  const id=c.id.toLowerCase();
  if(seen.has(id))throw Error("Duplicate candidate");
  seen.add(id);
  let score=0;
  for(const rank of [c.lexicalRank,c.semanticRank,c.graphRank]){
   if(rank===null)continue;
   if(!Number.isInteger(rank)||rank<1||rank>1000)throw Error("Invalid channel rank");
   score+=1/(60+rank);
  }
  if(score>0)ranked.push({id,version:c.version,score});
 }
 return ranked.sort((a,b)=>b.score-a.score||(a.id<b.id?-1:a.id>b.id?1:0)).slice(0,limit);
}
