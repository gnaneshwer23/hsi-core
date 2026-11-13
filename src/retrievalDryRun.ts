/**
 * Retrieval-only dry run (SCOUT + AEGIS, no model). It answers one practical question before any model spend: for this
 * question, how much usable, clearable evidence does open-access retrieval actually yield, and how many context fields can
 * even be detected? It sends no text to any model, stores nothing, and its report contains counts, ids and digests only,
 * never passage text. Context-cue detection is a DIAGNOSTIC (keyword presence). It is not extraction, not normalisation
 * and is never used in an audit. Requests go through the same host allow-list and request budget as live search.
 */
import {retrieveOpenAccessSections} from "./researchV2/openAccessSections";
import {buildLiveQueries,createAllowlistedFetcher,planLiveRequests,type ClearanceDecider} from "./liveSearch";
import type {SourceFetcher} from "./researchV2/sourceAdapters";

export const CUES:Readonly<Record<string,RegExp>>=Object.freeze({
 species:/\b(mouse|mice|murine|human|patients?|rats?|zebrafish|pigs?|macaques?|non-human primates?)\b/i,
 experimentalSystem:/\b(in vivo|in vitro|ex vivo|organoids?|cell lines?|primary cells|xenograft|knock-?out|transgenic|cohort)\b/i,
 tissueCompartment:/\b(colon|ileum|intestin\w*|gut|serum|plasma|blood|skin|lung|liver|synovi\w*|spleen|lymph nodes?|tissue)\b/i,
 cellType:/\b(t cells?|b cells?|monocytes?|macrophages?|neutrophils?|fibroblasts?|dendritic cells?|treg|th17|nk cells?|epithelial cells?)\b/i,
 timing:/\b(\d+\s*(days?|weeks?|hours?|months?|h|d|wk)\b|baseline|follow-?up)/i,
 assay:/\b(elisa|flow cytometry|facs|qpcr|rt-pcr|rna-?seq|western blot|immunohistochemistry|mass spectrometry|luminex|single-cell)\b/i,
 sampleSize:/\b(n\s*=\s*\d+|\d+\s+(patients|participants|mice|subjects|samples|donors))\b/i,
});
export type DryRunReport={
 termsRef:string;queries:string[];requestsMade:number;
 intents:{intent:"support"|"oppose";articlesFound:number;openAccessWithPmcid:number;fetched:number;fetchFailed:number;paragraphs:number;candidateParagraphs:number;selected:number}[];
 clearance:{assessed:boolean;outcomes:Record<string,number>};
 cueCoverage:{field:string;selectedWithCue:number;of:number;rate:number|null}[];
 comparableByCuesOnly:{paragraphsWithAllCues:number;of:number};
 note:string;
};
const overlap=(text:string,terms:readonly string[])=>{const t=text.toLowerCase();return terms.reduce((n,x)=>n+(t.includes(x)?1:0),0)};

export async function runRetrievalDryRun(input:{question:string;termsRef:string;fetcher:SourceFetcher;clearance?:ClearanceDecider;extraTerms?:readonly string[];maxArticlesPerIntent?:number;delayMs?:number;sleep?:(ms:number)=>Promise<void>}):Promise<DryRunReport>{
 if(!/^[A-Za-z0-9][A-Za-z0-9:_./-]{2,200}$/.test(input.termsRef))throw Error("A signed source terms reference is required before any retrieval");
 const articles=input.maxArticlesPerIntent??3,sleep=input.sleep??((ms:number)=>new Promise<void>(r=>setTimeout(r,ms))),delayMs=input.delayMs??350;
 const plan=planLiveRequests(input.question,{extraTerms:input.extraTerms,maxArticlesPerIntent:articles});
 const q=buildLiveQueries(input.question,input.extraTerms);
 const http=createAllowlistedFetcher(input.fetcher,{maxRequests:plan.maxRequests});
 const intents:DryRunReport["intents"]=[],outcomes:Record<string,number>={};
 const hits:Record<string,number>=Object.fromEntries(Object.keys(CUES).map(k=>[k,0]));let selectedTotal=0,allCues=0;
 for(const [intent,url] of [["support",plan.requests[0]!.url],["oppose",plan.requests[1]!.url]] as const){
  const row={intent,articlesFound:0,openAccessWithPmcid:0,fetched:0,fetchFailed:0,paragraphs:0,candidateParagraphs:0,selected:0};
  const res=await http.fetch(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw Error(`Europe PMC search HTTP ${res.status}`);
  const body=await res.json() as {resultList?:{result?:Record<string,unknown>[]}};
  const list=body?.resultList?.result;if(!Array.isArray(list))throw Error("Unexpected Europe PMC response");
  row.articlesFound=list.length;
  const oa=list.filter(r=>typeof r.pmcid==="string"&&/^PMC[1-9][0-9]{0,11}$/.test(r.pmcid as string)&&r.isOpenAccess==="Y").slice(0,articles);
  row.openAccessWithPmcid=oa.length;
  for(const article of oa){
   const pmcid=article.pmcid as string;
   try{await sleep(delayMs);const s=await retrieveOpenAccessSections(pmcid,http.fetch);row.fetched++;
    const paras=s.sections.filter(x=>x.kind==="results"||x.kind==="methods").flatMap(x=>x.paragraphs);row.paragraphs+=paras.length;
    const cands=paras.map(p=>({p,score:overlap(p.text,q.scoreTerms)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.p.id.localeCompare(b.p.id));
    row.candidateParagraphs+=cands.length;
    for(const {p} of cands.slice(0,2)){
     row.selected++;selectedTotal++;
     let all=true;for(const [f,re] of Object.entries(CUES)){if(re.test(p.text))hits[f]!++;else all=false}
     if(all)allCues++;
     if(input.clearance){
      try{const d=await input.clearance.decide({receipt:null,sourceId:`europepmc:${pmcid}`,sourceVersion:"dry-run",passage:p.text,requiredActions:["storage","display","comparison","export"]});outcomes[d.state]=(outcomes[d.state]??0)+1}
      catch{outcomes.error=(outcomes.error??0)+1}
     }
    }
   }catch{row.fetchFailed++}
  }
  intents.push(row);
 }
 return {termsRef:input.termsRef,queries:[q.support,q.oppose],requestsMade:http.count(),intents,
  clearance:{assessed:!!input.clearance,outcomes:input.clearance?outcomes:{}},
  cueCoverage:Object.entries(hits).map(([field,n])=>({field,selectedWithCue:n,of:selectedTotal,rate:selectedTotal?n/selectedTotal:null})),
  comparableByCuesOnly:{paragraphsWithAllCues:allCues,of:selectedTotal},
  note:"Counts only; no passage text is stored or printed. Cue detection is diagnostic keyword presence, not extraction. A low all-cue count means most passages will abstain as insufficient_evidence unless the normaliser registry and field policy are developed with a scientist."};
}
