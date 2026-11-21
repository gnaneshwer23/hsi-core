import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RelatedWorksPanel } from "../components/RelatedWorksPanel";
import { formatResearchApiError } from "../lib/researchApiErrors";
import "../styles/science-body.css";

type Publication = {
 id?:string;source?:string;pmid?:string;doi?:string|null;title?:string;authorString?:string|null;
 journalTitle?:string|null;pubYear?:string|null;url?:string;isRetracted?:boolean|null;
};
type Result = {hitCount?:number|null;nextCursorMark?:string|null;records?:Publication[];error?:string;note?:string};
const KNOWN=[
 {pmid:"30760472",label:"Tfh cells / IL-21 / B-cell differentiation"},
 {pmid:"29514998",label:"ICOS+ Tfh-like cells and dermal fibrosis"},
 {pmid:"33175976",label:"Tfh subsets and cohort differences"}
];
const SEARCH_DEBOUNCE_MS=400;
export function ScienceLiterature(){
 const [term,setTerm]=useState("");
 const [search,setSearch]=useState({query:"",cursor:"*"});
 const [records,setRecords]=useState<Publication[]>([]);
 const [total,setTotal]=useState<number|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const [selected,setSelected]=useState<string|null>(null);
 const [next,setNext]=useState<string|null>(null);
 useEffect(()=>{
  const handle=window.setTimeout(()=>{
   const nextQuery=term.trim().slice(0,120);
   setSearch((prev)=>prev.query===nextQuery?prev:{query:nextQuery,cursor:"*"});
  },SEARCH_DEBOUNCE_MS);
  return()=>window.clearTimeout(handle);
 },[term]);
 useEffect(()=>{setSelected(null);},[search.query]);
 useEffect(()=>{
  const controller=new AbortController();
  const run=async()=>{
   setLoading(true);setError("");
   try{
    const p=new URLSearchParams({cursor:search.cursor});
    if(search.query)p.set("term",search.query);
    const response=await fetch(`/api/research/literature-search?${p}`,{signal:controller.signal});
    const data=await response.json() as Result&{code?:string};
    if(!response.ok){
     throw new Error(formatResearchApiError(
      response,
      {code:typeof data.code==="string"?data.code:undefined,error:typeof data.error==="string"?data.error:undefined},
      "scientific_retrieval",
      `Literature service returned HTTP ${response.status}`,
     ));
    }
    if(!Array.isArray(data.records))throw new Error("Literature service returned an invalid response");
    setRecords(data.records);
    setTotal(typeof data.hitCount==="number"?data.hitCount:null);
    setNext(data.nextCursorMark&&data.nextCursorMark!==search.cursor?data.nextCursorMark:null);
   }catch(e){if(!controller.signal.aborted){setRecords([]);setError(e instanceof Error?e.message:"Literature retrieval unavailable");}}
   finally{if(!controller.signal.aborted)setLoading(false);}
  };
  void run();
  return ()=>controller.abort();
 },[search]);
 const selectedRecord=records.find(r=>`${r.source}:${r.id}`===selected);
 return <main className="science-body">
  <header className="science-body-hero"><div className="science-body-wrap">
   <p className="science-body-kicker">HSI / ISI SCIENTIFIC INTELLIGENCE / PRIORITY 01</p>
   <h1>Explore published evidence.<br/><em>Preserve scientific uncertainty.</em></h1>
   <p>Live bibliographic discovery from Europe PMC for systemic sclerosis, retrieved through the HSI server. Publication metadata is not independent verification that a biological claim is true.</p>
   <div className="science-body-actions"><Link to="/science/study-comparison">Compare SSc studies ↗</Link><Link to="/science/graph">Knowledge graph ↗</Link><Link to="/science/contradictions">Contradictions ↗</Link></div>
  </div></header>
  <section className="science-body-wrap" style={{paddingBlock:"3rem"}}>
   <h2>Systemic sclerosis literature</h2>
   <p>Scope: Tfh cells, IL-21, B cells and fibrosis. Search results are public literature candidates only; no patient records or approved graph writes.</p>
   <form onSubmit={e=>e.preventDefault()} style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBlock:"1.25rem"}}>
    <label htmlFor="ssc-search">Refine within SSc scope</label>
    <input id="ssc-search" type="search" value={term} onChange={e=>setTerm(e.target.value)} maxLength={120} placeholder="e.g. plasmablast" style={{flex:"1 1 15rem",padding:"0.75rem"}}/>
    <button type="button" onClick={()=>{setTerm("");setSearch({query:"",cursor:"*"});setSelected(null);}}>Reset</button>
   </form>
   <p role="status" aria-live="polite">{loading?"Retrieving literature…":error?"Retrieval unavailable":`${total??0} matching records · ${records.length} displayed`}</p>
   {error&&<p role="alert">{error}. No claims can be verified while retrieval is unavailable.</p>}
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,19rem),1fr))",gap:"1rem",marginBlock:"1.5rem"}}>
    {records.map((r,i)=><article key={`${r.source}:${r.id}:${i}`} style={{border:"1px solid #c7cbd2",borderRadius:"0.75rem",padding:"1.25rem"}}>
     <p className="science-body-kicker">EUROPE PMC · UNREVIEWED{r.isRetracted===true?" · RETRACTION FLAGGED":""}</p>
     <h3>{r.title||"Untitled record"}</h3>
     <p>{r.authorString||"Authors unavailable"} · {r.journalTitle||"Journal unavailable"} · {r.pubYear||"Year unknown"}</p>
     <p>PMID: {r.pmid||"Not available"} · DOI: {r.doi||"Not available"}</p>
     {r.url&&<a href={r.url} target="_blank" rel="noreferrer">Open publication record ↗</a>}
     <div><button type="button" onClick={()=>setSelected(selected===`${r.source}:${r.id}`?null:`${r.source}:${r.id}`)} aria-expanded={selected===`${r.source}:${r.id}`}>View evidence dossier</button></div>
    </article>)}
   </div>
   {selectedRecord&&<section aria-label="Publication evidence dossier" style={{border:"1px solid #aab3c0",padding:"1.5rem",borderRadius:"0.75rem",marginBottom:"1.5rem"}}>
    <p className="science-body-kicker">PUBLICATION DOSSIER · NOT SCIENTIFICALLY APPROVED</p>
    <h2>{selectedRecord.title}</h2>
    <p><strong>Source:</strong> Europe PMC · <strong>PMID:</strong> {selectedRecord.pmid||"Missing"} · <strong>DOI:</strong> {selectedRecord.doi||"Missing"}</p>
    <h3>Bibliographic metadata</h3>
    <p>This page returns identifiers and citation fields only. Open the publication record for the abstract and full text. Abstracts are not proxied through the browser.</p>
    {selectedRecord.url&&<p><a href={selectedRecord.url} target="_blank" rel="noreferrer">Open publication record ↗</a></p>}
    <h3>Assessment status</h3><p>Identifier: metadata retrieved, not independently verified. Claim support: unassessed. Contradiction status: not adjudicated. Human review: pending. Graph promotion: prohibited.</p>
    {(selectedRecord.doi||selectedRecord.pmid)&&<RelatedWorksPanel doi={selectedRecord.doi} pmid={selectedRecord.pmid} autoLoad/>}
   </section>}
   {next&&!loading&&!error&&<button type="button" onClick={()=>{setSearch((prev)=>({...prev,cursor:next}));setSelected(null);}}>Next 20 publications</button>}
   <h2 style={{marginTop:"3rem"}}>Existing SSc curation candidates</h2>
   <p>These identifiers are already referenced by draft HSI curation work. Their study-specific claims require source checking and independent scientific review.</p>
   <ul>{KNOWN.map(k=><li key={k.pmid}><a href={`https://pubmed.ncbi.nlm.nih.gov/${k.pmid}/`} target="_blank" rel="noreferrer">PMID {k.pmid}</a> — {k.label} · Unreviewed candidate</li>)}</ul>
   <p className="science-body-review">Research use only. Bibliographic retrieval is not a clinical recommendation, evidence endorsement or approval to publish graph relationships.</p>
  </section>
 </main>;
}
