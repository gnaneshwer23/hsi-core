import type {ReactNode} from "react";
import {
 CONTEXT_KEYS,CONTEXT_LABEL,HSI_DOMAINS,MAX_CONTEXT,domainLabel,type DomainCoverageRow,type Facets,type Filters,type GraphAssertionView,type GraphModel,type Stated,
} from "../../../src/graphWorkspace";

const READ:Record<string,string>={not_stated_in_source:"The source does not say.",not_recorded_in_graph_schema:"HSI does not record this field yet."};
const LEVEL:Record<string,string>={none:"No coverage",minimal:"Minimal",partial:"Partial",substantial:"Substantial"};

export function Checks({title,facet,value,onChange,format}:{title:string;facet:readonly {value:string;count:number}[];value:readonly string[];onChange:(v:string[])=>void;format?:(v:string)=>string}){
 if(!facet.length)return null;
 return (
  <fieldset className="gw-check">
   <legend>{title}</legend>
   {facet.slice(0,10).map(f=>(
    <label key={f.value}><input type="checkbox" checked={value.includes(f.value)} onChange={()=>onChange(value.includes(f.value)?value.filter(x=>x!==f.value):[...value,f.value])}/>
     <span>{format?format(f.value):f.value}</span><b>{f.count}</b></label>
   ))}
  </fieldset>
 );
}

export function FilterPanel({filters,set,facets,filtered,onReset,depth,setDepth,added,truncated,coverage}:{
 filters:Filters;set:(f:Filters)=>void;facets:Facets;filtered:boolean;onReset:()=>void;depth:number;setDepth:(n:number)=>void;added:number;truncated:boolean;coverage:readonly DomainCoverageRow[];
}){
 return (
  <aside className="gw-left" aria-label="Filters">
   <div className="gw-head"><h2>Filters</h2>{filtered&&<button type="button" className="gw-link" onClick={onReset}>Reset</button>}</div>
   <Checks title="Scientific domain" facet={facets.domains} value={filters.domains} onChange={v=>set({...filters,domains:v as Filters["domains"]})} format={v=>domainLabel(v as never)}/>
   <Checks title="Concept type" facet={facets.kinds} value={filters.kinds} onChange={v=>set({...filters,kinds:v})}/>
   <Checks title="Reported relationship" facet={facets.predicates} value={filters.predicates} onChange={v=>set({...filters,predicates:v})} format={v=>v.replaceAll("_"," ")}/>
   <Checks title="Species" facet={facets.species} value={filters.species} onChange={v=>set({...filters,species:v})}/>
   <Checks title="Model system" facet={facets.models} value={filters.models} onChange={v=>set({...filters,models:v})}/>
   <label className="gw-range"><span>Context stated: at least {filters.minContext} of {MAX_CONTEXT}</span>
    <input type="range" min={0} max={MAX_CONTEXT} value={filters.minContext} onChange={e=>set({...filters,minContext:Number(e.target.value)})}/></label>
   <fieldset className="gw-radio"><legend>Findings recorded as not holding</legend>
    {(["any","only","exclude"] as const).map(v=><label key={v}><input type="radio" name="gw-neg" checked={filters.negated===v} onChange={()=>set({...filters,negated:v})}/><span>{{any:"Include",only:"Only these",exclude:"Exclude"}[v]}</span></label>)}
   </fieldset>
   <fieldset className="gw-radio"><legend>Include neighbours</legend>
    <div className="gw-seg" role="radiogroup" aria-label="Neighbour hops">{[0,1,2].map(n=><button key={n} type="button" role="radio" aria-checked={depth===n} onClick={()=>setDepth(n)}>{n===0?"None":`${n} hop${n>1?"s":""}`}</button>)}</div>
    <p className="gw-hint">{depth===0?"Only the chosen scope.":`Added ${added} relationship${added===1?"":"s"}.${truncated?" Capped at the size limit.":""}`}</p>
   </fieldset>
   <section aria-labelledby="gw-cov"><h3 id="gw-cov">Coverage in the published graph</h3>
    <ul className="gw-cov">{coverage.map(c=><li key={c.domain} data-level={c.level}><span>{domainLabel(c.domain)}</span><b>{LEVEL[c.level]}</b><small>{c.relationships} relationships</small></li>)}</ul>
    <p className="gw-hint">Counts of reported relationships, not a measure of how well a domain is understood.</p>
   </section>
  </aside>
 );
}

