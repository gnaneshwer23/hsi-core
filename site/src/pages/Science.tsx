import {BlueprintSection,ExperienceLink} from "../components/Experience";
import { ScienceLanding } from "../components/landing/ScienceLanding";

/** Public educational biology explorer; separate from research workspaces. */
export function Science() {
  return <><ScienceLanding/><div className="xp-page"><BlueprintSection kicker="FROM EDUCATION TO INVESTIGATION" title="Take a question into the research workflow."><div className="xp-actions"><ExperienceLink to="/research">Explore research</ExperienceLink><ExperienceLink to="/evidence-safety" secondary>Understand the evidence states</ExperienceLink></div><p>Educational context and draft graph relationships remain separate from reviewed scientific findings.</p></BlueprintSection></div></>;
}
