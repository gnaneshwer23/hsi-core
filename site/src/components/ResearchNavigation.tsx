import {Link,useLocation} from "react-router-dom";
import {LIVE_INVESTIGATION_PATH,RESEARCH_HOME_PATH} from "../lib/workbenchPrimary";
/** Primary investigate path is the live workspace. Auth package viewer still needs `?investigation=`. */
export const RESEARCH_NAV_ITEMS=[
 {to:RESEARCH_HOME_PATH,label:"Home"},
 {to:LIVE_INVESTIGATION_PATH,label:"Live investigation"},
 {to:"/research/dashboard",label:"Saved & account list"},
 {to:"/research/knowledge-graph",label:"Knowledge graph"},
 {to:"/research/evidence-readiness",label:"Evidence"},
 {to:"/research/dashboard?view=briefs",label:"Briefs"},
 {to:"/research/governance",label:"Governance"},
 {to:"/science/graph",label:"Topic map"},
 {to:"/science/clinical-trials",label:"Trials"},
 {to:"/community",label:"Discussions"},
 {to:"/research/capabilities",label:"Capability lab"},
];
export function ResearchNavigation(){
 const location=useLocation();
 return <nav className="xp-research-nav" aria-label="Research workspace">{RESEARCH_NAV_ITEMS.map(i=>{
  const pathOnly=i.to.split("#")[0]??i.to;
  const current=pathOnly.includes("?")
   ?location.pathname+location.search===pathOnly
   :location.pathname===pathOnly&&!(pathOnly==="/research/dashboard"&&new URLSearchParams(location.search).get("view")==="briefs"&&!i.to.includes("view=briefs"));
  return <Link key={i.label} to={i.to} aria-current={current?"page":undefined}>{i.label}</Link>;
 })}</nav>;
}
