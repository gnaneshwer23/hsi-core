/**
 * Single primary live investigation path for HSI 1.0 reconnect.
 * Legacy workbench URLs remain as specialised tools or redirects — do not rebuild them.
 * Query `scenario` is curated scenarioId only (no free-text POST).
 */
import {LIVE_SCENARIOS} from "../../../src/investigation/scenarios";

export const LIVE_INVESTIGATION_PATH="/research/workspace" as const;
export const RESEARCH_HOME_PATH="/research/home" as const;
/** Text-first Scientific Companion (U41+) — optional workspace evidence handoff (U45). */
export const SCIENTIFIC_COMPANION_PATH="/research/companion" as const;
/** Auth-owned interrogative packages (requires ?investigation=). */
export const AUTHORISED_INVESTIGATION_PATH="/research/decision-workbench" as const;
/** Curated demo investigation (not the live run). */
export const CURATED_DEMO_INVESTIGATION_PATH="/research/investigate" as const;
/** URL query key for curated live scenario handoff (scenarioId only). */
export const LIVE_SCENARIO_QUERY_KEY="scenario" as const;
/** URL query key marking Companion handoff from the live workspace (U45). */
export const COMPANION_HANDOFF_FROM_QUERY_KEY="from" as const;
export const COMPANION_HANDOFF_FROM_WORKSPACE="workspace" as const;

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

/** Companion href with optional curated-scenario workspace handoff (no auto-run). */
export function scientificCompanionHref(opts?:{
  scenarioId?:string|null;
  fromWorkspace?:boolean;
}):string{
  const params=new URLSearchParams();
  if(opts?.fromWorkspace)params.set(COMPANION_HANDOFF_FROM_QUERY_KEY,COMPANION_HANDOFF_FROM_WORKSPACE);
  const scenario=resolveCuratedScenarioId(opts?.scenarioId??null);
  if(scenario)params.set(LIVE_SCENARIO_QUERY_KEY,scenario);
  const q=params.toString();
  return q?`${SCIENTIFIC_COMPANION_PATH}?${q}`:SCIENTIFIC_COMPANION_PATH;
}

/** Routes that used to market themselves as the investigation workbench. */
export const LEGACY_WORKBENCH_REDIRECTS=[
  {from:"/research/discovery-experience",to:LIVE_INVESTIGATION_PATH},
] as const;
