import {useState,type ReactNode} from "react";
import {Link} from "../router";
import {
 ATLAS_EDGES,ATLAS_PATHWAYS,STATUS_META,STATUS_ORDER,edgeById,entityById,pathwayById,
} from "../components/atlas/atlasData";
import {EXPLANATION_LEVELS,type ExplanationLevel,type OnboardingState} from "../../../../src/onboarding/scientificOnboarding";
import type {PanelKey} from "../../../../src/onboarding/workspacePreview";
import {EvidenceTag,ScrollTable,type Illustrative} from "./Frame";

export type Ctx={state:OnboardingState;personalised:boolean};
export type Built={panels:Partial<Record<PanelKey,ReactNode>>;first:{label:string;output:Illustrative}};

const edgeLine=(id:string)=>{const e=edgeById[id]!;return `${entityById[e.from]!.label} → ${entityById[e.to]!.label}`};
const contested=ATLAS_EDGES.filter(e=>e.status==="contested");
const hypotheses=ATLAS_EDGES.filter(e=>e.status==="hypothesis");

/* ------------------------------------------------------------- student */

const EXPLAIN:Record<ExplanationLevel,string>={
 foundations:"Gut bacteria break down fibre and make small molecules, including one called butyrate. Scientists have seen, mostly in mice and in dishes, that butyrate can help a type of immune cell called a regulatory T cell to develop. Those cells help calm inflammation. Whether this works the same way in people is still being studied.",
 working:"Butyrate, a short-chain fatty acid from bacterial fermentation, promotes FOXP3⁺ regulatory T-cell differentiation in mouse and in-vitro models. Regulatory T cells are a source of IL-10. Human intervention evidence is limited, so the link to disease is an association, not an established mechanism.",
 expert:"Microbial butyrate is reported to promote FOXP3⁺ Treg differentiation (largely murine and in vitro), with downstream IL-10 production. Human interventional data are sparse; effect sizes depend on dose, timing and compartment, and the IL-10-pathway link to very-early-onset IBD is genetic association.",
};
const PATH=["Cells of the immune system","Cytokines and signalling","How the gut and immune system talk","Reading a mechanism diagram","Telling association from cause"];

function Pathway(){
 const [done,setDone]=useState<string[]>([]);
 const next=PATH.find(p=>!done.includes(p));
 return (<>
  <p className="ws-sub">A sample pathway. Mark steps as you go; progress stays in this page only.</p>
  <ol className="ws-steps">{PATH.map((p,i)=>(
   <li key={p} data-done={done.includes(p)} data-next={p===next}>
    <button type="button" role="checkbox" aria-checked={done.includes(p)} onClick={()=>setDone(d=>d.includes(p)?d.filter(x=>x!==p):[...d,p])}><span className="ws-num">{done.includes(p)?"✓":i+1}</span>{p}{p===next&&<em> · up next</em>}</button>
   </li>))}
  </ol>
 </>);
}
function Explain(){
 const [lvl,setLvl]=useState<ExplanationLevel>("working");
 return (<>
  <div role="radiogroup" aria-label="Explanation level" className="ws-seg">
   {EXPLANATION_LEVELS.map(l=><button key={l.id} type="button" role="radio" aria-checked={lvl===l.id} onClick={()=>setLvl(l.id)}>{l.label}</button>)}
  </div>
  <p className="ws-prose" aria-live="polite">{EXPLAIN[lvl]}</p>
  <p className="ws-sub">One written example, shown three ways. Hand-written for this preview.</p>
 </>);
}

export function student(_c:Ctx):Built{
 return {
  panels:{
   pathway:<Pathway/>,
   concepts:<ul className="ws-cards">{["butyrate","treg","il10","barrier"].map(id=>{const e=entityById[id]!;return <li key={id}><strong>{e.label}</strong><span className="ws-sub">{e.kind}</span><p>{e.note}</p><Link to="/knowledge-graph" className="ws-link">See it in the atlas</Link></li>})}</ul>,
   literacy:<><ul className="ws-ladder">{STATUS_ORDER.map(s=><li key={s}><EvidenceTag s={s}/><span>{STATUS_META[s].gloss}</span></li>)}</ul>
    <h3 className="ws-h3">Three questions for any claim</h3><ol className="ws-plain"><li>What was measured, and in what system (cells, mice, people)?</li><li>Is it an association or was something changed on purpose?</li><li>Do other studies agree, and if not, what differs?</li></ol></>,
   explain:<Explain/>,
  },
  first:{label:"Explore a biological mechanism",output:{title:"How might a gut metabolite influence an immune cell?",blocks:[
   {h:"The chain",items:ATLAS_PATHWAYS[0]!.edges.map(edgeLine)},
   {h:"How sure are we",items:ATLAS_PATHWAYS[0]!.edges.map(id=>`${edgeLine(id)}: ${STATUS_META[edgeById[id]!.status].short}`)},
   {h:"What to read next",items:["The difference between mouse, cell-culture and human evidence","One review article on short-chain fatty acids and immunity (find one with your librarian)"]},
  ]}},
 };
}

