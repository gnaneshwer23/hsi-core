import {useEffect,useState,type ReactNode} from "react";
import {
 CONTEXT_KEYS,CONTEXT_LABEL,conceptEvidence,conceptIdentifiers,sourceEvidence,typeProposal,type SourceEvidenceView,HSI_DOMAINS,MAX_CONTEXT,bandLabel,domainLabel,isLevel,scaleOfKind,type ScaleBand,type DomainCoverageRow,type Facets,type Filters,type GraphAssertionView,type GraphModel,type Stated,
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
   <Checks title="Biological scale" facet={facets.scales} value={filters.scales} onChange={v=>set({...filters,scales:v as ScaleBand[]})} format={v=>bandLabel(v as ScaleBand)}/>
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

const IDENTITY:Record<string,string>={repository_locator_not_reverified:"Source located in the repository, not re-verified",bibliographic_candidate_not_retrieved:"Bibliographic candidate, not retrieved"};
const RIGHTS:Record<string,string>={import_receipt_only:"Licence reported in an import receipt; human clearance of permitted use is pending",unverified:"Usage rights unverified"};

/** One source: identifiers, standing, passages (text only where rights allow) and the correction check, stated as not done. */
export function SourceDetail({v,compact}:{v:SourceEvidenceView;compact?:boolean}){
 return (
  <div className="gw-src">
   {!compact&&<p className="gw-src-title">{v.title}</p>}
   <p>{v.doi?<a href={doiUrl(v.doi)} target="_blank" rel="noopener noreferrer">DOI {v.doi}</a>:"No DOI recorded"}{v.pmid?<> · <a href={pmidUrl(v.pmid)} target="_blank" rel="noopener noreferrer">PubMed {v.pmid}</a></>:<> · No PMID recorded</>}</p>
   <ul className="gw-status">
    <li>{IDENTITY[v.identity]}</li>
    <li>{RIGHTS[v.rights]}</li>
    <li>Correction and retraction status not checked</li>
   </ul>
   {!compact&&(v.passages.length?<ul className="gw-passages" aria-label="Recorded passages">{v.passages.map((p,i)=><li key={i}>
     {p.display==="shown"?<details><summary>Passage {i+1}: show recorded text</summary><blockquote>{p.text}</blockquote><small>{p.locator}</small></details>
     :p.display==="withheld_rights"?<p>Passage {i+1}: text recorded but not shown, because usage rights are not established. <small>{p.locator}</small></p>
     :<p>Passage {i+1}: locator only, no text. <small>{p.locator}</small></p>}
    </li>)}</ul>:<p>No passage is recorded for this source.</p>)}
   {!compact&&<p className="gw-hint">HSI shows a passage only where one is recorded and rights allow. None is invented. No absence of retraction or correction is inferred.</p>}
  </div>
 );
}

function ConceptEvidenceSection({model,conceptId}:{model:GraphModel;conceptId:string}){
 const e=conceptEvidence(model,conceptId);
 const top=(xs:readonly {value:string;count:number}[])=>xs.slice(0,4).map(x=>`${x.value} ${x.count}`).join(", ");
 return (
  <Section title="Evidence">
   {e.relationships?<>
    <p>{e.relationships} candidate relationship{e.relationships===1?"":"s"}{e.negated?`, ${e.negated} recorded as not holding`:""}, from {e.sources.length} source{e.sources.length===1?"":"s"}{e.withoutSource?` (${e.withoutSource} without a source)`:""}.</p>
    <dl className="gw-ctx">
     <div><dt>Identifiers</dt><dd>{e.identifiers.doi} with DOI, {e.identifiers.pmid} with PMID{e.identifiers.neither?`, ${e.identifiers.neither} with neither`:""}</dd></div>
     <div><dt>Species</dt><dd>{top(e.species)}</dd></div>
     <div><dt>Model system</dt><dd>{top(e.models)}</dd></div>
     <div><dt>Context stated</dt><dd>{e.meanContextStated} of {e.recordable} fields on average</dd></div>
     <div><dt>Passages</dt><dd>{e.passages.shown} shown, {e.passages.withheld} withheld for rights, {e.passages.locatorOnly} locator only</dd></div>
     <div><dt>Gaps and questions</dt><dd>{e.gaps} recorded gap{e.gaps===1?"":"s"}, {e.questions} question{e.questions===1?"":"s"}</dd></div>
    </dl>
    <details className="gw-srcs"><summary>Sources ({e.sources.length})</summary><ul className="gw-list">{e.sources.map(s=><li key={s.id}><p className="gw-src-title">{s.title}</p><SourceDetail v={s} compact/></li>)}</ul></details>
   </>:<p>No candidate relationship involves this concept.</p>}
   <p className="gw-hint">Counted over the whole published graph, not only this view. Every relationship is an unreviewed candidate; counts are not a measure of strength.</p>
  </Section>
 );
}

function useOntology(){
 const [d,setD]=useState<typeof import("./ontologyData")|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{let live=true;import("./ontologyData").then(m=>{if(live)setD(m)},()=>{if(live)setFailed(true)});return()=>{live=false}},[]);
 return {d,failed};
}

