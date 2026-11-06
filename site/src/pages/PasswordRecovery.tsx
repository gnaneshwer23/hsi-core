import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {authBaseUrl,hsiAuth} from '../lib/hsiAuth';
import '../styles/sign-in.css';

/** Recovery tokens exist only in component memory; the provider validates and consumes them. */
export function PasswordRecovery({mode}:{mode:'request'|'reset'}){
 const reset=mode==='reset',busy=useRef(false);
 const [token]=useState(()=>{if(!reset||typeof window==='undefined')return '';const params=new URLSearchParams(window.location.search),values=params.getAll('token');return values.length===1&&/^[A-Za-z0-9._~-]{16,2048}$/.test(values[0])?values[0]:''});
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[pending,setPending]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  if(!reset)return;
  // Remove secrets before subsequent navigation, copying the address or external requests.
  window.history.replaceState(window.history.state,'',window.location.pathname);
  const meta=document.querySelector<HTMLMetaElement>('meta[name="referrer"]'),previous=meta?.content;
  const policy=meta??document.createElement('meta');policy.name='referrer';policy.content='no-referrer';if(!meta)document.head.appendChild(policy);
  return()=>{if(meta&&previous!==undefined)meta.content=previous;else policy.remove()};
 },[reset]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy.current||!authBaseUrl||done)return;
  if(reset&&(!token||password!==confirmation)){setError('Enter matching passwords, or request a new recovery link.');return}
  busy.current=true;setPending(true);setError('');
  try{
   const result=reset?await hsiAuth.resetPassword(token,password):await hsiAuth.requestPasswordReset(email.trim(),window.location.origin);
   if(result.error){setError(result.error.message);return}
   setDone(true);setPassword('');setConfirmation('');
  }finally{busy.current=false;setPending(false)}
 }
 return <section className="hsi-sign-in" aria-labelledby="recovery-title"><div className="hsi-sign-in-card">
  <p className="hsi-sign-in-eyebrow">HSI / ACCOUNT RECOVERY</p><h1 id="recovery-title">{reset?'Set a new password':'Forgot your password?'}</h1>
  <p className="hsi-sign-in-description">{reset?'Use your recovery link to choose a new password.':'Enter your account email to request a password reset.'}</p>
  {!authBaseUrl?<p role="status">Password recovery is not configured on this deployment. Contact the HSI administrator.</p>:done?<p role="status">{reset?'Your password was reset. Sign in with your new password.':'If this address has an eligible account, the provider will send a recovery email. Check your inbox and spam folder.'}</p>:reset&&!token?<p role="alert">This recovery link is missing or invalid. <Link to="/forgot-password">Request a new recovery link</Link>.</p>:<form className="hsi-auth-form" onSubmit={submit} aria-busy={pending}>
   {reset?<><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={pending} value={password} onChange={e=>setPassword(e.target.value)} aria-describedby="password-guidance"/><p id="password-guidance">Use 12–128 characters. The authentication provider may apply additional rules.</p><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={pending} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></>:<><label htmlFor="recovery-email">Email address</label><input id="recovery-email" type="email" autoComplete="email" maxLength={254} required disabled={pending} value={email} onChange={e=>setEmail(e.target.value)}/></>}
   {error&&<p className="hsi-auth-error" role="alert">{error}</p>}<button disabled={pending} type="submit">{pending?'Please wait…':reset?'Reset password':'Send recovery email'}</button>
  </form>}
  <p className="hsi-auth-switch"><Link to="/sign-in">Return to sign in</Link></p>
 </div></section>;
}
