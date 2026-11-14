import {useEffect,useState,type FormEvent} from "react";
import {useSearchParams} from "react-router-dom";
import {clearAccessIntent,readAccessIntent,RESEARCH_CONTEXT_KEYS,writeAccessIntent,type AccessIntentDraft} from "../lib/researchContext";

/** Local preparation only. No submission endpoint or automatic account/permission handoff. */
export function AccessIntentPanel(){
 const [params]=useSearchParams();
 const [question,setQuestion]=useState('');
 const [draft,setDraft]=useState<AccessIntentDraft|null>(null);
 const [status,setStatus]=useState('');
 const [invalid,setInvalid]=useState(false);
 useEffect(()=>{const existing=readAccessIntent();if(existing&&typeof existing.question==='string'){setDraft(existing);setQuestion(existing.question.slice(0,1000));}},[]);
 function validate(){if(question.trim().length<12){setInvalid(true);setStatus('Describe your research question in at least 12 characters.');return false;}setInvalid(false);return true;}
 function save(event:FormEvent){event.preventDefault();if(!validate())return;try{
  if(typeof sessionStorage==='undefined')throw new Error('Storage unavailable');
  const saved=writeAccessIntent({question,domain:params.get(RESEARCH_CONTEXT_KEYS.domain)||draft?.domain,scenarioId:params.get(RESEARCH_CONTEXT_KEYS.scenario)||draft?.scenarioId});
  setDraft(saved);setStatus('Saved in this browser only. No access request was sent to HSI servers.');
 }catch{setStatus('This browser could not save your draft. Your text is still here; download it instead. Nothing was sent.');}}
 function clear(){try{clearAccessIntent();setDraft(null);setQuestion('');setInvalid(false);setStatus('Browser draft cleared. Nothing was sent.');}catch{setStatus('The saved draft could not be cleared. Your text remains here. Check your browser storage settings.');}}
 function download(){if(!validate())return;const body=['HSI research question — personal draft','Not submitted to HSI. No access or scientific approval granted.','',question.trim(),'','Preparation checklist: intended sources and permitted use; experimental context; evaluation needs.','Do not include personal health information or confidential material.'].join('\n');const url=URL.createObjectURL(new Blob([body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='hsi-research-question-draft.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Draft download prepared. Nothing was sent to HSI.');}
 return <section className="rai-draft" aria-labelledby="access-intent-heading"><h2 id="access-intent-heading">Keep a browser draft of your question</h2><p>Optional preparation for a future discussion. Saving keeps this text in this browser tab’s session; it is not an application or a message to HSI.</p>
 <form onSubmit={save} noValidate><label htmlFor="access-intent-question">Research question or investigation focus</label><textarea id="access-intent-question" required minLength={12} maxLength={1000} rows={6} value={question} onChange={e=>{setQuestion(e.target.value);setStatus('');setInvalid(false);}} aria-invalid={invalid||undefined} aria-describedby="access-intent-hint access-intent-status"/><p id="access-intent-hint" className="rai-help">Describe the biological question, the context you want to compare and the evidence you need. Up to 1,000 characters. Do not include personal health information, credentials or confidential research.</p><div className="sp-actions"><button className="sp-button" type="submit">Save browser draft</button><button type="button" onClick={download}>Download text draft</button>{draft||question?<button type="button" onClick={clear}>Clear draft</button>:null}</div></form>
 <p id="access-intent-status" role="status" aria-live="polite">{status}</p>{draft&&draft.question!==question.trim()?<p className="rai-help">Your latest edits have not been saved in this browser.</p>:null}{draft?<p className="rai-help">A draft is stored for this tab’s session. Reloading can restore it; closing the tab or clearing browser data may remove it. Download a copy if you want to keep it.</p>:null}
 </section>;
}
