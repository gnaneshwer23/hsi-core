import {useState,type FormEvent} from "react";
import {Link,useNavigate} from "react-router-dom";
import {authBaseUrl,hsiAuth} from "../lib/hsiAuth";
import {REGISTRATION_PASSWORD_MIN,REGISTRATION_PASSWORD_MAX,validateRegistration,type RegistrationErrors} from "../lib/registrationValidation";
import type {HsiRegistration} from "../lib/hsiAuthClient";
import "../styles/sign-in.css";

export function SignUp(){
 const navigate=useNavigate();
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");
 const [pending,setPending]=useState(false);const [error,setError]=useState("");const [fieldErrors,setFieldErrors]=useState<RegistrationErrors>({});
 const [registration,setRegistration]=useState<HsiRegistration|null>(null);
 const [verificationNote,setVerificationNote]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(pending||!authBaseUrl)return;
  const fields=validateRegistration({name,email,password});setFieldErrors(fields);setError("");
  const first=(["name","email","password"] as const).find(field=>fields[field]);
  if(first){document.getElementById(`hsi-${first}`)?.focus();return;}
  setPending(true);setVerificationNote("");
  try{
   const result=await hsiAuth.signUp(name.trim(),email.trim(),password);
   if(result.error){setError(result.error.message);return;}
   if(!result.data){setError("Registration could not be confirmed. Please try again.");return;}
   setRegistration(result.data);setPassword("");
   // Signup sets a first-party session cookie. Request verification while that session is hot,
   // then continue to the research account page where the OTP form already lives.
   if(!result.data.user.emailVerified){
    const verification=await hsiAuth.sendVerificationEmail();
    setVerificationNote(verification.error
     ?"Registration succeeded, but a verification email could not be requested automatically. Sign in, open your research account, and use Send verification email."
     :"A verification email was requested. Check your inbox and spam folder for a code or link.");
   }
   const session=await hsiAuth.session();
   if(session.data?.user?.id){navigate("/research/account",{replace:true});return;}
  }catch{setError("Account creation could not be completed. Please try again or contact the HSI administrator.");}
  finally{setPending(false);}
 }
 function clearFieldError(field:keyof RegistrationErrors){setFieldErrors(current=>({...current,[field]:undefined}));}
 return <section className="hsi-sign-in" aria-labelledby="sign-up-heading"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / CREATE AN ACCOUNT</p>
  <h1 id="sign-up-heading">{registration?(registration.user.emailVerified?"Registration accepted":"Account created"):"Create your account"}</h1>
  {registration?<div className="hsi-sign-up-success" role="status" aria-live="polite"><p>Registration was accepted for <strong>{registration.user.email}</strong>.</p>{registration.user.emailVerified?<p>Your email is verified. Continue to sign in.</p>:<><p>Sign in with this email and password, then verify your email from the research account page. Research access stays blocked until the email is verified.</p>{verificationNote&&<p>{verificationNote}</p>}<p>If no email arrives, open your research account after signing in and use Send verification email, or ask the HSI administrator to check provider email delivery.</p></>}<p>Researcher and scientific reviewer access still require separate backend approval.</p><Link className="hsi-sign-in-back" to="/sign-in">Continue to sign in →</Link></div>:<>
  <p className="hsi-sign-in-description">Register for an HSI account. Researcher access is granted separately after approval.</p>
  {authBaseUrl?<form className="hsi-auth-form" onSubmit={submit} noValidate aria-busy={pending}>
   <label htmlFor="hsi-name">Full name</label><input id="hsi-name" autoComplete="name" required maxLength={120} value={name} onChange={e=>{setName(e.target.value);clearFieldError("name");}} disabled={pending} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name?"hsi-name-error":undefined}/>
   {fieldErrors.name&&<p className="hsi-auth-field-error" id="hsi-name-error">{fieldErrors.name}</p>}
   <label htmlFor="hsi-email">Email address</label><input id="hsi-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>{setEmail(e.target.value);clearFieldError("email");}} disabled={pending} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email?"hsi-email-error":undefined}/>
   {fieldErrors.email&&<p className="hsi-auth-field-error" id="hsi-email-error">{fieldErrors.email}</p>}
   <label htmlFor="hsi-password">Password</label><input id="hsi-password" type="password" autoComplete="new-password" required minLength={REGISTRATION_PASSWORD_MIN} maxLength={REGISTRATION_PASSWORD_MAX} value={password} onChange={e=>{setPassword(e.target.value);clearFieldError("password");}} disabled={pending} aria-invalid={!!fieldErrors.password} aria-describedby={`hsi-password-hint${fieldErrors.password?" hsi-password-error":""}`}/>
   <p className="hsi-auth-hint" id="hsi-password-hint">Use 12–128 characters. The authentication provider may apply additional password rules.</p>
   {fieldErrors.password&&<p className="hsi-auth-field-error" id="hsi-password-error">{fieldErrors.password}</p>}
   {Object.values(fieldErrors).some(Boolean)&&<p role="alert" className="hsi-auth-error">Check the highlighted fields and try again.</p>}
   {error&&<p role="alert" className="hsi-auth-error">{error}</p>}
   {pending&&<p role="status" className="hsi-auth-hint">Contacting the secure authentication service… The request will time out if the service does not respond.</p>}
   <button type="submit" disabled={pending}>{pending?"Creating account…":"Create account"}</button>
  </form>:<div className="hsi-sign-in-status" role="status"><strong>Registration is not enabled on this deployment.</strong><p>The HSI administrator needs to configure the approved Neon Auth URL in Vercel and enable account registration in the authentication provider. Rebuilding the site is required after changing its public auth URL.</p></div>}
  <p className="hsi-sign-in-footnote">Already have an account? <Link to="/sign-in">Sign in</Link></p>
  </>}
 </div></section>;
}
