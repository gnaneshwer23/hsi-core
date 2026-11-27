import {useMemo} from "react";
import {
 READING_LABEL,candidateChecks,compareAssertions,type ComparisonUnit,type GraphModel,type RowStatus,
} from "../../../src/graphWorkspace";
import {doiUrl} from "./Panels";

const STATUS:Record<RowStatus,string>={same:"Same",differs:"Differs",cannot_tell:"Cannot tell",not_stated_by_any:"Not stated by any"};
const STATUS_HINT:Record<RowStatus,string>={
 same:"Stated and equal in every finding.",differs:"Stated and different.",cannot_tell:"Not stated in every finding, so a difference cannot be ruled in or out.",not_stated_by_any:"No finding states it.",
};

export function ComparePanel({model,units,showUnits,compareIds,setCompareIds,activeUnit,setActiveUnit,globalCount,onWhole,inWhole}:{
 model:GraphModel;units:readonly ComparisonUnit[];showUnits:boolean;compareIds:readonly string[];setCompareIds:(ids:string[])=>void;
 activeUnit:string|null;setActiveUnit:(id:string|null)=>void;globalCount:number;onWhole:()=>void;inWhole:boolean;
}){
 const recs=useMemo(()=>compareIds.map(id=>model.assertions.find(a=>a.id===id)).filter((a):a is NonNullable<typeof a>=>!!a),[compareIds,model]);
 const cmp=useMemo(()=>recs.length>=2?compareAssertions(recs):null,[recs]);
 const unit=units.find(u=>u.id===activeUnit)??null;
 const checks=cmp?candidateChecks(cmp,model,unit?[unit.subjectId,...(unit.objectId?[unit.objectId]:[])]:recs.flatMap(r=>[r.subject.id,r.object.id])):[];
 const dis=units.filter(u=>u.reading!=="no_disagreement");

 return (
  <section className="gw-card gw-wide" aria-labelledby="gw-compare" id="gw-compare-panel">
   <h2 id="gw-compare">Compare findings</h2>
   {showUnits&&(<>
    {dis.length?<>
     <p className="gw-hint">Disagreements recorded for the concepts in this view, from the existing context classifier. A disagreement is never called resolved, and the comparison does not say which finding is right.</p>
     <ul className="gw-units">{dis.map(u=>(
      <li key={u.id} data-reading={u.reading} data-active={activeUnit===u.id||undefined}>
       <div><span className="gw-reading" data-reading={u.reading}>{READING_LABEL[u.reading]}</span> <strong>{u.label}</strong></div>
       <small>{u.assertionIds.length} records in {u.strata} context{u.strata===1?"":"s"} from {u.studies} source{u.studies===1?"":"s"}. Context class: {u.conflictLabel}.</small>
       <button type="button" className="gw-btn" onClick={()=>{setActiveUnit(u.id);setCompareIds(u.assertionIds.slice(0,6) as string[])}}>Compare these findings</button>
      </li>))}
     </ul>
    </>:<div className="gw-empty" role="status">
     <p>No two relationships in this view disagree, so there is nothing to compare. That describes this slice, not the science: it does not show that nothing conflicts.</p>
     {!inWhole&&globalCount>0&&<p><button type="button" className="gw-btn" onClick={onWhole}>Show the {globalCount} disagreement{globalCount===1?"":"s"} recorded in the whole published graph</button></p>}
    </div>}
   </>)}

   {!cmp&&<p className="gw-hint">{showUnits?"":"Choose two to six relationships with the Compare checkboxes in the table view to see which recorded variables differ."}</p>}

   {cmp&&(<>
    {unit&&<div className="gw-verdict" data-reading={unit.reading}>
     <p><span className="gw-reading" data-reading={unit.reading}>{READING_LABEL[unit.reading]}</span> <strong>{unit.label}</strong></p>
     <p>{unit.statement}</p>
     <ul className="gw-limits">{unit.limits.map(l=><li key={l}>{l}</li>)}</ul>
     <p className="gw-hint">Adjudication: not performed.</p>
    </div>}
    <div className="gw-scroll" tabIndex={0} role="region" aria-label="Side-by-side comparison, scrolls sideways">
     <table className="gw-table gw-compare">
      <caption className="sr-only">Recorded context for {recs.length} findings. Differences are marked; none is judged.</caption>
      <thead><tr><th scope="col">Variable</th>{recs.map((r,i)=><th scope="col" key={r.id}>Finding {String.fromCharCode(65+i)}<small>{r.subject.name} {r.reportedAs} {r.object.name}</small></th>)}<th scope="col">Reading</th></tr></thead>
      <tbody>
       {cmp.rows.map(row=>(
        <tr key={row.key} data-status={row.status}>
         <th scope="row">{row.label}</th>
         {row.cells.map((c,i)=><td key={i}>{c.state==="stated"?c.value:<span className="gw-ns">Not stated</span>}</td>)}
         <td><span className="gw-badge" data-status={row.status} title={STATUS_HINT[row.status]}>{STATUS[row.status]}</span></td>
        </tr>))}
       <tr><th scope="row">Source</th>{recs.map(r=><td key={r.id}>{r.evidence.doi?<a href={doiUrl(r.evidence.doi)} target="_blank" rel="noopener noreferrer">DOI</a>:"No DOI"}</td>)}<td/></tr>
      </tbody>
     </table>
    </div>
    <p className="gw-hint" role="status">{cmp.differs.length?`Differs: ${cmp.differs.join(", ")}.`:"No stated variable differs."} {cmp.cannotTell.length?`Cannot tell, because it is not stated for every finding: ${cmp.cannotTell.join(", ")}.`:""}</p>
    {checks.length>0&&<><h3>Candidate checks</h3>
     <p className="gw-hint">Prompts that could narrow the uncertainty. They are not validated protocols and do not favour either finding.</p>
     <ul className="gw-list">{checks.map(c=><li key={c.text}>{c.text}</li>)}</ul></>}
    <button type="button" className="gw-link" onClick={()=>{setCompareIds([]);setActiveUnit(null)}}>Clear comparison</button>
   </>)}
  </section>
 );
}
