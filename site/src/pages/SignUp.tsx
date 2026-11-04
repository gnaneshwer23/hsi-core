import {useState,type FormEvent} from "react";
import {Link,useNavigate} from "react-router-dom";
import {authBaseUrl,hsiAuth} from "../lib/hsiAuth";
import "../styles/sign-in.css";
export function SignUp(){
 const navigate=useNavigate();
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");
 const [pending,setPending]=useState(false);const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(pending||!authBaseUrl)return;
  setError("");setPending(true);
  const r=await hsiAuth.signUp(name.trim(),email.trim(),password);
  setPending(false);
  if(r.error){setError(r.error.message||"Registration was not successful.");return}
  navigate("/sign-in",{replace:true});
 }
 return <section className="hsi-sign-in"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / CREATE AN ACCOUNT</p>
  <h1>Create your account</h1>
  <p className="hsi-sign-in-description">Register for an HSI account. Researcher access is granted separately after approval.</p>
  {authBaseUrl?<form className="hsi-auth-form" onSubmit={submit}>
   <label htmlFor="hsi-name">Full name</label><input id="hsi-name" autoComplete="name" required maxLength={120} value={name} onChange={e=>setName(e.target.value)} disabled={pending}/>
   <label htmlFor="hsi-email">Email address</label><input id="hsi-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={pending}/>
   <label htmlFor="hsi-password">Password</label><input id="hsi-password" type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e=>setPassword(e.target.value)} disabled={pending}/>
   {error&&<p role="alert" className="hsi-auth-error">{error}</p>}
   <button type="submit" disabled={pending}>{pending?"Creating account…":"Create account"}</button>
  </form>:<div className="hsi-sign-in-status" role="status"><strong>Registration is not enabled on this deployment.</strong><p>Secure Neon Auth configuration must be completed before new accounts can be created.</p></div>}
  <p className="hsi-sign-in-footnote">Already have an account? <Link to="/sign-in">Sign in</Link></p>
 </div></section>
}
