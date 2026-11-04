-- ARCH-009 staging-only proposal: checkpoint-fenced idempotent research artifacts.
-- Do not apply to production without explicit approval.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_agent_artifacts (
 artifact_id text PRIMARY KEY,
 idempotency_key text NOT NULL UNIQUE CHECK(idempotency_key ~ '^[a-f0-9]{64}$'),
 investigation_id text NOT NULL,
 task_id text NOT NULL,
 attempt integer NOT NULL,
 checkpoint_version integer NOT NULL,
 input_hash text NOT NULL CHECK(input_hash ~ '^[a-f0-9]{64}$'),
 content_hash text NOT NULL CHECK(content_hash ~ '^[a-f0-9]{64}$'),
 payload text NOT NULL CHECK(length(payload)<=1000000),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(investigation_id,task_id) REFERENCES hsi_agent_checkpoints(investigation_id,task_id)
);
CREATE OR REPLACE FUNCTION hsi_agent_artifact_guard_fn() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE cp record;
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'HSI agent artifacts are immutable'; END IF;
 SELECT version,attempt,state,input_hash INTO cp FROM hsi_agent_checkpoints WHERE investigation_id=NEW.investigation_id AND task_id=NEW.task_id FOR UPDATE;
 IF NOT FOUND OR cp.version<>NEW.checkpoint_version OR cp.attempt<>NEW.attempt OR cp.state<>'running' OR cp.input_hash<>NEW.input_hash THEN
  RAISE EXCEPTION 'HSI stale execution fence';
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS hsi_agent_artifact_guard ON hsi_agent_artifacts;
CREATE TRIGGER hsi_agent_artifact_guard BEFORE INSERT OR UPDATE OR DELETE ON hsi_agent_artifacts
FOR EACH ROW EXECUTE FUNCTION hsi_agent_artifact_guard_fn();
COMMIT;
