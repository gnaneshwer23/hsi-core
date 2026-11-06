import {Link,useLocation} from "react-router-dom";
export const RESEARCH_NAV_ITEMS=[
 {to:"/research/dashboard",label:"Dashboard"},{to:"/research/scientific-workbench",label:"Workbench"},
 {to:"/science/graph",label:"Topic map"},{to:"/research/knowledge-graph",label:"Knowledge graph"},{to:"/research/evidence-readiness",label:"Evidence"},
 {to:"/science/clinical-trials",label:"Trials"},{to:"/research/dashboard?view=briefs",label:"Briefs"},
 {to:"/research/governance",label:"Governance"},{to:"/community",label:"Discussions"},{to:"/research/capabilities",label:"Capability lab"}
];
export function ResearchNavigation(){const location=useLocation();return <nav className="xp-research-nav" aria-label="Research workspace">{RESEARCH_NAV_ITEMS.map(i=><Link key={i.label} to={i.to} aria-current={(i.to.includes("?")?location.pathname+location.search===i.to:location.pathname===i.to&&!(i.to==="/research/dashboard"&&new URLSearchParams(location.search).get("view")==="briefs"))?"page":undefined}>{i.label}</Link>)}</nav>}
