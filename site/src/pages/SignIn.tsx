import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ERROR_MESSAGES } from "../../../src/authErrors";
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
 const [needsVerification,setNeedsVerification]=useState(false);
 const [verificationCode,setVerificationCode]=useState("");
 const [codeError,setCodeError]=useState("");
 const [verifyingCode,setVerifyingCode]=useState(false);
 const [resending,setResending]=useState(false);
 const [verificationNote,setVerificationNote]=useState("");
  useEffect(()=>{
  if(!authBaseUrl)return;
  let active=true;
  hsiAuth.session().then(result=>{
   if(!active)return;
   setChecking(false);
   if(result.error){setError(result.error.message);return}
   if(result.data?.user?.id)navigate("/research/account",{replace:true});
  }).catch(()=>{
   if(!active)return;
   setChecking(false);
   setError("Authentication service unavailable. Check the approved origin and network configuration.");
  });
  return()=>{active=false};
 },[navigate]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(pending||!authBaseUrl)return;
  setPending(true);setError("");setNeedsVerification(false);setVerificationNote("");setCodeError("");
  const result=await hsiAuth.signIn(email.trim(),password);
  if(result.error){
   setError(result.error.message||"Unable to sign in.");
   setNeedsVerification(result.error.code==="EMAIL_NOT_VERIFIED");
   setPending(false);
   return;
  }
  const session=await hsiAuth.session();
  if(!session.data?.user?.id){setError("Sign-in could not be verified. Please try again.");setPending(false);return}
  navigate("/research/account",{replace:true});
 }
 async function resendVerification(){
  if(resending||verifyingCode||!email.trim())return;
  setResending(true);setCodeError("");
  try{
   const result=await hsiAuth.sendVerificationEmail(email.trim());
   setVerificationNote(result.error
    ?"A verification email could not be requested. Please try again or contact the HSI administrator."
    :"A verification email was requested. Check your inbox and spam folder for the latest code or link.");
  }finally{setResending(false);}
 }
 async function verifyCode(){
  if(verifyingCode||resending||!email.trim())return;
  const otp=verificationCode.trim();
  if(!/^\d{4,12}$/.test(otp)){setCodeError("Enter the numeric verification code from your email.");return;}
  setVerifyingCode(true);setCodeError("");
  try{
   const result=await hsiAuth.verifyEmailCode(otp,email.trim());
   if(result.error){setCodeError(result.error.message);return;}
   setNeedsVerification(false);setError("");setVerificationNote("Email verified. Sign in with your password.");
   setVerificationCode("");
  }catch{setCodeError("The code could not be verified. Please try again.");}
  finally{setVerifyingCode(false);}
 }
 return <section className="hsi-sign-in" aria-labelledby="sign-in-heading"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / SECURE RESEARCH ACCESS</p>
  <h1 id="sign-in-heading">Researcher sign in</h1>
  <p className="hsi-sign-in-description">Sign in to your HSI account. Governed research access requires separate administrator approval.</p>
  {authBaseUrl?<form onSubmit={submit} className="hsi-auth-form">
    <label htmlFor="hsi-email">Email address</label>
    <input id="hsi-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={pending||checking||verifyingCode||resending}/>
    <label htmlFor="hsi-password">Password</label>
    <input id="hsi-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={pending||checking||verifyingCode||resending}/>
    {error&&<p role="alert" className="hsi-auth-error">{error}</p>}
    {error===AUTH_ERROR_MESSAGES.INVALID_EMAIL_OR_PASSWORD&&<p className="hsi-auth-hint">If you have not registered on this authentication service yet, <Link to="/sign-up">create an account</Link>. Password reset only works for accounts that already exist here.</p>}
    {needsVerification&&<>
     <p className="hsi-auth-hint">Verify the email for this account before signing in. Use the code or link from your inbox, or request another email.</p>
     {verificationNote&&<p role="status" aria-live="polite">{verificationNote}</p>}
     <div className="hsi-auth-form" role="group" aria-label="Email verification">
      <label htmlFor="hsi-verification-code">Verification code</label>
      <input id="hsi-verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={12} value={verificationCode} onChange={e=>{setVerificationCode(e.target.value.replace(/\s/g,""));setCodeError("");}} disabled={verifyingCode||resending||pending} aria-invalid={!!codeError} aria-describedby={"hsi-verification-code-hint"+(codeError?" hsi-verification-code-error":"")}/>
      <p className="hsi-auth-hint" id="hsi-verification-code-hint">Enter the latest code from your email if the provider sent one.</p>
      {codeError&&<p className="hsi-auth-error" id="hsi-verification-code-error" role="alert">{codeError}</p>}
      <button type="button" disabled={verifyingCode||resending||pending} onClick={()=>{void verifyCode();}}>{verifyingCode?"Verifying code…":"Verify email"}</button>
      <button className="hsi-auth-signout" type="button" disabled={resending||verifyingCode||pending} onClick={resendVerification}>{resending?"Requesting verification…":"Resend verification email"}</button>
     </div>
    </>}
    <button type="submit" disabled={pending||checking||verifyingCode||resending}>{pending?"Signing in…":checking?"Checking session…":"Sign in securely"}</button>
   </form>:<div className="hsi-sign-in-status" role="status"><strong>Research sign-in is not enabled on this deployment.</strong><p>The authentication endpoint must be approved and configured before credentials can be accepted. Please contact the HSI administrator.</p></div>}
  <p className="hsi-auth-switch"><Link to="/forgot-password">Forgot your password?</Link></p>
  <p className="hsi-auth-switch">New to HSI? <Link to="/sign-up">Create an account</Link></p>
  <Link className="hsi-sign-in-back" to="/science">Explore public science <span aria-hidden="true">↗</span></Link>
  <p className="hsi-sign-in-footnote">Signing in does not grant access to private research or clinical records.</p>
 </div></section>;
}
