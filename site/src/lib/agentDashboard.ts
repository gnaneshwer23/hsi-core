import {intelligenceCapabilities,type IntelligenceCapability} from "./intelligenceCollective";

/** Operating state shown on the public agent dashboard. Derived from the maturity record, never from aspiration. */
export type AgentState="built_not_run"|"built_disabled";
export const AGENT_STATE:Record<string,{state:AgentState;label:string}>=Object.fromEntries(
  intelligenceCapabilities.map(c=>[c.slug,c.slug==="helix"
    ?{state:"built_disabled" as const,label:"Built · disabled"}
    :{state:"built_not_run" as const,label:"Built · no live run"}]),
);

export const PIPELINE=["Retrieve","Extract","Investigate","Challenge","Human review"] as const;

export function agentSummary(list:readonly IntelligenceCapability[]=intelligenceCapabilities){
  return {
    capabilities:list.length,
    // No capability's maturity record reports a real live run or an independent scientific acceptance.
    liveRuns:0,
    independentlyAccepted:0,
    disabled:list.filter(c=>AGENT_STATE[c.slug]?.state==="built_disabled").length,
  };
}
