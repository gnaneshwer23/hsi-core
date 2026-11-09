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
 * Research access intent — browser draft only.
 * Server-side access-request persistence is BLOCKED (grants are admin-provisioned).
 */
export function AccessIntentPanel(){
  const [params]=useSearchParams();
  const domain=params.get(RESEARCH_CONTEXT_KEYS.domain)??"";
  const scenario=params.get(RESEARCH_CONTEXT_KEYS.scenario)??"";
  const [question,setQuestion]=useState("");
  const [emailHint,setEmailHint]=useState("");
  const [draft,setDraft]=useState<AccessIntentDraft|null>(null);
  const [status,setStatus]=useState("");

  useEffect(()=>{
    const existing=readAccessIntent();
    if(existing){
      setDraft(existing);
      setQuestion(existing.question);
      setEmailHint(existing.emailHint??"");
    }
  },[]);

  function save(e:FormEvent){
    e.preventDefault();
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
    <h3 id="access-intent-heading">Describe the research you want to pursue</h3>
    <p className="ed-scope-line" role="note">
      Server-side access-request storage is not available on the public site.
      Grants in <code>hsi_research_access</code> are provisioned by an administrator after you create a verified account.
      This form keeps a browser-only draft so you do not lose your question across sign-up.
    </p>
    <form className="xp-form" onSubmit={save}>
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
      />
      <p id="access-intent-hint" className="xp-small">
        Optional context carried from the site: domain={domain||"none"} · scenario={scenario||"none"}.
        No personal health information.
      </p>
      <label htmlFor="access-intent-email">Email (optional, stored only in this browser)</label>
      <input
        id="access-intent-email"
        type="email"
        maxLength={254}
        value={emailHint}
        onChange={e=>setEmailHint(e.target.value)}
        autoComplete="email"
      />
      <div className="xp-actions">
        <button className="xp-button" type="submit">Save browser draft</button>
        {draft?<button className="xp-button xp-button-secondary" type="button" onClick={clear}>Clear draft</button>:null}
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
