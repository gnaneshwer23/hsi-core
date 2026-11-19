import {useEffect,useMemo,useRef,useState} from "react";
import {Link,useLocation} from "react-router-dom";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import {deriveRunGaps} from "../../../src/investigation/runGaps";
import {RunGapList} from "../components/home/RunGapList";
import {useRunGapTracking} from "../lib/useRunGapTracking";
import {useLedger} from "../lib/useLedger";
import {fromRunHypothesis} from "../../../src/investigation/hypothesisLedger";
import {useLiveRun} from "../lib/useLiveRun";
import {HowProducedPanel} from "../components/HowProducedPanel";
import {EvidenceContextPassportView} from "../components/EvidenceContextPassport";
import {PassportEvidenceTable} from "../components/PassportEvidenceTable";
import {liveClaimToPassportEdge} from "../../../src/investigation/liveClaimPassportEdge";
import {liveInvestigationPassportEdges,liveInvestigationPassportSources} from "../../../src/investigation/liveBriefPassport";
import {COMPARISON_OUTCOME_LABEL} from "../../../src/investigation/liveBriefComparison";
import {buildLiveBriefPreview} from "../../../src/investigation/liveBriefPreview";
import {
  buildUspADisagreementTrail,
  comparisonPairKey,
  type UspATrailStepId,
} from "../../../src/investigation/uspADisagreementTrail";
import {
  buildUspBCrossDomainTrail,
  buildUspBPathViews,
  defaultTargetDepartment,
  matchRunLabelsToGraphNodes,
  suggestCrossDomainStarts,
  summarizeDepartments,
  type UspBTrailStepId,
} from "../../../src/investigation/uspBCrossDomainTrail";
import {
  buildUspCConnectedTrail,
  type UspCTrailStepId,
} from "../../../src/investigation/uspCConnectedTrail";
import {
  buildUnifiedJourneyTrail,
  type UnifiedJourneyStepId,
} from "../../../src/investigation/unifiedJourneyTrail";
import {
  buildCuratedDisagreementPack,
  type CuratedDisagreementCaseId,
} from "../../../src/investigation/curatedDisagreementPack";
import {
  buildProfileWorkspaceHandoff,
  markHandoffOnWorkspace,
} from "../../../src/investigation/profileWorkspaceHandoff";
import {buildTestableNextQuestions} from "../../../src/investigation/testableNextQuestions";
import {buildStage2CompletionChecklist} from "../../../src/investigation/stage2CompletionChecklist";
import {buildBlockedJourneySteps} from "../../../src/investigation/blockedJourneyStepsHonesty";
import {
  getUsefulnessForBrief,
  loadResearcherUsefulnessStore,
} from "../../../src/investigation/researcherUsefulnessFeedback";
import {matchScenario} from "../../../src/investigation/scenarios";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import type {DepartmentSlug} from "../../../src/knowledgeGraph/departments";
import {UspADisagreementTrail} from "../components/workspace/UspADisagreementTrail";
import {UspADisagreementPanel} from "../components/workspace/UspADisagreementPanel";
import {CuratedDisagreementPackPanel} from "../components/workspace/CuratedDisagreementPackPanel";
import {UspBCrossDomainTrail} from "../components/workspace/UspBCrossDomainTrail";
import {UspBCrossDomainPanel} from "../components/workspace/UspBCrossDomainPanel";
import {UspCConnectedTrail} from "../components/workspace/UspCConnectedTrail";
import {UspCConnectedPanel} from "../components/workspace/UspCConnectedPanel";
import {UnifiedJourneyTrail} from "../components/workspace/UnifiedJourneyTrail";
import {LiveBriefDecisionPanel} from "../components/workspace/LiveBriefDecisionPanel";
import {ResearcherUsefulnessPanel} from "../components/workspace/ResearcherUsefulnessPanel";
import {TestableNextQuestionsPanel} from "../components/workspace/TestableNextQuestionsPanel";
import {Stage2CompletionChecklistPanel} from "../components/workspace/Stage2CompletionChecklistPanel";
import {BlockedJourneyStepsPanel} from "../components/workspace/BlockedJourneyStepsPanel";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {EMPTY_PROFILE,loadProfile,type Profile} from "../lib/researchHome";
import {BUCKET_LABEL,bucketOf,buildGraph,counts,filterCandidates,headline,stageRail,yearOf,type Bucket,type Cand,type EdgeState,type Run} from "../lib/workspaceView";
import "../styles/investigation-workspace-app.css";

