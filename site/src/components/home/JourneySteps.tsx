import {Link} from "react-router-dom";
import {STEPS,type Progress,type StatusKind} from "../../lib/journey";
import {Icon} from "./AppIcons";

export const KIND:Record<StatusKind,string>={live:"Live public source",published:"Published, unreviewed",synthetic:"Synthetic data",derived:"Derived from records",manual:"Written by you",local:"This browser only"};
/** The eight connected steps. Used by the public "How it works" page and by the signed-in walkthrough (which adds progress from this browser). */
export function JourneySteps({progress,headingLevel=2}:{progress?:Record<number,Progress>;headingLevel?:2|3}){
 const H=("h"+headingLevel) as "h2"|"h3";
 return (
  <ol className="jr-steps" aria-label="Walkthrough steps">
   {STEPS.map(s=>{const p=progress?.[s.n];return (
    <li key={s.id} className="rh-card jr-step" data-state={p?.state??"none"}>
     <header><span className="jr-n" aria-hidden="true">{s.n}</span><div><H>{s.title}</H><p className="rh-sub">{s.question}</p></div><span className="jr-kind" data-k={s.status.kind}>{KIND[s.status.kind]}</span></header>
     <p className="rh-note">{s.status.label}</p>
     <dl className="hl-dl"><dt>What it shows</dt><dd>{s.proves}</dd><dt>What it does not</dt><dd>{s.doesNot}</dd></dl>
     {p&&<p className="jr-prog" data-state={p.state}><span className="jr-state">{p.state==="done"?"Done":p.state==="todo"?"Not yet":"Not tracked"}</span> {p.text}</p>}
     <div className="rh-row"><Link className="rh-primary" to={s.to}>{s.cta} <Icon name="arrow" size={16}/></Link></div>
    </li>);})}
  </ol>
 );
}
