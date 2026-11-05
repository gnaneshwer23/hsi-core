import {useEffect,useState} from "react";
import type {ReviewPackage} from "../../../src/investigationDelivery";
import {assistanceFromReviewPackage,deterministicAssistance,ASSISTANCE_LIMITATIONS,ASSISTANCE_METHOD,type AssistanceInput,type AssistanceOutput} from "../../../src/scientificEvaluation";
const digest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,"0")).join("");
/** No new request, external model, local storage, or independent authority claim. */
export function SourceGroundedBaseline({evidencePackage}:{evidencePackage:ReviewPackage}){
 const [state,setState]=useState<{input:AssistanceInput;output:AssistanceOutput}|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;setState(null);setFailed(false);assistanceFromReviewPackage(evidencePackage,digest).then(input=>{if(active)setState({input,output:deterministicAssistance(input)})}).catch(()=>{if(active)setFailed(true)});return()=>{active=false}},[evidencePackage]);
 return <section className="source-grounded-baseline" aria-label="Source-grounded baseline"><h3>Source-grounded baseline</h3><p>Inspect exact source statements and excerpts from the verified primary release. This deterministic view is the reference for evaluating future AI assistance.</p>
 {failed?<p role="alert">The source context could not be verified. No assistance is shown.</p>:!state?<p role="status">Verifying source selections…</p>:<>
 <p><strong>{state.output.outcome==="abstain"?"Insufficient matching source context":state.output.outcome==="conflicting_sources"?"Conflicting source observations":"Matching source observations"}</strong> · Human research context · Method: <code>{ASSISTANCE_METHOD}</code></p>
 {state.output.outcome==="abstain"&&<p>No eligible human evidence selections are available for this view. Inspect the full graph for other experimental contexts.</p>}
 {state.output.selections.map(s=>{const e=state.input.evidence.find(e=>e.claimId===s.claimId&&e.passageId===s.passageId)!;return <article key={s.claimId+":"+s.passageId}><h4>{s.statement}</h4><blockquote>{s.quote}</blockquote><p>{e.sourceId} · {e.locator} · {e.disease.replaceAll("_"," ")} · {e.species}</p><details><summary>Inspect citation binding</summary><p>Claim: <code>{s.claimId}</code><br/>Passage: <code>{s.passageId}</code><br/>Source version: <code>{e.sourceVersion}</code><br/>Passage SHA-256: <code>{s.passageHash}</code></p></details></article>})}
 <ul>{ASSISTANCE_LIMITATIONS.map(l=><li key={l}>{l}</li>)}</ul><p>Model assistance remains disabled pending independent scientific evaluation. This view does not change the investigation, evidence grades or reviewer decisions.</p>
 </>}
 </section>;
}
