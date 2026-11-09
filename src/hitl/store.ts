/**
 * In-memory question store with idempotency and a transactional outbox.
 * Synthetic demonstration only. Nothing here sends email, SMS, or a network message.
 */
import { createHash } from "node:crypto";
import {
  HITL_TRANSITIONS,
  HitlError,
  type HitlActor,
  type HitlEvent,
  type HitlJob,
  type HitlState,
  type OutboxRow,
  type QuestionAudience,
} from "./types";

export type CreateJobInput = {
  gapKey: string;
  audience: QuestionAudience;
  recipientActorId: string;
  prompt: string;
  chartVersion: number;
  idempotencyKey: string;
  at: string;
  actorId: string;
};

export type IdempotencyRecord = {
  key: string;
  op: string;
  requestHash: string;
  result: Record<string, unknown>;
};

type Snapshot = {
  jobs: Map<string, HitlJob>;
  outbox: OutboxRow[];
  events: HitlEvent[];
  idempotency: Map<string, IdempotencyRecord>;
  answers: Map<string, { actorId: string; payloadHash: string }>;
  reviews: Map<string, { actorId: string; decision: "approve" | "reject" }>;
  chartVersions: Map<string, number>;
};

function cloneSnapshot(source: Snapshot): Snapshot {
  return {
    jobs: new Map(source.jobs),
    outbox: source.outbox.map((row) => ({ ...row })),
    events: source.events.map((row) => ({ ...row, detail: { ...row.detail } })),
    idempotency: new Map(source.idempotency),
    answers: new Map(source.answers),
    reviews: new Map(source.reviews),
    chartVersions: new Map(source.chartVersions),
  };
}

