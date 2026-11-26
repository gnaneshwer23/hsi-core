import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {Link} from "../router";
import {ROLES,roleById,stepById,type DataClass,type RoleId} from "../../../../src/onboarding/scientificOnboarding";
import {OnboardingShell} from "./Shell";
import {Chip,FieldError,Note,Status,TextField} from "./ui";
import {useOnboarding} from "./store";

const ACCOUNT_OPTIONS=[
 {id:"email",label:"Email",status:null,note:"Available. Create an account after setup, or now."},
 {id:"google",label:"Google",status:"Planned" as const,note:"Not connected yet."},
 {id:"orcid",label:"ORCID",status:"Planned" as const,note:"Authenticated ORCID sign-in is not connected yet. You can type your iD later."},
 {id:"sso",label:"Institutional SSO",status:"Planned" as const,note:"Not connected yet. Institutions start from the separate path below."},
];

export function Welcome(){
 const nav=useNavigate();
 const [s,d]=useOnboarding();
 const start=()=>{d({type:"set",patch:{account:s.account??"later",path:"individual"}});d({type:"visit",step:"welcome"});nav(stepById.role.path)};
 return (
  <OnboardingShell step="welcome" wide title={<>Science begins<br/>with you.</>} lede="Build a scientific intelligence environment around your research, expertise and ambitions.">
   <div className="ob-welcome">
    <div className="ob-welcome-cta">
     <button type="button" className="ob-btn ob-btn-primary ob-btn-lg" onClick={start}>Start setup</button>
     <p className="ob-hint">About three minutes. Only your role, one domain and one goal are required. Everything else can be skipped.</p>
     <p className="ob-institution-link">Setting up for an organisation? <button type="button" className="ob-link" onClick={()=>{d({type:"set",patch:{path:"institution"}});d({type:"visit",step:"welcome"});nav(stepById.role.path)}}>Start the institutional path →</button></p>
    </div>
    <section aria-labelledby="ob-acct" className="ob-accounts">
     <h2 id="ob-acct" className="ob-h2">How you will sign in</h2>
     <ul>
      {ACCOUNT_OPTIONS.map(o=>(
       <li key={o.id} data-available={!o.status}>
        <span className="ob-acct-name">{o.label}{o.status&&<Status s={o.status}/>}</span>
        <span className="ob-acct-note">{o.note}</span>
       </li>
      ))}
     </ul>
     <Note>Setup runs in this browser and is saved on this device only. Nothing is sent to HSI until you create an account, and choosing a role does not grant access to anything.</Note>
     <p className="ob-hint"><Link to="/sign-up" className="ob-link">Create an email account now</Link> · <Link to="/sign-in" className="ob-link">Sign in</Link></p>
    </section>
   </div>
  </OnboardingShell>
 );
}

const GROUPS:{label:string;ids:RoleId[]}[]=[
 {label:"Students",ids:["undergraduate","masters"]},
 {label:"Researchers",ids:["phd","postdoc","independent","pi"]},
 {label:"Laboratory and computational",ids:["lab","compbio","bioinf"]},
 {label:"Clinical and industry",ids:["clinical","biotech","pharma"]},
 {label:"Administration",ids:["admin"]},
];

export function Role(){
 const [s,d]=useOnboarding();
 return (
  <OnboardingShell step="role" eyebrow="Your research role" title="How would you describe your work?" lede="Choose the role that fits best, then add any others that also apply. This shapes what HSI shows you first.">
   <div role="radiogroup" aria-label="Primary role" aria-describedby="err-primaryRole" className="ob-roles">
    {GROUPS.map(g=>(
     <div key={g.label} className="ob-role-group">
      <h2 className="ob-h3">{g.label}</h2>
      {g.ids.map(id=>{
       const r=roleById[id],on=s.primaryRole===id;
       return (
        <div key={id} className="ob-role" data-on={on}>
         <button type="button" role="radio" aria-checked={on} className="ob-role-main" onClick={()=>d({type:"setPrimaryRole",role:id})}>
          <span className="ob-radio" aria-hidden="true"/>
          <span><span className="ob-role-name">{r.label}</span><span className="ob-role-blurb">{r.blurb}</span></span>
         </button>
        </div>
       );
      })}
     </div>
    ))}
   </div>
   <FieldError name="primaryRole"/>
   {s.primaryRole&&(
    <fieldset className="ob-group ob-secondary">
     <legend>Also describes me <span className="ob-optional">(optional)</span></legend>
     <div className="ob-chips">
      {ROLES.filter(r=>r.id!==s.primaryRole).map(r=><Chip key={r.id} on={s.secondaryRoles.includes(r.id)} onClick={()=>d({type:"toggleSecondaryRole",role:r.id})}>{r.label}</Chip>)}
     </div>
    </fieldset>
   )}
   <Note>Your role personalises your workspace. It is not a permission: group, institution and dataset access are granted separately by an administrator.</Note>
  </OnboardingShell>
 );
}