const QUESTION="Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?";
const DIR:Record<string,string>={positive:"Positive",negative:"Negative",none:"No relationship",association_only:"Linked, direction not stated",unresolved:"Unresolved",not_assessed:"Not assessed"};
const EDGE:Record<EdgeState,string>={supporting:"Supporting",opposing:"Opposing",disputed:"Disputed",unassessed:"Not assessed"};

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
 const [usefulnessTick,setUsefulnessTick]=useState(0);
 const [cmpKey,setCmpKey]=useState<string|null>(null);
 const [bundle,setBundle]=useState<DomainBundle|null>(null);
 const [graphError,setGraphError]=useState<string|null>(null);
 const [crossStart,setCrossStart]=useState<string|null>(null);
 const [crossTarget,setCrossTarget]=useState<DepartmentSlug>("neuroscience");
 const [crossPathIndex,setCrossPathIndex]=useState<number|null>(null);
 const [curatedCaseId,setCuratedCaseId]=useState<CuratedDisagreementCaseId|null>(null);
 const [profile,setProfile]=useState<Profile>(EMPTY_PROFILE);
 const first=useRef(true);
 useEffect(()=>{
  setSaved(lr.hasSaved());
  lr.refreshLibrary();
  setProfile(loadProfile());
  if(first.current){
   first.current=false;
   if(new URLSearchParams(loc.search).get("reopen")==="1")lr.reopen();
  }
 },[]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(run&&(run.structuredComparison?.pairCount??0)>0)setBrief(true)},[run?.briefHash]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{
  const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);
  setGraphError(null);
  loadDomainGraph(null,c.signal)
   .then((g)=>{setBundle(g);setGraphError(null)})
   .catch(()=>{if(!c.signal.aborted){setBundle(null);setGraphError("The cross-domain snapshot could not be verified.")}})
   .finally(()=>clearTimeout(t));
  return()=>{c.abort();clearTimeout(t)};
 },[]);
 const c=run?counts(run):null,h=run?headline(run):null;
 const runGaps=useMemo(()=>run?deriveRunGaps(run):[],[run]),gapTrack=useRunGapTracking(run?.briefHash??""),ledger=useLedger(),[ledgerMsg,setLedgerMsg]=useState("");
 const list=useMemo(()=>run?filterCandidates(run.candidates,{bucket,pair}):[],[run,bucket,pair]);
 const picked:Cand|null=run?.candidates.find(x=>x.id===sel)??null;
 const rec=picked?run?.records.find(r=>r.sourceId===picked.sourceId)??null:null;
 const supporting=run?.candidates.filter(x=>bucketOf(x)==="supporting")??[],opposing=run?.candidates.filter(x=>bucketOf(x)==="opposing"||x.verification==="disputed")??[];
 const comparison=run?.structuredComparison;
 const ctxLabel=(k:string)=>run?.byContext[k]?.label??k;
 const passportEdge=picked
  ?liveClaimToPassportEdge({
   candidate:picked,
   contextLabels:picked.contexts.map(ctxLabel),
  })
  :null;
 const passportEdges=useMemo(()=>run?liveInvestigationPassportEdges(run):[],[run]);
 const passportSources=useMemo(()=>run?liveInvestigationPassportSources(run):[],[run]);
 const curatedPack=useMemo(()=>bundle?buildCuratedDisagreementPack(bundle):null,[bundle]);
 const fromProfile=new URLSearchParams(loc.search).get("from")==="profile";
 const profileHandoff=useMemo(()=>{
  const base=buildProfileWorkspaceHandoff({
   onboarded:profile.onboarded,
   question:profile.question,
   interests:profile.interests,
   role:profile.role,
   cadence:profile.cadence,
   matchedScenarioId:profile.question.trim()?matchScenario(profile.question):null,
  });
  return fromProfile||base.ready?markHandoffOnWorkspace(base):base;
 },[profile,fromProfile]);
 const briefPreview=useMemo(()=>run?buildLiveBriefPreview(run,passportEdges.length):null,[run,passportEdges.length]);
 const uspTrail=useMemo(()=>buildUspADisagreementTrail({
  hasRun:Boolean(run),
  candidateCount:run?.candidates.length??0,
  selectedClaimId:sel,
  selectedComparisonKey:cmpKey,
  comparison:comparison??null,
  briefOpen:brief,
 }),[run,sel,cmpKey,comparison,brief]);
 const runLabels=useMemo(()=>{
  if(!run)return [] as string[];
  const labels=new Set<string>();
  for(const cand of run.candidates){labels.add(cand.subject);labels.add(cand.object)}
  return [...labels];
 },[run]);
 const crossMatches=useMemo(()=>{
  if(!bundle)return [];
  return suggestCrossDomainStarts(matchRunLabelsToGraphNodes(bundle,runLabels));
 },[bundle,runLabels]);
 useEffect(()=>{
  if(!crossMatches.length){setCrossStart(null);setCrossPathIndex(null);return}
  const preferred=crossMatches.find(m=>m.departments.length>1)??crossMatches[0]!;
  setCrossStart(preferred.nodeId);
  setCrossTarget(defaultTargetDepartment(preferred));
  setCrossPathIndex(null);
 },[crossMatches.map(m=>m.nodeId).join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
 const crossCoverage=useMemo(()=>bundle?summarizeDepartments(bundle).departments:[],[bundle]);
 const crossPaths=useMemo(()=>{
  if(!bundle||!crossStart)return {result:null,paths:[] as ReturnType<typeof buildUspBPathViews>["paths"]};
  return buildUspBPathViews(bundle,crossStart,crossTarget);
 },[bundle,crossStart,crossTarget]);
 useEffect(()=>{setCrossPathIndex(null)},[crossStart,crossTarget]);
 const uspBTrail=useMemo(()=>buildUspBCrossDomainTrail({
  hasRun:Boolean(run),
  graphLoaded:Boolean(bundle),
  matchedNodeCount:crossMatches.length,
  selectedStartId:crossStart,
  selectedTargetDepartment:crossTarget,
  pathCount:crossPaths.paths.length,
  selectedPathIndex:crossPathIndex,
  gapCount:runGaps.length,
  hypothesisCount:run?.hypotheses.items.length??0,
  briefOpen:brief,
 }),[run,bundle,crossMatches.length,crossStart,crossTarget,crossPaths.paths.length,crossPathIndex,runGaps.length,brief]);
 const uspCTrail=useMemo(()=>buildUspCConnectedTrail({
  profileOnboarded:profile.onboarded,
  hasResearchQuestion:Boolean(profile.question.trim()),
  interestCount:profile.interests.length,
  alertCadence:profile.cadence,
  hasRun:Boolean(run),
  libraryCount:lr.library.entries.length,
  savedThisSession:lr.savedThisSession,
  reopenedThisSession:lr.reopenedThisSession,
  briefOpen:brief,
 }),[profile,run,lr.library.entries.length,lr.savedThisSession,lr.reopenedThisSession,brief]);
 const unifiedTrail=useMemo(()=>buildUnifiedJourneyTrail({
  hasRun:Boolean(run),
  candidateCount:run?.candidates.length??0,
  selectedClaimId:sel,
  selectedComparisonKey:cmpKey,
  comparisonPairCount:comparison?.pairCount??0,
  crossDomainPathCount:crossPaths.paths.length,
  graphLoaded:Boolean(bundle),
  gapCount:runGaps.length,
  briefOpen:brief,
  libraryCount:lr.library.entries.length,
  savedThisSession:lr.savedThisSession,
 }),[run,sel,cmpKey,comparison,crossPaths.paths.length,bundle,runGaps.length,brief,lr.library.entries.length,lr.savedThisSession]);
 const testableQuestions=useMemo(()=>buildTestableNextQuestions({
  gaps:runGaps,
  hypotheses:run?.hypotheses.items??[],
  hypothesesStatus:run?.hypotheses.status??"not_configured",
 }),[runGaps,run]);
 const usefulnessRated=useMemo(()=>{
  if(!run?.briefHash)return false;
  const store=loadResearcherUsefulnessStore(typeof localStorage!=="undefined"?localStorage:null);
  return Boolean(getUsefulnessForBrief(store,run.briefHash));
 },[run?.briefHash,usefulnessTick]);
 const stage2Checklist=useMemo(()=>buildStage2CompletionChecklist({
  briefHash:run?.briefHash??null,
  hasRun:Boolean(run),
  candidateCount:run?.candidates.length??0,
  hasPassportOrDisagreement:Boolean(sel)||Boolean(cmpKey),
  hasGapsOrTestable:runGaps.length>0||testableQuestions.items.length>0,
  briefAvailable:Boolean(briefPreview),
  savedOrReopened:lr.savedThisSession||lr.reopenedThisSession||lr.library.entries.length>0,
  usefulnessRated,
 }),[run,sel,cmpKey,runGaps.length,testableQuestions.items.length,briefPreview,lr.savedThisSession,lr.reopenedThisSession,lr.library.entries.length,usefulnessRated]);
 const blockedJourneySteps=useMemo(()=>buildBlockedJourneySteps({
  briefHash:run?.briefHash??null,
  libraryCount:lr.library.entries.length,
  reopenedThisSession:lr.reopenedThisSession,
 }),[run?.briefHash,lr.library.entries.length,lr.reopenedThisSession]);
 const openUspPanelsFold=()=>{
  const el=document.getElementById("ws-usp-panels") as HTMLDetailsElement|null;
  if(el&&!el.open)el.open=true;
 };
 const onStage2ChecklistSelect=(id:typeof stage2Checklist.items[number]["id"])=>{
  if(id==="ask_run"){document.getElementById("ws-ask-strip")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="evidence"||id==="passport_or_disagreement"){
   if(id==="passport_or_disagreement"&&cmpKey){
    openUspPanelsFold();
    document.getElementById("ws-disagree-h")?.scrollIntoView({behavior:"smooth",block:"start"});
    return;
   }
   document.getElementById("ws-ev-h")?.scrollIntoView({behavior:"smooth",block:"start"});
   return;
  }
  if(id==="gaps_or_testable"){document.getElementById("ws-tq-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="save_or_reopen"){document.getElementById("ws-conn-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="usefulness"){document.getElementById("ws-useful-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  setBrief(true);
  document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 const onUnifiedTrailSelect=(id:UnifiedJourneyStepId)=>{
  if(id==="ask"){document.getElementById("ws-ask-strip")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="evidence"||id==="passport"){document.getElementById("ws-ev-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="disagreement"){
   openUspPanelsFold();
   document.getElementById("ws-disagree-h")?.scrollIntoView({behavior:"smooth",block:"start"});
   return;
  }
  if(id==="crossDomain"){
   openUspPanelsFold();
   document.getElementById("ws-cross-h")?.scrollIntoView({behavior:"smooth",block:"start"});
   return;
  }
  if(id==="gaps"){document.getElementById("ws-gp-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="save"){document.getElementById("ws-conn-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  setBrief(true);
  document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 const onTrailSelect=(id:UspATrailStepId)=>{
  if(id==="ask"){document.getElementById("ws-ask-strip")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="evidence"){document.getElementById("ws-ev-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="passport"){document.getElementById("ws-vf-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="disagreement"){
   openUspPanelsFold();
   document.getElementById("ws-disagree-h")?.scrollIntoView({behavior:"smooth",block:"start"});
   if(!cmpKey&&comparison&&comparison.items[0])setCmpKey(comparisonPairKey(comparison.items[0]));
   return;
  }
  setBrief(true);
  document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 const onUspBTrailSelect=(id:UspBTrailStepId)=>{
  if(id==="ask"){document.getElementById("ws-ask-strip")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="domains"||id==="pathways"){
   openUspPanelsFold();
   document.getElementById("ws-cross-h")?.scrollIntoView({behavior:"smooth",block:"start"});
   if(id==="pathways"&&crossPathIndex===null&&crossPaths.paths[0])setCrossPathIndex(0);
   return;
  }
  if(id==="gaps"){document.getElementById("ws-gp-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  setBrief(true);
  document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 const onUspCTrailSelect=(id:UspCTrailStepId)=>{
  if(id==="profile"||id==="save"||id==="reopen"){
   document.getElementById("ws-conn-h")?.scrollIntoView({behavior:"smooth",block:"start"});
   return;
  }
  if(id==="workspace"){document.getElementById("ws-ev-h")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  setBrief(true);
  document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 return (
  <ResearchAppShell where="Investigation workspace" whereIcon="flask" active="investigations">
   <main className="ws" id="rh-main" tabIndex={-1}>
    <nav className="ws-crumb" aria-label="Breadcrumb"><Link to="/research/home">Research Home</Link><span aria-hidden="true">/</span><span>Live investigation</span></nav>
    <header className="ws-head">
     <div className="ws-title">
      <span className="ws-tag">USP A · USP B · USP C · Research investigation · live sources</span>
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
       <button type="button" className="ws-run" onClick={()=>{setSel(null);setPair(null);setCmpKey(null);setBucket("all");void lr.start()}} disabled={state==="running"}><Icon name="spark" size={16}/>{state==="running"?"Running…":run?"Run again":"Run live investigation"}</button>
       {!run&&saved&&<button type="button" className="ws-btn" onClick={()=>lr.reopen()}>Reopen saved run</button>}
      </div>
     </section>
     <dl className="ws-stats" aria-label="Run totals">
      <div><dt>Sources</dt><dd>{h?h.sources:"—"}</dd></div><div><dt>Candidates</dt><dd>{h?h.candidates:"—"}</dd></div><div><dt>Key findings</dt><dd>{h?h.findings:"—"}</dd></div>
     </dl>
    </header>
    <section className="ws-ask-strip" id="ws-ask-strip" aria-labelledby="ws-ask-h">
     <h2 id="ws-ask-h">Ask</h2>
     <p className="ws-muted">
      Start from Research Home Ask, or run the default IL-21 cross-context question here.
      Disease chips below are demonstration scenarios — HSI is disease-agnostic.
     </p>
     {profileHandoff.ready?(
      <div className="ws-ask-handoff" role="status">
       <p className="ws-muted">
        Profile handoff · device-local · durable server profile claimed:{" "}
        {String(profileHandoff.honesty.serverProfileDurableClaimed)} · production writes:{" "}
        {String(profileHandoff.honesty.productionWritesEnabled)}
       </p>
       {profileHandoff.question?<p><b>{profileHandoff.question}</b></p>:null}
       {profileHandoff.interestLabels.length>0?(
        <p className="ws-muted">Focus: {profileHandoff.interestLabels.join(", ")}</p>
       ):null}
       <p className="ws-muted">{profileHandoff.note}</p>
      </div>
     ):(
      <p className="ws-muted">
       No onboarded profile yet. <Link to="/welcome">Tell us what you work on</Link> so interests
       hand off into this workspace.
      </p>
     )}
     <div className="ws-actions">
      <Link className="ws-btn" to="/research/home">Open Ask on Research Home</Link>
      <Link className="ws-btn" to="/welcome">Edit profile setup</Link>
      {saved&&<button type="button" className="ws-btn" onClick={()=>lr.reopen()}>Reopen browser-saved run</button>}
     </div>
    </section>
    <UnifiedJourneyTrail steps={unifiedTrail.steps} onSelect={onUnifiedTrailSelect}/>
    <Stage2CompletionChecklistPanel checklist={stage2Checklist} onSelectItem={onStage2ChecklistSelect}/>
    <details className="ws-usp-focus">
     <summary>USP focus trails (A · B · C)</summary>
     <UspADisagreementTrail steps={uspTrail.steps} onSelect={onTrailSelect}/>
     <UspBCrossDomainTrail steps={uspBTrail.steps} onSelect={onUspBTrailSelect}/>
     <UspCConnectedTrail steps={uspCTrail.steps} onSelect={onUspCTrailSelect}/>
    </details>
    <Rail run={state==="running"?null:run} running={state==="running"}/>
    <HowProducedPanel
     className="rh-trace ws-produced"
     source={state==="running"?{kind:"running"}:run?{kind:"live",run}:null}
    />

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
         <p className="ws-state">Candidate · unreviewed · not promotable to the graph</p>
         {passportEdge&&<EvidenceContextPassportView edge={passportEdge} heading="Evidence context passport" headingLevel={3}/>}
        </>}
       </div>
       {run&&!picked&&(
        <div className="ws-passport-empty" role="status">
         <p className="ecp-kicker">EVIDENCE CONTEXT PASSPORT · NOT SCIENTIFICALLY APPROVED</p>
         <p className="ws-muted">Select a claim to open its Evidence Context Passport. Missing biological and experimental fields stay explicit — they are not invented.</p>
        </div>
       )}
       <details className="ws-acc" open><summary><Icon name="check" size={16}/>Evidence <b>{supporting.length}</b></summary><p>Claims both checks agreed on as positive. {supporting.length===0&&"None in this run."}</p><ul>{supporting.map(x=><li key={x.id}><button type="button" onClick={()=>setSel(x.id)}>{x.subject} ~ {x.object}</button></li>)}</ul></details>
       <details className="ws-acc"><summary><Icon name="x" size={16}/>Opposing / disputed checks <b>{opposing.length}</b></summary><p>{run.verification.status==="not_configured"?"Not assessed: the model check did not run.":opposing.length===0?"None found in these sources. This does not establish consensus.":"Opposing polarity or disputed model checks — not structured contradiction classes."}</p><ul>{opposing.map(x=><li key={x.id}><button type="button" onClick={()=>setSel(x.id)}>{x.subject} ~ {x.object}</button></li>)}</ul></details>
       <div className="ws-acc ws-acc-static" role="note">
        <p><Icon name="layers" size={16}/> Structured comparison <b>{comparison?.pairCount??0}</b></p>
        <p className="ws-muted">Pairwise outcomes live in the USP A panel below. Verification is bound before contradiction language.</p>
        {(comparison?.pairCount??0)>0&&(
         <button type="button" className="ws-btn" onClick={()=>onTrailSelect("disagreement")}>
          Open why-findings-differ
         </button>
        )}
        {comparison&&comparison.items[0]&&(
         <p className="ws-muted">Example: {COMPARISON_OUTCOME_LABEL[comparison.items[0].outcome]} — {comparison.items[0].leftLabel} vs {comparison.items[0].rightLabel}</p>
        )}
       </div>
       <details className="ws-acc" open={run.hypotheses.items.length>0}><summary><Icon name="flask" size={16}/>Hypotheses <b>{run.hypotheses.items.length}</b></summary>
        {run.hypotheses.items.length===0?<p>{run.hypotheses.reason??"None proposed."}</p>:<>
         <p className="ws-warn">Unvalidated model proposals from {run.hypotheses.basis.findings} agreed findings. Not findings, not recommendations, not reviewed.</p>
         <p className="ws-muted" role="status">{ledgerMsg} <a href="/research/ledger">Open the ledger</a></p>
         <ul className="ws-hyps">{run.hypotheses.items.map(hy=>(
          <li key={hy.id}><span className="ws-tagline">Unvalidated hypothesis</span><b>{hy.statement}</b>
           <div className="ws-cites" role="group" aria-label={`Findings behind ${hy.id}`}>{hy.citedClaimIds.map(id=>{const cc=run.candidates.find(x=>x.id===id);return cc?<button key={id} type="button" onClick={()=>setSel(id)}>{cc.subject} ~ {cc.object}</button>:null})}</div>
           <p className="ws-chal" data-v={hy.challenge?.verdict??"none"}>{hy.challenge?`Second model: ${hy.challenge.verdict}. ${hy.challenge.reason}`:hy.challengeNote??"Not challenged."}</p>
           <div className="ws-row-actions"><button type="button" className="ws-btn" onClick={()=>{const r=fromRunHypothesis(run,hy,new Date().toISOString(),runGaps.filter(g=>g.scope==="scientific").map(g=>g.id));if(!r.ok){setLedgerMsg(r.error);return}const a=ledger.add(r.entry);setLedgerMsg(a.added?"Added to your Hypothesis Ledger.":a.error??"Already in your Hypothesis Ledger.")}}>Add to Hypothesis Ledger</button></div>
           <details><summary>Rationale, prediction, experiment, falsifier</summary>
            <dl><dt>Why</dt><dd>{hy.rationale}</dd><dt>Prediction if true</dt><dd>{hy.prediction}</dd><dt>Experiment</dt><dd>{hy.experiment}</dd><dt>Would be falsified by</dt><dd>{hy.falsifier}</dd><dt>Limits</dt><dd>{hy.limits}</dd><dt>Proposed by</dt><dd>{hy.generatedBy.verifier} ({hy.generatedBy.model})</dd></dl></details></li>))}</ul></>}
       </details>
       <PassportEvidenceTable
        edges={passportEdges}
        sources={passportSources}
        heading="Evidence table for this live brief"
        onInspect={(edgeId)=>{
         const id=edgeId.startsWith("live-claim:")?edgeId.slice("live-claim:".length):edgeId;
         setSel(id);
        }}
       />
       {lr.note&&<p className="ws-muted" role="status">{lr.note}</p>}
       <p className="ws-muted">Model agreement is not scientific proof. {run.verification.independence==="independent_execution_only"?"Both checks ran on one provider (independent execution only).":""}</p>
      </>}
     </section>
    </div>

    <details className="ws-usp-focus" id="ws-usp-panels">
     <summary>USP focus panels (A · B · curated) — not journey complete · not scientific approval</summary>
     {run&&comparison?(
      <UspADisagreementPanel
       run={run}
       comparison={comparison}
       selectedKey={cmpKey}
       onSelectPair={(key)=>{setCmpKey(key);if(key){const item=comparison.items.find(i=>comparisonPairKey(i)===key);if(item)setSel(item.leftId)}}}
       onSelectClaim={setSel}
       ctxLabel={ctxLabel}
      />
     ):run?(
      <section className="ws-card ws-disagree" aria-labelledby="ws-disagree-h">
       <header><h2 id="ws-disagree-h">Why findings may differ</h2></header>
       <p className="ws-muted">Structured comparison will appear when this run has at least two candidates on the same relation.</p>
      </section>
     ):null}

     <CuratedDisagreementPackPanel
      pack={curatedPack}
      selectedId={curatedCaseId}
      onSelect={setCuratedCaseId}
      graphError={graphError}
     />

     <UspBCrossDomainPanel
      bundle={bundle}
      coverage={crossCoverage}
      matches={crossMatches}
      startId={crossStart}
      targetDepartment={crossTarget}
      pathStatus={crossPaths.result?.status??null}
      paths={crossPaths.paths}
      selectedPathIndex={crossPathIndex}
      gapCount={runGaps.length}
      hypothesisCount={run?.hypotheses.items.length??0}
      graphError={graphError}
      onSelectStart={(id)=>{setCrossStart(id);setCrossPathIndex(null)}}
      onSelectTarget={(slug)=>{setCrossTarget(slug);setCrossPathIndex(null)}}
      onSelectPath={setCrossPathIndex}
      onOpenGaps={()=>document.getElementById("ws-gp-h")?.scrollIntoView({behavior:"smooth",block:"start"})}
      onOpenBrief={()=>{setBrief(true);document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"})}}
     />
    </details>

    <UspCConnectedPanel
     profile={profile}
     library={lr.library.entries}
     savedThisSession={lr.savedThisSession}
     reopenedThisSession={lr.reopenedThisSession}
     hasRun={Boolean(run)}
     onSave={()=>{lr.save();setSaved(lr.hasSaved())}}
     onReopen={(id)=>{lr.reopenFromLibrary(id);setSaved(lr.hasSaved())}}
     onOpenBrief={()=>{setBrief(true);document.getElementById("ws-brief-panel")?.scrollIntoView({behavior:"smooth",block:"start"})}}
    />

    {run&&briefPreview?(
     <LiveBriefDecisionPanel
      run={run}
      preview={briefPreview}
      passportEdges={passportEdges}
      passportSources={passportSources}
      markdownOpen={brief}
      onToggleMarkdown={()=>setBrief(b=>!b)}
      onInspectEdge={(edgeId)=>{
       const id=edgeId.startsWith("live-claim:")?edgeId.slice("live-claim:".length):edgeId;
       setSel(id);
      }}
      onSave={()=>{lr.save();setSaved(lr.hasSaved())}}
     />
    ):null}

    <ResearcherUsefulnessPanel
     briefHash={run?.briefHash??null}
     question={run?.question??QUESTION}
     onRated={()=>setUsefulnessTick((n)=>n+1)}
    />

    <section className="ws-card ws-gaps" aria-labelledby="ws-gp-h">
     <header><h2 id="ws-gp-h"><Icon name="layers" size={18}/>Gaps in this run <small>({run?runGaps.length:"none yet"})</small></h2></header>
     {!run?<p className="ws-muted">Gaps appear after a run. They are derived from the run itself, not generated, and a limit of the search is shown apart from a gap in the science.</p>:<>
      <RunGapList gaps={runGaps} track={gapTrack.track} onSet={(id,s,n)=>gapTrack.set(id,s,n,runGaps.find(g=>g.id===id)?.candidateIds.length??0)}/>
      {gapTrack.blocked&&<p className="ws-err" role="status">This browser blocked local storage, so your status was not kept.</p>}
      <p className="ws-muted">Status is kept in this browser only. <a href="/research/gaps">Open the Gap Register</a></p></>}
    </section>

    <TestableNextQuestionsPanel
     pack={testableQuestions}
     onInspectClaim={(id)=>setSel(id)}
     onOpenGaps={()=>document.getElementById("ws-gp-h")?.scrollIntoView({behavior:"smooth",block:"start"})}
    />

    <BlockedJourneyStepsPanel
     pack={blockedJourneySteps}
     onOpenLibrary={()=>document.getElementById("ws-conn-h")?.scrollIntoView({behavior:"smooth",block:"start"})}
    />
   </main>
  </ResearchAppShell>
 );
}
