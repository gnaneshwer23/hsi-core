import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {authBaseUrl,hsiAuth,type HsiAuthSession} from "../lib/hsiAuth";
import "../styles/sign-in.css";
/** Account identity page; does not infer or grant research permissions. */
export function ResearchAccount(){
 const navigate=useNavigate();
 const [session,setSession]=useState<HsiAuthSession|null>(null);
 const [status,setStatus]=useState("Checking your session…");
 useEffect(()=>{
  let active=true;
  if(!authBaseUrl){setStatus("Authentication is not configured.");return}
  hsiAuth.session().then(r=>{if(!active)return;if(r.error){setStatus(r.error.message);return}if(!r.data?.user?.id){navigate("/sign-in",{replace:true});return}setSession(r.data);setStatus("")});
  return()=>{active=false};
 },[navigate]);
 async function signOut(){const r=await hsiAuth.signOut();if(r.error){setStatus("Could not sign out. Please try again.");return}navigate("/sign-in",{replace:true})}
 return <section className="hsi-sign-in"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / RESEARCH ACCOUNT</p>
  <h1>Research account</h1>
  {session?<><p className="hsi-sign-in-description">Signed in as {session.user.email}.</p><div className="hsi-sign-in-status"><strong>Research access requires approval</strong><p>Your identity is authenticated. Researcher and scientific reviewer permissions must be verified independently by the trusted HSI API before any governed data is returned.</p></div><button className="hsi-auth-signout" type="button" onClick={signOut}>Sign out</button></>:<p role="status">{status}</p>}
  <p className="hsi-sign-in-footnote"><Link to="/science">Return to public science</Link></p>
 </div></section>
}
