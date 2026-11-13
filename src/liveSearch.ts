/**
 * Live search adapter for the context-audit runner (not enabled by any default path).
 * Europe PMC open-access search -> open-access full-text sections -> candidate paragraphs -> an independent source
 * clearance decision per paragraph. A paragraph becomes an audit hit ONLY when the clearance authority returns a
 * cleared, signed receipt that permits storage, display, comparison and export; the retriever never asserts rights
 * itself. Every request goes through a host allow-list and a hard request budget. Tests use mocked fetchers only.
 */
import {createHash} from "node:crypto";
import {retrieveOpenAccessSections} from "./researchV2/openAccessSections";
import type {SourceFetcher} from "./researchV2/sourceAdapters";
import type {SourceClearanceReceipt,ClearanceBinding} from "./researchV2/sourceClearanceReceipt";
import type {ContextAuditHit,ContextAuditSearch,ContextAuditTarget} from "./evidence/contextConflictAudit";
import {LIVE_ALLOWED_HOSTS,LIVE_HARD_LIMITS} from "./liveReadiness";

export type ClearanceDecision={state:string;receipt:SourceClearanceReceipt|null;policyRef:string};
export type ClearanceDecider={decide:(input:ClearanceBinding)=>Promise<ClearanceDecision>};
const REQUIRED_ACTIONS=["storage","display","comparison","export"] as const;
const SEARCH="https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const STOP=new Set(["how","might","what","which","with","from","that","this","does","between","into","about","their","there","evidence","influence","relate","relates","related","connect","connects","could","would","should","where","when","also","than","these","those"]);

/** Fetch wrapper: https only, allow-listed hosts only, and a hard cap on the number of requests. */
export function createAllowlistedFetcher(fetcher:SourceFetcher,options:{hosts?:readonly string[];maxRequests:number}){
 const hosts=options.hosts??LIVE_ALLOWED_HOSTS;let count=0;
 if(!Number.isInteger(options.maxRequests)||options.maxRequests<1||options.maxRequests>64||hosts.some(h=>!LIVE_ALLOWED_HOSTS.includes(h)))throw Error("Invalid fetch policy");
 const guarded:SourceFetcher=async(input,init)=>{
  const url=new URL(typeof input==="string"||input instanceof URL?input.toString():input.url);
  if(url.protocol!=="https:"||!hosts.includes(url.hostname)||url.username||url.password)throw Error("Request host is not allowed");
  if(++count>options.maxRequests)throw Error("Request budget exhausted");
  return fetcher(input,{...init,redirect:"error"});
 };
 return {fetch:guarded,count:()=>count};
}

const cleanTerm=(t:string)=>t.toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,40);
/** Pathway or entity phrases keep their spaces; they rank paragraphs and never narrow the search. */
const cleanPhrase=(t:string)=>t.toLowerCase().replace(/[^a-z0-9 -]/g," ").replace(/\s+/g," ").trim().slice(0,80);
export function questionTerms(question:string,max=4):string[]{
 const seen=new Set<string>();
 return question.split(/[\s,;:?()]+/).map(cleanTerm).filter(t=>t.length>=3&&!STOP.has(t)&&!seen.has(t)&&!!seen.add(t)).slice(0,max);
}
const OPPOSE_PHRASES=['"no association"','"not associated"','"did not"','"failed to"','"no significant"','"no effect"'];
export function buildLiveQueries(question:string,extraTerms:readonly string[]=[]):{support:string;oppose:string;queryTerms:string[];scoreTerms:string[]}{
 const queryTerms=questionTerms(question);
 if(!queryTerms.length)throw Error("Question has no searchable terms");
 const base=`(${queryTerms.join(" AND ")}) AND OPEN_ACCESS:y AND HAS_FT:y`;
 const scoreTerms=[...queryTerms,...extraTerms.map(cleanPhrase).filter(t=>t.length>=4)].filter((t,i,a)=>a.indexOf(t)===i).slice(0,10);
 return {support:base,oppose:`${base} AND (${OPPOSE_PHRASES.join(" OR ")})`,queryTerms,scoreTerms};
}
const searchUrl=(query:string,pageSize:number)=>{const u=new URL(SEARCH);u.searchParams.set("query",query);u.searchParams.set("format","json");u.searchParams.set("resultType","lite");u.searchParams.set("pageSize",String(pageSize));return u.toString()};

/** What a live run would request. Shown to the source-policy owner before anything is approved. */
export function planLiveRequests(question:string,options:{extraTerms?:readonly string[];maxArticlesPerIntent?:number}={}){
 const articles=options.maxArticlesPerIntent??3;
 if(!Number.isInteger(articles)||articles<1||articles>LIVE_HARD_LIMITS.maxArticlesPerIntent)throw Error("Invalid article limit");
 const q=buildLiveQueries(question,options.extraTerms);
 return {hosts:[...LIVE_ALLOWED_HOSTS],terms:q.queryTerms,rankingTerms:q.scoreTerms,
  requests:[{purpose:"support search",method:"GET" as const,url:searchUrl(q.support,articles*2)},{purpose:"oppose search",method:"GET" as const,url:searchUrl(q.oppose,articles*2)}],
  fullTextFetches:{perIntent:articles,urlPattern:"https://www.ebi.ac.uk/europepmc/webservices/rest/{PMCID}/fullTextXML",maxTotal:articles*2},
  maxRequests:2+articles*2,transmitsToModels:false};
}

