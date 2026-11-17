import {useEffect,useRef,useState,type FormEvent} from "react";
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

type DeliveryStatus="loading"|"configured"|"unavailable"|"unknown";

/**
 * Research access intent: browser draft always available; optional server delivery when configured.
 * Success copy only after the server reports provider acceptance. Grants remain admin-provisioned.
 */
export function AccessIntentPanel(){
  const [params]=useSearchParams();
  const domain=params.get(RESEARCH_CONTEXT_KEYS.domain)??"";
  const scenario=params.get(RESEARCH_CONTEXT_KEYS.scenario)??"";
  const [question,setQuestion]=useState("");
  const [emailHint,setEmailHint]=useState("");
  const [honeypot,setHoneypot]=useState("");
  const [draft,setDraft]=useState<AccessIntentDraft|null>(null);
  const [status,setStatus]=useState("");
  const [deliveryStatus,setDeliveryStatus]=useState<DeliveryStatus>("loading");
  const [busy,setBusy]=useState(false);
  const statusAttempts=useRef(0);

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
        const b:unknown=await r.json();
        if(controller.signal.aborted)return;
        const record=b&&typeof b==="object"&&!Array.isArray(b)?b as Record<string,unknown>:{};
        if(r.ok&&record.deliveryConfigured===true)setDeliveryStatus("configured");
        else if(r.ok)setDeliveryStatus("unavailable");
        else setDeliveryStatus("unknown");
      }catch{
        if(controller.signal.aborted)return;
        // Fail closed to draft-only so the contact page stays usable without a second identical Save control.
        statusAttempts.current+=1;
        setDeliveryStatus("unavailable");
      }
    })();
    return ()=>controller.abort();
  },[]);

  const deliveryConfigured=deliveryStatus==="configured";

  function saveDraft(e?:FormEvent){
    e?.preventDefault();
    const trimmed=question.trim();
    if(trimmed.length<12){
      setStatus("Describe your research question in at least 12 characters.");
      return;
    }
    try{
      const saved=writeAccessIntent({
        question:trimmed,
        domain:domain||undefined,
        scenarioId:scenario||undefined,
        emailHint:emailHint||undefined,
      });
      setDraft(saved);
      setStatus("Saved in this browser only. No access request was sent to HSI servers.");
    }catch{
      setStatus("Could not save a browser draft in this session. Your question was not sent.");
    }
  }

  async function sendRequest(e:FormEvent){
    e.preventDefault();
    const trimmed=question.trim();
    const emailSnapshot=emailHint;
    const honeypotSnapshot=honeypot;
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
          email:emailSnapshot||undefined,
          domain:domain||undefined,
          scenarioId:scenario||undefined,
          company_website:honeypotSnapshot,
        }),
      });
      const data:unknown=await response.json().catch(()=>({}));
      const record=data&&typeof data==="object"&&!Array.isArray(data)?data as Record<string,unknown>:{};
      if(response.ok&&(record.providerAccepted===true||record.delivered===true)){
        try{
          writeAccessIntent({
            question:trimmed,
            domain:domain||undefined,
            scenarioId:scenario||undefined,
            emailHint:emailSnapshot||undefined,
          });
          setDraft(readAccessIntent());
        }catch{
          // Browser draft is optional after provider acceptance.
        }
        setQuestion(trimmed);
        setEmailHint(emailSnapshot);
        setStatus(typeof record.note==="string"?record.note:"Accepted by the notification provider. Operator receipt is not confirmed. This does not grant research access.");
        return;
      }
      if(response.status===503||record.code==="ACCESS_REQUEST_NOT_CONFIGURED"){
        setDeliveryStatus("unavailable");
        saveDraft();
        setStatus("Delivery is not configured on this deployment. Saved a browser draft instead; nothing was sent.");
        return;
      }
      setStatus(typeof record.error==="string"?record.error:"The access request could not be accepted by the notification provider. Nothing was claimed as delivered.");
    }catch{
      setStatus("The access request could not be accepted by the notification provider. Nothing was claimed as delivered.");
    }finally{setBusy(false)}
  }

  function clear(){
    clearAccessIntent();
    setDraft(null);
    setQuestion("");
    setEmailHint("");
    setStatus("Browser draft cleared.");
  }

  async function retryStatus(){
    setDeliveryStatus("loading");
    try{
      const r=await fetch("/api/access-requests");
      const b:unknown=await r.json();
      const record=b&&typeof b==="object"&&!Array.isArray(b)?b as Record<string,unknown>:{};
      if(r.ok&&record.deliveryConfigured===true)setDeliveryStatus("configured");
      else if(r.ok)setDeliveryStatus("unavailable");
      else setDeliveryStatus("unknown");
    }catch{
      setDeliveryStatus("unknown");
    }
  }

  const continueSignUp=signUpHref({
    next:"/research/account",
    domain:domain||draft?.domain,
    scenario:scenario||draft?.scenarioId,
  });
  const continueSignIn=signInHref("/research/account");

  const heading=
    deliveryStatus==="loading"?"Checking access-request delivery…":
    deliveryConfigured?"Request research access":
    deliveryStatus==="unknown"?"Access request status unavailable":
    "Keep a browser draft of your question";

  return <section className="xp-access-intent" aria-labelledby="access-intent-heading">
    <h3 id="access-intent-heading">{heading}</h3>
    <p className="ed-scope-line" role="note">
      {deliveryStatus==="loading"
        ?"Checking whether this deployment can accept access requests through a notification provider."
        :deliveryConfigured
        ?"When delivery is configured, sending asks the notification provider to accept the enquiry. Operator inbox receipt is not confirmed here. Grants in hsi_research_access are still provisioned by an administrator after you create a verified account."
        :deliveryStatus==="unknown"
        ?"Could not confirm whether server delivery is configured. You can still save a browser-only draft, or retry the status check."
        :"Server delivery is not configured on this deployment. This form keeps a browser-only draft so you do not lose your question across sign-up. Nothing is emailed until an operator enables delivery."}
      {" "}Grants in <code>hsi_research_access</code> are provisioned by an administrator after you create a verified account.
    </p>
    {deliveryStatus==="unknown"?<p><button className="xp-button" type="button" onClick={()=>void retryStatus()}>Retry delivery status</button></p>:null}
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
        disabled={busy}
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
        disabled={busy}
      />
      {/* Honeypot for bots; visually hidden. */}
      <label className="xp-honeypot" htmlFor="access-intent-company" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}>Company website</label>
      <input
        id="access-intent-company"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={e=>setHoneypot(e.target.value)}
        style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}
      />
      <div className="xp-actions">
        {deliveryConfigured
          ?<>
            <button className="xp-button" type="submit" disabled={busy}>{busy?"Sending…":"Send access request"}</button>
            <button className="xp-button xp-button-secondary" type="button" onClick={()=>saveDraft()} disabled={busy}>Save browser draft</button>
          </>
          :<button className="xp-button" type="submit" disabled={busy||deliveryStatus==="loading"}>Save browser draft</button>}
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
