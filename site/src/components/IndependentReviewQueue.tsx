import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import "../styles/investigation-delivery.css";
type QueueItem={id:string;submissionId:string;packageHash:string;contextHash:string;question:string;submittedAt:string};
type QueuePage={items:QueueItem[];nextCursor:{at:string;id:string}|null;history:{id:string;decisionId:string;outcome:string;reviewedAt:string;decisionHash:string;packageHash:string}[]};
const id=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/,sha=/^[a-f0-9]{64}$/;
function parse(value:unknown):QueuePage{
 const v=value as QueuePage;if(!v||!Array.isArray(v.items)||v.items.length>25||!Array.isArray(v.history)||v.history.length>25)throw Error();
 if(v.items.some(i=>!i||!id.test(i.id)||!/^submission-[a-f0-9]{32}$/.test(i.submissionId)||!sha.test(i.packageHash)||!sha.test(i.contextHash)||typeof i.question!=="string"||i.question.length>500||!Number.isFinite(Date.parse(i.submittedAt))))throw Error();
 if(v.history.some(d=>!d||!id.test(d.id)||!/^review-[a-f0-9]{32}$/.test(d.decisionId)||!sha.test(d.decisionHash)||!sha.test(d.packageHash)||!["approve_with_limitations","request_revision","reject"].includes(d.outcome)||!Number.isFinite(Date.parse(d.reviewedAt))))throw Error();
 if(v.nextCursor!==null&&(!v.nextCursor||!/^submission-[a-f0-9]{32}$/.test(v.nextCursor.id)||!Number.isFinite(Date.parse(v.nextCursor.at))))throw Error();return v;
}
export function IndependentReviewQueue({embedded=false}:{embedded?:boolean}={}){
 const [page,setPage]=useState<QueuePage|null>(null),[items,setItems]=useState<QueueItem[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[attempt,setAttempt]=useState(0),[cursor,setCursor]=useState<QueuePage["nextCursor"]>(null);
 useEffect(()=>{const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);setLoading(true);setError("");if(!cursor)setPage(null);
  fetch("/api/research/scientific-review/queue"+(cursor?"?"+new URLSearchParams({cursor:JSON.stringify(cursor)}):""),{credentials:"same-origin",cache:"no-store",redirect:"error",signal:c.signal,headers:{Accept:"application/json"}})
  .then(async response=>{if(!response.ok)throw Error();const text=await response.text();if(text.length>200000)throw Error();return parse(JSON.parse(text))})
  .then(v=>{if(!c.signal.aborted){setPage(v);setItems(old=>cursor?[...old,...v.items.filter(i=>!old.some(x=>x.id===i.id))]:v.items)}})
  .catch(()=>{if(!c.signal.aborted){setPage(null);setItems([]);setError("The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.")}})
  .finally(()=>{clearTimeout(timer);if(!c.signal.aborted)setLoading(false)});
  const timeout=()=>{setLoading(false);setPage(null);setItems([]);setError("Reviewer queue request timed out. Refresh to retry.")};c.signal.addEventListener("abort",timeout,{once:true});return()=>{c.signal.removeEventListener("abort",timeout);c.abort();clearTimeout(timer)};
 },[cursor,attempt]);
 return <div className="delivery-queue"><p>HSI / INDEPENDENT REVIEW</p>{embedded?<h2>Scientific reviewer workspace</h2>:<h1>Scientific reviewer workspace</h1>}<p>Examine another researcher’s fixed evidence package. Your own investigations and decided submissions are excluded from this queue.</p><p><Link to="/research/account">Research account</Link> · <Link to="/research/scientific-workbench">Research workspace</Link></p><button type="button" disabled={loading} onClick={()=>{setCursor(null);setAttempt(n=>n+1)}}>Refresh reviewer queue</button>
  {loading&&<p role="status">Loading authorised reviewer queue…</p>}{error&&<p role="alert">{error}</p>}
  {page&&<><section aria-label="Awaiting independent review"><h2>Awaiting independent review · {items.length}</h2>{!items.length&&<p>No undecided investigations are available for your reviewer identity.</p>}{items.map(i=><article key={i.id}><h3><Link to={"/research/scientific-review?investigation="+i.id}>{i.question}</Link></h3><p>Submitted {new Date(i.submittedAt).toLocaleString("en-GB")}</p><p>Package <code>{i.packageHash}</code></p><p>Context <code>{i.contextHash}</code></p></article>)}{page.nextCursor&&<button type="button" disabled={loading} onClick={()=>setCursor(page.nextCursor)}>Load more review submissions</button>}</section>
  <section aria-label="Your recorded brief decisions"><h2>Your recorded brief decisions</h2>{!page.history.length&&<p>No context-bound decisions recorded by this reviewer identity.</p>}{page.history.map(d=><article key={d.decisionId}><h3>{d.outcome.replaceAll("_"," ")}</h3><p><Link to={"/research/scientific-review?investigation="+d.id}>Inspect reviewed brief →</Link></p><p>{new Date(d.reviewedAt).toLocaleString("en-GB")}</p><p>Decision hash <code>{d.decisionHash}</code></p></article>)}</section></>}
 </div>;
}