function overlap(text:string,terms:readonly string[]){const t=text.toLowerCase();return terms.reduce((n,x)=>n+(t.includes(x)?1:0),0)}

export function createLiveSearch(deps:{
 fetcher:SourceFetcher;clearance:ClearanceDecider;extraTerms?:readonly string[];maxArticlesPerIntent?:number;maxHitsPerIntent?:number;
 delayMs?:number;sleep?:(ms:number)=>Promise<void>;now?:()=>string;
}){
 const articles=deps.maxArticlesPerIntent??3,maxHits=deps.maxHitsPerIntent??6,delayMs=deps.delayMs??350,sleep=deps.sleep??((ms:number)=>new Promise<void>(r=>setTimeout(r,ms))),now=deps.now??(()=>new Date().toISOString());
 if(!Number.isInteger(articles)||articles<1||articles>LIVE_HARD_LIMITS.maxArticlesPerIntent||!Number.isInteger(maxHits)||maxHits<1||maxHits>LIVE_HARD_LIMITS.maxHitsPerIntent)throw Error("Invalid live search limits");
 const http=createAllowlistedFetcher(deps.fetcher,{maxRequests:2+articles*2});
 return async function search(target:Readonly<ContextAuditTarget>,intent:"support"|"oppose",signal?:AbortSignal):Promise<ContextAuditSearch>{
  const queries=buildLiveQueries(target.question,deps.extraTerms),query=queries[intent],terms=queries.scoreTerms;
  if(signal?.aborted)throw Error("Search cancelled");
  const response=await http.fetch(searchUrl(query,articles*2),{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(`Europe PMC search HTTP ${response.status}`);
  const body=await response.json() as {resultList?:{result?:unknown[]}};
  if(!Array.isArray(body?.resultList?.result))throw Error("Unexpected Europe PMC response");
  const found=(body.resultList.result as Record<string,unknown>[]).filter(r=>typeof r.pmcid==="string"&&/^PMC[1-9][0-9]{0,11}$/.test(r.pmcid as string)&&r.isOpenAccess==="Y").slice(0,articles);
  const retrievedAt=now(),version=`europepmc-fulltext-${retrievedAt.slice(0,10)}`,hits:ContextAuditHit[]=[];
  let partial=false;
  for(const article of found){
   if(signal?.aborted)throw Error("Search cancelled");
   const pmcid=article.pmcid as string;
   let sections:Awaited<ReturnType<typeof retrieveOpenAccessSections>>;
   try{await sleep(delayMs);sections=await retrieveOpenAccessSections(pmcid,http.fetch)}catch{partial=true;continue}
   const candidates=sections.sections.filter(s=>s.kind==="results"||s.kind==="methods").flatMap(s=>s.paragraphs)
    .map(p=>({p,score:overlap(p.text,terms)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.p.id.localeCompare(b.p.id)).slice(0,2);
   for(const {p} of candidates){
    if(hits.length>=maxHits){partial=true;break}
    const sourceId=`europepmc:${pmcid}`;
    let decision:ClearanceDecision;
    try{decision=await deps.clearance.decide({receipt:null,sourceId,sourceVersion:version,passage:p.text,requiredActions:REQUIRED_ACTIONS})}catch{partial=true;continue}
    const receipt=decision.receipt;
    if(decision.state!=="cleared"||!receipt||!REQUIRED_ACTIONS.every(a=>receipt.permittedActions.includes(a))||receipt.passageSha256!==p.sha256){partial=true;continue}
    hits.push({id:`${pmcid.toLowerCase()}-${p.id.split(":p")[1]}`,clearanceReceiptId:receipt.id,
     source:{id:sourceId,title:typeof article.title==="string"?article.title.slice(0,300):pmcid,kind:"publication",dataClass:"public_real",
      pmid:typeof article.pmid==="string"?article.pmid:null,doi:typeof article.doi==="string"?article.doi:null,url:`https://europepmc.org/article/PMC/${pmcid}`,
      licence:{status:"permitted",identifier:receipt.licenceId,passageUsePermitted:true},
      provenance:{product:"hsi",datasetId:"europepmc-open-access",version,retrievedAt}},
     passage:{id:`${sourceId}:${p.id.split(":")[1]}`,sourceId,sourceVersion:version,text:p.text,locator:p.locator,dataClass:"public_real",sha256:p.sha256}});
   }
  }
  const sourceIds=[...new Set(hits.map(h=>h.source.id))];
  return {intent,status:hits.length===0&&!partial?"successful_empty":partial?"partial":"completed_bounded",queriedAt:retrievedAt,queryHash:sha(query),sourceIds,hits};
 };
}

/** Re-checks clearance immediately before storage: same receipt, same passage digest, all required actions. */
export function createLiveAuthorizePassage(clearance:ClearanceDecider){
 return async function authorizePassage(hit:Readonly<ContextAuditHit>,actions:readonly ["storage","display","comparison","export"]):Promise<boolean>{
  try{
   const d=await clearance.decide({receipt:null,sourceId:hit.source.id,sourceVersion:hit.passage.sourceVersion,passage:hit.passage.text,requiredActions:actions});
   return d.state==="cleared"&&!!d.receipt&&d.receipt.id===hit.clearanceReceiptId&&d.receipt.passageSha256===hit.passage.sha256&&actions.every(a=>d.receipt!.permittedActions.includes(a));
  }catch{return false}
 };
}
