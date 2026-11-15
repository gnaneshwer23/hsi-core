import {useEffect,useMemo,useRef,useState} from "react";
import {Link,useLocation} from "react-router-dom";
import {renderLiveBriefMarkdown} from "../../../src/investigation/liveBrief";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import {deriveRunGaps} from "../../../src/investigation/runGaps";
import {RunGapList} from "../components/home/RunGapList";
import {useRunGapTracking} from "../lib/useRunGapTracking";
import {useLiveRun} from "../lib/useLiveRun";
import {BUCKET_LABEL,bucketOf,buildGraph,counts,filterCandidates,headline,stageRail,yearOf,type Bucket,type Cand,type EdgeState,type Run} from "../lib/workspaceView";
import "../styles/investigation-workspace-app.css";

const QUESTION="Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?";
const DIR:Record<string,string>={positive:"Positive",negative:"Negative",none:"No relationship",association_only:"Linked, direction not stated",unresolved:"Unresolved",not_assessed:"Not assessed"};
const EDGE:Record<EdgeState,string>={supporting:"Supporting",opposing:"Opposing",disputed:"Disputed",unassessed:"Not assessed"};
function download(name:string,text:string,type:string){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}

function Rail({run,running}:{run:Run|null;running:boolean}){
 return <ol className="ws-rail" aria-label="Investigation stages, as recorded by the run">{stageRail(run,running).map((s,i)=>(
  <li key={s.key} data-state={s.state} title={s.detail}><span className="ws-dot" aria-hidden="true">{s.state==="done"?<Icon name="check" size={14}/>:s.state==="failed"?<Icon name="x" size={14}/>:i+1}</span><span className="ws-st"><b>{s.label}</b><small>{({pending:"Not run",running:"Running",done:"Done",partial:"Partial",failed:"Failed",skipped:"Skipped"})[s.state]}</small></span></li>))}</ol>;
}

function GraphView({run,pair,onPair}:{run:Run;pair:string|null;onPair:(p:string|null)=>void}){
 const g=useMemo(()=>buildGraph(run),[run]);
 const others=g.nodes.filter(n=>!n.centre),W=520,H=400,cx=W/2,cy=H/2,R=150;
 const pos=new Map(g.nodes.map(n=>[n.id,n]));const at=new Map<string,{x:number;y:number}>();
 const c0=g.nodes.find(n=>n.centre);if(c0)at.set(c0.id,{x:cx,y:cy});
 others.forEach((n,i)=>{const a=(-90+360*i/Math.max(others.length,1))*Math.PI/180;at.set(n.id,{x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)})});
 const label=(s:string)=>s.length>22?s.slice(0,21).trimEnd()+"…":s;
 return (
  <>
   <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="ws-g-t ws-g-d" className="ws-graph">
    <title id="ws-g-t">Relationships found in this run</title>
    <desc id="ws-g-d">{`${g.nodes.length} concepts. ${g.edges.length} relationships have at least one candidate sentence. Line style shows the direction both checks agreed on; grey means not assessed. The same relationships are listed as buttons below.`}</desc>
    {g.edges.map(e=>{const a=at.get(e.from),b=at.get(e.to);if(!a||!b)return null;const on=pair===e.key;
     return <g key={e.key}><line className={"ws-edge ws-e-"+e.state+(on?" is-on":"")} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/><line className="ws-hit" x1={a.x} y1={a.y} x2={b.x} y2={b.y} onClick={()=>onPair(on?null:e.key)}/></g>})}
    {g.nodes.map(n=>{const p=at.get(n.id)!;const rel=g.edges.find(e=>e.to===n.id);const on=rel&&pair===rel.key;
     return <g key={n.id} className={"ws-node"+(n.centre?" is-centre":"")+(n.linked?"":" is-off")+(on?" is-on":"")} onClick={()=>{if(n.centre)onPair(null);else if(rel)onPair(on?null:rel.key)}}>
      <circle cx={p.x} cy={p.y} r={n.centre?38:26}/><text x={p.x} y={p.y+(n.centre?5:-36)} textAnchor="middle">{label(n.label)}</text></g>})}
   </svg>
   <ul className="ws-legend" aria-label="Line key"><li><i className="k-sup"/>Supporting</li><li><i className="k-opp"/>Opposing</li><li><i className="k-dis"/>Disputed</li><li><i className="k-na"/>Not assessed</li></ul>
   <div className="ws-rels" role="group" aria-label="Relationships found">{g.edges.length===0?<p className="ws-muted">No candidate sentence links two concepts in these sources.</p>:g.edges.map(e=>(
    <button key={e.key} type="button" aria-pressed={pair===e.key} onClick={()=>onPair(pair===e.key?null:e.key)}>{pos.get(e.from)?.label} → {pos.get(e.to)?.label}<span>{EDGE[e.state]} · {e.candidates} sentence{e.candidates===1?"":"s"}, {e.checked} checked</span></button>))}</div>
  </>
 );
}