export function Institution(){
 const [s,d]=useOnboarding();
 useEffect(()=>{if(s.path!=="institution")d({type:"set",patch:{path:"institution"}})},[]);// direct visits take the institutional path
 const set=(patch:Partial<typeof s.institutionInfo>)=>d({type:"setInstitution",patch});
 return (
  <OnboardingShell step="institution" eyebrow="Institutional path" title="Set up an organisation." lede="Tell us about the organisation so a workspace can be planned. This does not verify the organisation or create access.">
   <div className="ob-form">
    <TextField name="institutionName" label="Organisation name" value={s.institutionInfo.name} onChange={v=>set({name:v})} autoComplete="organization"/>
    <TextField name="contact" label="Contact email" optional type="email" value={s.institutionInfo.contact} onChange={v=>set({contact:v})} autoComplete="email"/>
    <fieldset className="ob-group"><legend>Approximate size <span className="ob-optional">(optional)</span></legend>
     <div className="ob-chips" role="radiogroup" aria-label="Approximate size">
      {([["under-50","Under 50 researchers"],["50-500","50 to 500"],["over-500","Over 500"]] as const).map(([v,l])=><Chip key={v} role="radio" on={s.institutionInfo.size===v} onClick={()=>set({size:s.institutionInfo.size===v?"":v})}>{l}</Chip>)}
     </div>
    </fieldset>
    <Departments/>
    <fieldset className="ob-group"><legend>Kinds of data the organisation expects to use <span className="ob-optional">(optional)</span></legend>
     <p className="ob-hint">A plan, not an authorisation. Restricted data needs your organisation's approval and administrator-provisioned access.</p>
     <div className="ob-chips">
      {(["public","private","restricted"] as DataClass[]).map(c=><Chip key={c} on={s.institutionInfo.intendedData.includes(c)} onClick={()=>set({intendedData:s.institutionInfo.intendedData.includes(c)?s.institutionInfo.intendedData.filter(x=>x!==c):[...s.institutionInfo.intendedData,c]})}>{{public:"Public metadata",private:"Members' private documents",restricted:"Restricted research data"}[c]}</Chip>)}
     </div>
    </fieldset>
   </div>
   <section className="ob-next" aria-labelledby="ob-inst-next">
    <h2 id="ob-inst-next" className="ob-h3">What happens next</h2>
    <ol>
     <li><span>An HSI administrator verifies the organisation</span><Status s="Planned"/></li>
     <li><span>Members are invited and their roles confirmed by the organisation</span><Status s="Planned"/></li>
     <li><span>Permissions and research governance are configured by an authorised administrator</span><Status s="Planned"/></li>
    </ol>
   </section>
   <Note tone="caution">Choosing an administrator role, or entering an organisation here, does not give anyone access. Nothing is sent from this page.</Note>
  </OnboardingShell>
 );
}

function Departments(){
 const [s,d]=useOnboarding();
 const [name,setName]=useState("");
 const add=()=>{if(name.trim()){d({type:"addDepartment",name});setName("")}};
 return (
  <section className="ob-interests" aria-labelledby="ob-dept">
   <h2 id="ob-dept" className="ob-h3">Departments or groups <span className="ob-optional">(optional)</span></h2>
   <form className="ob-inline" onSubmit={e=>{e.preventDefault();add()}}>
    <label className="ob-field ob-field-grow"><span>Name</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="For example Immunology"/></label>
    <button type="submit" className="ob-btn ob-btn-quiet">Add</button>
   </form>
   {s.institutionInfo.departments.length>0&&<ul className="ob-tags" aria-label="Departments">{s.institutionInfo.departments.map((x,i)=><li key={x}>{x}<button type="button" aria-label={`Remove ${x}`} onClick={()=>d({type:"removeDepartment",index:i})}>×</button></li>)}</ul>}
  </section>
 );
}