function OntologySections({model,conceptId}:{model:GraphModel;conceptId:string}){
 const {d,failed}=useOntology();
 if(failed)return <Section title="Identifiers"><p>The candidate mappings could not be loaded. No identifier is shown.</p></Section>;
 if(!d)return <Section title="Identifiers"><p role="status">Loading candidate mappings…</p></Section>;
 const ids=conceptIdentifiers(d.MAPPINGS,conceptId),tp=typeProposal(d.TYPES,conceptId,model.version);
 return (<>
  <Section title="Identifiers">
   {ids.state==="candidate"||ids.state==="ambiguous"?<>
    <ul className="gw-list">{ids.candidates.map(c=><li key={c.id}><code>{c.id}</code> {c.label} <small>({c.ontology}{c.release?` ${c.release}`:""}, matched on {c.matchedOn.replaceAll("_"," ")})</small></li>)}</ul>
    <p className="gw-hint">{ids.state==="ambiguous"?"Ambiguous: several candidates match and none is chosen. ":""}Candidate label match, unreviewed. Not a canonical identifier; no mapping in HSI is approved.</p>
   </>:ids.state==="unmapped"?<p>No candidate identifier: the label-match run found none{ids.obsoleteOnly?" except obsolete terms":""}. No canonical identifier is shown.</p>
   :<p>This concept was not covered by the mapping run. No canonical identifier is shown.</p>}
  </Section>
  {tp.state==="proposed"&&<Section title="Proposed concept type"><p>{tp.proposedType} <small>({tp.reason})</small>{tp.alternatives.length?<> · alternatives: {tp.alternatives.join(", ")}</>:null}</p><p className="gw-hint">A rule-based proposal (rules {tp.rulesVersion}), unreviewed, confidence uncalibrated. It does not change the concept’s type or its scale.</p></Section>}
  {tp.state==="stale"&&<Section title="Proposed concept type"><p className="gw-hint">Type proposals were made against another graph version and are not shown.</p></Section>}
 </>);
}

function ScaleSection({kind}:{kind:string}){
 const p=scaleOfKind(kind);
 return <Section title="Biological scale"><p>{isLevel(p.band)?<>{bandLabel(p.band)}, from the concept type “{kind}”.</>:p.band==="not_biological"?<>Not a biological level: “{kind}” is not a biological entity.</>:<>Scale not recorded: the concept type “{kind}” carries no level, and none is guessed from the name.</>}</p><p className="gw-hint">Derived from the stated scale map, version {p.mapVersion}. The published graph records no scale of its own.</p></Section>;
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
    <ConceptEvidenceSection model={model} conceptId={node.id}/>
    <ScaleSection kind={node.kind}/>
    <OntologySections model={model} conceptId={node.id}/>
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
     {assertion.evidence.sourceId&&model.sources.get(assertion.evidence.sourceId)?<SourceDetail v={sourceEvidence(model.sources.get(assertion.evidence.sourceId)!)}/>:<p>No source is attached to this relationship.</p>}
    </Section>
    {assertion.limitations&&<Section title="Limitations"><p>{assertion.limitations}</p></Section>}
    {assertion.scopeWarnings.length>0&&<Section title="Scope warnings"><ul className="gw-list">{assertion.scopeWarnings.map(w=><li key={w}>{w}</li>)}</ul></Section>}
    <Section title="Version"><p className="gw-hint">Graph version {assertion.graphVersion.slice(0,8)}. Per-relationship version history is not recorded yet.</p></Section>
   </>)}
  </aside>
 );
}

export {HSI_DOMAINS};
