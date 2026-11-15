import {useEffect,useMemo,useState,type ReactNode} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../../src/knowledgeGraph/domainGraph";
import {buildGapRegister} from "../../../../src/knowledgeGraph/gapRegister";
import {STEPS,progressFor,readBrowserRecord,type BrowserRecord} from "../../lib/journey";
import {Icon} from "./AppIcons";
import type {ProgramView} from "../../lib/program";
import type {Profile} from "../../lib/researchHome";

const n=(x:number)=>x.toLocaleString("en-GB");
const HUMAN=new Set(["human_in_vivo","human_ex_vivo","human_cell_line"]);
/** Decorative bars. The numbers they draw are always stated in text next to them. */
function Bars({values,label}:{values:number[];label:string}){
 const max=Math.max(1,...values);
 return <span className="pm-bars" role="img" aria-label={label}>{values.map((v,i)=><i key={i} style={{height:`${Math.max(8,Math.round(v/max*100))}%`}}/>)}</span>;
}
type Tile={tone:"mint"|"peach"|"lavender"|"sky";icon:string;title:string;value:string;note:string;bars:number[];barsLabel:string;to:string};

function tiles(b:DomainBundle|null,rec:BrowserRecord|null,v:ProgramView|null):Tile[]{
 if(v&&b){
  const done=rec?Object.values(progressFor(rec)).filter(p=>p.state==="done").length:0;
  const tracked=rec?[rec.savedRun,rec.gapStatuses>0,rec.withCohortObservation>0,rec.ledgerEntries>0,rec.withTargets>0,rec.loopClosed>0]:[];
  const animal=v.edges.filter(e=>/mouse|rodent/.test(e.model)).length,names=v.anchors.map(a=>a.name).join(", ");
  return [
   {tone:"mint",icon:"graph",title:"Concepts in your area",value:n(v.hop.size),note:`within one hop of ${names}`,bars:v.counts.filter((c,i)=>i>0||c>0),barsLabel:"Concepts at each distance from your anchors",to:"/research/knowledge-graph"},
   {tone:"lavender",icon:"layers",title:"Your relationships",value:n(v.edges.length),note:`${n(v.human)} with human evidence · ${n(animal)} animal · none reviewed`,bars:[v.human,animal,Math.max(0,v.edges.length-v.human-animal)],barsLabel:"Your relationships by evidence model: human, animal, other",to:"/research/knowledge-graph"},
   {tone:"peach",icon:"search",title:"Gaps in your area",value:n(v.gaps.length),note:v.gaps[0]?`Highest ordering score: ${v.gaps[0].priority.score}. An aid, not importance`:"None recorded here. A coverage limit, not a finding",bars:v.gaps.map(g=>g.priority.score).slice(0,9),barsLabel:"Ordering score of each gap in your area",to:"/research/gaps"},
   {tone:"sky",icon:"flask",title:"Your loop",value:rec?`${done} of 8`:"…",note:rec?(rec.ledgerEntries?`${n(rec.ledgerEntries)} in your ledger, kept in this browser`:"Steps recorded in this browser so far"):"Reading this browser",bars:tracked.length?tracked.map(t=>t?1:0.15):[0.15],barsLabel:"Which recorded steps you have completed",to:"/research/journey"},
  ];
 }
 const cands=b?b.edges.filter(e=>e.kind==="source_candidate"):[];
 const byDomain=new Map<string,number>();
 if(b)for(const x of b.nodes){const d=x.domains[0]??"other";byDomain.set(d,(byDomain.get(d)??0)+1)}
 const human=cands.filter(e=>HUMAN.has(e.model)).length,animal=cands.filter(e=>/mouse|rodent/.test(e.model)).length;
 const gaps=b?buildGapRegister(b):[];
 const done=rec?Object.values(progressFor(rec)).filter(p=>p.state==="done").length:0;
 const tracked=rec?[rec.savedRun,rec.gapStatuses>0,rec.withCohortObservation>0,rec.ledgerEntries>0,rec.withTargets>0,rec.loopClosed>0]:[];
 return [
  {tone:"mint",icon:"graph",title:"Concepts",value:b?n(b.nodes.length):"…",note:b?`across ${byDomain.size} recorded domains`:"Verifying the published graph",bars:[...byDomain.values()].sort((a,c)=>c-a).slice(0,7),barsLabel:"Concepts per recorded domain",to:"/research/knowledge-graph"},
  {tone:"lavender",icon:"layers",title:"Recorded relationships",value:b?n(cands.length):"…",note:b?`${n(human)} with human evidence · ${n(animal)} animal · none reviewed`:"Verifying the published graph",bars:[human,animal,Math.max(0,cands.length-human-animal)],barsLabel:"Relationships by evidence model: human, animal, other",to:"/research/knowledge-graph"},
  {tone:"peach",icon:"search",title:"Gaps recorded",value:b?n(gaps.length):"…",note:gaps[0]?`Highest ordering score: ${gaps[0].priority.score}. An aid, not importance`:"Derived from the graph",bars:gaps.map(g=>g.priority.score).slice(0,9),barsLabel:"Ordering score of each recorded gap",to:"/research/gaps"},
  {tone:"sky",icon:"flask",title:"Your loop",value:rec?`${done} of 8`:"…",note:rec?(rec.ledgerEntries?`${n(rec.ledgerEntries)} in your ledger, kept in this browser`:"Steps recorded in this browser so far"):"Reading this browser",bars:tracked.length?tracked.map(t=>t?1:0.15):[0.15],barsLabel:"Which recorded steps you have completed",to:"/research/journey"},
 ];
}

