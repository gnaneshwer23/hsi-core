import {Link,useLocation} from "react-router-dom";
/** Investigation deep-links require `?investigation=hsi-interrogative-…` — bare workbench is a dead end. */
export const RESEARCH_NAV_ITEMS=[
 {to:"/research/dashboard",label:"Dashboard"},
 {to:"/research/dashboard#dashboard-workspace",label:"Investigation"},
 {to:"/research/mechanism-workflow",label:"Connected path"},
 {to:"/research/scientific-workbench",label:"Saved list"},
 {to:"/science/graph",label:"Topic map"},{to:"/research/knowledge-graph",label:"Knowledge graph"},{to:"/research/evidence-readiness",label:"Evidence"},
 {to:"/science/clinical-trials",label:"Trials"},{to:"/research/dashboard?view=briefs",label:"Briefs"},
 {to:"/research/governance",label:"Governance"},{to:"/community",label:"Discussions"},{to:"/research/capabilities",label:"Capability lab"}
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
