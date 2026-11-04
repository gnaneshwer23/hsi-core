import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/science-body.css";

type Publication = {
 id?:string;source?:string;pmid?:string;doi?:string;title?:string;authorString?:string;
 journalTitle?:string;pubYear?:string;abstractText?:string;
};
type Result = {hitCount?:number;nextCursorMark?:string;resultList?:{result?:Publication[]}};
const QUERY='("systemic sclerosis" OR scleroderma) AND ("T follicular helper" OR Tfh OR "IL-21" OR "B cell" OR fibrosis)';
const KNOWN=[
 {pmid:"30760472",label:"Tfh cells / IL-21 / B-cell differentiation"},
 {pmid:"29514998",label:"ICOS+ Tfh-like cells and dermal fibrosis"},
 {pmid:"33175976",label:"Tfh subsets and cohort differences"}
];
export function ScienceLiterature(){
 const [term,setTerm]=useState("");
 const [records,setRecords]=useState<Publication[]>([]);
 const [total,setTotal]=useState<number|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const [selected,setSelected]=useState<string|null>(null);
 const [cursor,setCursor]=useState("*");
 const [next,setNext]=useState<string|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  const run=async()=>{
   setLoading(true);setError("");
   try{
    const query=term.trim()? `(${QUERY}) AND (${term.trim().slice(0,120).replace(/[()]/g," ")})`:QUERY;
    const p=new URLSearchParams({query,format:"json",resultType:"core",pageSize:"20",cursorMark:cursor});
    const response=await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${p}`,{signal:controller.signal});
    if(!response.ok)throw new Error(`Europe PMC returned HTTP ${response.status}`);
    const data=await response.json() as Result;
    if(!Array.isArray(data.resultList?.result))throw new Error("Literature service returned an invalid response");
    setRecords(data.resultList.result);
    setTotal(typeof data.hitCount==="number"?data.hitCount:null);
    setNext(data.nextCursorMark&&data.nextCursorMark!==cursor?data.nextCursorMark:null);
   }catch(e){if(!controller.signal.aborted){setRecords([]);setError(e instanceof Error?e.message:"Literature retrieval unavailable");}}
   finally{if(!controller.signal.aborted)setLoading(false);}
  };
  void run();
  return ()=>controller.abort();
 },[term,cursor]);
 const selectedRecord=records.find(r=>`${r.source}:${r.id}`===selected);
 return <main className="science-body">
  <header className="science-body-hero"><div className="science-body-wrap">
   <p className="science-body-kicker">HSI / ISI SCIENTIFIC INTELLIGENCE / PRIORITY 01</p>
   <h1>Explore published evidence.<br/><em>Preserve scientific uncertainty.</em></h1>
   <p>Live bibliographic discovery from Europe PMC for systemic sclerosis. Publication metadata and abstracts are not independent verification that a biological claim is true.</p>
   <div className="science-body-actions"><Link to="/science/graph">Knowledge graph ↗</Link><Link to="/science/contradictions">Contradictions ↗</Link></div>
  </div></header>
  <section className="science-body-wrap" style={{paddingBlock:"3rem"}}>
   <h2>Systemic sclerosis literature</h2>
   <p>Scope: Tfh cells, IL-21, B cells and fibrosis. Search results are public literature candidates only; no patient records or approved graph writes.</p>
   <form onSubmit={e=>e.preventDefault()} style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBlock:"1.25rem"}}>
    <label htmlFor="ssc-search">Refine within SSc scope</label>
    <input id="ssc-search" type="search" value={term} onChange={e=>{setTerm(e.target.value);setCursor("*");setSelected(null);}} maxLength={120} placeholder="e.g. plasmablast" style={{flex:"1 1 15rem",padding:"0.75rem"}}/>
    <button type="button" onClick={()=>{setTerm("");setCursor("*");}}>Reset</button>
   </form>
   <p role="status" aria-live="polite">{loading?"Retrieving literature…":error?"Retrieval unavailable":`${total??0} matching records · ${records.length} displayed`}</p>
   {error&&<p role="alert">{error}. No claims can be verified while retrieval is unavailable.</p>}
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,19rem),1fr))",gap:"1rem",marginBlock:"1.5rem"}}>
    {records.map((r,i)=><article key={`${r.source}:${r.id}:${i}`} style={{border:"1px solid #c7cbd2",borderRadius:"0.75rem",padding:"1.25rem"}}>
     <p className="science-body-kicker">EUROPE PMC · UNREVIEWED</p>
     <h3>{r.title||"Untitled record"}</h3>
     <p>{r.authorString||"Authors unavailable"} · {r.journalTitle||"Journal unavailable"} · {r.pubYear||"Year unknown"}</p>
     <p>PMID: {r.pmid||"Not available"} · DOI: {r.doi||"Not available"}</p>
     {r.source&&r.id&&<a href={`https://europepmc.org/article/${encodeURIComponent(r.source)}/${encodeURIComponent(r.id)}`} target="_blank" rel="noreferrer">Open publication record ↗</a>}
     <div><button type="button" onClick={()=>setSelected(selected===`${r.source}:${r.id}`?null:`${r.source}:${r.id}`)} aria-expanded={selected===`${r.source}:${r.id}`}>View evidence dossier</button></div>
    </article>)}
   </div>
   {selectedRecord&&<section aria-label="Publication evidence dossier" style={{border:"1px solid #aab3c0",padding:"1.5rem",borderRadius:"0.75rem",marginBottom:"1.5rem"}}>
    <p className="science-body-kicker">PUBLICATION DOSSIER · NOT SCIENTIFICALLY APPROVED</p>
    <h2>{selectedRecord.title}</h2>
    <p><strong>Source:</strong> Europe PMC · <strong>PMID:</strong> {selectedRecord.pmid||"Missing"} · <strong>DOI:</strong> {selectedRecord.doi||"Missing"}</p>
    <h3>Source abstract (unreviewed)</h3><p>{selectedRecord.abstractText?.replace(/<[^>]*>/g," ")||"No abstract supplied by source."}</p>
    <h3>Assessment status</h3><p>Identifier: metadata retrieved, not independently verified. Claim support: unassessed. Contradiction status: not adjudicated. Human review: pending. Graph promotion: prohibited.</p>
   </section>}
   {next&&!loading&&!error&&<button type="button" onClick={()=>{setCursor(next);setSelected(null);}}>Next 20 publications</button>}
   <h2 style={{marginTop:"3rem"}}>Existing SSc curation candidates</h2>
   <p>These identifiers are already referenced by draft HSI curation work. Their study-specific claims require source checking and independent scientific review.</p>
   <ul>{KNOWN.map(k=><li key={k.pmid}><a href={`https://pubmed.ncbi.nlm.nih.gov/${k.pmid}/`} target="_blank" rel="noreferrer">PMID {k.pmid}</a> — {k.label} · Unreviewed candidate</li>)}</ul>
   <p className="science-body-review">Research use only. Bibliographic retrieval is not a clinical recommendation, evidence endorsement or approval to publish graph relationships.</p>
  </section>
 </main>;
}