export function InvestigationWorkspacePage(){
 const lr=useLiveRun(),{run,state}=lr,loc=useLocation();
 const [bucket,setBucket]=useState<Bucket|"all">("all"),[pair,setPair]=useState<string|null>(null),[sel,setSel]=useState<string|null>(null),[brief,setBrief]=useState(false),[sources,setSources]=useState(false),[saved,setSaved]=useState(false);
 const first=useRef(true);
 useEffect(()=>{setSaved(lr.hasSaved());if(first.current){first.current=false;if(new URLSearchParams(loc.search).get("reopen")==="1")lr.reopen()}},[]); // eslint-disable-line react-hooks/exhaustive-deps
 const c=run?counts(run):null,h=run?headline(run):null;
 const runGaps=useMemo(()=>run?deriveRunGaps(run):[],[run]),gapTrack=useRunGapTracking(run?.briefHash??"");
 const list=useMemo(()=>run?filterCandidates(run.candidates,{bucket,pair}):[],[run,bucket,pair]);
 const picked:Cand|null=run?.candidates.find(x=>x.id===sel)??null;
 const rec=picked?run?.records.find(r=>r.sourceId===picked.sourceId)??null:null;
 const supporting=run?.candidates.filter(x=>bucketOf(x)==="supporting")??[],opposing=run?.candidates.filter(x=>bucketOf(x)==="opposing"||x.verification==="disputed")??[];
 const ctxLabel=(k:string)=>run?.byContext[k]?.label??k;
 return (
  <ResearchAppShell where="Investigation workspace" whereIcon="flask" active="investigations">
   <main className="ws" id="rh-main" tabIndex={-1}>
    <nav className="ws-crumb" aria-label="Breadcrumb"><Link to="/research/home">Research Home</Link><span aria-hidden="true">/</span><span>Live investigation</span></nav>
    <header className="ws-head">
     <div className="ws-title">
      <span className="ws-tag">Research investigation · live sources</span>
      <h1>{run?.question??QUESTION}</h1>
      <div className="ws-chips" aria-label="Disease contexts">{run?Object.values(run.byContext).map(b=><span key={b.label}>{b.label}</span>):<span>Rheumatoid arthritis</span>}{!run&&<><span>Systemic lupus erythematosus</span><span>Systemic sclerosis</span></>}</div>
     </div>
     <section className="ws-status" aria-label="Run status">
      <div role="status" aria-live="polite">
       {state==="running"&&<><b><span className="ws-spin" aria-hidden="true"/>Running on the server</b><p>Retrieval, ranking and the two-model check run together and return when finished (about 10 to 20 seconds). Steps are shown from the run record afterwards.</p></>}
       {state==="idle"&&!run&&<><b>Ready</b><p>Nothing starts until you press Run. It searches Europe PMC, OpenAlex and Open Targets, then two models check the best claims.</p></>}
       {state==="idle"&&run&&<><b>Run complete</b><p>{run.verification.status==="not_configured"?"The model check did not run: "+(run.verification.reason??""):`${h!.checked} of ${h!.candidates} candidates checked by two models. Candidate-only, unreviewed.`}</p></>}
       {state==="error"&&<p className="ws-err" role="alert">{lr.error} No findings were generated.</p>}
      </div>
      <div className="ws-actions">
       <button type="button" className="ws-run" onClick={()=>{setSel(null);setPair(null);setBucket("all");void lr.start()}} disabled={state==="running"}><Icon name="spark" size={16}/>{state==="running"?"Running…":run?"Run again":"Run live investigation"}</button>
       {!run&&saved&&<button type="button" className="ws-btn" onClick={()=>lr.reopen()}>Reopen saved run</button>}
      </div>
     </section>
     <dl className="ws-stats" aria-label="Run totals">
      <div><dt>Sources</dt><dd>{h?h.sources:"—"}</dd></div><div><dt>Candidates</dt><dd>{h?h.candidates:"—"}</dd></div><div><dt>Key findings</dt><dd>{h?h.findings:"—"}</dd></div>
     </dl>
    </header>
    <Rail run={state==="running"?null:run} running={state==="running"}/>

    <div className="ws-cols">
     <section className="ws-card" aria-labelledby="ws-ev-h">
      <header><h2 id="ws-ev-h"><Icon name="layers" size={18}/>Evidence <small>({run?run.candidates.length+" claims":"none yet"})</small></h2></header>
      {!run?<p className="ws-muted">Run the investigation to retrieve evidence. Each claim keeps its source, passage and how its direction was checked.</p>:<>
       <div className="ws-filter" role="group" aria-label="Filter claims">
        <button type="button" aria-pressed={bucket==="all"} onClick={()=>setBucket("all")}>All ({run.candidates.length})</button>
        {(Object.keys(BUCKET_LABEL) as Bucket[]).map(b=><button key={b} type="button" aria-pressed={bucket===b} onClick={()=>setBucket(b)}>{BUCKET_LABEL[b]} ({c![b]})</button>)}
       </div>
       {pair&&<p className="ws-pair">Showing {pair.replace("→"," → ")} <button type="button" onClick={()=>setPair(null)}>Clear</button></p>}
       <ul className="ws-list">{list.slice(0,30).map(x=>{const r=run.records.find(q=>q.sourceId===x.sourceId);const b=bucketOf(x);
        return <li key={x.id}><button type="button" aria-pressed={sel===x.id} data-b={b} onClick={()=>setSel(x.id)}>
         <b>{x.subject} ~ {x.object}</b><span className="ws-quote">{x.sentence}</span>
         <span className="ws-meta"><em>{BUCKET_LABEL[b]}{x.direction!=="not_assessed"?` · ${DIR[x.direction]??x.direction}`:""}</em>{x.contexts.map(ctxLabel).join(", ")||"context not stated"} · {yearOf(r?.publicationDate)}</span></button></li>})}
        {list.length===0&&<li className="ws-muted">No claims match this filter.</li>}</ul>
       <button type="button" className="ws-link" aria-expanded={sources} onClick={()=>setSources(s=>!s)}>{sources?"Hide":"View"} all sources ({run.records.length})</button>
       {sources&&<ul className="ws-sources">{run.records.map(r=><li key={r.sourceId}><a href={r.sourceUrl} target="_blank" rel="noreferrer noopener">{r.title}</a><span>{r.provider} · {yearOf(r.publicationDate)}{r.doi?` · DOI ${r.doi}`:""}{r.retraction==="flagged"?" · flagged retracted":""}</span></li>)}</ul>}
      </>}
     </section>

     <section className="ws-card ws-graphcard" aria-labelledby="ws-kg-h">
      <header><h2 id="ws-kg-h"><Icon name="graph" size={18}/>Relationships <small>from this run</small></h2></header>
      {!run?<p className="ws-muted">The relationship map appears after a run. Lines only exist where a retrieved sentence links two concepts.</p>:<GraphView run={run} pair={pair} onPair={setPair}/>}
     </section>

     <section className="ws-card" aria-labelledby="ws-vf-h">
      <header><h2 id="ws-vf-h"><Icon name="shield" size={18}/>Scientific verification</h2></header>
      {!run?<p className="ws-muted">Verification appears after a run. Two models must agree on a direction and quote the passage; otherwise the claim stays unresolved.</p>:<>
       <div className="ws-inspect" aria-label="Selected claim" tabIndex={-1}>
        {!picked?<p className="ws-muted">Select a claim to see its source and each model's check.</p>:<>
         <p className="ws-claim">{picked.subject} ~ {picked.object}</p>
         <p className="ws-q">“{picked.sentence}”</p>
         <dl><dt>Direction</dt><dd>{DIR[picked.direction]??picked.direction}{picked.verification==="not_run"?" (not checked: ranked lower)":""}</dd>
          <dt>Why it was ranked</dt><dd>{picked.priority.reasons.join("; ")||"Not ranked"}</dd>
          <dt>Source</dt><dd><a href={picked.sourceUrl} target="_blank" rel="noreferrer noopener">{rec?.title??picked.sourceId}</a>{rec&&<><br/>{rec.provider} · {rec.doi?`DOI ${rec.doi} · `:""}{rec.pmid?`PMID ${rec.pmid} · `:""}retrieved {rec.retrievedAt} · retraction: {rec.retraction.replaceAll("_"," ")} · licence not assessed</>}</dd></dl>
         {picked.verdicts.map(v=><p key={v.verifier} className="ws-verdict"><b>{v.verifier}</b> ({v.model}): {v.direction.replaceAll("_"," ")}. {v.reason}{v.evidenceSpan&&<><br/>Quoted: “{v.evidenceSpan}”</>}</p>)}
         <p className="ws-state">Candidate · unreviewed · not promotable to the graph</p></>}
       </div>
       <details className="ws-acc" open><summary><Icon name="check" size={16}/>Evidence <b>{supporting.length}</b></summary><p>Claims both checks agreed on as positive. {supporting.length===0&&"None in this run."}</p><ul>{supporting.map(x=><li key={x.id}><button type="button" onClick={()=>setSel(x.id)}>{x.subject} ~ {x.object}</button></li>)}</ul></details>
       <details className="ws-acc"><summary><Icon name="x" size={16}/>Contradictions <b>{opposing.length}</b></summary><p>{run.verification.status==="not_configured"?"Not assessed: the model check did not run.":opposing.length===0?"None found in these sources. This does not establish consensus.":"Opposing or disputed claims."}</p><ul>{opposing.map(x=><li key={x.id}><button type="button" onClick={()=>setSel(x.id)}>{x.subject} ~ {x.object}</button></li>)}</ul></details>
       <details className="ws-acc" open={run.hypotheses.items.length>0}><summary><Icon name="flask" size={16}/>Hypotheses <b>{run.hypotheses.items.length}</b></summary>
        {run.hypotheses.items.length===0?<p>{run.hypotheses.reason??"None proposed."}</p>:<>
         <p className="ws-warn">Unvalidated model proposals from {run.hypotheses.basis.findings} agreed findings. Not findings, not recommendations, not reviewed.</p>
         <ul className="ws-hyps">{run.hypotheses.items.map(hy=>(
          <li key={hy.id}><span className="ws-tagline">Unvalidated hypothesis</span><b>{hy.statement}</b>
           <div className="ws-cites" role="group" aria-label={`Findings behind ${hy.id}`}>{hy.citedClaimIds.map(id=>{const cc=run.candidates.find(x=>x.id===id);return cc?<button key={id} type="button" onClick={()=>setSel(id)}>{cc.subject} ~ {cc.object}</button>:null})}</div>
           <p className="ws-chal" data-v={hy.challenge?.verdict??"none"}>{hy.challenge?`Second model: ${hy.challenge.verdict}. ${hy.challenge.reason}`:hy.challengeNote??"Not challenged."}</p>
           <details><summary>Rationale, prediction, experiment, falsifier</summary>
            <dl><dt>Why</dt><dd>{hy.rationale}</dd><dt>Prediction if true</dt><dd>{hy.prediction}</dd><dt>Experiment</dt><dd>{hy.experiment}</dd><dt>Would be falsified by</dt><dd>{hy.falsifier}</dd><dt>Limits</dt><dd>{hy.limits}</dd><dt>Proposed by</dt><dd>{hy.generatedBy.verifier} ({hy.generatedBy.model})</dd></dl></details></li>))}</ul></>}
       </details>
       <details className="ws-acc"><summary><Icon name="book" size={16}/>Research brief</summary><p>An evidence-linked record of this run with its limits. Abstracts are not included.</p></details>
       <button type="button" className="ws-run ws-wide" onClick={()=>setBrief(b=>!b)} aria-expanded={brief}>{brief?"Hide research brief":"Open research brief"} <Icon name="arrow" size={16}/></button>
       {brief&&<pre className="ws-brief" tabIndex={0} aria-label="Research brief text">{renderLiveBriefMarkdown(run)}</pre>}
       <div className="ws-export"><button type="button" className="ws-btn" onClick={()=>download("hsi-live-brief.md",renderLiveBriefMarkdown(run),"text/markdown")}>Export brief (Markdown)</button><button type="button" className="ws-btn" onClick={()=>download("hsi-live-investigation.json",JSON.stringify(run,null,2),"application/json")}>Export JSON</button><button type="button" className="ws-btn" onClick={()=>{lr.save();setSaved(true)}}>Save in this browser</button></div>
       {lr.note&&<p className="ws-muted" role="status">{lr.note}</p>}
       <p className="ws-muted">Model agreement is not scientific proof. {run.verification.independence==="independent_execution_only"?"Both checks ran on one provider (independent execution only).":""}</p>
      </>}
     </section>
    </div>
    <section className="ws-card ws-gaps" aria-labelledby="ws-gp-h">
     <header><h2 id="ws-gp-h"><Icon name="layers" size={18}/>Gaps in this run <small>({run?runGaps.length:"none yet"})</small></h2></header>
     {!run?<p className="ws-muted">Gaps appear after a run. They are derived from the run itself, not generated, and a limit of the search is shown apart from a gap in the science.</p>:<>
      <RunGapList gaps={runGaps} track={gapTrack.track} onSet={(id,s,n)=>gapTrack.set(id,s,n,runGaps.find(g=>g.id===id)?.candidateIds.length??0)}/>
      {gapTrack.blocked&&<p className="ws-err" role="status">This browser blocked local storage, so your status was not kept.</p>}
      <p className="ws-muted">Status is kept in this browser only. <a href="/research/gaps">Open the Gap Register</a></p></>}
    </section>
   </main>
  </ResearchAppShell>
 );
}
