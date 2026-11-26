import {useState} from "react";
import {
 ATLAS_DOMAINS,ATLAS_EDGES,ATLAS_ENTITIES,STATUS_META,STATUS_ORDER,edgeById,entityById,relationsOf,weakestStatus,type AtlasDomainKey,
} from "../components/atlas/atlasData";
import {COMPUTATIONAL_METHODS,DATASET_KINDS} from "../../../../src/onboarding/scientificOnboarding";
import {EvidenceTag,ScrollTable} from "./Frame";
import {Status} from "../onboarding/ui";
import type {Built,Ctx} from "./dashA";

const line=(id:string)=>{const e=edgeById[id]!;return `${entityById[e.from]!.label} → ${entityById[e.to]!.label}`};
const contested=ATLAS_EDGES.filter(e=>e.status==="contested");

/* -------------------------------------------------------- computational */

function Neighbourhood(){
 const [d,setD]=useState<AtlasDomainKey>("immunology");
 const rows=ATLAS_ENTITIES.filter(e=>e.domain===d);
 return (<>
  <label className="ws-field"><span>Domain</span><select value={d} onChange={e=>setD(e.target.value as AtlasDomainKey)}>{ATLAS_DOMAINS.map(x=><option key={x.key} value={x.key}>{x.name}</option>)}</select></label>
  <ScrollTable><table className="ws-table"><caption className="sr-only">Entities and their relations in the sample atlas</caption><thead><tr><th scope="col">Entity</th><th scope="col">Kind</th><th scope="col">Relations</th><th scope="col">Weakest evidence</th></tr></thead>
   <tbody>{rows.map(e=><tr key={e.id}><th scope="row">{e.label}</th><td>{e.kind}</td><td>{relationsOf(e.id).length}</td><td><EvidenceTag s={weakestStatus(e.id)}/></td></tr>)}</tbody></table></ScrollTable>
  <p className="ws-sub">A small illustrative graph, not a count of studies. The live knowledge graph is on its own page.</p>
 </>);
}
const LAYERS=["Genomic","Transcriptomic","Proteomic","Metabolomic"];
function Omics(){
 const ents=["microbiota","treg","il10","barrier"];
 const [have,setHave]=useState<string[]>([]);
 const key=(l:string,e:string)=>l+"|"+e;
 const missing=LAYERS.filter(l=>!ents.some(e=>have.includes(key(l,e))));
 return (<>
  <p className="ws-sub">Tick the layers you hold data for. HSI has not mapped any of these to your data; this plans which layers a question would need.</p>
  <ScrollTable><table className="ws-table"><caption className="sr-only">Planning grid: layers by entity</caption><thead><tr><th scope="col">Entity</th>{LAYERS.map(l=><th scope="col" key={l}>{l}</th>)}</tr></thead>
   <tbody>{ents.map(e=><tr key={e}><th scope="row">{entityById[e]!.label}</th>{LAYERS.map(l=><td key={l}><input type="checkbox" aria-label={`${entityById[e]!.label}, ${l}`} checked={have.includes(key(l,e))} onChange={()=>setHave(h=>h.includes(key(l,e))?h.filter(x=>x!==key(l,e)):[...h,key(l,e)])}/></td>)}</tr>)}</tbody></table></ScrollTable>
  <p className="ws-sub" role="status">{missing.length?`No data planned for: ${missing.join(", ")}.`:"At least one entity is covered in every layer."}</p>
 </>);
}

export function computational(c:Ctx):Built{
 const kinds=c.personalised&&c.state.methods.datasets.length?c.state.methods.datasets:DATASET_KINDS.slice(0,4);
 const methods=c.personalised&&c.state.methods.computational.length?c.state.methods.computational:COMPUTATIONAL_METHODS.slice(0,4);
 return {
  panels:{
   datasets:<><p className="ws-sub">{c.personalised&&c.state.methods.datasets.length?"The kinds of data you named.":"Sample kinds of data."} Each needs provenance recorded before it can support a claim.</p>
    <ScrollTable><table className="ws-table"><thead><tr><th scope="col">Kind</th><th scope="col">Source</th><th scope="col">Version</th><th scope="col">Licence</th><th scope="col">Access class</th></tr></thead><tbody>{kinds.map(k=><tr key={k}><th scope="row">{k}</th><td>Not provided</td><td>Not provided</td><td>Not provided</td><td>Not provided</td></tr>)}</tbody></table></ScrollTable>
    <p className="ws-note">Do not register individual-level or identifiable data in this prototype.</p></>,
   graph:<Neighbourhood/>,
   omics:<Omics/>,
   fit:<><p className="ws-sub">{c.personalised&&c.state.methods.computational.length?"Your methods.":"Sample methods."} Considerations in general terms.</p><ul className="ws-rows">{methods.map(m=><li key={m}><strong>{m}</strong><span>Check that its assumptions hold for your data, state the null, and keep the analysis reproducible.</span></li>)}</ul></>,
  },
  first:{label:"Open an illustrative multi-omics view",output:{title:"Before aligning layers: what context travels with each dataset?",blocks:[
   {h:"Record for every dataset",items:["Source and version","Licence and access class","Model system and condition","Processing pipeline and parameters"]},
   {h:"Then ask",items:["Which entity does each layer measure?","Is the layer descriptive or perturbational?","Where do the layers disagree, and why might they?"]}]}},
 };
}

