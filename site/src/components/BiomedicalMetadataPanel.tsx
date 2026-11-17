import {useState} from "react";

type LookupState={status:"idle"|"loading"|"success"|"error";message:string;
  protein?:{accession:string;name:string;url:string;retrievedAt:string};
  pathway?:{id:string;name:string;url:string;retrievedAt:string}};

/** Opt-in public metadata lookup via the HSI server. Never stores records or submits
 * scientific evidence. Does not call UniProt or Reactome from the browser (ING-01). */
export function BiomedicalMetadataPanel(){
  const [accession,setAccession]=useState("P01375");
  const [stableId,setStableId]=useState("R-HSA-199420");
  const [state,setState]=useState<LookupState>({status:"idle",message:"No external requests sent."});
  const [busy,setBusy]=useState(false);
  async function lookup(){
    if(busy)return;
    setBusy(true);setState({status:"loading",message:"Requesting public protein and pathway metadata…"});
    try{
      const response=await fetch("/api/research/biomedical-metadata",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({accession,stableId}),
      });
      const data:any=await response.json();
      if(!response.ok||data?.ok===false){
        setState({status:"error",message:typeof data?.error==="string"?data.error:"Lookup failed. Public provider access may be blocked or unavailable."});
        return;
      }
      setState({status:"success",message:"Metadata retrieved. No mechanism or protein–pathway membership has been verified.",
        protein:data.protein,pathway:data.pathway});
    }catch{
      setState({status:"error",message:"Lookup failed. The metadata service may be unavailable."});
    }finally{setBusy(false)}
  }
  return <section aria-labelledby="biomedical-metadata-heading" style={{border:"1px solid #aab3c0",borderRadius:12,padding:"1.25rem",marginBottom:24}}>
    <p className="science-body-kicker">PHASE 9.3 · PUBLIC METADATA EXPLORATION</p>
    <h2 id="biomedical-metadata-heading">Explore a protein and a pathway</h2>
    <p>Use public UniProt and Reactome metadata (retrieved through the HSI server) to orient a research question across immunology. This lookup is not an authenticated investigation, does not verify a biological relationship, and does not save to the HSI knowledge graph.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBlock:16}}>
      <label>UniProt accession<br/><input aria-label="UniProt accession" value={accession} onChange={e=>setAccession(e.target.value)} maxLength={20}/></label>
      <label>Reactome stable ID<br/><input aria-label="Reactome stable ID" value={stableId} onChange={e=>setStableId(e.target.value)} maxLength={30}/></label>
      <button type="button" onClick={()=>void lookup()} disabled={busy}>{busy?"Retrieving…":"Retrieve public metadata"}</button>
    </div>
    <p role="status">{state.message}</p>
    {state.status==="success"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      <article><h3>Protein · {state.protein?.accession}</h3><p>{state.protein?.name}</p><p>Retrieved: {state.protein?.retrievedAt}</p><a href={state.protein?.url} target="_blank" rel="noopener noreferrer">Inspect UniProt source</a></article>
      <article><h3>Pathway · {state.pathway?.id}</h3><p>{state.pathway?.name}</p><p>Retrieved: {state.pathway?.retrievedAt}</p><a href={state.pathway?.url} target="_blank" rel="noopener noreferrer">Inspect Reactome source</a></article>
    </div>}
    <p><strong>Scientific state:</strong> Unreviewed metadata · No inferred membership · No clinical use · No graph promotion</p>
  </section>;
}
