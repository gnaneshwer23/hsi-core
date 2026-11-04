-- ARCH-009: HSI agent checkpoints and recovery decisions.
-- Staging-only proposal. NOT applied by adding this file.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_agent_checkpoints (
 investigation_id text NOT NULL,
 task_id text NOT NULL,
 schema_version text NOT NULL CHECK(schema_version='hsi-agent-checkpoint-1'),
 attempt integer NOT NULL CHECK(attempt BETWEEN 1 AND 3),
 state text NOT NULL CHECK(state IN ('created','running','completed','blocked','failed','cancelled')),
 version integer NOT NULL CHECK(version>0),
 input_hash text NOT NULL CHECK(input_hash ~ '^[a-f0-9]{64}$'),
 output_ref text,
 error_code text,
 started_at timestamptz NOT NULL,
 finished_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(investigation_id,task_id),
 CHECK((state='completed' AND output_ref IS NOT NULL AND length(trim(output_ref))>0) OR (state<>'completed' AND output_ref IS NULL))
);
CREATE TABLE IF NOT EXISTS hsi_agent_recovery_decisions (
 decision_id text PRIMARY KEY,
 investigation_id text NOT NULL,
 task_id text NOT NULL,
 prior_version integer NOT NULL,
 next_version integer NOT NULL,
 operator_principal text NOT NULL,
 reason text NOT NULL,
 decided_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(investigation_id,task_id) REFERENCES hsi_agent_checkpoints(investigation_id,task_id),
 UNIQUE(investigation_id,task_id,next_version)
);
CREATE OR REPLACE FUNCTION hsi_agent_recovery_immutable_fn() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'HSI recovery decisions are immutable'; END;
$$;
DROP TRIGGER IF EXISTS hsi_agent_recovery_immutable ON hsi_agent_recovery_decisions;
CREATE TRIGGER hsi_agent_recovery_immutable BEFORE UPDATE OR DELETE ON hsi_agent_recovery_decisions
FOR EACH ROW EXECUTE FUNCTION hsi_agent_recovery_immutable_fn();
COMMIT;
