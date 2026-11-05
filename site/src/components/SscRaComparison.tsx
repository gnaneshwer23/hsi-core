import {useState} from "react";
type Row={relationshipId:string;subjectId:string;predicate:string;objectId:string;studyContext:string;sourceEvidenceIds:string[];reviewState:string;epistemicType:string};
type Result={schemaVersion:string;scope:string;graphPromotable:boolean;readOnly:boolean;ssc:Row[];ra:Row[];sharedMechanismCandidates:Array<{subjectId:string;predicate:string;objectId:string;sscRelationshipIds:string[];raRelationshipIds:string[]}>;unresolved:string[]};
export function SscRaComparison({sscNodeId}:{sscNodeId:string|null}){
 const [raNode,setRaNode]=useState(""),[result,setResult]=useState<Result|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function compare(){if(!sscNodeId)return;setBusy(true);setResult(null);setError("");try{
 const url="/api/research/comparison/ssc-ra?sscNode="+encodeURIComponent(sscNodeId)+"&raNode="+encodeURIComponent(raNode.trim());
 const response=await fetch(url,{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
 if(!response.ok)throw Error(response.status===401?"Verified researcher sign-in required":response.status===403?"Research access denied or graph unavailable":"Comparison service unavailable");
 const data:Result=await response.json();
 if(data.schemaVersion!=="hsi-disease-comparison-1"||data.scope!=="governed_research"||data.graphPromotable!==false||data.readOnly!==true||!Array.isArray(data.ssc)||!Array.isArray(data.ra)||!Array.isArray(data.sharedMechanismCandidates))throw Error("Invalid governed comparison response");
 setResult(data);
 }catch(e){setError(e instanceof Error?e.message:"Comparison unavailable")}finally{setBusy(false)}}
 return <section aria-label="Governed systemic sclerosis rheumatoid arthritis comparison" style={{padding:20,border:"1px solid #aab3c0",borderRadius:12,marginBlock:24}}>
 <h2>Cross-disease investigation · SSc versus RA</h2><p>Compare two independently sourced, authorised graph neighbourhoods. RA relationships must explicitly identify RA study context and source evidence. Shared relationships are not proof of equivalent biology.</p>
 <p>SSc focus: <strong>{sscNodeId??"Select an SSc concept above"}</strong></p>
 <label>RA graph concept ID <input value={raNode} onChange={e=>setRaNode(e.target.value)} placeholder="Enter a verified RA graph node ID" style={{padding:10,maxWidth:"100%"}}/></label>{" "}
 <button type="button" disabled={!sscNodeId||!/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(raNode)||busy} onClick={compare}>{busy?"Comparing…":"Compare governed evidence"}</button>
 {error&&<p role="alert">{error}</p>}
 {result&&<><p role="status">{result.ssc.length} source-linked SSc relationships · {result.ra.length} source-linked RA relationships · {result.sharedMechanismCandidates.length} shared candidate predicates</p>
 <h3>Candidate shared mechanisms</h3>{result.sharedMechanismCandidates.length===0?<p>No shared source-supported candidates detected. This may reflect incomplete graph coverage, not a biological absence.</p>:result.sharedMechanismCandidates.map((r,i)=><article key={i} style={{paddingBlock:10,borderTop:"1px solid #aab3c0"}}><strong>{r.subjectId} → {r.predicate} → {r.objectId}</strong><p>SSc: {r.sscRelationshipIds.join(", ")} · RA: {r.raRelationshipIds.join(", ")}</p><small>Unvalidated comparison candidate · independent scientific review required</small></article>)}
 <h3>Disease-specific evidence records</h3>{(["ssc","ra"] as const).map(k=><section key={k}><h4>{k==="ssc"?"Systemic sclerosis":"Rheumatoid arthritis"}</h4>{result[k].length?result[k].map(e=><p key={e.relationshipId}>{e.subjectId} → {e.predicate} → {e.objectId} · {e.reviewState} · {e.studyContext} · sources: {e.sourceEvidenceIds.join(", ")}</p>):<p>No eligible source-linked {k.toUpperCase()} evidence returned.</p>}</section>)}
 <h3>Unresolved scientific checks</h3><ul>{result.unresolved.map((x,i)=><li key={i}>{x}</li>)}</ul><p><strong>Read-only:</strong> no cross-disease inference, clinical advice, graph write or scientific approval.</p></>}
 </section>;
}
