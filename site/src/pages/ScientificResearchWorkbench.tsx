import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import "../styles/science-body.css";
import {investigateDiscoveryCandidates} from "../features/science/discoveryInvestigation";
import {projectMechanismTraces} from "../features/science/mechanismTrace";
import {ResearchEvidenceQueue,validateScientificVerification,type ScientificVerification} from "../components/ResearchEvidenceQueue";
import {InvestigationWorkspace} from "../components/InvestigationWorkspace";
import {SscGovernedDiscovery} from "../components/SscGovernedDiscovery";
type Node={id:string;preferredLabel:string;kind:string};
type Edge={id:string;subjectId:string;objectId:string;predicate:string;reviewState:string;sourceEvidenceIds:string[];context:{studyContext?:string;limitations?:string;sourceLocator?:string}};
type Draft={release:{id:string;version:string;graphPromotable:boolean};provenance:{reviewedByHuman:boolean;rightsCleared:boolean};nodes:Node[];relationships:Edge[]};
type Verification=ScientificVerification;
type GovernedPage={scope:string;limit:number;nodes:Array<{id:string;preferredLabel:string;kind:string;reviewState:string}>;relationships:Array<{id:string;subjectId:string;objectId:string;predicate:string;reviewState:string;epistemicType:string;sourceEvidenceIds:string[];context:Record<string,string>}>};
export function ScientificResearchWorkbench(){
 const [graph,setGraph]=useState<Draft|null>(null),[verification,setVerification]=useState<Verification|null>(null);
 const [governed,setGoverned]=useState<GovernedPage|null>(null),[governedLoading,setGovernedLoading]=useState(false),[governedError,setGovernedError]=useState("");
 const [error,setError]=useState(""),[query,setQuery]=useState(""),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{const c=new AbortController();Promise.all([
  fetch("/research/ssc-tfh-il21-graph-draft.v1.json",{signal:c.signal,cache:"no-store"}),
  fetch("/research/ssc-tfh-il21-abstract-verification.v1.json",{signal:c.signal,cache:"no-store"})
 ]).then(async ([a,b])=>{if(!a.ok||!b.ok)throw Error("Research sources unavailable");return Promise.all([a.json(),b.json()])})
 .then(([g,v]:[Draft,Verification])=>{validateScientificVerification(v);if(g.release.graphPromotable!==false||g.provenance.reviewedByHuman!==false||g.provenance.rightsCleared!==false||!Array.isArray(g.nodes)||!Array.isArray(g.relationships))throw Error("Source governance validation failed");if(!c.signal.aborted){setGraph(g);setVerification(v)}})
 .catch(e=>{if(!c.signal.aborted)setError(e instanceof Error?e.message:"Research sources unavailable")});return()=>c.abort()},[]);
 const visible=useMemo(()=>graph?.nodes.filter(n=>(n.preferredLabel+" "+n.id).toLowerCase().includes(query.toLowerCase()))??[],[graph,query]);
 const node=graph?.nodes.find(n=>n.id===selected);
 const edges=graph?.relationships.filter(e=>e.subjectId===selected||e.objectId===selected)??[];
 const findings=useMemo(()=>graph&&verification?investigateDiscoveryCandidates({edges:graph.relationships,claims:verification.claims,disagreements:verification.disagreements.map(d=>({id:d.id,claimIds:[],description:d.description,interpretation:d.interpretation,requiresReview:d.requiresReview}))}):[],[graph,verification]);
 const traces=useMemo(()=>graph&&verification?projectMechanismTraces(graph.nodes,graph.relationships,verification.claims,selected):[],[graph,verification,selected]);
 return <main className="science-body"><header className="science-body-hero"><div className="science-body-wrap">
 <p className="science-body-kicker">HSI / ISI · SCIENTIFIC RESEARCH WORKBENCH</p><h1>Investigate mechanisms.<br/><em>Follow the evidence.</em></h1>
 <p>Systemic sclerosis · Tfh–IL-21–B-cell responses · Research candidates only. This view does not approve scientific claims.</p>
 <div className="science-body-actions"><Link to="/science/literature">Literature discovery</Link><Link to="/science/graph">Full graph explorer</Link><Link to="/research/account">Researcher sign-in</Link></div>
 </div></header><div className="science-body-wrap" style={{paddingBlock:"2rem"}}>
 <InvestigationWorkspace/>
 <section aria-label="Authenticated governed graph" style={{padding:"1.25rem",border:"1px solid #aab3c0",borderRadius:12,marginBottom:24}}>
 <h2>Governed graph · authenticated research</h2>
 <p>Query the existing server-side Neon graph read service using your verified research session. This does not modify graph evidence or approve claims.</p>
 <button type="button" disabled={!selected||governedLoading} onClick={async()=>{if(!selected)return;setGoverned(null);setGovernedError("");setGovernedLoading(true);try{const response=await fetch("/api/research/graph/ssc?node="+encodeURIComponent(selected),{credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json"}});if(!response.ok)throw Error(response.status===401?"Researcher sign-in required":response.status===403?"Graph access denied or unavailable":"Graph service unavailable");const page:GovernedPage=await response.json();if(page.scope!=="governed_research"||!Array.isArray(page.nodes)||!Array.isArray(page.relationships)||page.relationships.length>100||page.nodes.length>500)throw Error("Unexpected governed graph response");setGoverned(page)}catch(e){setGovernedError(e instanceof Error?e.message:"Graph unavailable")}finally{setGovernedLoading(false)}}}> {governedLoading?"Querying governed graph…":"Query selected concept in governed graph"}</button>
 <p role="status">{governedError||(!selected?"Select a concept below to query its governed graph neighbourhood.":governed?governed.relationships.length+" governed relationships returned · read only":"No authenticated graph query loaded")}</p>
 {governed&&<div>{governed.relationships.map(e=><article key={e.id} style={{borderTop:"1px solid #aab3c0",paddingBlock:12}}><strong>{governed.nodes.find(n=>n.id===e.subjectId)?.preferredLabel||e.subjectId} → {e.predicate} → {governed.nodes.find(n=>n.id===e.objectId)?.preferredLabel||e.objectId}</strong><p>Evidence classification: {e.epistemicType} · Review: {e.reviewState}</p><p>Context: {e.context?.studyContext||"Not supplied"} · Source locator: {e.context?.sourceLocator||"Not supplied"}</p><p>Limitations: {e.context?.limitations||"Not supplied"}</p><p>Evidence identifiers: {e.sourceEvidenceIds.join(", ")||"Not supplied"}</p></article>)}</div>}
 </section>
 <SscGovernedDiscovery nodeId={selected}/>
 <h2>Evidence-linked SSc investigation</h2><p role="status">{error||(!graph?"Loading versioned research sources…":graph.release.id+" · version "+graph.release.version+" · "+graph.nodes.length+" concepts · "+graph.relationships.length+" candidate relationships")}</p>
 {graph&&<><p><strong>Evidence status:</strong> Unreviewed · No automatic promotion · No clinical use</p>
 <label htmlFor="workbench-concepts">Find immune cells, pathways and molecules</label>{" "}<input id="workbench-concepts" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tfh, IL-21, B cell…" style={{padding:10,maxWidth:"100%"}}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,15rem),1fr))",gap:12,marginBlock:18}}>{visible.map(n=><button key={n.id} type="button" aria-pressed={selected===n.id} onClick={()=>setSelected(n.id)} style={{padding:16,textAlign:"left",border:"1px solid #aab3c0",borderRadius:10,background:selected===n.id?"#e9eef7":"transparent",color:"inherit"}}><strong>{n.preferredLabel}</strong><small style={{display:"block"}}>{n.kind} · {n.id} · draft</small></button>)}</div>
 {node&&<section aria-label="Selected concept evidence" style={{padding:20,border:"1px solid #aab3c0",borderRadius:12}}><h3>{node.preferredLabel}</h3><p>{edges.length} source-linked candidate relationships; no scientific approval inferred.</p>
 {edges.map(e=><article key={e.id} style={{borderTop:"1px solid #aab3c0",paddingBlock:14}}><strong>{graph.nodes.find(n=>n.id===e.subjectId)?.preferredLabel} → {e.predicate.replaceAll("_"," ")} → {graph.nodes.find(n=>n.id===e.objectId)?.preferredLabel}</strong>
 <p>{e.context.studyContext||"Study context not supplied"} · {e.reviewState}</p><p>Limitations: {e.context.limitations||"Not documented"}</p><p>Source locator: {e.context.sourceLocator||"Missing — needs review"}</p>
 {e.sourceEvidenceIds.map(s=><p key={s}><a href={"https://pubmed.ncbi.nlm.nih.gov/"+encodeURIComponent(s.replace(/^PMID:/,""))+"/"} target="_blank" rel="noreferrer">Publication {s}</a></p>)}</article>)}</section>}
 </>}
 <section aria-label="P1.2 immune mechanism investigation" style={{marginBlock:28}}><h2>Immune mechanism investigation · P1.2</h2><p>Read-only trace of ISI-derived SSc draft relationships in HSI. Select a concept above to narrow the trace. This is not a live ISI query, causal conclusion, or approved mechanism.</p><p role="status">{traces.length} mechanism relationship candidates · independent review required</p>{traces.map(t=><article key={t.id} style={{border:"1px solid #aab3c0",borderRadius:12,padding:18,marginBlock:12}}><h3>{t.subject} → {t.predicate.replaceAll("_"," ").toLowerCase()} → {t.object}</h3><p><strong>Study model:</strong> {t.model} · <strong>Context:</strong> {t.studyContext}</p><p><strong>Source locator:</strong> {t.sourceLocator} · <strong>Limitations:</strong> {t.limitations}</p><p><strong>Verification claims:</strong> {t.claimIds.length?t.claimIds.join(", "):"None linked"}</p><p><strong>Source records:</strong> {t.sourceIds.length?t.sourceIds.map(id=>/^PMID:[1-9]\\d*$/.test(id)?<a key={id} style={{marginRight:12}} href={"https://pubmed.ncbi.nlm.nih.gov/"+id.slice(5)+"/"} target="_blank" rel="noreferrer">{id}</a>:<span key={id} style={{marginRight:12}}>{id}</span>):"Missing"}</p><p><strong>Review gaps:</strong> {t.gaps.join("; ")||"No automated gaps detected; scientific review still required"}</p><small>Unvalidated research candidate · no graph promotion · no clinical use</small></article>)}</section>
 <section aria-label="P1 scientific discovery candidates" style={{marginBlock:28}}><h2>Scientific Discovery Intelligence · P1</h2><p>Deterministic evidence-gap and contextual tension screening. These are research candidates, not validated contradictions or clinical findings.</p><p role="status">{findings.length} candidates requiring scientific review</p>{findings.map(item=><article key={item.id} style={{border:"1px solid #aab3c0",borderRadius:10,padding:16,marginBlock:10}}><h3>{item.title}</h3><p>{item.explanation}</p><small>{item.kind.replaceAll("_"," ")} · unvalidated · reviewer required</small>{item.sourceIds.length>0&&<p>Source or claim IDs: {item.sourceIds.join(", ")}</p>}</article>)}<p>Hypothesis generation is intentionally held until the reviewed evidence and method context support a falsifiable proposal.</p></section>
 <section style={{marginBlock:28}}><h2>Scientific verification and review</h2><p>Abstract-verification dataset: {verification?.schemaVersion||"Unavailable"}. Source identity checks and abstract review do not establish mechanistic truth.</p>
 <p><Link to="/science/study-comparison">Compare studies</Link> · <Link to="/science/contradictions">Inspect potential contradictions</Link> · <Link to="/science/review-preparation">Prepare independent review</Link></p>
 {verification&&<ResearchEvidenceQueue verification={verification}/>}
 <p>Ontology mappings, claim-level support and graph publication remain separately governed. No patient records are loaded on this page.</p></section>
 </div></main>
}
