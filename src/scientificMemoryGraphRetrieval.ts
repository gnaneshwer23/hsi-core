/** Read-only candidate graph channel. No graph writes, approval or authorization bypass. */
import {verifyDomainBundle,type DomainBundle} from "./knowledgeGraph/domainGraph";
export interface MemoryGraphLink {id:string;version:number;nodeIds:readonly string[]}
export interface GraphMemoryRank {id:string;version:number;graphRank:number;graphVersion:string;matchedNodeIds:string[];edgeIds:string[];scientificClaimAllowed:false}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const norm=(s:string)=>s.normalize("NFKC").toLowerCase().trim().replace(/\s+/g," ");
/** Links must originate from an authorized current-version repository, never user-provided IDs. */
export async function createMemoryGraphRetriever(snapshot:unknown,digest:(s:string)=>Promise<string>,expectedVersion:string){
 if(!/^[a-f0-9]{64}$/.test(expectedVersion))throw Error("Invalid graph pin");
 const g:DomainBundle=await verifyDomainBundle(snapshot,digest,expectedVersion);
 const nodes=new Set(g.nodes.map(n=>n.id));
 const aliases=g.nodes.map(n=>({id:n.id,labels:[n.id,n.name,...n.aliases].map(norm)}));
 const edges=g.edges.filter(e=>e.kind==="source_candidate"&&!e.negated&&e.predicate!=="studied_in");
 return {graphVersion:g.version,rank(terms:readonly string[],links:readonly MemoryGraphLink[],limit=10):GraphMemoryRank[]{
  if(!Array.isArray(terms)||terms.length<1||terms.length>20||terms.some(t=>typeof t!=="string"||!t.trim()||t.length>250)||!Array.isArray(links)||links.length>1000||!Number.isInteger(limit)||limit<1||limit>100)throw Error("Invalid graph retrieval bounds");
  const seeds=new Set<string>();
  for(const term of terms){const matches=aliases.filter(n=>n.labels.includes(norm(term)));if(matches.length===1)seeds.add(matches[0]!.id);}
  const seen=new Set<string>();
  const results:{id:string;version:number;direct:number;matchedNodeIds:string[];edgeIds:string[]}[]=[];
  for(const link of links){
   if(typeof link.id!=="string"||!uuid.test(link.id)||seen.has(link.id.toLowerCase())||!Number.isSafeInteger(link.version)||link.version<1||!Array.isArray(link.nodeIds)||link.nodeIds.length>50||new Set(link.nodeIds).size!==link.nodeIds.length||link.nodeIds.some((n:string)=>!nodes.has(n)))throw Error("Invalid memory graph link");
   seen.add(link.id.toLowerCase());
   const direct=link.nodeIds.filter((n:string)=>seeds.has(n));
   const related=edges.filter(e=>seeds.has(e.subjectId)&&link.nodeIds.includes(e.objectId));
   const matched=[...new Set([...direct,...related.map(e=>e.objectId)])].sort();
   if(matched.length)results.push({id:link.id,version:link.version,direct:direct.length,matchedNodeIds:matched,edgeIds:related.map(e=>e.id).sort()});
  }
  return results.sort((a,b)=>b.direct-a.direct||b.matchedNodeIds.length-a.matchedNodeIds.length||a.id.localeCompare(b.id)).slice(0,limit).map(({direct,...r},i)=>({...r,graphRank:i+1,graphVersion:g.version,scientificClaimAllowed:false}));
 }};
}
