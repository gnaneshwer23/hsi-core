/**
 * Durable question-and-review states, ported from the local v3 loop.
 * Patient-facing questions are simulated in fixtures and are never sent.
 * Every row in this module is for the synthetic demonstration cohort.
 */

export const HITL_STATES = [
  "draft",
  "awaiting_send_approval",
  "awaiting_answer",
  "awaiting_review",
  "approved",
  "rejected",
  "applied",
  "expired",
  "cancelled_permission",
  "superseded",
] as const;

export type HitlState = (typeof HITL_STATES)[number];

export const HITL_TERMINAL: ReadonlySet<HitlState> = new Set([
  "rejected",
  "applied",
  "expired",
  "cancelled_permission",
  "superseded",
]);

export const HITL_TRANSITIONS: Record<HitlState, readonly HitlState[]> = {
  draft: ["awaiting_send_approval", "cancelled_permission"],
  awaiting_send_approval: ["awaiting_answer", "cancelled_permission", "superseded", "expired"],
  awaiting_answer: ["awaiting_review", "expired", "cancelled_permission", "superseded"],
  awaiting_review: ["approved", "rejected", "cancelled_permission", "superseded"],
  approved: ["applied", "superseded", "cancelled_permission"],
  rejected: [],
  applied: [],
  expired: [],
  cancelled_permission: [],
  superseded: [],
};

export type HitlRole =
  | "coordinator"
  | "scientific_reviewer"
  | "scientist"
  | "patient"
  | "clinician"
  | "privacy_service";

export type HitlActor = {
  id: string;
  role: HitlRole;
  /** Project pseudonym when the actor is a patient. Never a real identity. */
  pseudonym: string | null;
};

export type QuestionAudience = "scientific_reviewer" | "patient";

export type HitlJob = {
  id: string;
  gapKey: string;
  audience: QuestionAudience;
  state: HitlState;
  recipientActorId: string;
  prompt: string;
  chartVersionAsked: number;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  synthetic: true;
};

export type OutboxRow = {
  id: string;
  kind: "question.deliver";
  jobId: string;
  status: "pending" | "done" | "cancelled";
  channel: "simulated_local_only";
  createdAt: string;
  processedAt: string | null;
};

export type HitlEvent = {
  id: string;
  jobId: string | null;
  name: string;
  actorId: string;
  at: string;
  detail: Record<string, unknown>;
};

export class HitlError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid_transition"
      | "idempotency_conflict"
      | "patient_questions_never_sent"
      | "four_eyes_required"
      | "unknown_job"
      | "denied",
  ) {
    super(message);
    this.name = "HitlError";
  }
}
