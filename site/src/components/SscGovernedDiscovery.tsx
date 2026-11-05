import {useEffect,useState} from "react";
type Candidate={id:string;kind:string;relationshipIds:string[];sourceEvidenceIds:string[];explanation:string;reviewState:string};
type Dossier={schemaVersion:string;disease:string;scope:string;candidateCount:number;relationshipCount:number;candidates:Candidate[];readOnly:boolean;graphPromotable:boolean};
export function SscGovernedDiscovery({nodeId}:{nodeId:string|null}){
 const [data,setData]=useState<Dossier|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false),[requested,setRequested]=useState<string|null>(null),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{setData(null);setError("");setRequested(null);setSelected(null)},[nodeId]);
 async function investigate(){if(!nodeId)return;setLoading(true);setError("");setData(null);setRequested(nodeId);try{
 const r=await fetch("/api/research/discovery/ssc?node="+encodeURIComponent(nodeId),{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
 if(!r.ok)throw Error(r.status===401?"Verified researcher sign-in required":r.status===403?"Research permission denied":"Research discovery service unavailable");
 const x:Dossier=await r.json();
 if(x.schemaVersion!=="hsi-governed-discovery-1"||x.scope!=="governed_research"||x.disease!=="systemic_sclerosis"||x.readOnly!==true||x.graphPromotable!==false||!Array.isArray(x.candidates)||x.candidates.length>1000)throw Error("Unexpected scientific discovery response");
 setData(x);
 }catch(e){setError(e instanceof Error?e.message:"Discovery unavailable")}finally{setLoading(false)}}
 const candidate=data?.candidates.find(c=>c.id===selected);
 return <section aria-label="Authenticated SSc discovery investigation" style={{padding:20,border:"1px solid #aab3c0",borderRadius:12,marginBlock:24}}>
 <h2>Scientific discovery · governed SSc investigation</h2><p>Run a read-only evidence-gap and opposing-predicate screen on the authorised Neon graph neighbourhood. Candidate tensions are not confirmed contradictions. No AI-generated hypothesis is scientifically approved.</p>
 <button type="button" disabled={!nodeId||loading} onClick={investigate}>{loading?"Screening evidence…":"Investigate selected SSc concept"}</button>
 <p role="status">{error||(!nodeId?"Select a research concept first.":data?data.relationshipCount+" graph relationships screened · "+data.candidateCount+" candidates require review":requested?"No result available":"Sign in to run governed discovery.")}</p>
 {data&&<><h3>Evidence gaps and contextual tensions</h3>{data.candidates.length===0&&<p>No automated candidate gaps detected. This does not constitute evidence validation.</p>}
 {data.candidates.map(c=><article key={c.id} style={{borderTop:"1px solid #aab3c0",paddingBlock:12}}><h4>{c.kind.replaceAll("_"," ")}</h4><p>{c.explanation}</p><p>Relationship IDs: {c.relationshipIds.join(", ")}</p><p>Source identifiers: {c.sourceEvidenceIds.length?c.sourceEvidenceIds.join(", "):"Missing"}</p><button type="button" onClick={()=>setSelected(selected===c.id?null:c.id)} aria-expanded={selected===c.id}>{selected===c.id?"Close":"Prepare supervised hypothesis question"}</button></article>)}
 {candidate&&<section aria-label="Supervised hypothesis preparation" style={{padding:16,background:"#f4f7f8",color:"#183e3b",borderRadius:10}}><h3>Research question · draft only</h3><p>What independent experiments or source-level checks could resolve the following candidate: {candidate.explanation}</p><p><strong>Required:</strong> compare disease stage, tissue, model, assay and source provenance; specify falsifiable alternatives and negative controls. Review the underlying publications before proposing a mechanistic claim.</p><p>Evidence IDs: {candidate.sourceEvidenceIds.join(", ")||"Not available"}</p><p><strong>Review status:</strong> preparation only. Not submitted, persisted, approved or published.</p></section>}</>}
 </section>;
}
