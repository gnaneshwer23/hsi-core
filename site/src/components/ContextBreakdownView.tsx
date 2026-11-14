import {useMemo} from "react";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {breakdownForConcept,breakdownForPair,CONTEXT_FIELDS,exportBreakdown} from "../../../src/knowledgeGraph/contextBreakdown";

const MODEL:Record<string,string>={human_in_vivo:"Human participants",human_ex_vivo:"Human cells (ex vivo)",human_cell_line:"Human cell line",mouse:"Mouse",rodent:"Rodent",mixed:"Mixed systems",unspecified:"Not stated"};
const DIRECTION:Record<string,string>={reported:"Finding reported",negative:"Negative finding",mixed:"Mixed (reported and negative)"};
const FIELD:Record<string,string>={model:"study system",tissue:"tissue",population:"population",design:"design"};
function download(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+"\n"],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

/** Evidence by context for a relationship (pair) or a concept. Never a single score. */
export function ContextBreakdownView({bundle,scope,heading,headingLevel=4}:{bundle:DomainBundle;scope:{kind:"pair";subjectId:string;objectId:string}|{kind:"concept";nodeId:string};heading:string;headingLevel?:3|4}){
 const b=useMemo(()=>scope.kind==="pair"?breakdownForPair(bundle,scope.subjectId,scope.objectId):breakdownForConcept(bundle,scope.nodeId),[bundle,scope]);
 const H=("h"+headingLevel) as "h3"|"h4",id="cb-"+(scope.kind==="pair"?scope.subjectId+scope.objectId:scope.nodeId).replace(/[^a-z0-9]/gi,"-");
 return <section className="cb" aria-labelledby={id}>
  <H id={id}>{heading}</H>
  <p className="cb-summary"><strong>{b.summary}</strong></p>
  {b.strata.length>0&&<div className="cb-scroll" tabIndex={0} role="region" aria-label={heading+" table"}><table className="cb-table">
   <caption>Source-linked candidate records grouped by the context each one states. Counts are distinct sources, not independent studies.</caption>
   <thead><tr><th scope="col">Study system</th><th scope="col">Tissue</th><th scope="col">Population</th><th scope="col">Design</th><th scope="col">Sources</th><th scope="col">Direction</th><th scope="col">Not stated</th></tr></thead>
   <tbody>{b.strata.map(s=><tr key={s.recordIds.join("|")}>
    <th scope="row">{MODEL[s.key.model]??s.key.model}</th><td>{s.key.tissue??<span className="cb-na">Not stated</span>}</td><td>{s.key.population??<span className="cb-na">Not stated</span>}</td><td>{s.key.design}</td>
    <td className="cb-num">{s.studyCount}{s.recordsWithoutSource>0?<small> (+{s.recordsWithoutSource} without a source)</small>:null}</td>
    <td>{DIRECTION[s.direction]}{s.negativeFindings>0&&s.direction==="mixed"?<small> ({s.negativeFindings} of {s.recordIds.length} negative)</small>:null}</td>
    <td>{s.missingFields.length?s.missingFields.map(f=>FIELD[f]).join(", "):"None"}</td>
   </tr>)}</tbody></table></div>}
  {b.totals.records>0&&<p className="cb-missing">Records not stating: {CONTEXT_FIELDS.map(f=>`${FIELD[f]} ${b.missing[f]} of ${b.totals.records}`).join(" · ")}. {b.completeContextShare===0?"No record has complete context.":`${Math.round((b.completeContextShare??0)*100)}% have complete context.`}</p>}
  <ul className="cb-caveats">{b.caveats.map(c=><li key={c}>{c}</li>)}</ul>
  <p className="cb-na-list">Not assessed here: {b.notAssessed.map(n=>n.replaceAll("_"," ")).join(", ")}. No score or conclusion is given.</p>
  <button type="button" className="cb-btn" onClick={()=>download(exportBreakdown(b),"hsi-context-breakdown.json")}>Export this breakdown</button>
 </section>;
}
