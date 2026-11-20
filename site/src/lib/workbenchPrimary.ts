/**
 * Single primary live investigation path for HSI 1.0 reconnect.
 * Legacy workbench URLs remain as specialised tools or redirects — do not rebuild them.
 * Query `scenario` is curated scenarioId only (no free-text POST).
 */
import {LIVE_SCENARIOS} from "../../../src/investigation/scenarios";

export const LIVE_INVESTIGATION_PATH="/research/workspace" as const;
export const RESEARCH_HOME_PATH="/research/home" as const;
/** Auth-owned interrogative packages (requires ?investigation=). */
export const AUTHORISED_INVESTIGATION_PATH="/research/decision-workbench" as const;
/** Curated demo investigation (not the live run). */
export const CURATED_DEMO_INVESTIGATION_PATH="/research/investigate" as const;
/** URL query key for curated live scenario handoff (scenarioId only). */
export const LIVE_SCENARIO_QUERY_KEY="scenario" as const;

export function resolveCuratedScenarioId(raw:string|null|undefined):string|null{
  if(typeof raw!=="string")return null;
  const id=raw.trim();
  return id&&LIVE_SCENARIOS[id]?id:null;
}

export function liveInvestigationHref(opts?:{reopen?:boolean;scenarioId?:string|null}):string{
  const params=new URLSearchParams();
  if(opts?.reopen)params.set("reopen","1");
  const scenario=resolveCuratedScenarioId(opts?.scenarioId??null);
  if(scenario)params.set(LIVE_SCENARIO_QUERY_KEY,scenario);
  const q=params.toString();
  return q?`${LIVE_INVESTIGATION_PATH}?${q}`:LIVE_INVESTIGATION_PATH;
}

export function authorisedInvestigationHref(id:string):string{
  return `${AUTHORISED_INVESTIGATION_PATH}?investigation=${encodeURIComponent(id)}`;
}

/** Routes that used to market themselves as the investigation workbench. */
export const LEGACY_WORKBENCH_REDIRECTS=[
  {from:"/research/discovery-experience",to:LIVE_INVESTIGATION_PATH},
] as const;