export const doiUrl=(doi:string)=>`https://doi.org/${encodeURI(doi)}`;
export const pmidUrl=(p:string)=>`https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(p)}/`;

function Cell({v}:{v:Stated<string>}){return v.state==="stated"?<>{v.value}</>:<span className="gw-ns" title={READ[v.reason]}>Not stated</span>}

export function AssertionTable({rows,selected,onSelect,compare}:{rows:readonly GraphAssertionView[];selected:string|null;onSelect:(id:string)=>void;compare?:{ids:readonly string[];toggle:(id:string)=>void;max:number}}){
 if(!rows.length)return <p className="gw-empty" role="status">No relationships match. That is a filter result, not evidence of absence.</p>;
 return (
  <div className="gw-scroll" tabIndex={0} role="region" aria-label="Relationships table, scrolls sideways">
   <table className="gw-table">
    <caption className="sr-only">Candidate relationships in view. None is reviewed or approved.</caption>
    <thead><tr>{compare&&<th scope="col">Compare</th>}<th scope="col">Concept</th><th scope="col">As reported</th><th scope="col">Concept</th><th scope="col">Species</th><th scope="col">Model</th><th scope="col">Context stated</th><th scope="col">Source</th></tr></thead>
    <tbody>{rows.map(a=>(
     <tr key={a.id} data-selected={selected===a.id}>
      {compare&&<td><input type="checkbox" aria-label={`Compare: ${a.subject.name} ${a.reportedAs} ${a.object.name}`} checked={compare.ids.includes(a.id)} disabled={!compare.ids.includes(a.id)&&compare.ids.length>=compare.max} onChange={()=>compare.toggle(a.id)}/></td>}
      <th scope="row"><button type="button" onClick={()=>onSelect(a.id)} aria-pressed={selected===a.id}>{a.subject.name}</button></th>
      <td>{a.negated&&<span className="gw-neg">Recorded as not holding: </span>}{a.reportedAs}</td>
      <td>{a.object.name}</td>
      <td><Cell v={a.context.species}/></td><td><Cell v={a.context.modelSystem}/></td>
      <td>{a.contextCompleteness.stated} of {a.contextCompleteness.recordable}</td>
      <td>{a.evidence.doi?<a href={doiUrl(a.evidence.doi)} target="_blank" rel="noopener noreferrer">DOI</a>:"No DOI"}{a.evidence.pmid&&<> · <a href={pmidUrl(a.evidence.pmid)} target="_blank" rel="noopener noreferrer">PMID</a></>}</td>
     </tr>))}
    </tbody>
   </table>
  </div>
 );
}

function Section({title,children}:{title:string;children:ReactNode}){return <section className="gw-sec"><h3>{title}</h3>{children}</section>}

