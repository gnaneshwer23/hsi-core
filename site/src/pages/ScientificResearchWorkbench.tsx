import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import "../styles/science-body.css";
import {investigateDiscoveryCandidates} from "../features/science/discoveryInvestigation";
import {ResearchEvidenceQueue,validateScientificVerification,type ScientificVerification} from "../components/ResearchEvidenceQueue";
type Node={id:string;preferredLabel:string;kind:string};
type Edge={id:string;subjectId:string;objectId:string;predicate:string;reviewState:string;sourceEvidenceIds:string[];context:{studyContext?:string;limitations?:string;sourceLocator?:string}};
type Draft={release:{id:string;version:string;graphPromotable:boolean};provenance:{reviewedByHuman:boolean;rightsCleared:boolean};nodes:Node[];relationships:Edge[]};
type Verification=ScientificVerification;
export function ScientificResearchWorkbench(){
 const [graph,setGraph]=useState<Draft|null>(null),[verification,setVerification]=useState<Verification|null>(null);
 const [error,setError]=useState(""),[query,setQuery]=useState(""),[selected,setSelected]=useState<string|null>(null),[investigation,setInvestigation]=useState("");
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
 const validId=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(investigation);
 return <main className="science-body"><header className="science-body-hero"><div className="science-body-wrap">
 <p className="science-body-kicker">HSI / ISI · SCIENTIFIC RESEARCH WORKBENCH</p><h1>Investigate mechanisms.<br/><em>Follow the evidence.</em></h1>
 <p>Systemic sclerosis · Tfh–IL-21–B-cell responses · Research candidates only. This view does not approve scientific claims.</p>
 <div className="science-body-actions"><Link to="/science/literature">Literature discovery</Link><Link to="/science/graph">Full graph explorer</Link><Link to="/research/account">Researcher sign-in</Link></div>
 </div></header><div className="science-body-wrap" style={{paddingBlock:"2rem"}}>
 <section aria-label="Research access" style={{padding:"1.25rem",border:"1px solid #aab3c0",borderRadius:12,marginBottom:24}}>
 <h2>Authorised research investigation</h2><p>Public graph candidates are shown below. Protected investigation records and review submissions require a verified research account and server-side permission checks.</p>
 <label htmlFor="investigation-id">Authorised investigation ID</label>{" "}<input id="investigation-id" value={investigation} onChange={e=>setInvestigation(e.target.value)} placeholder="hsi-interrogative-…" style={{padding:10,maxWidth:"100%"}}/>
 {" "}{validId?<Link to={"/research/decision-workbench?investigation="+encodeURIComponent(investigation)}>Open authenticated investigation</Link>:<span>Enter a valid investigation ID to open the protected workbench.</span>}
 </section>
 <h2>Evidence-linked SSc investigation</h2><p role="status">{error||(!graph?"Loading versioned research sources…":graph.release.id+" · version "+graph.release.version+" · "+graph.nodes.length+" concepts · "+graph.relationships.length+" candidate relationships")}</p>
 {graph&&<><p><strong>Evidence status:</strong> Unreviewed · No automatic promotion · No clinical use</p>
 <label htmlFor="workbench-concepts">Find immune cells, pathways and molecules</label>{" "}<input id="workbench-concepts" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tfh, IL-21, B cell…" style={{padding:10,maxWidth:"100%"}}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,15rem),1fr))",gap:12,marginBlock:18}}>{visible.map(n=><button key={n.id} type="button" aria-pressed={selected===n.id} onClick={()=>setSelected(n.id)} style={{padding:16,textAlign:"left",border:"1px solid #aab3c0",borderRadius:10,background:selected===n.id?"#e9eef7":"transparent",color:"inherit"}}><strong>{n.preferredLabel}</strong><small style={{display:"block"}}>{n.kind} · {n.id} · draft</small></button>)}</div>
 {node&&<section aria-label="Selected concept evidence" style={{padding:20,border:"1px solid #aab3c0",borderRadius:12}}><h3>{node.preferredLabel}</h3><p>{edges.length} source-linked candidate relationships; no scientific approval inferred.</p>
 {edges.map(e=><article key={e.id} style={{borderTop:"1px solid #aab3c0",paddingBlock:14}}><strong>{graph.nodes.find(n=>n.id===e.subjectId)?.preferredLabel} → {e.predicate.replaceAll("_"," ")} → {graph.nodes.find(n=>n.id===e.objectId)?.preferredLabel}</strong>
 <p>{e.context.studyContext||"Study context not supplied"} · {e.reviewState}</p><p>Limitations: {e.context.limitations||"Not documented"}</p><p>Source locator: {e.context.sourceLocator||"Missing — needs review"}</p>
 {e.sourceEvidenceIds.map(s=><p key={s}><a href={"https://pubmed.ncbi.nlm.nih.gov/"+encodeURIComponent(s.replace(/^PMID:/,""))+"/"} target="_blank" rel="noreferrer">Publication {s}</a></p>)}</article>)}</section>}
 </>}
 <section aria-label="P1 scientific discovery candidates" style={{marginBlock:28}}><h2>Scientific Discovery Intelligence · P1</h2><p>Deterministic evidence-gap and contextual tension screening. These are research candidates, not validated contradictions or clinical findings.</p><p role="status">{findings.length} candidates requiring scientific review</p>{findings.map(item=><article key={item.id} style={{border:"1px solid #aab3c0",borderRadius:10,padding:16,marginBlock:10}}><h3>{item.title}</h3><p>{item.explanation}</p><small>{item.kind.replaceAll("_"," ")} · unvalidated · reviewer required</small>{item.sourceIds.length>0&&<p>Source or claim IDs: {item.sourceIds.join(", ")}</p>}</article>)}<p>Hypothesis generation is intentionally held until the reviewed evidence and method context support a falsifiable proposal.</p></section>
 <section style={{marginBlock:28}}><h2>Scientific verification and review</h2><p>Abstract-verification dataset: {verification?.schemaVersion||"Unavailable"}. Source identity checks and abstract review do not establish mechanistic truth.</p>
 <p><Link to="/science/study-comparison">Compare studies</Link> · <Link to="/science/contradictions">Inspect potential contradictions</Link> · <Link to="/science/review-preparation">Prepare independent review</Link></p>
 {verification&&<ResearchEvidenceQueue verification={verification}/>}
 <p>Ontology mappings, claim-level support and graph publication remain separately governed. No patient records are loaded on this page.</p></section>
 </div></main>
}
