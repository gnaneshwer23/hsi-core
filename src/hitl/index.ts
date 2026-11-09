export { HitlStore, requestHash } from "./store";
export { HITL_STATES, HITL_TERMINAL, HITL_TRANSITIONS, HitlError } from "./types";
export type { HitlActor, HitlEvent, HitlJob, HitlState, OutboxRow, QuestionAudience } from "./types";

import type { HitlActor } from "./types";

/** Scripted fixture actors. They are not live reviewers and they send nothing. */
export const DEMO_HITL_ACTORS: readonly HitlActor[] = [
  { id: "actor-coordinator", role: "coordinator", pseudonym: null },
  { id: "actor-scientist", role: "scientist", pseudonym: null },
  { id: "actor-reviewer", role: "scientific_reviewer", pseudonym: null },
  { id: "actor-patient", role: "patient", pseudonym: "HSI-DEMO-0014" },
  { id: "actor-privacy", role: "privacy_service", pseudonym: null },
];
