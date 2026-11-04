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
 useEffect(()=>{
  let active=true;
  setChecking(true);setAccess(null);setStatus("Checking your session…");
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
 const account=access?.kind==="ready"?access.account:null;
 const authorised=account&&(account.researcher||account.scientificReviewer);
 return <section className="hsi-sign-in"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / RESEARCH ACCOUNT</p><h1>Research account</h1>
  {session&&<p className="hsi-sign-in-description">Signed in as {session.user.email}.</p>}
  {status&&<p role="status" aria-live="polite">{status}</p>}
  {access&&access.kind!=="ready"&&<div className="hsi-sign-in-status" role="alert"><strong>Research access could not be checked</strong><p>{access.message}</p></div>}
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
   <p className="hsi-auth-hint">Showing up to 50 recent accessible investigations. Access does not approve evidence or publish knowledge graph relationships.</p>
  </section>}
  <div className="hsi-account-actions"><button className="hsi-auth-signout" type="button" disabled={checking||signingOut} onClick={()=>setAttempt(n=>n+1)}>{checking?"Checking access…":"Refresh access"}</button>
   {session&&<button className="hsi-auth-signout" type="button" disabled={signingOut} onClick={signOut}>{signingOut?"Signing out…":"Sign out"}</button>}
  </div>
  <p className="hsi-sign-in-footnote"><Link to="/science">Return to public science</Link></p>
 </div></section>
}
