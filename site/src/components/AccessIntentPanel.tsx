import {useEffect,useState,type FormEvent} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {
  fetchAccessRequestStatus,
  submitAccessRequest,
} from "../lib/accessRequestClient";
import {formatRetryAfterHint} from "../lib/retryAfter";
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
type StatusTone="status"|"alert";

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
  const [statusTone,setStatusTone]=useState<StatusTone>("status");
  const [deliveryStatus,setDeliveryStatus]=useState<DeliveryStatus>("loading");
  const [busy,setBusy]=useState(false);

  function announce(message:string,tone:StatusTone="status"){
    setStatusTone(tone);
    setStatus(message);
  }

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
      const result=await fetchAccessRequestStatus(fetch,controller.signal);
      if(controller.signal.aborted)return;
      // Fail closed to draft-only so the contact page stays usable without a second identical Save control.
      if(result.kind==="configured")setDeliveryStatus("configured");
      else if(result.kind==="unavailable")setDeliveryStatus("unavailable");
      else setDeliveryStatus("unavailable");
    })();
    return ()=>controller.abort();
  },[]);

  const deliveryConfigured=deliveryStatus==="configured";

  function saveDraft(e?:FormEvent){
    e?.preventDefault();
    const trimmed=question.trim();
    if(trimmed.length<12){
      announce("Describe your research question in at least 12 characters.","alert");
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
      announce("Saved in this browser only. No access request was sent to HSI servers.");
    }catch{
      announce("Could not save a browser draft in this session. Your question was not sent.","alert");
    }
  }

  async function sendRequest(e:FormEvent){
    e.preventDefault();
    const trimmed=question.trim();
    const emailSnapshot=emailHint;
    const honeypotSnapshot=honeypot;
    if(trimmed.length<12){
      announce("Describe your research question in at least 12 characters.","alert");
      return;
    }
    if(!deliveryConfigured){
      saveDraft();
      return;
    }
    setBusy(true);
    try{
      const result=await submitAccessRequest({
        question:trimmed,
        email:emailSnapshot||undefined,
        domain:domain||undefined,
        scenarioId:scenario||undefined,
        company_website:honeypotSnapshot,
      });
      switch(result.kind){
        case"quiet_accept":
          setQuestion(trimmed);
          setEmailHint(emailSnapshot);
          announce(result.note);
          break;
        case"accepted":
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
          announce(result.note);
          break;
        case"not_configured":
          setDeliveryStatus("unavailable");
          saveDraft();
          announce("Delivery is not configured on this deployment. Saved a browser draft instead; nothing was sent.","alert");
          break;
        case"rate_limited":{
          const hint=formatRetryAfterHint(result.retryAfterSeconds,"");
          const base=result.error.replace(/\.\s*$/,"");
          announce(hint&&!base.includes("Try again in about")?`${base}. ${hint}`:result.error,"alert");
          break;
        }
        case"refused":
        case"error":
          announce(result.error,"alert");
          break;
        default:{
          const _exhaustive:never=result;
          announce("The access request could not be accepted by the notification provider. Nothing was claimed as delivered.","alert");
          void _exhaustive;
        }
      }
    }finally{setBusy(false)}
  }

  function clear(){
    clearAccessIntent();
    setDraft(null);
    setQuestion("");
    setEmailHint("");
    announce("Browser draft cleared.");
  }

  async function retryStatus(){
    setDeliveryStatus("loading");
    const result=await fetchAccessRequestStatus();
    if(result.kind==="configured")setDeliveryStatus("configured");
    else if(result.kind==="unavailable")setDeliveryStatus("unavailable");
    else setDeliveryStatus("unknown");
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
          :<button className="xp-button" type="submit" disabled={busy||deliveryStatus==="loading"}>Start a pilot request</button>}
        {draft?<button className="xp-button xp-button-secondary" type="button" onClick={clear} disabled={busy}>Clear draft</button>:null}
      </div>
    </form>
    {status?<p role={statusTone}>{status}</p>:null}
    {draft?<p className="ed-scope-line">Draft saved {new Date(draft.savedAt).toLocaleString()} · persistence=browser_only</p>:null}
    <div className="xp-actions">
      <Link to={continueSignUp}>Continue to create account</Link>
      <Link to={continueSignIn}>I already have an account</Link>
      <Link to="/research/account">Check research account after sign-in</Link>
    </div>
  </section>;
}
