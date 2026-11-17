import {useEffect,useState} from "react";
import {HowProducedPanel} from "./HowProducedPanel";
import type {RelatedWorksResult} from "../../../src/evidence/openAlexRelatedWorks";

type RelatedPayload={
 status:RelatedWorksResult["status"];
 error:string|null;
 note:string;
 seed:{title:string;sourceId:string;url:string;doi:string|null;pmid:string|null}|null;
 related:RelatedWorksResult["related"];
 unresolvedRelatedIds?:string[];
};

function seedFromIds(doi?:string|null,pmid?:string|null,openalexSourceId?:string|null):string|null{
 if(openalexSourceId&&/^openalex:W\d{1,15}$/.test(openalexSourceId))return openalexSourceId;
 if(doi&&/^10\.\d{4,9}\/\S{1,180}$/.test(doi))return`doi:${doi}`;
 if(pmid&&/^\d{1,9}$/.test(pmid))return`pmid:${pmid}`;
 return null;
}

/** Connected Papers–style neighbour list from OpenAlex related_works. Server-only; metadata only. */
export function RelatedWorksPanel({
 doi,pmid,openalexSourceId,autoLoad=false,className,
}:{doi?:string|null;pmid?:string|null;openalexSourceId?:string|null;autoLoad?:boolean;className?:string}){
 const preset=seedFromIds(doi,pmid,openalexSourceId);
 const [seed,setSeed]=useState(preset??"");
 const [data,setData]=useState<RelatedPayload|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 useEffect(()=>{if(preset)setSeed(preset);},[preset]);
 useEffect(()=>{
  if(!autoLoad||!preset)return;
  const controller=new AbortController();
  const trimmed=preset.trim();
  setLoading(true);setError("");setData(null);
  void(async()=>{
   try{
    const response=await fetch("/api/research/related-works",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({seed:trimmed,limit:12}),
     signal:controller.signal,
    });
    const body=await response.json() as RelatedPayload&{error?:string};
    if(controller.signal.aborted)return;
    if(response.status===404){setData(body);setError(body.error||"Seed work not found in OpenAlex");return;}
    if(!response.ok)throw new Error(body.error||`Related works service returned HTTP ${response.status}`);
    setData(body);
   }catch(e){
    if(controller.signal.aborted)return;
    setError(e instanceof Error?e.message:"Related works retrieval unavailable");
   }finally{
    if(!controller.signal.aborted)setLoading(false);
   }
  })();
  return()=>controller.abort();
 },[autoLoad,preset]);

 async function load(nextSeed:string){
  const trimmed=nextSeed.trim();
  if(!trimmed){setError("Enter a DOI, PMID, or OpenAlex work id.");return;}
  setLoading(true);setError("");setData(null);
  try{
   const response=await fetch("/api/research/related-works",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({seed:trimmed,limit:12}),
   });
   const body=await response.json() as RelatedPayload&{error?:string};
   if(response.status===404){setData(body);setError(body.error||"Seed work not found in OpenAlex");return;}
   if(!response.ok)throw new Error(body.error||`Related works service returned HTTP ${response.status}`);
   setData(body);
  }catch(e){
   setError(e instanceof Error?e.message:"Related works retrieval unavailable");
  }finally{
   setLoading(false);
  }
 }

 return(
  <section className={className} aria-label="Related works from OpenAlex" style={{marginTop:"1rem"}}>
   <h3>Related works</h3>
   <p className="rh-note">OpenAlex related_works neighbours — not an HSI co-citation graph or claim support. Metadata only.</p>
   <form onSubmit={e=>{e.preventDefault();void load(seed);}} style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBlock:"0.75rem"}}>
    <label htmlFor="related-works-seed">Seed paper</label>
    <input id="related-works-seed" type="text" value={seed} onChange={e=>setSeed(e.target.value)} maxLength={220} placeholder="doi:10.… · pmid:… · openalex:W…" style={{flex:"1 1 14rem",padding:"0.6rem"}}/>
    <button type="submit" disabled={loading}>{loading?"Looking up…":"Find related"}</button>
   </form>
   <p role="status" aria-live="polite">{loading?"Retrieving related works…":error?error:data?`${data.related.length} related work${data.related.length===1?"":"s"}`:""}</p>
   {data?.seed&&<p className="rh-note">Seed: <a href={data.seed.url} target="_blank" rel="noreferrer noopener">{data.seed.title}</a>{data.seed.doi?` · DOI ${data.seed.doi}`:""}{data.seed.pmid?` · PMID ${data.seed.pmid}`:""}</p>}
   {data&&data.related.length>0&&(
    <ul className="rh-plist">
     {data.related.map(p=>(
      <li key={p.sourceId}>
       <a href={p.url} target="_blank" rel="noreferrer noopener">{p.title}</a>
       <span>
        {p.journal??"journal not given"} · {p.date??"date not given"}
        {p.citedBy!==null?` · cited by ${p.citedBy}`:""}
        {p.preprint?" · preprint":""}
        {p.retraction==="flagged"?" · flagged retracted":""}
        {p.doi?` · DOI ${p.doi}`:p.pmid?` · PMID ${p.pmid}`:""}
       </span>
      </li>
     ))}
    </ul>
   )}
   {data&&data.related.length===0&&!loading&&!error&&<p className="rh-note">OpenAlex listed no resolvable related works for this seed.</p>}
   {data?.note&&<p className="rh-note">{data.note}</p>}
   {data&&(
    <HowProducedPanel
     source={{
      kind:"related-works",
      run:{
       schemaVersion:"hsi-related-works-1",
       status:data.status,
       error:data.error,
       seed:data.seed?{...data.seed,date:null,journal:null,citedBy:null,retraction:"unknown",preprint:false,relatedWorkIds:[]}:null,
       related:data.related.map(r=>({...r,relation:"openalex_related_works" as const})),
       unresolvedRelatedIds:data.unresolvedRelatedIds??[],
       note:data.note,
      },
     }}
    />
   )}
  </section>
 );
}
