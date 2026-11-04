import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {authBaseUrl,hsiAuth,type HsiAuthSession} from "../lib/hsiAuth";
import {checkResearchAccount,type AccountCheck} from "../lib/researchAccountClient";
import "../styles/sign-in.css";
/** Provider identity and backend research permissions are checked independently. */
export function ResearchAccount(){
 const navigate=useNavigate();
 const [session,setSession]=useState<HsiAuthSession|null>(null);
 const [status,setStatus]=useState("Checking your session…");
 const [access,setAccess]=useState<AccountCheck|null>(null);
 const [checking,setChecking]=useState(true);
 const [attempt,setAttempt]=useState(0);
 const [signingOut,setSigningOut]=useState(false);
 const [history,setHistory]=useState<{decisionId:string;investigationId:string;outcome:string;reviewedAt:string;decisionHash:string}[]>([]);
 const [historyStatus,setHistoryStatus]=useState("");
 const [sendingVerification,setSendingVerification]=useState(false);
 const [verificationMessage,setVerificationMessage]=useState("");
 useEffect(()=>{
  let active=true;
  setChecking(true);setAccess(null);setStatus("Checking your session…");setVerificationMessage("");
  async function check(){
   try{
    if(!authBaseUrl){if(active)setStatus("Authentication is not configured.");return}
    const result=await hsiAuth.session();if(!active)return;
    if(result.error){setSession(null);setStatus(result.error.message);return}
    if(!result.data){navigate("/sign-in",{replace:true});return}
    setSession(result.data);setStatus("Checking research permissions with the HSI backend…");
    const account=await checkResearchAccount(result.data.user.id);
    if(active){setAccess(account);setStatus("")}
   }catch{if(active)setStatus("Account verification failed. Please retry.")}
   finally{if(active)setChecking(false)}
  }
  void check();return()=>{active=false};
 },[navigate,attempt]);
 async function signOut(){
  if(signingOut)return;setSigningOut(true);
  try{const r=await hsiAuth.signOut();if(r.error){setStatus("Could not sign out. Please try again.");return}setSession(null);setAccess(null);navigate("/sign-in",{replace:true})}
  catch{setStatus("Could not sign out. Please try again.")}
  finally{setSigningOut(false)}
 }
 async function refreshReviewHistory(){
  setHistoryStatus("Loading authorised decision history…");
  try{
   const response=await fetch("/api/research/scientific-review/history",{credentials:"same-origin",cache:"no-store"});
   if(!response.ok)throw Error("Review history unavailable or access denied.");
   const data=await response.json() as {items?:typeof history};
   if(!Array.isArray(data.items))throw Error("Invalid history response");
   setHistory(data.items);setHistoryStatus(data.items.length?"":"No decisions recorded for this reviewer.");
  }catch(e){setHistory([]);setHistoryStatus(e instanceof Error?e.message:"Unable to load history")}
 }
 async function sendVerification(){
  if(sendingVerification)return;setSendingVerification(true);setVerificationMessage("");
  try{
   const result=await hsiAuth.sendVerificationEmail();
   setVerificationMessage(result.error?result.error.message:result.data?.alreadyVerified===true?"Your email is already verified. Refresh access to check again.":"Verification request accepted. Check your inbox and spam folder, follow the verification link, then refresh access. If no email arrives, contact the HSI administrator to check provider email delivery.");
  }catch{setVerificationMessage("Verification could not be requested. Please retry or contact the HSI administrator.")}
  finally{setSendingVerification(false)}
 }
 const account=access?.kind==="ready"?access.account:null;
 const authorised=account&&(account.researcher||account.scientificReviewer);
 return <section className="hsi-sign-in"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / RESEARCH ACCOUNT</p><h1>Research account</h1>
  {session&&<p className="hsi-sign-in-description">Signed in as {session.user.email}.</p>}
  {status&&<p role="status" aria-live="polite">{status}</p>}
  {access&&access.kind!=="ready"&&<div className="hsi-sign-in-status" role="alert"><strong>{access.kind==="email_verification_required"?"Verify your email to continue":"Research access could not be checked"}</strong><p>{access.message}</p>
   {access.kind==="email_verification_required"&&<button className="hsi-auth-signout" type="button" disabled={sendingVerification||signingOut} onClick={sendVerification}>{sendingVerification?"Requesting verification…":"Send verification email"}</button>}
  </div>}
  {verificationMessage&&<p role="status" aria-live="polite">{verificationMessage}</p>}
  {account&&!authorised&&<div className="hsi-sign-in-status" role="status"><strong>Research access requires approval</strong><p>The HSI backend verified your account but found no active research or scientific reviewer grant. Contact the research administrator to request researcher access.</p><p>Scientific reviewer access requires separate approval and an independent reviewer identity.</p></div>}
  {authorised&&<section className="hsi-account-workspace" aria-labelledby="workspace-heading">
   <h2 id="workspace-heading">Your research workspace</h2>
   <p role="status">{account.researcher?"Researcher access confirmed.":""} {account.scientificReviewer?"Scientific reviewer access confirmed for systemic sclerosis.":""}</p>
   <p>Open an investigation to examine its evidence and review status. Each record is checked again by the backend.</p>
   {account.investigations.length?<ul className="hsi-account-records">{account.investigations.map(i=><li key={i.id}>
    <span className="hsi-account-record-id">{i.id}</span><span>{i.state.replaceAll("_"," ")}</span>
    <Link to={"/research/decision-workbench?investigation="+encodeURIComponent(i.id)}>Open research workbench →</Link>
    {i.canReview&&<Link to={"/research/scientific-review?investigation="+encodeURIComponent(i.id)}>Review independently →</Link>}
   </li>)}</ul>:<p>No accessible investigations yet. An authorised research operator must save a release-bound investigation before it appears here.</p>}
   {account.scientificReviewer&&<section aria-label="Independent reviewer history">
    <h3>Your scientific review history</h3>
    <p>Only decisions signed by your verified reviewer identity are returned. Records are read-only; history is not a knowledge-graph publication.</p>
    <button type="button" onClick={refreshReviewHistory}>Load my decision history</button>
    {historyStatus&&<p role="status">{historyStatus}</p>}
    {history.length>0&&<ul className="hsi-account-records">{history.map(h=><li key={h.decisionId}>
     <strong>{h.outcome.replaceAll("_"," ")}</strong><span>{h.investigationId}</span>
     <time dateTime={h.reviewedAt}>{new Date(h.reviewedAt).toLocaleString()}</time>
     <small>Decision: {h.decisionId} · Audit hash: {h.decisionHash.slice(0,16)}…</small>
    </li>)}</ul>}
   </section>}
   <p className="hsi-auth-hint">Showing up to 50 recent accessible investigations. Access does not approve evidence or publish knowledge graph relationships.</p>
  </section>}
  <div className="hsi-account-actions"><button className="hsi-auth-signout" type="button" disabled={checking||signingOut} onClick={()=>setAttempt(n=>n+1)}>{checking?"Checking access…":"Refresh access"}</button>
   {session&&<button className="hsi-auth-signout" type="button" disabled={signingOut} onClick={signOut}>{signingOut?"Signing out…":"Sign out"}</button>}
  </div>
  <p className="hsi-sign-in-footnote"><Link to="/science">Return to public science</Link></p>
 </div></section>
}
