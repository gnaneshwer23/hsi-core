import {Link,useSearchParams} from "react-router-dom";
import {InvestigationWorkspace} from "../components/InvestigationWorkspace";
import {BlueprintSection,ExperienceHero,ExperienceLink} from "../components/Experience";
export function ResearchDashboard(){
 const [params]=useSearchParams(),briefs=params.get("view")==="briefs";
 return <div className="xp-page xp-dashboard"><ExperienceHero eyebrow="RESEARCH DASHBOARD" title={briefs?"Your research briefs.":"Start with a question."} emphasis={briefs?"Keep every version in view.":"Keep the evidence connected."} description={briefs?"Open a saved investigation to inspect and export its exact evidence package, outcome and review status. No saved brief or review count is invented.":"Create or reopen a bounded investigation. The backend verifies your current research permissions, source access and release availability."}><div className="xp-actions"><ExperienceLink to="/research/account" secondary>Check your account</ExperienceLink><ExperienceLink to="/research/validation" secondary>Try a synthetic scenario</ExperienceLink></div></ExperienceHero>
 <div className="xp-wrap xp-dashboard-workspace"><InvestigationWorkspace/></div>
 <BlueprintSection kicker="RESEARCH TOOLS" title="Move between the question and its context."><div className="xp-card-grid xp-three">{[
 ["Graph explorer","Inspect represented entities, relationships, context and draft evidence.","/science/graph"],
 ["Evidence library","Review the working catalogue and its source/scientific clearance gaps.","/research/evidence-readiness"],
 ["Trial research","Explore the registry-context and synthetic criterion previews. No eligibility decision.","/science/clinical-trials"],
 ["Independent review","Authorised reviewers inspect submitted packages and record scoped decisions.","/research/scientific-review"],
 ["Discussion drafts","Prepare local source-linked comments or challenges; no public posting.","/community"],
 ["Biology explorer","Explore educational organs, tissues and mechanisms separately from governed evidence.","/science/body"]
 ].map(([t,d,to])=><article className="xp-card" key={t}><h3>{t}</h3><p>{d}</p><Link to={to}>Open tool ↗</Link></article>)}</div></BlueprintSection></div>;
}
