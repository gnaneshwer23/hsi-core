/**
 * Literature co-mention counts from Europe PMC, for the gap finder. A count is how many records mention a term (or two terms together)
 * in title or abstract. It measures attention, not truth or novelty. A failed query is reported as failed, never as zero.
 */
import type {FetchLike} from "../fetchLike";
export type PairCount={a:string;b:string;joint:number|null;error:string|null;queryUrl:string};
export type CooccurrenceResult={schemaVersion:"hsi-cooccurrence-1";generatedAt:string;terms:{term:string;count:number|null;error:string|null;queryUrl:string}[];pairs:PairCount[];note:string};
export const validTerm=(t:unknown):t is string=>typeof t==="string"&&t.trim().length>=2&&t.length<=60&&!/[\u0000-\u001f"\\()\[\]{}:]/.test(t);
const q=(t:string)=>`TITLE_ABS:"${t.trim()}"`;
const search=(query:string)=>"https://europepmc.org/search?query="+encodeURIComponent(query);
async function hits(query:string,f:FetchLike):Promise<number>{
 const u=new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
 u.searchParams.set("query",query);u.searchParams.set("format","json");u.searchParams.set("resultType","lite");u.searchParams.set("pageSize","1");
 const r=await f(u.toString(),{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error("HTTP "+r.status);
 const b=await r.json() as any;if(typeof b?.hitCount!=="number"||b.hitCount<0)throw Error("Unexpected Europe PMC response");
 return b.hitCount;
}
const safe=(e:unknown)=>(e instanceof Error?e.message:"failed").replace(/https?:\/\/\S+/g,"[url]").slice(0,80);
/** Runs at most 8 term counts and 12 pair counts, a few at a time. */
export async function cooccurrence(terms:readonly string[],pairs:readonly (readonly [number,number])[],f:FetchLike=fetch,now=()=>new Date()):Promise<CooccurrenceResult>{
 const run=async<T,R>(items:readonly T[],fn:(x:T)=>Promise<R>,n=4):Promise<R[]>=>{const out:R[]=new Array(items.length);let i=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(i<items.length){const k=i++;out[k]=await fn(items[k]!)}}));return out};
 const tr=await run(terms,async t=>{const query=q(t);try{return {term:t,count:await hits(query,f),error:null,queryUrl:search(query)}}catch(e){return {term:t,count:null,error:safe(e),queryUrl:search(query)}}});
 const pr=await run(pairs,async([i,j])=>{const a=terms[i]!,b=terms[j]!,query=`${q(a)} AND ${q(b)}`;try{return {a,b,joint:await hits(query,f),error:null,queryUrl:search(query)}}catch(e){return {a,b,joint:null,error:safe(e),queryUrl:search(query)}}});
 return {schemaVersion:"hsi-cooccurrence-1",generatedAt:now().toISOString(),terms:tr,pairs:pr,note:"Counts are records whose title or abstract mention the terms, from Europe PMC. They measure attention, not quality or novelty. A low joint count can mean a real gap, different wording, or little interest."};
}