/* ------------------------------------------------------------- clinical */

const DISEASES=[["ibd","Inflammatory bowel disease"],["pd","Parkinson's disease"],["nsclc","NSCLC immune evasion"]] as const;
function trace(target:string){
 const seen=new Set<string>([target]);let frontier=[target];const out:string[]=[];
 for(let d=0;d<3;d++){const nxt:string[]=[];for(const t of frontier)for(const e of ATLAS_EDGES)if(e.to===t&&!out.includes(e.id)){out.push(e.id);if(!seen.has(e.from)){seen.add(e.from);nxt.push(e.from)}}frontier=nxt}
 return out;
}
function Trace(){
 const [t,setT]=useState<string>("ibd");
 const edges=trace(t);
 return (<>
  <label className="ws-field"><span>Disease or mechanism</span><select value={t} onChange={e=>setT(e.target.value)}>{DISEASES.map(([id,l])=><option key={id} value={id}>{l}</option>)}</select></label>
  <p className="ws-sub">Relations leading to it, up to three steps back, from the sample atlas.</p>
  <ul className="ws-rows">{edges.map(id=><li key={id}><strong>{line(id)} <EvidenceTag s={edgeById[id]!.status}/></strong><span>{edgeById[id]!.basis}</span></li>)}</ul>
 </>);
}

export function clinical(_c:Ctx):Built{
 return {
  panels:{
   trace:<Trace/>,
   trials:<><p className="ws-note">No trial data is connected. ClinicalTrials.gov is a planned source, so nothing below is a real trial.</p><ul className="ws-rows">{[["Which interventions target this mechanism?","Planned"],["What endpoints were used, and do they match the mechanism?","Planned"],["Where do trial results and preclinical evidence disagree?","Planned"]].map(([q,s])=><li key={q}><strong>{q}</strong><span><Status s={s as "Planned"}/></span></li>)}</ul></>,
   ladder:<ol className="ws-ladder">{[["Mechanistic, in model systems",STATUS_ORDER[0]!],["Association in human cohorts",STATUS_ORDER[1]!],["Proposed, not yet tested",STATUS_ORDER[2]!],["Studies disagree",STATUS_ORDER[3]!]].map(([l,s])=><li key={l as string}><EvidenceTag s={s as never}/><span>{l as string}: {STATUS_META[s as never as keyof typeof STATUS_META].gloss}</span></li>)}</ol>,
   boundaries:<ul className="ws-plain"><li>Research use only. Not diagnostic, not treatment advice, and not a decision tool for any patient.</li><li>No patient data is accepted. Do not enter identifiers or individual records.</li><li>Evidence on this page is a sample written for illustration.</li></ul>,
  },
  first:{label:"Open an illustrative mechanism trace",output:{title:"Tracing a disease association back to mechanism",blocks:[
   {h:"One path in the sample atlas",items:trace("ibd").slice(0,4).map(id=>`${line(id)}: ${STATUS_META[edgeById[id]!.status].short}`)},
   {h:"Reading it",items:["A chain is only as strong as its weakest link.","Where a link is an association, treat the mechanism as open."]}]}},
 };
}

/* -------------------------------------------------------------- biotech */

function Target(){
 const [t,setT]=useState("pd1");
 const rel=relationsOf(t);
 return (<>
  <label className="ws-field"><span>Target</span><select value={t} onChange={e=>setT(e.target.value)}>{["pd1","il6","il10"].map(id=><option key={id} value={id}>{entityById[id]!.label}</option>)}</select></label>
  <p className="ws-sub">{entityById[t]!.note}</p>
  <ul className="ws-rows">{rel.map(e=><li key={e.id}><strong>{line(e.id)} <EvidenceTag s={e.status}/></strong><span>{e.basis}{e.unresolved?` Unresolved: ${e.unresolved}`:""}</span></li>)}</ul>
 </>);
}
const READY=["Biological rationale stated","Human genetic or association support","Model-system evidence","Known safety signals reviewed","Biomarker or readout available"];
function Readiness(){
 const [v,setV]=useState<Record<string,"yes"|"partly"|"no"|"">>({});
 const n=(x:string)=>READY.filter(r=>v[r]===x).length;
 return (<>
  <p className="ws-sub">A self-assessment. HSI is not scoring your target.</p>
  <ul className="ws-rows">{READY.map(r=><li key={r}><strong>{r}</strong><span className="ws-seg" role="radiogroup" aria-label={r}>{(["yes","partly","no"] as const).map(o=><button key={o} type="button" role="radio" aria-checked={v[r]===o} onClick={()=>setV({...v,[r]:o})}>{o[0]!.toUpperCase()+o.slice(1)}</button>)}</span></li>)}</ul>
  <p className="ws-sub" role="status">{n("yes")} yes · {n("partly")} partly · {n("no")} no · {READY.length-n("yes")-n("partly")-n("no")} not assessed</p>
 </>);
}
function Portfolio(){
 const [name,setName]=useState("");const [items,setItems]=useState<string[]>([]);
 return (<>
  <form className="ws-inline" onSubmit={e=>{e.preventDefault();if(name.trim()){setItems(i=>[...i,name.trim().slice(0,80)]);setName("")}}}>
   <label className="ws-field"><span>Programme</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={80}/></label>
   <button className="ws-btn" type="submit">Add</button>
  </form>
  {items.length?<ul className="ws-rows">{items.map(i=><li key={i}><strong>{i}</strong><span>Evidence gaps: not yet assessed. Local to this page.</span></li>)}</ul>:<p className="ws-sub">No programmes. Do not enter confidential programme details; this prototype does not protect them.</p>}
 </>);
}

