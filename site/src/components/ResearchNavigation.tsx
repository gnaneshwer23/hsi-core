import {Link,useLocation} from "react-router-dom";
import {RESEARCH_NAV_ITEMS} from "../lib/researchNavItems";

export {RESEARCH_NAV_ITEMS};

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
