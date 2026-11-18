import {LIVE_INVESTIGATION_PATH,RESEARCH_HOME_PATH} from "./workbenchPrimary";

/** Legacy research chrome nav. Primary investigate path is the live workspace. */
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
] as const;