export function requestHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export class HitlStore {
  private snapshot: Snapshot = {
    jobs: new Map(),
    outbox: [],
    events: [],
    idempotency: new Map(),
    answers: new Map(),
    reviews: new Map(),
    chartVersions: new Map(),
  };

  constructor(private readonly actors: readonly HitlActor[]) {}

  actor(id: string): HitlActor {
    const found = this.actors.find((item) => item.id === id);
    if (!found) throw new HitlError(`Unknown actor ${id}`, "denied");
    return found;
  }

  job(id: string): HitlJob {
    const found = this.snapshot.jobs.get(id);
    if (!found) throw new HitlError(`Unknown job ${id}`, "unknown_job");
    return found;
  }

  events(): readonly HitlEvent[] {
    return this.snapshot.events;
  }

  outbox(): readonly OutboxRow[] {
    return this.snapshot.outbox;
  }

  chartVersion(patientPseudonym: string): number {
    return this.snapshot.chartVersions.get(patientPseudonym) ?? 1;
  }

  /** One function, one commit. A thrown error restores the previous snapshot. */
  transaction<T>(work: (store: HitlStore) => T): T {
    const previous = cloneSnapshot(this.snapshot);
    try {
      return work(this);
    } catch (error) {
      this.snapshot = previous;
      throw error;
    }
  }

  remember(key: string, op: string, request: unknown, result: Record<string, unknown>): Record<string, unknown> {
    const hash = requestHash(request);
    const prior = this.snapshot.idempotency.get(key);
    if (prior) {
      if (prior.op !== op || prior.requestHash !== hash) {
        throw new HitlError("idempotency_key_reused_with_different_content", "idempotency_conflict");
      }
      return { ...prior.result, status: "noop" };
    }
    this.snapshot.idempotency.set(key, { key, op, requestHash: hash, result });
    return result;
  }

  prior(key: string, op: string, request: unknown): Record<string, unknown> | null {
    const prior = this.snapshot.idempotency.get(key);
    if (!prior) return null;
    if (prior.op !== op || prior.requestHash !== requestHash(request)) {
      throw new HitlError("idempotency_key_reused_with_different_content", "idempotency_conflict");
    }
    return { ...prior.result, status: "noop" };
  }

  createJob(input: CreateJobInput): HitlJob {
    const request = { ...input };
    const existing = this.prior(input.idempotencyKey, "create_job", request);
    if (existing) return this.job(String(existing.jobId));
    const id = `hitl-job-${requestHash(input.gapKey + input.idempotencyKey).slice(0, 12)}`;
    const job: HitlJob = {
      id,
      gapKey: input.gapKey,
      audience: input.audience,
      state: "draft",
      recipientActorId: input.recipientActorId,
      prompt: input.prompt,
      chartVersionAsked: input.chartVersion,
      idempotencyKey: input.idempotencyKey,
      createdAt: input.at,
      updatedAt: input.at,
      synthetic: true,
    };
    this.snapshot.jobs.set(id, job);
    this.event("job.draft", input.actorId, input.at, id, { audience: input.audience });
    this.transition(id, "draft", "awaiting_send_approval", input.actorId, input.at);
    this.remember(input.idempotencyKey, "create_job", request, { jobId: id, state: "awaiting_send_approval" });
    return this.job(id);
  }

  /**
   * Scientific questions may be approved for simulated local delivery.
   * Patient-facing questions are refused here and never enter the outbox.
   */
  approveSend(jobId: string, actorId: string, key: string, at: string): Record<string, unknown> {
    const request = { jobId, actorId };
    const prior = this.prior(key, "approve_send", request);
    if (prior) return prior;
    const actor = this.actor(actorId);
    if (actor.role !== "coordinator") throw new HitlError("send approval requires a coordinator", "denied");
    const job = this.job(jobId);
    if (job.audience === "patient") {
      this.event("send.denied", actorId, at, jobId, { reason: "patient_questions_never_sent" });
      throw new HitlError("patient-facing questions are never sent", "patient_questions_never_sent");
    }
    this.transition(jobId, "awaiting_send_approval", "awaiting_answer", actorId, at);
    const row: OutboxRow = {
      id: `outbox-${jobId}`,
      kind: "question.deliver",
      jobId,
      status: "pending",
      channel: "simulated_local_only",
      createdAt: at,
      processedAt: null,
    };
    this.snapshot.outbox.push(row);
    return this.remember(key, "approve_send", request, {
      status: "approved_for_simulated_delivery",
      jobId,
      channel: "simulated_local_only",
    });
  }

  /** Records a local delivery row. No network message is created. */
  deliverSimulated(actorId: string, at: string): OutboxRow[] {
    const actor = this.actor(actorId);
    if (actor.role !== "coordinator") throw new HitlError("delivery requires a coordinator", "denied");
    const done: OutboxRow[] = [];
    this.snapshot.outbox = this.snapshot.outbox.map((row) => {
      if (row.status !== "pending") return row;
      const job = this.job(row.jobId);
      if (job.audience === "patient" || job.state !== "awaiting_answer") {
        return { ...row, status: "cancelled", processedAt: at };
      }
      this.event("delivery.simulated", actorId, at, row.jobId, { channel: "simulated_local_only" });
      const next = { ...row, status: "done" as const, processedAt: at };
      done.push(next);
      return next;
    });
    return done;
  }

  answer(jobId: string, actorId: string, payload: Record<string, unknown>, key: string, at: string): Record<string, unknown> {
    const request = { jobId, actorId, payload };
    const prior = this.prior(key, "answer", request);
    if (prior) return prior;
    const job = this.job(jobId);
    if (actorId !== job.recipientActorId) throw new HitlError("not the routed recipient", "denied");
    if (job.state !== "awaiting_answer") {
      throw new HitlError(`job is ${job.state}`, "invalid_transition");
    }
    const delivered = this.snapshot.outbox.some((row) => row.jobId === jobId && row.status === "done");
    if (!delivered) throw new HitlError("question was not delivered", "invalid_transition");
    this.snapshot.answers.set(jobId, { actorId, payloadHash: requestHash(payload) });
    this.transition(jobId, "awaiting_answer", "awaiting_review", actorId, at);
    return this.remember(key, "answer", request, { status: "accepted", jobId, validationStatus: "schema_valid_pending_review" });
  }

  review(jobId: string, actorId: string, decision: "approve" | "reject", key: string, at: string): Record<string, unknown> {
    const request = { jobId, actorId, decision };
    const prior = this.prior(key, "review", request);
    if (prior) return prior;
    const actor = this.actor(actorId);
    if (actor.role !== "scientific_reviewer") throw new HitlError("review requires a scientific reviewer", "denied");
    const job = this.job(jobId);
    if (job.state !== "awaiting_review") throw new HitlError(`job is ${job.state}`, "invalid_transition");
    const answer = this.snapshot.answers.get(jobId);
    if (!answer) throw new HitlError("no accepted answer", "invalid_transition");
    if (answer.actorId === actorId) throw new HitlError("four eyes required", "four_eyes_required");
    this.snapshot.reviews.set(jobId, { actorId, decision });
    const next: HitlState = decision === "approve" ? "approved" : "rejected";
    this.transition(jobId, "awaiting_review", next, actorId, at);
    return this.remember(key, "review", request, { status: next, jobId });
  }

  apply(
    jobId: string,
    actorId: string,
    key: string,
    at: string,
    currentChartVersion: number,
    onApplied: (job: HitlJob) => Record<string, unknown>,
  ): Record<string, unknown> {
    const request = { jobId, actorId, currentChartVersion };
    const prior = this.prior(key, "apply", request);
    if (prior) return prior;
    const actor = this.actor(actorId);
    if (actor.role !== "coordinator") throw new HitlError("apply requires a coordinator", "denied");
    const job = this.job(jobId);
    if (job.state !== "approved") throw new HitlError(`job is ${job.state}`, "invalid_transition");
    if (currentChartVersion !== job.chartVersionAsked) {
      this.transition(jobId, "approved", "superseded", actorId, at);
      return this.remember(key, "apply", request, { status: "superseded", jobId, reason: "newer_chart_version" });
    }
    const extra = onApplied(job);
    this.transition(jobId, "approved", "applied", actorId, at);
    return this.remember(key, "apply", request, { status: "applied", jobId, ...extra });
  }

  expire(jobId: string, actorId: string, at: string): HitlJob {
    this.actor(actorId);
    const job = this.job(jobId);
    this.transition(jobId, job.state, "expired", actorId, at);
    this.event("question.budget_exhausted", actorId, at, jobId, { factRemains: "unknown" });
    return this.job(jobId);
  }

  withdrawPermission(jobId: string, actorId: string, at: string): HitlJob {
    const actor = this.actor(actorId);
    if (actor.role !== "privacy_service") throw new HitlError("withdrawal requires the privacy service", "denied");
    const job = this.job(jobId);
    this.transition(jobId, job.state, "cancelled_permission", actorId, at);
    this.snapshot.outbox = this.snapshot.outbox.map((row) =>
      row.jobId === jobId && row.status === "pending" ? { ...row, status: "cancelled", processedAt: at } : row,
    );
    return this.job(jobId);
  }

  private transition(jobId: string, from: HitlState, to: HitlState, actorId: string, at: string): void {
    const allowed = HITL_TRANSITIONS[from];
    if (!allowed.includes(to)) throw new HitlError(`${from}->${to}_not_allowed`, "invalid_transition");
    const job = this.job(jobId);
    if (job.state !== from) throw new HitlError(`state_changed_expected_${from}`, "invalid_transition");
    if (at < job.updatedAt) throw new HitlError("time_before_last_transition", "invalid_transition");
    this.snapshot.jobs.set(jobId, { ...job, state: to, updatedAt: at });
    this.event(`job.${to}`, actorId, at, jobId, { from, to });
  }

  private event(name: string, actorId: string, at: string, jobId: string | null, detail: Record<string, unknown>): void {
    const id = `hitl-event-${String(this.snapshot.events.length + 1).padStart(4, "0")}`;
    this.snapshot.events.push({ id, jobId, name, actorId, at, detail });
  }
}