export function biotech(_c:Ctx):Built{
 return {
  panels:{
   target:<Target/>,
   readiness:<Readiness/>,
   portfolio:<Portfolio/>,
   tconflicts:<ul className="ws-rows">{contested.map(e=><li key={e.id}><strong>{line(e.id)}</strong><span>{e.unresolved}</span></li>)}</ul>,
  },
  first:{label:"Open an illustrative target brief",output:{title:"A target brief starts with what is and is not established",blocks:[
   {h:"For PD-1 / PD-L1 in the sample atlas",items:relationsOf("pd1").map(e=>`${line(e.id)}: ${STATUS_META[e.status].short}`)},
   {h:"Before any decision",items:["Separate mechanism from association.","List the variables on which studies disagree.","Name what evidence would change your mind."]}]}},
 };
}

/* ---------------------------------------------------------- institution */

const RESOURCES=["Private scientific memory","Group projects","Institutional datasets","Governance settings"];
const ORG_ROLES=["Researcher","Group lead","Data steward","Administrator"];
export function institution(c:Ctx):Built{
 const org=c.personalised&&c.state.institutionInfo.name.trim()?c.state.institutionInfo.name.trim():"Your organisation";
 return {
  panels:{
   structure:<><p className="ws-sub">A sample structure for {org}. Real structure is configured by an authorised administrator.</p><ul className="ws-tree"><li>{org}<ul><li>Faculty of Life Sciences<ul><li>Department A<ul><li>Research group 1</li><li>Research group 2</li></ul></li><li>Department B</li></ul></li><li>Core facilities</li></ul></li></ul></>,
   members:<><ScrollTable><table className="ws-table"><thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody>{[["Person 1","Group lead"],["Person 2","Researcher"],["Person 3","Data steward"]].map(([a,b])=><tr key={a}><th scope="row">{a}</th><td>{b}</td><td>Invitation pending (sample)</td></tr>)}</tbody></table></ScrollTable><p className="ws-note">Membership is confirmed by your organisation, not by what a person selects during setup.</p></>,
   permissions:<><ScrollTable><table className="ws-table"><caption className="sr-only">Roles by resource: nothing is provisioned</caption><thead><tr><th scope="col">Role</th>{RESOURCES.map(r=><th scope="col" key={r}>{r}</th>)}</tr></thead><tbody>{ORG_ROLES.map(r=><tr key={r}><th scope="row">{r}</th>{RESOURCES.map(x=><td key={x}>Not provisioned</td>)}</tr>)}</tbody></table></ScrollTable><p className="ws-sub">Every cell is unprovisioned. Permissions are granted by an authorised administrator and enforced by the backend.</p></>,
   governance:<GovernanceList/>,
  },
  first:{label:"Review organisation structure",output:{title:"Setting up an organisation workspace",blocks:[
   {h:"An HSI administrator does",items:["Verify the organisation","Create the organisation workspace"]},
   {h:"Your organisation does",items:["Confirm who may be a member and in which role","Decide which data classes may be used, and where","Name who reviews research outputs"]},
   {h:"Not done by this preview",items:["Nothing was created, verified or granted."]}]}},
 };
}
function GovernanceList(){
 const items=["Data protection impact assessment","Data classes and where each may be used","Audit trail and retention","Who reviews research outputs","Incident and withdrawal process"];
 const [on,setOn]=useState<string[]>([]);
 return (<>
  <ul className="ws-check">{items.map(i=><li key={i}><button type="button" role="checkbox" aria-checked={on.includes(i)} onClick={()=>setOn(o=>o.includes(i)?o.filter(x=>x!==i):[...o,i])}><span className="ws-box" aria-hidden="true">{on.includes(i)?"✓":""}</span>{i}</button></li>)}</ul>
  <p className="ws-sub">{on.length} of {items.length} marked ready. Your own tracking; HSI does not check these.</p>
 </>);
}
