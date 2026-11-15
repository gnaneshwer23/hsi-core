import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {DIMENSIONS,SCALE,type DimensionId,type Score} from "../../../src/evaluation/rubric";
import {EXPERTISE,analyse,blindedOutputs,exportRatings,itemsFromGaps,makeItemSet,parseItemSet,parseRatingFile,type Analysis,type EvalItem,type ItemSet,type Rater,type Rating,type RatingFile} from "../../../src/evaluation/session";
import {deriveRunGaps} from "../../../src/investigation/runGaps";
import {LIVE_RUN_KEY} from "../lib/researchHome";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {EVAL_ITEMS_KEY,EVAL_RATER_KEY,EVAL_RATINGS_KEY} from "../lib/storageKeys";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const EXP:Record<string,string>={early_career:"Early career",experienced:"Experienced researcher",domain_expert:"Expert in this area",other:"Other"};
const DL:Record<string,string>={hsi_higher:"HSI rated higher (interval excludes zero)",baseline_higher:"Comparison rated higher (interval excludes zero)",not_established:"No difference established"};
const download=(name:string,text:string)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"application/json"}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
const ls={get:(k:string)=>{try{return localStorage.getItem(k)}catch{return null}},set:(k:string,v:string)=>{try{localStorage.setItem(k,v);return true}catch{return false}}};
type Mine={rater:Rater;ratings:Rating[]};
const loadMine=():Record<string,Mine>=>{try{const x=JSON.parse(ls.get(EVAL_RATINGS_KEY)??"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}catch{return {}}};
const ci=(c:{mean:number;low:number;high:number}|null)=>c?`${c.mean.toFixed(2)} (${c.low.toFixed(2)} to ${c.high.toFixed(2)})`:"not shown";

function RateItem({item,raterId,existing,onSave}:{item:EvalItem;raterId:string;existing:Record<string,Rating>;onSave:(rs:Rating[])=>void}){
 const outs=useMemo(()=>blindedOutputs(raterId,item),[raterId,item]);
 const [draft,setDraft]=useState<Record<string,Partial<Record<DimensionId,Score>>>>(()=>Object.fromEntries(outs.map(o=>[o.output.id,existing[o.output.id]?.scores??{}]))),[notes,setNotes]=useState<Record<string,string>>(()=>Object.fromEntries(outs.map(o=>[o.output.id,existing[o.output.id]?.note??""]))),[err,setErr]=useState("");
 const complete=outs.every(o=>DIMENSIONS.every(d=>draft[o.output.id]?.[d.id]));
 return (
  <div className="ev-item">
   <p>{item.prompt}</p>
   {outs.map(({label,output})=>(
    <fieldset key={output.id} className="ev-out"><legend>{label}</legend>
     <blockquote className="ev-text">{output.text}</blockquote>
     {DIMENSIONS.map(d=>(
      <div key={d.id} className="ev-dim" role="radiogroup" aria-label={`${label}: ${d.label}`}>
       <p className="ev-q"><b>{d.label}.</b> {d.question}</p>
       <div className="rh-choices gr-filter">{SCALE.map(s=><button key={s} type="button" role="radio" aria-checked={draft[output.id]?.[d.id]===s} onClick={()=>setDraft(x=>({...x,[output.id]:{...x[output.id],[d.id]:s}}))}>{s}</button>)}</div>
       <p className="rh-note">1: {d.anchors[1]} 3: {d.anchors[3]} 5: {d.anchors[5]}</p>
      </div>))}
     <label className="rh-note" htmlFor={"n-"+output.id}>Optional note</label>
     <input id={"n-"+output.id} className="gr-note" maxLength={300} value={notes[output.id]??""} onChange={e=>setNotes(n=>({...n,[output.id]:e.target.value}))}/>
    </fieldset>))}
   <div className="rh-row"><button type="button" className="rh-primary" onClick={()=>{if(!complete){setErr("Score every dimension for every output before saving.");return}setErr("");onSave(outs.map(({output})=>({itemId:item.id,outputId:output.id,scores:draft[output.id] as Record<DimensionId,Score>,note:notes[output.id]??"",at:new Date().toISOString()})))}}>Save ratings for this item</button></div>
   {err&&<p className="rh-err" role="alert">{err}</p>}
  </div>
 );
}

export function EvaluationSetPage(){
 const [bundle,setBundle]=useState<DomainBundle|null>(null),[tab,setTab]=useState<"rate"|"prepare"|"analyse">("rate");
 const [imported,setImported]=useState<ItemSet|null>(()=>parseItemSet(ls.get(EVAL_ITEMS_KEY))),[extra,setExtra]=useState<Record<string,{text:string;source:string}>>({}),[msg,setMsg]=useState("");
 const [rater,setRater]=useState<Rater>(()=>{try{const x=JSON.parse(ls.get(EVAL_RATER_KEY)??"null");if(x&&typeof x.raterId==="string")return x}catch{/* default */}return {raterId:"",independent:false,expertise:"domain_expert"}});
 const [mine,setMine]=useState<Record<string,Mine>>(loadMine),[idx,setIdx]=useState(0);
 const [runItems,setRunItems]=useState<EvalItem[]>([]),[aItems,setAItems]=useState<ItemSet|null>(null),[files,setFiles]=useState<RatingFile[]>([]),[aMsg,setAMsg]=useState("");
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 const builtIn=useMemo(()=>{if(!bundle)return null;const r=makeItemSet(itemsFromGaps(bundle));return r.ok?r.set:null},[bundle]);
 const set=imported??builtIn,validRater=/^[A-Za-z0-9][A-Za-z0-9 _.-]{1,39}$/.test(rater.raterId)&&!rater.raterId.includes("@");
 const my=set?mine[set.digest]:undefined,existing=useMemo(()=>Object.fromEntries((my?.ratings??[]).map(r=>[r.outputId,r])),[my]);
 const rated=set?set.items.filter(i=>i.outputs.every(o=>existing[o.id])).length:0;
 const saveRater=(r:Rater)=>{setRater(r);ls.set(EVAL_RATER_KEY,JSON.stringify(r))};
 const saveRatings=(rs:Rating[])=>{if(!set)return;const cur=mine[set.digest]?.ratings??[],byOut=new Map(cur.map(r=>[r.outputId,r]));for(const r of rs)byOut.set(r.outputId,r);const next={...mine,[set.digest]:{rater,ratings:[...byOut.values()]}};setMine(next);ls.set(EVAL_RATINGS_KEY,JSON.stringify(next));setMsg("Saved in this browser.")};
 const savedRunGaps=useMemo(()=>{try{const raw=ls.get(LIVE_RUN_KEY);const x=raw&&raw.length<2_000_000?JSON.parse(raw):null;if(x&&typeof x.scenarioId==="string"&&Array.isArray(x.candidates)&&x.byContext&&Array.isArray(x.searches)&&x.verification)return deriveRunGaps(x).filter(g=>g.scope==="scientific").map((g):EvalItem=>({id:"rungap:"+g.id.replace(/[^\w:.\-]/g,"_"),domain:g.contexts.join(", ").slice(0,80),prompt:"Someone proposed the item below as a gap in current knowledge. Rate it as a researcher who knows this area.",outputs:[{id:"o:hsi:"+g.id.replace(/[^\w:.\-]/g,"_"),condition:"hsi",text:`${g.title}\n${g.detail}`,sourceNote:"HSI gap derived from a live investigation"}]}))}catch{/* none */}return [] as EvalItem[]},[]);
 const prepared=useMemo(()=>{if(!builtIn)return null;const items:EvalItem[]=[...builtIn.items,...runItems.filter(r=>!builtIn.items.some(b=>b.id===r.id))].map(it=>{const x=extra[it.id];return x&&x.text.trim().length>=10?{...it,outputs:[...it.outputs,{id:"o:base:"+it.id.replace(/^gap:/,""),condition:"baseline",text:x.text,sourceNote:x.source||"Supplied by the evaluation lead"}]}:it});const r=makeItemSet(items);return r.ok?r.set:null},[builtIn,extra]);
 const analysis:Analysis|null=useMemo(()=>aItems&&files.length>0?analyse(aItems,files):null,[aItems,files]);
 const item=set?set.items[Math.min(idx,set.items.length-1)]:null;
 return (
  <ResearchAppShell where="Evaluation set" whereIcon="shield" active="evaluation">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <p className="co-banner" role="note"><b>This tests HSI; it does not show that HSI is better.</b> No ratings exist yet. Ratings by the people who built HSI are excluded from every result. Nothing is uploaded: ratings stay in this browser until you export them.</p>
    <section className="rh-card" aria-labelledby="ev-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="shield" size={22}/></span><div><h1 id="ev-h">Evaluation set: are HSI’s gaps useful?</h1><p className="rh-sub">Independent researchers rate each gap on four separate dimensions, blind to where it came from. Results appear only with at least two independent raters and ten doubly-rated outputs, each dimension on its own, with an interval, and agreement between raters.</p></div></header>
     <div className="rh-choices co-defs" role="tablist" aria-label="Evaluation steps">{([["rate","Rate gaps"],["prepare","Prepare an item set"],["analyse","Analyse ratings"]] as const).map(([k,l])=><button key={k} type="button" role="tab" aria-selected={tab===k} onClick={()=>setTab(k)}>{l}</button>)}</div>
    </section>

    {tab==="rate"&&<section className="rh-card" aria-labelledby="ev-r-h"><h2 id="ev-r-h">Rate gaps</h2>
     <div className="hl-form">
      <div className="hl-field"><label htmlFor="ev-id">Your pseudonym (letters, numbers, spaces; no name or email)</label><input id="ev-id" className="gr-note" maxLength={40} value={rater.raterId} onChange={e=>saveRater({...rater,raterId:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="ev-x">Your expertise</label><select id="ev-x" className="gr-note" value={rater.expertise} onChange={e=>saveRater({...rater,expertise:e.target.value as Rater["expertise"]})}>{EXPERTISE.map(x=><option key={x} value={x}>{EXP[x]}</option>)}</select></div>
      <label className="ev-check"><input type="checkbox" checked={rater.independent} onChange={e=>saveRater({...rater,independent:e.target.checked})}/> I had no part in building, funding or commissioning HSI and have no financial interest in it.</label>
     </div>
     {imported&&<p className="rh-note">Using an imported item set ({imported.digest.slice(0,10)}). <button type="button" className="rh-link" onClick={()=>{setImported(null);try{localStorage.removeItem(EVAL_ITEMS_KEY)}catch{/* ignore */}}}>Use the built-in gaps instead</button></p>}
     <p className="rh-note"><label className="rh-ghost ms-import">Import an item set from the evaluation lead<input type="file" accept="application/json,.json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;const s=f.size<=2_000_000?parseItemSet(await f.text()):null;if(!s){setMsg("That is not a valid item set.");return}setImported(s);ls.set(EVAL_ITEMS_KEY,JSON.stringify(s));setIdx(0);setMsg("Item set imported.");e.target.value=""}}/></label></p>
     {!set&&<p className="rh-note">Loading the published graph…</p>}
     {set&&!validRater&&<p className="rh-note" role="status">Enter a pseudonym to start rating.</p>}
     {set&&validRater&&item&&<>
      <p className="rh-note" role="status">{rated} of {set.items.length} items rated. Item {Math.min(idx,set.items.length-1)+1}.{!rater.independent&&" You have not said you are independent, so your ratings will be excluded from results."}</p>
      <RateItem key={item.id+rater.raterId} item={item} raterId={rater.raterId} existing={existing} onSave={rs=>{saveRatings(rs);if(idx<set.items.length-1)setIdx(idx+1)}}/>
      <div className="rh-row"><button type="button" className="rh-ghost" disabled={idx===0} onClick={()=>setIdx(idx-1)}>Previous item</button><button type="button" className="rh-ghost" disabled={idx>=set.items.length-1} onClick={()=>setIdx(idx+1)}>Next item</button>
       <button type="button" className="rh-primary" disabled={!my||my.ratings.length===0} onClick={()=>download(`hsi-eval-ratings-${rater.raterId.replace(/\W+/g,"-")}.json`,exportRatings(rater,set,my!.ratings))}>Export my ratings (JSON)</button></div>
      <div role="status" aria-live="polite">{msg&&<p className="rh-note">{msg}</p>}</div></>}
    </section>}

    {tab==="prepare"&&<section className="rh-card" aria-labelledby="ev-p-h"><h2 id="ev-p-h">Prepare an item set</h2>
     <p className="rh-note">Each item starts with HSI’s output only. A comparison is only possible if you add one, for example what another tool returned for the same question or what an expert listed by hand. Raters see them as “Output 1” and “Output 2” in an order that differs per rater, so they cannot tell which is which. Fix the item set, export it, and give the same file to every rater.</p>
     {!builtIn&&<p className="rh-note">Loading the published graph…</p>}
     {builtIn&&<div className="rh-row"><button type="button" className="rh-ghost" disabled={savedRunGaps.length===0||runItems.length>0} onClick={()=>setRunItems(savedRunGaps)}>Add gaps from my latest investigation ({savedRunGaps.length})</button><span className="rh-note">{savedRunGaps.length===0?"No saved investigation with scientific gaps in this browser.":"These are HSI outputs from your own run."}</span></div>}
     {builtIn&&<ul className="gr-list" aria-label="Items">{[...builtIn.items,...runItems.filter(r=>!builtIn.items.some(b=>b.id===r.id))].map(it=><li key={it.id} className="rh-card"><p><b>{it.outputs[0]!.text.split("\n")[0]}</b></p>
      <div className="hl-field"><label htmlFor={"x-"+it.id}>Comparison output for the same question (optional)</label><textarea id={"x-"+it.id} rows={2} maxLength={1200} value={extra[it.id]?.text??""} onChange={e=>setExtra(x=>({...x,[it.id]:{text:e.target.value,source:x[it.id]?.source??""}}))}/></div>
      <div className="hl-field"><label htmlFor={"s-"+it.id}>Where it came from (kept private from raters)</label><input id={"s-"+it.id} className="gr-note" maxLength={200} value={extra[it.id]?.source??""} onChange={e=>setExtra(x=>({...x,[it.id]:{text:x[it.id]?.text??"",source:e.target.value}}))}/></div></li>)}</ul>}
     {prepared&&<div className="rh-row"><button type="button" className="rh-primary" onClick={()=>download("hsi-eval-items.json",JSON.stringify(prepared,null,2))}>Export item set (JSON)</button><span className="rh-note">{prepared.items.length} items, {prepared.items.filter(i=>i.outputs.length>1).length} with a comparison output. Digest {prepared.digest.slice(0,12)}.</span></div>}
    </section>}

    {tab==="analyse"&&<section className="rh-card" aria-labelledby="ev-a-h"><h2 id="ev-a-h">Analyse ratings</h2>
     <p className="rh-note"><label className="rh-ghost ms-import">1. Import the item set<input type="file" accept="application/json,.json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;const s=f.size<=2_000_000?parseItemSet(await f.text()):null;if(!s){setAMsg("That is not a valid item set.");return}setAItems(s);setFiles([]);setAMsg(`Item set loaded (${s.items.length} items).`);e.target.value=""}}/></label>{builtIn&&!aItems&&<> <button type="button" className="rh-link" onClick={()=>{setAItems(builtIn);setFiles([]);setAMsg(`Built-in item set loaded (${builtIn.items.length} items).`)}}>or use the built-in gaps</button></>}</p>
     <p className="rh-note"><label className={"rh-ghost ms-import"+(aItems?"":" ev-off")}>2. Import rating files (one per rater)<input type="file" multiple disabled={!aItems} accept="application/json,.json" onChange={async e=>{if(!aItems)return;const list=[...(e.target.files??[])].slice(0,20);const next=[...files];const errs:string[]=[];for(const f of list){const r=f.size<=1_500_000?parseRatingFile(await f.text(),aItems):{ok:false as const,error:"File too large."};if(!r.ok)errs.push(`${f.name}: ${r.error}`);else if(next.some(x=>x.rater.raterId===r.file.rater.raterId))errs.push(`${f.name}: a rater with that id is already loaded.`);else next.push(r.file)}setFiles(next);setAMsg(errs.length?errs.join(" "):`${next.length} rating file${next.length===1?"":"s"} loaded.`);e.target.value=""}}/></label></p>
     <div role="status" aria-live="polite">{aMsg&&<p className="rh-note">{aMsg}</p>}</div>
     {analysis&&<div className="ev-result">
      <p className={analysis.status==="ok"?"co-ok":"rh-err"} role="status">{analysis.status==="ok"?"Enough independent ratings to show results for HSI outputs.":"Not enough independent ratings to show results."}</p>
      {analysis.reasons.length>0&&<ul>{analysis.reasons.map(r=><li key={r}>{r}</li>)}</ul>}
      <div className="co-tablewrap"><table className="co-table"><caption>Raters</caption><thead><tr><th scope="col">Rater</th><th scope="col">Expertise</th><th scope="col">Independent</th><th scope="col">Ratings</th></tr></thead><tbody>{analysis.raters.map(r=><tr key={r.raterId}><th scope="row">{r.raterId}</th><td>{EXP[r.expertise]}</td><td>{r.independent?"Yes":"No (excluded)"}</td><td>{r.ratings}</td></tr>)}</tbody></table></div>
      <div className="co-tablewrap"><table className="co-table"><caption>Mean rating by dimension (95% interval), outputs rated by two or more independent raters</caption><thead><tr><th scope="col">Dimension</th><th scope="col">HSI</th><th scope="col">Comparison</th><th scope="col">Rater agreement</th><th scope="col">HSI minus comparison</th></tr></thead><tbody>{DIMENSIONS.map(d=>{const h=analysis.byCondition.hsi[d.id],b=analysis.byCondition.baseline[d.id],ag=analysis.agreement[d.id],cp=analysis.comparison[d.id];return <tr key={d.id}><th scope="row">{d.label}</th><td>{ci(h.ci)} <small>n={h.unitsRated}</small></td><td>{ci(b.ci)} <small>n={b.unitsRated}</small></td><td>{ag.kappa===null?"not enough shared ratings":`kappa ${ag.kappa} (${ag.label}); within one point ${Math.round((ag.withinOne??0)*100)}%`}</td><td>{cp.diff?`${ci(cp.diff)}: ${DL[cp.reading]}`:`${cp.pairedItems} paired items; ${DL[cp.reading]}`}</td></tr>})}</tbody></table></div>
      <ul>{analysis.notes.map(n=><li key={n} className="rh-note">{n}</li>)}</ul></div>}
    </section>}
    <p className="rh-note">Related: <Link to="/research/gaps">Gap Register</Link> · <Link to="/research/journey">Guided walkthrough</Link></p>
   </main>
  </ResearchAppShell>
 );
}
