import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authBaseUrl, hsiAuth } from "../lib/hsiAuth";
import "../styles/sign-in.css";

/** Sign-in is enabled only when an approved Neon Auth URL is supplied.
 * An authenticated Neon user is NOT automatically an authorised HSI researcher.
 */
export function SignIn() {
 const navigate=useNavigate();
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 const [checking,setChecking]=useState(Boolean(authBaseUrl));
 useEffect(()=>{
  if(!authBaseUrl)return;
  let active=true;
  hsiAuth.session().then(result=>{if(!active)return;setChecking(false);if(result.error){setError(result.error.message);return}if(result.data?.user?.id)navigate("/research/account",{replace:true})});
  return()=>{active=false};
 },[navigate]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(pending||!authBaseUrl)return;
  setPending(true);setError("");
  const result=await hsiAuth.signIn(email.trim(),password);
  if(result.error){setError(result.error.message||"Unable to sign in.");setPending(false);return}
  const session=await hsiAuth.session();
  if(!session.data?.user?.id){setError("Sign-in could not be verified. Please try again.");setPending(false);return}
  navigate("/research/account",{replace:true});
 }
 return <section className="hsi-sign-in" aria-labelledby="sign-in-heading"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / SECURE RESEARCH ACCESS</p>
  <h1 id="sign-in-heading">Researcher sign in</h1>
  <p className="hsi-sign-in-description">Sign in to your HSI account. Governed research access requires separate administrator approval.</p>
  {authBaseUrl?<form onSubmit={submit} className="hsi-auth-form">
    <label htmlFor="hsi-email">Email address</label>
    <input id="hsi-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={pending||checking}/>
    <label htmlFor="hsi-password">Password</label>
    <input id="hsi-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={pending||checking}/>
    {error&&<p role="alert" className="hsi-auth-error">{error}</p>}
    <button type="submit" disabled={pending||checking}>{pending?"Signing in…":checking?"Checking session…":"Sign in securely"}</button>
   </form>:<div className="hsi-sign-in-status" role="status"><strong>Research sign-in is not enabled on this deployment.</strong><p>The authentication endpoint must be approved and configured before credentials can be accepted. Please contact the HSI administrator.</p></div>}
  <p className="hsi-auth-switch">New to HSI? <Link to="/sign-up">Create an account</Link></p>
  <Link className="hsi-sign-in-back" to="/science">Explore public science <span aria-hidden="true">↗</span></Link>
  <p className="hsi-sign-in-footnote">Signing in does not grant access to private research or clinical records.</p>
 </div></section>;
}
