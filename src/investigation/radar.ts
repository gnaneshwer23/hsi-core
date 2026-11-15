/**
 * Research Radar: what is new and how active a topic is, from open sources (Europe PMC, OpenAlex), generated on request.
 * Nothing is stored. A failed part is reported as failed, never as "nothing new". Counts are literature volume, not quality or novelty.
 */
import type {FetchLike} from "../fetchLike";

export type RadarPaper={title:string;sourceId:string;url:string;doi:string|null;pmid:string|null;date:string|null;journal:string|null;provider:"europe-pmc"|"openalex";retraction:"flagged"|"not_flagged_by_provider"|"unknown";preprint:boolean};
export type TopicRadar={topic:string;status:"ok"|"failed";error:string|null;newCount:number;papers:RadarPaper[];trend:{year:number;count:number}[]|null;trendError:string|null};
export type OwnPapers={status:"ok"|"failed"|"not_requested";error:string|null;papers:(RadarPaper&{citedBy:number|null})[];unresolved:string[]};
export type RadarResult={schemaVersion:"hsi-radar-1";generatedAt:string;window:{days:number;from:string;to:string};topics:TopicRadar[];own:OwnPapers;note:string};

const clean=(s:unknown,n=400):string=>typeof s==="string"?s.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,n):"";
const day=(d:Date)=>d.toISOString().slice(0,10);
const safeErr=(e:unknown)=>(e instanceof Error?e.message:"failed").replace(/https?:\/\/\S+/g,"[url]").slice(0,100);
export const validTopic=(t:unknown):t is string=>typeof t==="string"&&t.trim().length>=2&&t.length<=80&&!/[\u0000-\u001f"\\]/.test(t);
async function getJson(url:string,f:FetchLike,ms=15000):Promise<any>{
 const r=await f(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(ms)});
 if(!r.ok)throw Error("HTTP "+r.status);return r.json();
}
const epmcUrl=(id:string,src:string)=>"https://europepmc.org/article/"+encodeURIComponent(src)+"/"+encodeURIComponent(id);
function epmcPaper(r:any):RadarPaper|null{
 if(typeof r?.id!=="string"||typeof r?.source!=="string"||!clean(r.title))return null;
 const types:string[]=Array.isArray(r.pubTypeList?.pubType)?r.pubTypeList.pubType:[];
 return {title:clean(r.title,300),sourceId:"europepmc:"+r.source+":"+r.id,url:epmcUrl(r.id,r.source),doi:typeof r.doi==="string"?r.doi:null,pmid:typeof r.pmid==="string"?r.pmid:null,date:typeof r.firstPublicationDate==="string"?r.firstPublicationDate:null,
  journal:clean(r.journalTitle,120)||null,provider:"europe-pmc",retraction:types.some(t=>/retract/i.test(t))?"flagged":"not_flagged_by_provider",preprint:r.source==="PPR"};
}
export async function topicRadar(topic:string,window:{from:string;to:string},f:FetchLike=fetch,opts:{limit?:number;trend?:boolean}={}):Promise<TopicRadar>{
 const limit=Math.max(1,Math.min(opts.limit??8,15));
 const out:TopicRadar={topic,status:"ok",error:null,newCount:0,papers:[],trend:null,trendError:null};
 const u=new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
 u.searchParams.set("query",`("${topic}") AND (FIRST_PDATE:[${window.from} TO ${window.to}])`);
 u.searchParams.set("format","json");u.searchParams.set("resultType","lite");u.searchParams.set("pageSize",String(limit));u.searchParams.set("sort","P_PDATE_D desc");
 const trendUrl=new URL("https://api.openalex.org/works");
 const y=Number(window.to.slice(0,4));
 // Phrase match on title and abstract. A bare search term is tokenised and returns hundreds of thousands of unrelated works.
 trendUrl.searchParams.set("filter",`title_and_abstract.search:"${topic.replace(/[,|:]/g," ")}",publication_year:${y-9}-${y}`);trendUrl.searchParams.set("group_by","publication_year");
 const [a,b]=await Promise.allSettled([getJson(u.toString(),f),opts.trend===false?Promise.resolve(null):getJson(trendUrl.toString(),f)]);
 if(a.status==="fulfilled"){
  const rs=a.value?.resultList?.result;
  if(!Array.isArray(rs)||typeof a.value?.hitCount!=="number"){out.status="failed";out.error="Unexpected Europe PMC response"}
  else{out.newCount=a.value.hitCount;out.papers=rs.map(epmcPaper).filter((p):p is RadarPaper=>!!p)}
 }else{out.status="failed";out.error=safeErr(a.reason)}
 if(b.status==="fulfilled"&&b.value){
  const g=b.value?.group_by;
  if(Array.isArray(g)){const m=new Map<number,number>(g.filter((x:any)=>/^\d{4}$/.test(String(x?.key))&&Number.isFinite(x?.count)).map((x:any)=>[Number(x.key),Number(x.count)]));out.trend=Array.from({length:10},(_,i)=>({year:y-9+i,count:m.get(y-9+i)??0}))}
  else out.trendError="Unexpected OpenAlex response";
 }else if(b.status==="rejected")out.trendError=safeErr(b.reason);
 return out;
}
/** The researcher's own papers: ORCID through OpenAlex, plus pasted DOIs and PMIDs through Europe PMC. IDs come in as "doi:..." or "pmid:...". */
export async function ownPapers(input:{orcid:string|null;ids:readonly string[]},f:FetchLike=fetch):Promise<OwnPapers>{
 if(!input.orcid&&!input.ids.length)return {status:"not_requested",error:null,papers:[],unresolved:[]};
 const papers:(RadarPaper&{citedBy:number|null})[]=[],unresolved:string[]=[],errors:string[]=[];
 if(input.orcid){
  try{
   const u=new URL("https://api.openalex.org/works");
   u.searchParams.set("filter","author.orcid:https://orcid.org/"+input.orcid);u.searchParams.set("sort","publication_date:desc");u.searchParams.set("per-page","10");
   u.searchParams.set("select","id,doi,title,publication_date,ids,primary_location,cited_by_count,is_retracted,type");
   const b=await getJson(u.toString(),f);
   if(!Array.isArray(b?.results))throw Error("Unexpected OpenAlex response");
   for(const r of b.results){
    if(typeof r?.id!=="string"||!/^https:\/\/openalex\.org\/W\d{1,15}$/.test(r.id)||!clean(r.title))continue;
    const pm=typeof r.ids?.pmid==="string"?r.ids.pmid.replace(/^.*\//,""):null;
    papers.push({title:clean(r.title,300),sourceId:"openalex:"+r.id.replace(/^.*\//,""),url:r.id,doi:typeof r.doi==="string"?r.doi.replace(/^https?:\/\/doi\.org\//i,""):null,pmid:pm&&/^\d+$/.test(pm)?pm:null,date:typeof r.publication_date==="string"?r.publication_date:null,
     journal:clean(r.primary_location?.source?.display_name,120)||null,provider:"openalex",retraction:r.is_retracted===true?"flagged":r.is_retracted===false?"not_flagged_by_provider":"unknown",preprint:r.type==="preprint",citedBy:Number.isFinite(r.cited_by_count)?r.cited_by_count:null});
   }
  }catch(e){errors.push("ORCID lookup: "+safeErr(e))}
 }
 for(const id of input.ids.slice(0,20)){
  const [kind,val]=id.split(/:(.+)/);
  if(!val||!/^(doi|pmid)$/.test(kind!)||(kind==="pmid"&&!/^\d{1,9}$/.test(val))||(kind==="doi"&&!/^10\.\d{4,9}\/\S{1,180}$/.test(val))){unresolved.push(id.slice(0,60));continue}
  try{
   const u=new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
   u.searchParams.set("query",kind==="pmid"?`EXT_ID:${val} AND SRC:MED`:`DOI:"${val.replace(/"/g,"")}"`);u.searchParams.set("format","json");u.searchParams.set("resultType","lite");u.searchParams.set("pageSize","1");
   const b=await getJson(u.toString(),f);
   const p=Array.isArray(b?.resultList?.result)?epmcPaper(b.resultList.result[0]):null;
   if(p){if(!papers.some(x=>(x.doi&&x.doi.toLowerCase()===p.doi?.toLowerCase())||(x.pmid&&x.pmid===p.pmid)))papers.push({...p,citedBy:Number.isFinite(b.resultList.result[0]?.citedByCount)?b.resultList.result[0].citedByCount:null})}
   else unresolved.push(id.slice(0,60));
  }catch(e){errors.push(id.slice(0,40)+": "+safeErr(e));unresolved.push(id.slice(0,60))}
 }
 return {status:errors.length&&!papers.length?"failed":"ok",error:errors.length?errors.slice(0,3).join("; "):null,papers:papers.slice(0,25),unresolved};
}
export async function buildRadar(input:{topics:readonly string[];days:number;orcid:string|null;paperIds:readonly string[]},f:FetchLike=fetch,now=()=>new Date()):Promise<RadarResult>{
 const to=now(),from=new Date(to.getTime()-input.days*86_400_000);
 const window={days:input.days,from:day(from),to:day(to)};
 const [topics,own]=await Promise.all([Promise.all(input.topics.map(t=>topicRadar(t,window,f))),ownPapers({orcid:input.orcid,ids:input.paperIds},f)]);
 return {schemaVersion:"hsi-radar-1",generatedAt:to.toISOString(),window,topics,own,note:"Generated now from Europe PMC and OpenAlex. Counts are literature volume, not quality, novelty or consensus. Nothing here is reviewed, and it is not clinical advice."};
}
export function renderDigestMarkdown(r:RadarResult):string{
 const safe=(s:string)=>s.replace(/[<>&`*_\[\]#|]/g,c=>"&#"+c.charCodeAt(0)+";").replace(/[\r\n]+/g," ");
 return ["# HSI research digest",`Generated ${r.generatedAt.slice(0,10)} · papers first published ${r.window.from} to ${r.window.to}`,"",
  ...r.topics.flatMap(t=>[`## ${safe(t.topic)}`,t.status==="failed"?`Search failed (${safe(t.error??"error")}). Absence of results is not evidence of absence.`:`${t.newCount} new paper${t.newCount===1?"":"s"} in this window.`,
   ...(t.trend?[`Publications per year (OpenAlex, title or abstract mentions; the latest year is partial): ${t.trend.map(x=>`${x.year}: ${x.count}`).join(", ")}`]:[]),
   ...t.papers.map(p=>`- ${safe(p.title)}${p.preprint?" (preprint)":""} · ${safe(p.journal??"journal not given")} · ${p.date??"date not given"} · ${p.url}${p.retraction==="flagged"?" · flagged retracted":""}`),""]),
  ...(r.own.papers.length?["## Your papers",...r.own.papers.map(p=>`- ${safe(p.title)} · ${p.date??"date not given"}${p.citedBy!==null?` · cited by ${p.citedBy}`:""} · ${p.url}`),""]:[]),
  "---",r.note,""].join("\n");
}
