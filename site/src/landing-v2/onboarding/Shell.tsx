import {useEffect,useRef,useState,type ReactNode} from "react";
import {useNavigate} from "react-router-dom";
import {Link} from "../router";
import {Logo} from "../components/site/Header";
import {
 isRequired,nextStep,previousStep,stepById,validateStep,visibleSteps,type Errors,type StepId,
} from "../../../../src/onboarding/scientificOnboarding";
import {ErrorsContext} from "./ui";
import {useOnboarding} from "./store";
import "./onboarding.css";

export type ShellProps={
 step:StepId;eyebrow?:string;title:ReactNode;lede?:ReactNode;children:ReactNode;
 /** Replaces Continue (the review step finishes instead of advancing). */
 primary?:{label:string;onClick:()=>void;disabled?:boolean}|null;
 hideSkip?:boolean;wide?:boolean;
};

/** Full-screen onboarding frame: progress, one question, and back / skip / continue. */
export function OnboardingShell({step,eyebrow,title,lede,children,primary,hideSkip,wide}:ShellProps){
 const [s,dispatch]=useOnboarding();
 const nav=useNavigate();
 const h1=useRef<HTMLHeadingElement>(null);
 const [errors,setErrors]=useState<Errors>({});
 const steps=visibleSteps(s);
 const index=Math.max(0,steps.findIndex(x=>x.id===step));
 const prev=previousStep(step,s),next=nextStep(step,s);
 const optional=!isRequired(step);

 useEffect(()=>{setErrors({});window.scrollTo(0,0);h1.current?.focus({preventScroll:true})},[step]);

 const go=(to:StepId|null)=>{if(to)nav(stepById[to].path)};
 const onContinue=()=>{
  const e=validateStep(step,s);
  if(Object.keys(e).length){
   setErrors(e);
   requestAnimationFrame(()=>document.getElementById("ob-error-summary")?.focus());
   return;
  }
  dispatch({type:"visit",step});
  if(primary)primary.onClick();else go(next);
 };
 const onSkip=()=>{dispatch({type:"skip",step});go(next)};

 return (
  <div className="lv2 ob" data-step={step}>
   <a href="#ob-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to the question</a>
   <div className="ob-bg" aria-hidden="true"><svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><use href="#ob-helix"/></svg></div>
   <svg width="0" height="0" aria-hidden="true" focusable="false" style={{position:"absolute"}}>
    <defs>
     <g id="ob-helix" fill="none" strokeLinecap="round">
      <path className="ob-strand ob-strand-a" d="M-50 620 C 200 380, 380 760, 640 520 S 1040 300, 1260 420"/>
      <path className="ob-strand ob-strand-b" d="M-50 520 C 220 700, 400 340, 660 560 S 1000 760, 1260 520"/>
      {[120,260,400,540,680,820,960,1100].map((x,i)=><circle key={x} className="ob-node" cx={x} cy={500+((i%3)-1)*60} r={i%2?3:4.5}/>)}
     </g>
    </defs>
   </svg>

   <header className="ob-top">
    <Logo/>
    <p className="ob-count" aria-hidden="true">Step {index+1} of {steps.length}</p>
    <Link to="/" className="ob-exit">Save and exit</Link>
   </header>

   <nav className="ob-rail" aria-label="Setup progress">
    <ol>
     {steps.map((x,i)=>{
      const done=s.visited.includes(x.id)&&x.id!==step,skipped=s.skipped.includes(x.id)&&x.id!==step;
      return <li key={x.id} aria-current={x.id===step?"step":undefined} data-done={done&&!skipped} data-skipped={skipped} data-current={x.id===step}>
       <span className="ob-dot" aria-hidden="true">{done&&!skipped?"✓":i+1}</span>
       <span className="ob-rail-label">{x.label}<span className="sr-only">{done&&!skipped?" (done)":skipped?" (skipped)":x.id===step?" (current step)":""}</span></span>
      </li>;
     })}
    </ol>
    <div className="ob-meter" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index+1} aria-valuetext={`Step ${index+1} of ${steps.length}: ${stepById[step].label}`}>
     <span style={{width:`${((index+1)/steps.length)*100}%`}}/>
    </div>
   </nav>

   <main id="ob-main" className={`ob-main${wide?" ob-wide":""}`}>
    <p className="sr-only" role="status" aria-live="polite">Step {index+1} of {steps.length}: {stepById[step].label}</p>
    {eyebrow&&<p className="ob-eyebrow">{eyebrow}</p>}
    <h1 ref={h1} tabIndex={-1} className="ob-title">{title}</h1>
    {lede&&<p className="ob-lede">{lede}</p>}
    <ErrorsContext.Provider value={errors}>
     <div className="ob-body">{children}</div>
    </ErrorsContext.Provider>
    {Object.keys(errors).length>0&&(
     <div id="ob-error-summary" tabIndex={-1} className="ob-summary" role="alert">
      <strong>Before you continue</strong>
      <ul>{Object.entries(errors).map(([k,m])=><li key={k}>{m}</li>)}</ul>
     </div>
    )}
    <div className="ob-actions">
     {prev?<button type="button" className="ob-btn ob-btn-quiet" onClick={()=>go(prev)}>← Back</button>:<span/>}
     <div className="ob-actions-end">
      {optional&&step!=="welcome"&&step!=="review"&&!hideSkip&&<button type="button" className="ob-btn ob-btn-quiet" onClick={onSkip}>Skip for now</button>}
      {step!=="welcome"&&primary!==null&&<button type="button" className="ob-btn ob-btn-primary" onClick={onContinue} disabled={primary?.disabled}>{primary?.label??(step==="review"?"Finish":"Continue")}</button>}
     </div>
    </div>
   </main>
  </div>
 );
}
