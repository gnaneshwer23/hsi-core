import {Link} from "react-router-dom";
import {buildProducedTrace,type ProducedTraceSource} from "../lib/producedTrace";

/** Honesty panel: steps from a real run record only. No fake progress animation. */
export function HowProducedPanel({
 source,
 defaultOpen=false,
 className="rh-trace",
}:{source:ProducedTraceSource|null|undefined;defaultOpen?:boolean;className?:string}){
 const view=buildProducedTrace(source);
 return(
  <details className={className} open={defaultOpen||undefined}>
   <summary>{view.title}</summary>
   <ol>
    {view.steps.map((s,i)=><li key={i}>{s}</li>)}
   </ol>
   {view.note&&<p className="rh-note">{view.note}</p>}
   <p className="rh-note">
    Maturity:{" "}
    {view.capabilities.map((c,i)=>(
     <span key={c.id}>{i>0?" · ":null}<Link to={c.href}>{c.label}</Link></span>
    ))}
    . Engineering level is not scientific acceptance.
   </p>
  </details>
 );
}