export function Inspector({model,assertion,entityId,onSelectEntity,onSelectAssertion,related,statusSummary}:{
 model:GraphModel;assertion:GraphAssertionView|null;entityId:string|null;onSelectEntity:(id:string)=>void;onSelectAssertion:(id:string)=>void;related:readonly GraphAssertionView[];statusSummary:string;
}){
 const node=entityId?model.nodes.get(entityId):null;
 return (
  <aside className="gw-right" aria-label="Inspector">
   {!assertion&&!node&&<><h2>Inspector</h2><p className="gw-hint">Select a concept or a relationship to see what is stated, what is not, and where it came from.</p><p className="gw-note">{statusSummary}</p></>}
   {node&&!assertion&&(<>
    <h2>{node.name}</h2>
    <p className="gw-hint">{node.kind} · {(model.nodeDomains.get(node.id)?.domains.map(d=>domainLabel(d)).join(", "))||"No HSI domain mapped"}</p>
    {node.aliases.length>0&&<p className="gw-hint">Also called: {node.aliases.slice(0,4).join(", ")}</p>}
    <Section title="Identifiers"><p>No canonical identifier is shown in this phase. Candidate ontology mappings exist for some concepts and none is reviewed.</p></Section>
    <Section title={`Relationships (${related.length})`}>
     <ul className="gw-list">{related.slice(0,30).map(a=><li key={a.id}><button type="button" onClick={()=>onSelectAssertion(a.id)}>{a.subject.id===node.id?"→":"←"} {a.reportedAs} {a.subject.id===node.id?a.object.name:a.subject.name}</button></li>)}</ul>
    </Section>
   </>)}
   {assertion&&(<>
    <h2>Relationship</h2>
    <p className="gw-claim"><button type="button" className="gw-link" onClick={()=>onSelectEntity(assertion.subject.id)}>{assertion.subject.name}</button> {assertion.negated?<em>recorded as not holding:</em>:""} <strong>{assertion.reportedAs}</strong> <button type="button" className="gw-link" onClick={()=>onSelectEntity(assertion.object.id)}>{assertion.object.name}</button></p>
    <p className="gw-hint">The source’s wording, shown as reported. It is not a claim that HSI has established this.</p>
    {assertion.statement&&<Section title="As recorded"><p>{assertion.statement}</p></Section>}
    <Section title="Status">
     <ul className="gw-status"><li>Candidate</li><li>Unreviewed</li><li>Confidence not calibrated</li><li>Source not verified</li></ul>
     <p className="gw-hint">No relationship in the published graph is reviewed or approved.</p>
    </Section>
    <Section title={`Experimental context · ${assertion.contextCompleteness.stated} of ${assertion.contextCompleteness.recordable} stated`}>
     <dl className="gw-ctx">{CONTEXT_KEYS.map(k=>{const v=assertion.context[k];return <div key={k} data-state={v.state}><dt>{CONTEXT_LABEL[k]}</dt><dd>{v.state==="stated"?v.value:<><span className="gw-ns">Not stated</span> <small>{READ[v.reason]}</small></>}</dd></div>})}</dl>
    </Section>
    <Section title="Source evidence">
     <p>{assertion.evidence.doi?<a href={doiUrl(assertion.evidence.doi)} target="_blank" rel="noopener noreferrer">DOI {assertion.evidence.doi}</a>:"No DOI recorded."}{assertion.evidence.pmid&&<> · <a href={pmidUrl(assertion.evidence.pmid)} target="_blank" rel="noopener noreferrer">PubMed {assertion.evidence.pmid}</a></>}</p>
     <ul className="gw-status">
      <li>{{repository_locator_not_reverified:"Source located in the repository, not re-verified",bibliographic_candidate_not_retrieved:"Bibliographic candidate, not retrieved"}[assertion.evidence.identity??"bibliographic_candidate_not_retrieved"]}</li>
      <li>Usage rights {assertion.evidence.rights==="import_receipt_only"?"limited to an import receipt":"unverified"}</li>
      <li>{{not_available:"No passage recorded",locator_only:"Passage locator only, no text",text_recorded:"Passage text recorded"}[assertion.evidence.passage]}</li>
     </ul>
     <p className="gw-hint">HSI shows a passage only where one is recorded and rights allow. None is invented.</p>
    </Section>
    {assertion.limitations&&<Section title="Limitations"><p>{assertion.limitations}</p></Section>}
    {assertion.scopeWarnings.length>0&&<Section title="Scope warnings"><ul className="gw-list">{assertion.scopeWarnings.map(w=><li key={w}>{w}</li>)}</ul></Section>}
    <Section title="Version"><p className="gw-hint">Graph version {assertion.graphVersion.slice(0,8)}. Per-relationship version history is not recorded yet.</p></Section>
   </>)}
  </aside>
 );
}

export {HSI_DOMAINS};
