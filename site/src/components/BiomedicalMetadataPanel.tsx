import {useRef,useState} from "react";
import {formatResearchApiError} from "../lib/researchApiErrors";

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
  const requestId=useRef(0);
  async function lookup(){
    if(busy)return;
    const myId=++requestId.current;
    const requestedAccession=accession;
    const requestedStableId=stableId;
    setBusy(true);setState({status:"loading",message:"Requesting public protein and pathway metadata…"});
    try{
      const response=await fetch("/api/research/biomedical-metadata",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({accession:requestedAccession,stableId:requestedStableId}),
      });
      const data:unknown=await response.json();
      if(myId!==requestId.current)return;
      const record=data&&typeof data==="object"&&!Array.isArray(data)?data as Record<string,unknown>:{};
      if(!response.ok||record.ok===false){
        const fallback="Lookup failed. Public provider access may be blocked or unavailable.";
        setState({
          status:"error",
          message:formatResearchApiError(
            response,
            {
              code:typeof record.code==="string"?record.code:undefined,
              error:typeof record.error==="string"?record.error:undefined,
            },
            "scientific_retrieval",
            fallback,
          ),
        });
        return;
      }
      const protein=record.protein&&typeof record.protein==="object"&&!Array.isArray(record.protein)?record.protein as Record<string,unknown>:null;
      const pathway=record.pathway&&typeof record.pathway==="object"&&!Array.isArray(record.pathway)?record.pathway as Record<string,unknown>:null;
      if(
        typeof protein?.accession!=="string"||typeof protein.name!=="string"||typeof protein.url!=="string"||typeof protein.retrievedAt!=="string"||
        typeof pathway?.id!=="string"||typeof pathway.name!=="string"||typeof pathway.url!=="string"||typeof pathway.retrievedAt!=="string"
      ){
        setState({status:"error",message:"Lookup failed. The metadata service returned an invalid response."});
        return;
      }
      setState({status:"success",message:"Metadata retrieved. No mechanism or protein–pathway membership has been verified.",
        protein:{accession:protein.accession,name:protein.name,url:protein.url,retrievedAt:protein.retrievedAt},
        pathway:{id:pathway.id,name:pathway.name,url:pathway.url,retrievedAt:pathway.retrievedAt}});
    }catch{
      if(myId!==requestId.current)return;
      setState({status:"error",message:"Lookup failed. The metadata service may be unavailable."});
    }finally{if(myId===requestId.current)setBusy(false)}
  }
  function onAccessionChange(value:string){
    requestId.current+=1;
    setAccession(value);
    setBusy(false);
    setState({status:"idle",message:"No external requests sent."});
  }
  function onStableIdChange(value:string){
    requestId.current+=1;
    setStableId(value);
    setBusy(false);
    setState({status:"idle",message:"No external requests sent."});
  }
  return <section aria-labelledby="biomedical-metadata-heading" style={{border:"1px solid #aab3c0",borderRadius:12,padding:"1.25rem",marginBottom:24}}>
    <p className="science-body-kicker">PHASE 9.3 · PUBLIC METADATA EXPLORATION</p>
    <h2 id="biomedical-metadata-heading">Explore a protein and a pathway</h2>
    <p>Use public UniProt and Reactome metadata (retrieved through the HSI server) to orient a research question across immunology. This lookup is not an authenticated investigation, does not verify a biological relationship, and does not save to the HSI knowledge graph.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBlock:16}}>
      <label>UniProt accession<br/><input aria-label="UniProt accession" value={accession} onChange={e=>onAccessionChange(e.target.value)} maxLength={20}/></label>
      <label>Reactome stable ID<br/><input aria-label="Reactome stable ID" value={stableId} onChange={e=>onStableIdChange(e.target.value)} maxLength={30}/></label>
      <button type="button" onClick={()=>void lookup()} disabled={busy}>{busy?"Retrieving…":"Retrieve public metadata"}</button>
    </div>
    <p id="biomedical-metadata-status" role="status">{state.message}</p>
    {state.status==="success"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      <article><h3>Protein · {state.protein?.accession}</h3><p>{state.protein?.name}</p><p>Retrieved: {state.protein?.retrievedAt}</p><a href={state.protein?.url} target="_blank" rel="noopener noreferrer">Inspect UniProt source</a></article>
      <article><h3>Pathway · {state.pathway?.id}</h3><p>{state.pathway?.name}</p><p>Retrieved: {state.pathway?.retrievedAt}</p><a href={state.pathway?.url} target="_blank" rel="noopener noreferrer">Inspect Reactome source</a></article>
    </div>}
    <p><strong>Scientific state:</strong> Unreviewed metadata · No inferred membership · No clinical use · No graph promotion</p>
  </section>;
}
