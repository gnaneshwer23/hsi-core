import {useState} from "react";
type WorkbenchResult={schemaVersion:"hsi-workbench-1";focusNodeId:string;readOnly:true;nodes:{id:string;label:string;kind:string;layer:string}[];relationships:{id:string;subjectId:string;predicate:string;objectId:string;epistemicType:string;reviewState:string;evidenceAssessment:string;warnings:string[]}[];qa:{total:number;reviewed:number;contested:number;missingDossiers:number;warnings:string[]}};
/** Optional authenticated research surface. No local catalogue is represented as governed data.
 * Backend endpoint is intentionally disabled unless explicitly configured.
 */
export function GovernedResearchPanel({focusNodeId,endpoint}:{focusNodeId:string;endpoint?:string}){
 const [result,setResult]=useState<WorkbenchResult|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [loading,setLoading]=useState(false);
 async function load(){
  if(!endpoint)return;
  setLoading(true);setError(null);setResult(null);
  try{
   const url=new URL(endpoint,window.location.origin);
   if(url.origin!==window.location.origin||url.pathname!=="/api/research/graph-workbench")throw Error("Research endpoint configuration rejected");
   url.searchParams.set("focusNodeId",focusNodeId);
   const response=await fetch(url.toString(),{credentials:"same-origin",headers:{Accept:"application/json"},cache:"no-store"});
   if(!response.ok)throw Error(response.status===401||response.status===403?"Research authorisation required":"Governed research data unavailable");
   const data:unknown=await response.json();
   if(!data||typeof data!=="object"||!("schemaVersion" in data)||data.schemaVersion!=="hsi-workbench-1"||!("readOnly" in data)||data.readOnly!==true||!("focusNodeId" in data)||data.focusNodeId!==focusNodeId||!("relationships" in data)||!Array.isArray(data.relationships)||!("qa" in data)||!data.qa||typeof data.qa!=="object")throw Error("Invalid governed research response");
   setResult(data as WorkbenchResult);
  }catch(e){setError(e instanceof Error?e.message:"Research data unavailable");}
  finally{setLoading(false)}
 }
 return <section aria-label="Governed research workbench" className="science-graph-dossier">
  <h3>Governed research evidence</h3>
  {!endpoint?<p>Authenticated scientific graph service is not connected. The graph above remains an unreviewed educational catalogue.</p>:<>
   <p>Restricted to authorised researchers. This view does not contain patient records.</p>
   <button type="button" disabled={loading} onClick={load}>{loading?"Loading evidence…":"Load governed evidence"}</button>
   {error&&<p role="alert">{error}</p>}
   {result&&<div aria-live="polite"><p>{result.qa.total} relationships · {result.qa.reviewed} reviewed · {result.qa.contested} contested · {result.qa.missingDossiers} missing dossiers</p>
    {result.relationships.map(e=><article key={e.id}><strong>{e.subjectId} — {e.predicate} — {e.objectId}</strong><p>{e.epistemicType} · {e.reviewState} · evidence: {e.evidenceAssessment}</p>{e.warnings.map((w,i)=><p key={i}>{w}</p>)}</article>)}
   </div>}
  </>}
 </section>;
}
