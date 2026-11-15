import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../../src/knowledgeGraph/domainGraph";
import {buildGapRegister,parseTracking} from "../../../../src/knowledgeGraph/gapRegister";
import {GAP_REGISTER_KEY,RUN_GAPS_KEY} from "../../lib/storageKeys";
import {STEPS,progressFor,readBrowserRecord,type BrowserRecord} from "../../lib/journey";
import {Icon} from "./AppIcons";
import type {ProgramView} from "../../lib/program";

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

/** Month grid that marks only days on which the researcher really set a gap status. Nothing is simulated. */
function Activity({days}:{days:Set<string>}){
 const now=new Date(),y=now.getFullYear(),m=now.getMonth();
 const first=new Date(y,m,1),lead=(first.getDay()+6)%7,total=new Date(y,m+1,0).getDate();
 const cells=[...Array(lead).fill(null),...Array.from({length:total},(_,i)=>i+1)];
 const key=(d:number)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
 const marked=[...days].filter(d=>d.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).length;
 return (
  <section className="pm-card pm-cal" aria-labelledby="pm-cal-h">
   <header><h2 id="pm-cal-h">{now.toLocaleString("en-GB",{month:"long",year:"numeric"})}</h2><span className="pm-pill">{marked?`${marked} day${marked===1?"":"s"} with activity`:"No activity yet"}</span></header>
   <ul className="pm-grid7" aria-label="Days this month on which you recorded work">
    {["M","T","W","T","F","S","S"].map((d,i)=><li key={i} className="pm-dow" aria-hidden="true">{d}</li>)}
    {cells.map((d,i)=>d===null?<li key={"e"+i} aria-hidden="true"/>:<li key={d} className="pm-day" data-on={days.has(key(d))} data-today={d===now.getDate()} aria-label={`${d} ${now.toLocaleString("en-GB",{month:"long"})}${days.has(key(d))?", you recorded work":""}`}>{d}</li>)}
   </ul>
   <p className="pm-note">Days appear when you set a status in the Gap Register. Kept in this browser only.</p>
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
export function Overview({bundle,view=null}:{bundle:DomainBundle|null;view?:ProgramView|null}){
 const [rec,setRec]=useState<BrowserRecord|null>(null),[days,setDays]=useState<Set<string>>(new Set());
 useEffect(()=>{
  try{
   setRec(readBrowserRecord(localStorage));
   const d=new Set<string>();
   for(const k of [GAP_REGISTER_KEY,RUN_GAPS_KEY])for(const v of Object.values(parseTracking(localStorage.getItem(k))))for(const h of v.history){const t=new Date(h.at);if(!Number.isNaN(t.getTime()))d.add(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`)}
   setDays(d);
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
   <div className="pm-pair"><Loop rec={rec}/><Activity days={days}/></div>
  </>
 );
}