/* ---------------------------------------------------------- researcher */

function Mechanism(){
 const [id,setId]=useState(ATLAS_PATHWAYS[1]!.id);
 const p=pathwayById[id]!;
 return (<>
  <label className="ws-field"><span>Pathway</span><select value={id} onChange={e=>setId(e.target.value)}>{ATLAS_PATHWAYS.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
  <p className="ws-sub">{p.summary}</p>
  <ol className="ws-chain">{p.edges.map(eid=>{const e=edgeById[eid]!;return <li key={eid}><div><strong>{edgeLine(eid)}</strong> <EvidenceTag s={e.status}/></div><p>{e.basis}</p>{e.unresolved&&<p className="ws-unres"><b>Unresolved:</b> {e.unresolved}</p>}</li>})}</ol>
 </>);
}
function Checklist({items,note}:{items:string[];note?:string}){
 const [on,setOn]=useState<string[]>([]);
 return (<>
  <ul className="ws-check">{items.map(i=><li key={i}><button type="button" role="checkbox" aria-checked={on.includes(i)} onClick={()=>setOn(o=>o.includes(i)?o.filter(x=>x!==i):[...o,i])}><span className="ws-box" aria-hidden="true">{on.includes(i)?"✓":""}</span>{i}</button></li>)}</ul>
  <p className="ws-sub">{on.length} of {items.length} decided. {note}</p>
 </>);
}

export function researcher(c:Ctx):Built{
 const q=c.state.question.trim();
 const postdoc=c.personalised&&c.state.primaryRole==="postdoc";
 const e=edgeById["e-but-bar"]!;
 const first=postdoc?{label:"Open an illustrative conflict comparison",output:{title:"Comparing two findings that disagree",blocks:[
   {h:"The conflict in the sample atlas",items:[`${edgeLine("e-but-bar")}: ${e.basis}`,"Marked: unresolved conflict."]},
   {h:"What may explain the difference",items:[e.unresolved??""]},
   {h:"How to compare",items:["Tabulate model system, dose, timing and readout for each study side by side.","Note which differences you can test and which you can only discuss."]},
  ]}}:null;
 return {
  panels:{
   thesis:<><p className="ws-sub">A sample structure. Chapter notes are prompts, not content from your thesis.</p><ul className="ws-rows">{[["Background","Which established findings does everything else rest on?"],["Mechanism","Which link in your chain is least certain?"],["Methods","Which model system and readout will you defend?"],["Results (planned)","What would each outcome mean for the mechanism?"],["Discussion (planned)","Which conflicts will you address directly?"]].map(([t,n])=><li key={t}><strong>{t}</strong><span>{n}</span></li>)}</ul></>,
   gaps:<><p className="ws-sub">Places where the sample atlas records only a hypothesis or an association.</p><ul className="ws-rows">{[...hypotheses,...ATLAS_EDGES.filter(e=>e.status==="association")].slice(0,5).map(e=><li key={e.id}><strong>{edgeLine(e.id)} <EvidenceTag s={e.status}/></strong><span>{e.basis}</span></li>)}</ul></>,
   memory:<><p className="ws-badge">Private by default · off until an account is connected · illustrative entries</p><ul className="ws-log">{[["Question",q||"Does butyrate change barrier function in humans?"],["Decision","Treat the barrier effect as an open conflict until dose and timing are compared."],["Source","Not linked. Sources are attached once literature access is connected."]].map(([k,v])=><li key={k}><b>{k}</b><span>{v}</span></li>)}</ul></>,
   hypotheses:<div className="ws-board">{[["Draft",hypotheses.slice(0,1)],["Needs evidence",hypotheses.slice(1,3)],["Ready for expert review",[]]].map(([h,xs])=><div key={h as string}><h3 className="ws-h3">{h as string}</h3>{(xs as typeof hypotheses).length?(xs as typeof hypotheses).map(e=><p key={e.id} className="ws-card-sm">{edgeLine(e.id)}</p>):<p className="ws-sub">Nothing here yet.</p>}</div>)}</div>,
   mechanism:<Mechanism/>,
   conflicts:<ScrollTable><table className="ws-table"><caption className="sr-only">Contested relations in the sample atlas</caption><thead><tr><th scope="col">Relation</th><th scope="col">Why it is contested</th><th scope="col">Variables to compare</th></tr></thead><tbody>{contested.map(e=><tr key={e.id}><th scope="row">{edgeLine(e.id)}</th><td>{e.basis}</td><td>{e.unresolved}</td></tr>)}</tbody></table></ScrollTable>,
   experiments:<Checklist items={["Aim stated as a falsifiable claim","Model system chosen and justified","Positive and negative controls named","Readout and timepoint fixed","Replicates and power considered","Confounders from the conflict table listed"]} note="Experimental design support is planned; this is a planning checklist."/>,
  },
  first:first??{label:"Investigate a research gap",output:{title:"Does butyrate strengthen or impair the intestinal barrier?",blocks:[
   {h:"What the sample atlas holds",items:[edgeById["e-but-bar"]!.basis,"Marked: unresolved conflict."]},
   {h:"Variables to compare across studies",items:[edgeById["e-but-bar"]!.unresolved??""]},
   {h:"A testable next step",items:["Compare barrier readouts across a dose range in one model, holding timing fixed, then repeat with timing varied."]},
  ]}},
 };
}

/* ------------------------------------------------------------ professor */

function Overlap(){
 const projects=[{n:"Project A",c:["butyrate","treg","barrier"]},{n:"Project B",c:["il6","barrier","bbb"]},{n:"Project C",c:["treg","il10","il6"]}];
 const all=[...new Set(projects.flatMap(p=>p.c))];
 const shared=all.filter(c=>projects.filter(p=>p.c.includes(c)).length>1);
 return (<>
  <ScrollTable><table className="ws-table"><caption className="sr-only">Concepts by project (sample)</caption><thead><tr><th scope="col">Concept</th>{projects.map(p=><th scope="col" key={p.n}>{p.n}</th>)}</tr></thead>
   <tbody>{all.map(c=><tr key={c}><th scope="row">{entityById[c]!.label}{shared.includes(c)&&<span className="ws-pill"> shared</span>}</th>{projects.map(p=><td key={p.n}>{p.c.includes(c)?<span aria-label="in this project">●</span>:<span className="sr-only">not in this project</span>}</td>)}</tr>)}</tbody></table></ScrollTable>
  <p className="ws-sub">Sample projects. {shared.length} concepts appear in more than one: {shared.map(s=>entityById[s]!.label).join(", ")}. Overlap is a prompt for a conversation, not a finding.</p>
 </>);
}
function GroupAccess(){
 const [name,setName]=useState("");const [drafts,setDrafts]=useState<string[]>([]);
 return (<>
  <p className="ws-note">No research group is provisioned for you. Group sharing needs an administrator to authorise the group and its members; choosing the professor role does not do that.</p>
  <form className="ws-inline" onSubmit={e=>{e.preventDefault();if(name.trim()){setDrafts(d=>[...d,name.trim().slice(0,80)]);setName("")}}}>
   <label className="ws-field"><span>Project name</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={80}/></label>
   <button type="submit" className="ws-btn">Add local draft</button>
  </form>
  {drafts.length>0&&<ul className="ws-rows">{drafts.map(d=><li key={d}><strong>{d}</strong><span>Local draft on this page. Not shared, not saved.</span></li>)}</ul>}
 </>);
}

export function professor(_c:Ctx):Built{
 return {
  panels:{
   group:<><p className="ws-sub">Sample members. Real membership is confirmed by your organisation.</p><ScrollTable><table className="ws-table"><thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody>{[["Member A","PhD researcher"],["Member B","Postdoctoral researcher"],["Member C","Laboratory scientist"]].map(([a,b])=><tr key={a}><th scope="row">{a}</th><td>{b}</td><td>Sample</td></tr>)}</tbody></table></ScrollTable></>,
   overlap:<Overlap/>,
   opportunities:<ul className="ws-rows">{contested.slice(0,3).map(e=><li key={e.id}><strong>Resolve: {edgeLine(e.id)}</strong><span>{e.unresolved}</span></li>)}</ul>,
   access:<GroupAccess/>,
  },
  first:{label:"Sketch an authorised research-group project",output:{title:"Draft project: a shared conflict to resolve",blocks:[
   {h:"Aim",items:["Compare dose and timing across studies of one contested relation, across two lab models."]},
   {h:"Needs an administrator before it can exist",items:["Group created and verified","Members invited and roles confirmed","Sharing scope set (private to the group)"]},
   {h:"Stays private until then",items:["Everything on this page; nothing has been shared."]},
  ]}},
 };
}

/* ----------------------------------------------------------- laboratory */

const METHODS:[string,string,string][]=[
 ["Flow cytometry","Record gating strategy, panel and compensation.","Antibody lot and viability gating change results."],
 ["Single-cell RNA sequencing","Record dissociation protocol and batch structure.","Dissociation can alter cell-state signatures."],
 ["Cell culture","Record passage, medium and cell density.","Culture conditions may not reflect tissue exposure."],
 ["Animal models","Record strain, housing, sex and age.","Microbiome and housing differ between facilities."],
];
function Plan(){
 const [id,setId]=useState(contested[0]!.id);
 const e=edgeById[id]!;
 return (<>
  <label className="ws-field"><span>Start from a contested relation</span><select value={id} onChange={ev=>setId(ev.target.value)}>{contested.map(x=><option key={x.id} value={x.id}>{edgeLine(x.id)}</option>)}</select></label>
  <dl className="ws-dl">
   <div><dt>Aim</dt><dd>Test whether {edgeLine(id).replace(" → "," affects ")} depends on the variables below.</dd></div>
   <div><dt>Variables to hold or vary</dt><dd>{e.unresolved}</dd></div>
   <div><dt>Controls</dt><dd>Positive and negative controls to be chosen by you.</dd></div>
   <div><dt>Readouts</dt><dd>To be chosen by you, with the timepoint fixed in advance.</dd></div>
   <div><dt>Replicates and power</dt><dd>To be decided with a statistician.</dd></div>
  </dl>
  <p className="ws-sub">A scaffold built from the relation's unresolved variables. Experimental design support is planned.</p>
 </>);
}
const FIELDS=["Model system","Dose or exposure","Assay","Timepoint","Outcome"];
function Observations(){
 const [v,setV]=useState<Record<string,string>>({});const [log,setLog]=useState<Record<string,string>[]>([]);
 const filled=FIELDS.filter(f=>v[f]?.trim()).length;
 return (<>
  <form className="ws-form" onSubmit={e=>{e.preventDefault();if(filled){setLog(l=>[...l,v]);setV({})}}}>
   {FIELDS.map(f=><label className="ws-field" key={f}><span>{f}</span><input value={v[f]??""} onChange={e=>setV({...v,[f]:e.target.value.slice(0,80)})}/></label>)}
   <div role="status" className="ws-meter-text">{filled===FIELDS.length?"Context complete.":`Context ${filled} of ${FIELDS.length}. Missing: ${FIELDS.filter(f=>!v[f]?.trim()).join(", ")}.`}</div>
   <button type="submit" className="ws-btn" disabled={!filled}>Add to local log</button>
  </form>
  {log.length>0&&<ul className="ws-rows">{log.map((l,i)=><li key={i}><strong>{l["Outcome"]||"Observation"}</strong><span>{FIELDS.filter(f=>f!=="Outcome").map(f=>`${f}: ${l[f]||"not recorded"}`).join(" · ")}</span></li>)}</ul>}
  <p className="ws-sub">Missing context is flagged, never filled in. Entries live on this page only.</p>
 </>);
}

export function laboratory(c:Ctx):Built{
 const mine=c.personalised?c.state.methods.techniques:[];
 const list=METHODS.filter(m=>!mine.length||mine.includes(m[0]));
 return {
  panels:{
   methods:<><p className="ws-sub">{mine.length?"Filtered to the techniques you chose.":"Sample techniques."} What to record and where results shift, written in general terms.</p><ul className="ws-cards">{(list.length?list:METHODS).map(([t,r,p])=><li key={t}><strong>{t}</strong><p><b>Record:</b> {r}</p><p><b>Watch for:</b> {p}</p></li>)}</ul></>,
   plan:<Plan/>,
   observations:<Observations/>,
  },
  first:{label:"Open an illustrative method plan",output:{title:"Plan: does the effect depend on dose or timing?",blocks:[
   {h:"Hold constant",items:["Model system","Assay and readout","Operator and batch where possible"]},
   {h:"Vary",items:["Dose across at least three levels","Timepoint across at least two"]},
   {h:"Record with every observation",items:FIELDS}]}},
 };
}
