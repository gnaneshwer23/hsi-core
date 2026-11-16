import {useEffect,useState,type ReactNode} from "react";
import {Link} from "react-router-dom";
import {HsiIdentity} from "../HsiIdentity";
import {departments} from "../../lib/departments";
import {DEPT_ICON,Icon} from "./AppIcons";
import {ACCENTS,DEFAULT_APPEARANCE,loadAppearance,saveAppearance,type Appearance} from "../../lib/appearance";
import {readBrowserRecord} from "../../lib/journey";
import {loadProfile,type Profile} from "../../lib/researchHome";
import "../../styles/research-home.css";
import "../../styles/premium-app.css";

export type ShellNav="home"|"investigations"|"gaps"|"ledger"|"targets"|"cohort"|"prescreen"|"journey"|"methods"|"evaluation"|"graph"|"evidence"|"library"|"updates";
type NavItem={label:string;to:string;icon:string;key?:ShellNav;badge?:"ledger"|"gaps"};
const GROUPS:{label:string;items:NavItem[]}[]=[
 {label:"Discover",items:[
  {label:"Home",to:"/research/home",icon:"home",key:"home"},
  {label:"Guided walkthrough",to:"/research/journey",icon:"compass",key:"journey"},
  {label:"Investigations",to:"/research/workspace",icon:"search",key:"investigations"},
  {label:"Knowledge Graph",to:"/research/knowledge-graph",icon:"graph",key:"graph"},
  {label:"Evidence Intelligence",to:"/evidence-intelligence",icon:"layers",key:"evidence"}]},
 {label:"Your research",items:[
  {label:"Gap Register",to:"/research/gaps",icon:"target",key:"gaps",badge:"gaps"},
  {label:"Hypothesis Ledger",to:"/research/ledger",icon:"flask",key:"ledger",badge:"ledger"},
  {label:"Candidate targets",to:"/research/targets",icon:"pill",key:"targets"},
  {label:"Research methods",to:"/research/methods",icon:"book",key:"methods"},
  {label:"Evaluation set",to:"/research/evaluation",icon:"chart",key:"evaluation"}]},
 {label:"Patients and trials",items:[
  {label:"Cohort (synthetic)",to:"/research/cohort",icon:"users",key:"cohort"},
  {label:"Trial pre-screening",to:"/research/prescreen",icon:"clipboard",key:"prescreen"}]},
 {label:"Library",items:[
  {label:"Research Library",to:"/research/home#rh-library",icon:"book"},
  {label:"Scientific Updates",to:"/research/home#rh-radar",icon:"bell"}]},
];
const deptIcon=(slug:string)=>DEPT_ICON[slug]??"graph";
function AppearanceMenu({ap,set}:{ap:Appearance;set:(a:Appearance)=>void}){
 const [open,setOpen]=useState(false);
 return (
  <div className="rh-appear">
   <button type="button" className="rh-iconbtn" aria-expanded={open} aria-controls="rh-appear-panel" aria-label="Appearance" onClick={()=>setOpen(o=>!o)}><Icon name="palette" size={19}/></button>
   {open&&<div className="rh-appear-panel" id="rh-appear-panel" role="group" aria-label="Appearance">
    <p>Mode</p>
    <div className="rh-seg">{(["light","dark"] as const).map(t=><button key={t} type="button" aria-pressed={ap.theme===t} onClick={()=>set({...ap,theme:t})}>{t==="light"?"Light":"Dark"}</button>)}</div>
    <p>Accent</p>
    <div className="rh-swatches">{ACCENTS.map(a=><button key={a.id} type="button" aria-pressed={ap.accent===a.id} aria-label={a.label} title={a.label} style={{background:a.swatch}} onClick={()=>set({...ap,accent:a.id})}>{ap.accent===a.id&&<Icon name="check" size={14}/>}</button>)}</div>
    <small>Saved on this device.</small>
   </div>}
  </div>
 );
}
/** The researcher app shell: own top bar and sidebar in place of the public header and footer. Shared by Research Home and the investigation workspace. */
export function ResearchAppShell({where,whereIcon="home",active,onSearch,children}:{where:string;whereIcon?:string;active:ShellNav;onSearch?:()=>void;children:ReactNode}){
 const [menu,setMenu]=useState(false),[ap,setAp]=useState<Appearance>(DEFAULT_APPEARANCE);
 const [badges,setBadges]=useState<Record<"ledger"|"gaps",number>>({ledger:0,gaps:0});
 const [prof,setProf]=useState<Profile|null>(null);
 useEffect(()=>{setProf(loadProfile());setAp(loadAppearance());try{const r=readBrowserRecord(localStorage);setBadges({ledger:r.ledgerEntries,gaps:r.gapStatuses})}catch{}},[]);
 /** WCAG 2.2 Focus Not Obscured: the header is sticky, so keep keyboard focus clear of it. */
 useEffect(()=>{
  const onFocus=(e:FocusEvent)=>{
   const el=e.target as Element|null,head=document.querySelector(".rh-top");
   if(!el||!head||el===document.body||head.contains(el)||el.closest(".rh-nav"))return;
   const h=head.getBoundingClientRect().height,r=el.getBoundingClientRect();
   if(r.top<h+8)window.scrollBy({top:r.top-h-16,behavior:"instant" as ScrollBehavior});
  };
  document.addEventListener("focusin",onFocus);return()=>document.removeEventListener("focusin",onFocus);
 },[]);
 const change=(a:Appearance)=>{setAp(a);saveAppearance(a)};
 const theme=ap.theme;
 const isArea=(i:string)=>departments.some(d=>d.slug===i);
 const mine=prof?.onboarded?prof.interests.filter(i=>!isArea(i)).slice(0,5):[];
 const myAreas=prof?.onboarded?departments.filter(d=>prof.interests.includes(d.slug)):[];
 const sci=myAreas.length?myAreas:departments;
 const cur=(k:ShellNav)=>active===k?"page":undefined;
 return (
  <div className="rh-app" data-theme={theme} data-accent={ap.accent}>
   <a className="rh-skip" href="#rh-main">Skip to the main content</a>
   <header className="rh-top">
    <button type="button" className="rh-menu" aria-expanded={menu} aria-controls="rh-nav" onClick={()=>setMenu(m=>!m)}><Icon name={menu?"x":"menu"} size={20}/><span className="rh-vh">Menu</span></button>
    <Link to="/" className="rh-brand" aria-label="Human Super Intelligence, public site"><HsiIdentity/></Link>
    <span className="rh-sep" aria-hidden="true"/>
    <span className="rh-where"><Icon name={whereIcon} size={18}/> {where}</span>
    {mine.length>0&&<Link className="rh-prog" to="/research/home#pr-h" aria-label={`Your research program: ${mine.slice(0,2).join(", ")}`}><Icon name="target" size={15}/><span>{mine.slice(0,2).join(" · ")}{mine.length>2?` +${mine.length-2}`:""}</span></Link>}
    {onSearch?<button type="button" className="rh-kbd" onClick={onSearch} aria-label="Focus search (Command K)"><Icon name="search" size={16}/> Search <kbd>⌘K</kbd></button>:<Link className="rh-kbd" to="/research/home#rh-q" aria-label="Search from Research Home"><Icon name="search" size={16}/> Search</Link>}
    <AppearanceMenu ap={ap} set={change}/>
    <a className="rh-iconbtn" href="/research/home#rh-radar" aria-label="Scientific updates: none connected"><Icon name="bell" size={19}/></a>
    <Link className="rh-iconbtn" to="/research/account" aria-label="Profile and access"><Icon name="user" size={19}/></Link>
   </header>
   <div className="rh-body">
    <aside className="rh-nav" id="rh-nav" data-open={menu} aria-label="Research navigation">
     {mine.length>0&&<nav aria-label="My research"><h2>My research</h2><ul>
      <li><Link to="/research/home#pr-h"><Icon name="target"/><span>My program</span></Link></li>
      {mine.map(t=><li key={t}><Link to={"/research/knowledge-graph?netQuery="+encodeURIComponent(t)}><Icon name="spark"/><span>{t}</span></Link></li>)}</ul></nav>}
     {GROUPS.map(g=><nav key={g.label} aria-label={g.label}><h2>{g.label}</h2><ul>{g.items.map(i=>(
      <li key={i.label}><Link to={i.to} aria-current={i.key&&cur(i.key)}><Icon name={i.icon}/><span>{i.label}</span>{i.badge&&badges[i.badge]>0&&<em className="rh-count" aria-hidden="true">{badges[i.badge]}</em>}</Link></li>))}</ul></nav>)}
     <nav aria-label="Explore science"><h2>{myAreas.length?"My areas":"Explore science"}</h2><ul>{sci.map(d=><li key={d.slug}><Link to={"/research/knowledge-graph?netDepartment="+d.slug}><Icon name={deptIcon(d.slug)}/>{d.name}</Link></li>)}</ul></nav>
     <nav aria-label="Account"><h2>Account</h2><ul><li><Link to="/research/account"><Icon name="user"/>Profile and access</Link></li><li><Link to="/research/home#rh-interests"><Icon name="spark"/>Preferences</Link></li></ul></nav>
     <div className="rh-status"><b>Research preview</b><span>Candidate-only graph. Nothing is scientifically approved. No clinical advice.</span></div>
    </aside>
    {children}
   </div>
  </div>
 );
}
