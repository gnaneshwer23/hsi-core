import {Link} from "../router";
import {deriveWorkspacePlan,stepById,validateStep,type StepId} from "../../../../src/onboarding/scientificOnboarding";
import {OnboardingShell} from "./Shell";
import {Note,Status} from "./ui";
import {dispatchOnboarding,useOnboarding} from "./store";

const REQUIRED:StepId[]=["role","science","objectives"];

function Assembly({items}:{items:string[]}){
 return (
  <div className="ob-assembly" aria-hidden="true">
   <svg viewBox="0 0 600 260" focusable="false">
    <circle className="ob-core" cx="300" cy="130" r="30"/>
    <circle className="ob-core-ring" cx="300" cy="130" r="46"/>
    {items.map((t,i)=>{
     const a=(i/items.length)*Math.PI*2-Math.PI/2,x=300+Math.cos(a)*210,y=130+Math.sin(a)*92;
     return <g key={t+i} className="ob-orbit" style={{animationDelay:`${i*0.12}s`}}>
      <line x1="300" y1="130" x2={x} y2={y} pathLength={1}/>
      <circle cx={x} cy={y} r="5"/>
      <text x={x} y={y+(y>130?20:-12)} textAnchor="middle">{t.length>26?t.slice(0,25)+"…":t}</text>
     </g>;
    })}
   </svg>
  </div>
 );
}

export function Review(){
 const [s]=useOnboarding();
 const missing=REQUIRED.filter(x=>Object.keys(validateStep(x,s)).length>0);
 const plan=missing.length?null:deriveWorkspacePlan(s);
 const orbit=plan?[plan.primaryRoleLabel,...plan.domains.slice(0,3),...plan.objectives.slice(0,2),...plan.interests.slice(0,1)]:[];
 const finish=()=>dispatchOnboarding({type:"finish"});
 return (
  <OnboardingShell step="review" wide eyebrow={s.done?"Setup saved on this device":"Your workspace plan"} title={s.done?"Your setup is saved.":"Here is the workspace we would build."} lede={plan?"Assembled from your answers, in this browser. Review it, change anything, then finish.":"A few required answers are missing. Complete them and your plan will appear here."} primary={plan&&!s.done?{label:"Finish setup",onClick:finish}:null} hideSkip>
   {!plan&&(
    <ul className="ob-missing">
     {missing.map(m=><li key={m}><Link to={stepById[m].path} className="ob-link">Complete “{stepById[m].label}” →</Link></li>)}
    </ul>
   )}
   {plan&&(<>
    <Assembly items={orbit}/>
    <div className="ob-plan">
     <section aria-labelledby="pl-who"><h2 id="pl-who" className="ob-h3">You</h2>
      <p className="ob-plan-big">{plan.primaryRoleLabel}</p>
      {plan.secondaryRoleLabels.length>0&&<p className="ob-hint">Also: {plan.secondaryRoleLabels.join(", ")}</p>}
      <p className="ob-hint">Workspace style: {plan.personaLabel}</p>
      <Link to={stepById.role.path} className="ob-link">Change role</Link>
     </section>
     <section aria-labelledby="pl-sci"><h2 id="pl-sci" className="ob-h3">Science</h2>
      <p className="ob-plan-big">{plan.domains[0]}</p>
      {plan.domains.length>1&&<p className="ob-hint">Also: {plan.domains.slice(1).join(", ")}</p>}
      {plan.interests.length>0&&<p className="ob-hint">Following: {plan.interests.join(", ")}</p>}
      <Link to={stepById.science.path} className="ob-link">Change domains</Link>
     </section>
     <section aria-labelledby="pl-obj"><h2 id="pl-obj" className="ob-h3">Objectives</h2>
      <ul className="ob-plain">{plan.objectives.map(o=><li key={o}>{o}</li>)}</ul>
      <Link to={stepById.objectives.path} className="ob-link">Change objectives</Link>
     </section>
     <section aria-labelledby="pl-tools" className="ob-plan-wide"><h2 id="pl-tools" className="ob-h3">Recommended scientific tools</h2>
      <ul className="ob-tools">{plan.tools.map(t=><li key={t.id}><div><Link to={t.to} className="ob-role-name ob-link">{t.name}</Link> <Status s={t.status}/><span className="ob-role-blurb">{t.why}</span></div></li>)}</ul>
      <p className="ob-hint">Statuses match the public platform pages. Tools marked Planned are not available yet.</p>
     </section>
     <section aria-labelledby="pl-first" className="ob-plan-wide ob-first"><h2 id="pl-first" className="ob-h3">Proposed first investigation</h2>
      <p className="ob-plan-big">{plan.firstInvestigation.title}</p>
      <p className="ob-hint">{plan.firstInvestigation.detail}</p>
     </section>
    </div>
    <div className="ob-honest" role="note">
     <h2 className="ob-h3">What has and has not happened</h2>
     <ul>{plan.notes.map(n=><li key={n}>{n}</li>)}</ul>
    </div>
    {s.done&&(
     <section className="ob-done" aria-labelledby="ob-done-h">
      <h2 id="ob-done-h" className="ob-h2">Where next</h2>
      <div className="ob-done-actions">
       <Link to={plan.firstAction.to} className="ob-btn ob-btn-primary">{plan.firstAction.label}</Link>
       <Link to="/settings/scientific-profile" className="ob-btn ob-btn-quiet">Review my scientific profile</Link>
       <Link to="/sign-up" className="ob-btn ob-btn-quiet">Create an account to keep this</Link>
      </div>
      <Note>The workspace above is a demonstration with illustrative content. It is not your data, and it does not use your answers beyond choosing which demonstration to open.</Note>
     </section>
    )}
   </>)}
  </OnboardingShell>
 );
}
