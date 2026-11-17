import {useEffect,useState,type FormEvent} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {
  clearAccessIntent,
  readAccessIntent,
  RESEARCH_CONTEXT_KEYS,
  signInHref,
  signUpHref,
  writeAccessIntent,
  type AccessIntentDraft,
} from "../lib/researchContext";

/**
 * Research access intent: browser draft always available; optional server delivery when configured.
 * Success copy only after the server reports delivered. Grants remain admin-provisioned.
 */
export function AccessIntentPanel(){
  const [params]=useSearchParams();
  const domain=params.get(RESEARCH_CONTEXT_KEYS.domain)??"";
  const scenario=params.get(RESEARCH_CONTEXT_KEYS.scenario)??"";
  const [question,setQuestion]=useState("");
  const [emailHint,setEmailHint]=useState("");
  const [draft,setDraft]=useState<AccessIntentDraft|null>(null);
  const [status,setStatus]=useState("");
  const [deliveryConfigured,setDeliveryConfigured]=useState(false);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const existing=readAccessIntent();
    if(existing){
      setDraft(existing);
      setQuestion(existing.question);
      setEmailHint(existing.emailHint??"");
    }
  },[]);

  useEffect(()=>{
    const controller=new AbortController();
    void (async()=>{
      try{
        const r=await fetch("/api/access-requests",{signal:controller.signal});
        const b:any=await r.json();
        if(!controller.signal.aborted)setDeliveryConfigured(b?.deliveryConfigured===true);
      }catch{if(!controller.signal.aborted)setDeliveryConfigured(false)}
    })();
    return ()=>controller.abort();
  },[]);

  function saveDraft(e?:FormEvent){
    e?.preventDefault();
    const trimmed=question.trim();
    if(trimmed.length<12){
      setStatus("Describe your research question in at least 12 characters.");
      return;
    }
    const saved=writeAccessIntent({
      question:trimmed,
      domain:domain||undefined,
      scenarioId:scenario||undefined,
      emailHint:emailHint||undefined,
    });
    setDraft(saved);
    setStatus("Saved in this browser only. No access request was sent to HSI servers.");
  }

  async function sendRequest(e:FormEvent){
    e.preventDefault();
    const trimmed=question.trim();
    if(trimmed.length<12){
      setStatus("Describe your research question in at least 12 characters.");
      return;
    }
    if(!deliveryConfigured){
      saveDraft();
      return;
    }
    setBusy(true);
    try{
      const response=await fetch("/api/access-requests",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          question:trimmed,
          email:emailHint||undefined,
          domain:domain||undefined,
          scenarioId:scenario||undefined,
          company_website:"",
        }),
      });
      const data:any=await response.json().catch(()=>({}));
      if(response.ok&&data?.delivered===true){
        writeAccessIntent({
          question:trimmed,
          domain:domain||undefined,
          scenarioId:scenario||undefined,
          emailHint:emailHint||undefined,
        });
        setDraft(readAccessIntent());
        setStatus(typeof data.note==="string"?data.note:"Delivered to the HSI operator channel. This does not grant research access.");
        return;
      }
      if(response.status===503||data?.code==="ACCESS_REQUEST_NOT_CONFIGURED"){
        saveDraft();
        setStatus("Delivery is not configured on this deployment. Saved a browser draft instead; nothing was sent.");
        return;
      }
      setStatus(typeof data?.error==="string"?data.error:"The access request could not be delivered. Nothing was sent.");
    }catch{
      setStatus("The access request could not be delivered. Nothing was sent.");
    }finally{setBusy(false)}
  }

  function clear(){
    clearAccessIntent();
    setDraft(null);
    setQuestion("");
    setEmailHint("");
    setStatus("Browser draft cleared.");
  }

  const continueSignUp=signUpHref({
    next:"/research/account",
    domain:domain||draft?.domain,
    scenario:scenario||draft?.scenarioId,
  });
  const continueSignIn=signInHref("/research/account");

  return <section className="xp-access-intent" aria-labelledby="access-intent-heading">
    <h3 id="access-intent-heading">{deliveryConfigured?"Request research access":"Keep a browser draft of your question"}</h3>
    <p className="ed-scope-line" role="note">
      {deliveryConfigured
        ?"When delivery is configured, sending notifies the HSI operator. Grants in hsi_research_access are still provisioned by an administrator after you create a verified account."
        :"Server delivery is not configured on this deployment. This form keeps a browser-only draft so you do not lose your question across sign-up. Nothing is emailed until an operator enables delivery."}
      {" "}Grants in <code>hsi_research_access</code> are provisioned by an administrator after you create a verified account.
    </p>
    <form className="xp-form" onSubmit={deliveryConfigured?sendRequest:saveDraft} noValidate>
      <label htmlFor="access-intent-question">Research question or investigation focus</label>
      <textarea
        id="access-intent-question"
        required
        minLength={12}
        maxLength={1000}
        rows={4}
        value={question}
        onChange={e=>setQuestion(e.target.value)}
        aria-describedby="access-intent-hint"
        aria-invalid={status.includes("at least 12")?true:undefined}
      />
      <p id="access-intent-hint" className="xp-small">
        Optional context carried from the site: domain={domain||"none"} · scenario={scenario||"none"}.
        No personal health information.
      </p>
      <label htmlFor="access-intent-email">Email (optional{deliveryConfigured?", included if you send a request":", stored only in this browser"})</label>
      <input
        id="access-intent-email"
        type="email"
        maxLength={254}
        value={emailHint}
        onChange={e=>setEmailHint(e.target.value)}
        autoComplete="email"
      />
      {/* Honeypot for bots; visually hidden. */}
      <label className="xp-honeypot" htmlFor="access-intent-company" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}>Company website</label>
      <input id="access-intent-company" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}/>
      <div className="xp-actions">
        {deliveryConfigured
          ?<button className="xp-button" type="submit" disabled={busy}>{busy?"Sending…":"Send access request"}</button>
          :<button className="xp-button" type="submit">Save browser draft</button>}
        <button className="xp-button xp-button-secondary" type="button" onClick={()=>saveDraft()} disabled={busy}>Save browser draft</button>
        {draft?<button className="xp-button xp-button-secondary" type="button" onClick={clear} disabled={busy}>Clear draft</button>:null}
      </div>
    </form>
    {status?<p role="status">{status}</p>:null}
    {draft?<p className="ed-scope-line">Draft saved {new Date(draft.savedAt).toLocaleString()} · persistence=browser_only</p>:null}
    <div className="xp-actions">
      <Link to={continueSignUp}>Continue to create account</Link>
      <Link to={continueSignIn}>I already have an account</Link>
      <Link to="/research/account">Check research account after sign-in</Link>
    </div>
  </section>;
}
