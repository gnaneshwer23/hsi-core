/** Read-only PubMed evidence discovery. Bibliographic metadata is not verified biological evidence. */
export type PubmedHit={pmid:string;title:string;authors:string[];journal:string;pubdate:string;url:string};
export type PubmedResult={query:string;retrievedAt:string;total:number;hits:PubmedHit[];status:"retrieved"|"no_results";disclaimer:string};
export const PUBMED_DISCLAIMER="PubMed search results are bibliographic leads, not verified scientific claims. Review full texts, methods, population, tissue, assays and independent replication before drawing conclusions.";
const SEARCH="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const SUMMARY="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
function safeQuery(q:string){const s=q.trim().replace(/\s+/g," ");if(s.length<5||s.length>400||/[<>\u0000-\u001f]/.test(s))throw new Error("Research query must be 5–400 characters of plain text.");return s;}
function makeUrl(base:string,params:Record<string,string>){const u=new URL(base);for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);return u.toString();}
async function getJson(url:string,fetcher:typeof fetch,signal?:AbortSignal){
 const r=await fetcher(url,{headers:{Accept:"application/json"},signal});
 if(!r.ok)throw new Error("PubMed upstream returned "+r.status);
 return r.json() as Promise<any>;
}
export async function retrievePubmedBibliography(input:string,fetcher:typeof fetch=fetch,signal?:AbortSignal):Promise<PubmedResult>{
 const query=safeQuery(input);
 const search=await getJson(makeUrl(SEARCH,{db:"pubmed",term:query,retmode:"json",retmax:"12",sort:"relevance",tool:"hsi_scientific_discovery"}),fetcher,signal);
 const ids:unknown=search?.esearchresult?.idlist;
 if(!Array.isArray(ids)||!ids.every(x=>typeof x==="string"&&/^\d+$/.test(x)))throw new Error("Invalid PubMed search response");
 const total=Number(search?.esearchresult?.count??0);
 const retrievedAt=new Date().toISOString();
 if(ids.length===0)return {query,retrievedAt,total:0,hits:[],status:"no_results",disclaimer:PUBMED_DISCLAIMER};
 const summary=await getJson(makeUrl(SUMMARY,{db:"pubmed",id:ids.join(","),retmode:"json",tool:"hsi_scientific_discovery"}),fetcher,signal);
 const hits:PubmedHit[]=ids.map((pmid:string)=>{
  const x=summary?.result?.[pmid];
  if(!x||typeof x.title!=="string")return null;
  return {pmid,title:x.title,authors:Array.isArray(x.authors)?x.authors.map((a:any)=>String(a?.name??"")).filter(Boolean).slice(0,12):[],journal:String(x.fulljournalname??x.source??""),pubdate:String(x.pubdate??""),url:"https://pubmed.ncbi.nlm.nih.gov/"+pmid+"/"};
 }).filter((x:PubmedHit|null):x is PubmedHit=>x!==null);
 return {query,retrievedAt,total:Number.isFinite(total)?total:0,hits,status:hits.length?"retrieved":"no_results",disclaimer:PUBMED_DISCLAIMER};
}