type Move={title:string;why:string;to:string};
/** Next moves: derived only from the program's records and this browser's progress. Nothing is generated. */
function moves(p:Profile,v:ProgramView|null,rec:BrowserRecord|null):Move[]{
 const out:Move[]=[];
 if(v&&v.anchors.length>=2)out.push({title:`Trace how ${v.anchors[0]!.name} connects to ${v.anchors[1]!.name}`,why:`${v.edges.length} recorded relationships sit within one hop of your anchors. Open the path and inspect each source.`,to:"/research/knowledge-graph"});
 if(v){
  out.push(v.gaps.length?{title:`Review ${v.gaps.length} recorded gap${v.gaps.length===1?"":"s"} in your area`,why:"Each lists what is missing and a possible next study.",to:"/research/gaps"}
   :{title:"Find literature gaps for your topics",why:"No gap in the published graph touches your area. That is a coverage limit, so count literature co-mentions instead.",to:"/research/home#rh-gaps"});
  if(v.human===0&&v.edges.length>0)out.push({title:"No human evidence in your area yet",why:"Every recorded relationship here rests on non-human models. That is where a human cohort question would add the most.",to:"/research/cohort"});
 }
 if(!p.orcid&&p.papers.length===0)out.push({title:"Add your own papers",why:"Your radar then follows the literature around your work.",to:"/welcome"});
 if(rec){const next=STEPS.find(s=>progressFor(rec)[s.n]?.state!=="done");if(next)out.push({title:`Next in the loop: ${next.title}`,why:"The first step you have not recorded yet.",to:next.to})}
 return out.slice(0,4);
}
function NextMoves({list}:{list:Move[]}){
 return (
  <section className="pm-card pm-moves" aria-labelledby="pm-moves-h">
   <header><h2 id="pm-moves-h">Next moves</h2></header>
   {list.length===0?<p className="pm-note">Complete setup to see next moves for your area.</p>:<ol>{list.map(m=><li key={m.title}><Link to={m.to}><b>{m.title}</b><span>{m.why}</span></Link></li>)}</ol>}
  </section>
 );
}

function Loop({rec}:{rec:BrowserRecord|null}){
 const prog=rec?progressFor(rec):null;
 return (
  <section className="pm-card pm-loop" aria-labelledby="pm-loop-h">
   <header><h2 id="pm-loop-h">Where you are in the loop</h2><Link className="pm-more" to="/research/journey">Guided walkthrough <Icon name="arrow" size={15}/></Link></header>
   <ol>{STEPS.map(s=>{const p=prog?.[s.n];return (
    <li key={s.id} data-state={p?.state??"untracked"}>
     <Link to={s.to}><span className="pm-dot" aria-hidden="true">{p?.state==="done"?<Icon name="check" size={13}/>:s.n}</span><span className="pm-lt"><b>{s.title}</b><small>{p?.state==="untracked"?"Shown, not stored":p?.text??"Reading this browser…"}</small></span></Link>
    </li>);})}</ol>
  </section>
 );
}

/** The researcher's overview: real counts from the published graph and from this browser, no invented activity. */
export function Overview({bundle,view=null,profile,children}:{bundle:DomainBundle|null;view?:ProgramView|null;profile:Profile;children?:ReactNode}){
 const [rec,setRec]=useState<BrowserRecord|null>(null);
 useEffect(()=>{
  try{
   setRec(readBrowserRecord(localStorage));
  }catch{setRec(null)}
 },[]);
 const list=useMemo(()=>tiles(bundle,rec,view),[bundle,rec,view]);
 return (
  <>
   <section className="pm-tiles" aria-label={view?"Overview of your research area":"Overview"}>
    {list.map(t=>(
     <Link key={t.title} to={t.to} className="pm-tile" data-tone={t.tone}>
      <span className="pm-tile-top"><span className="pm-tile-ico" aria-hidden="true"><Icon name={t.icon} size={18}/></span><b>{t.title}</b><Icon name="arrow" size={15}/></span>
      <span className="pm-value">{t.value}</span>
      <span className="pm-tile-note">{t.note}</span>
      <Bars values={t.bars} label={t.barsLabel}/>
     </Link>
    ))}
   </section>
   {children}
   <div className="pm-pair"><Loop rec={rec}/><NextMoves list={moves(profile,view,rec)}/></div>
  </>
 );
}
