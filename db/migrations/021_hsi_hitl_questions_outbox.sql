-- Synthetic demonstration question-and-review store.
-- NOT applied to a live database by this change.
-- Patient-facing questions are not deliverable: audience check is enforced
-- by the application, and this table rejects a patient delivery channel.
-- Idempotency keys and the outbox are written in the same transaction as the job.

CREATE TABLE IF NOT EXISTS hsi_hitl_jobs (
  id text PRIMARY KEY,
  gap_key text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('scientific_reviewer', 'patient')),
  state text NOT NULL CHECK (state IN (
    'draft', 'awaiting_send_approval', 'awaiting_answer', 'awaiting_review',
    'approved', 'rejected', 'applied', 'expired', 'cancelled_permission', 'superseded'
  )),
  recipient_actor_id text NOT NULL,
  prompt text NOT NULL,
  chart_version_asked integer NOT NULL CHECK (chart_version_asked >= 1),
  idempotency_key text NOT NULL UNIQUE,
  synthetic boolean NOT NULL CHECK (synthetic),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hsi_hitl_outbox (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind = 'question.deliver'),
  job_id text NOT NULL REFERENCES hsi_hitl_jobs(id),
  status text NOT NULL CHECK (status IN ('pending', 'done', 'cancelled')),
  channel text NOT NULL CHECK (channel = 'simulated_local_only'),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS hsi_hitl_events (
  id text PRIMARY KEY,
  job_id text REFERENCES hsi_hitl_jobs(id),
  name text NOT NULL,
  actor_id text NOT NULL,
  at timestamptz NOT NULL,
  detail jsonb NOT NULL
);

CREATE OR REPLACE FUNCTION hsi_hitl_deny_patient_delivery() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE audience text;
BEGIN
  SELECT j.audience INTO audience FROM hsi_hitl_jobs j WHERE j.id = NEW.job_id;
  IF audience = 'patient' THEN
    RAISE EXCEPTION 'patient_questions_never_sent';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS hsi_hitl_outbox_no_patient ON hsi_hitl_outbox;
CREATE TRIGGER hsi_hitl_outbox_no_patient
  BEFORE INSERT ON hsi_hitl_outbox
  FOR EACH ROW EXECUTE FUNCTION hsi_hitl_deny_patient_delivery();

ALTER TABLE hsi_hitl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_hitl_jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_hitl_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_hitl_outbox FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_hitl_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_hitl_events FORCE ROW LEVEL SECURITY;
