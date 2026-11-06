import {Link,useLocation} from "react-router-dom";
export const RESEARCH_NAV_ITEMS=[
 {to:"/research/dashboard",label:"Dashboard"},{to:"/research/scientific-workbench",label:"Workbench"},
 {to:"/science/graph",label:"Graph"},{to:"/research/knowledge-graph",label:"Claim graph"},{to:"/research/evidence-readiness",label:"Evidence"},
 {to:"/science/clinical-trials",label:"Trials"},{to:"/research/dashboard?view=briefs",label:"Briefs"},
 {to:"/research/governance",label:"Governance"},{to:"/community",label:"Discussions"},{to:"/research/capabilities",label:"Capability lab"}
];
export function ResearchNavigation(){const location=useLocation();return <nav className="xp-research-nav" aria-label="Research workspace">{RESEARCH_NAV_ITEMS.map(i=><Link key={i.label} to={i.to} aria-current={location.pathname+location.search===i.to?"page":undefined}>{i.label}</Link>)}</nav>}
