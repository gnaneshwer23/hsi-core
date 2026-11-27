-- Candidate only; no production migration or runtime grants.
CREATE TABLE hsi_memory.revalidation_jobs(
 job_id uuid PRIMARY KEY,
 decision_id uuid NOT NULL REFERENCES hsi_memory.adjudication_candidates(decision_id) ON DELETE RESTRICT,
 due_at timestamptz NOT NULL,
 priority smallint NOT NULL CHECK(priority BETWEEN 0 AND 2),
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','leased','succeeded','failed','cancelled')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
 lease_id uuid,
 lease_until timestamptz,
 result_decision_id uuid REFERENCES hsi_memory.adjudication_candidates(decision_id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK((state='leased' AND lease_id IS NOT NULL AND lease_until IS NOT NULL AND attempts>0) OR (state<>'leased' AND lease_id IS NULL AND lease_until IS NULL)),
 CHECK((state='succeeded')=(result_decision_id IS NOT NULL)),
 CHECK(result_decision_id IS NULL OR result_decision_id<>decision_id)
);
CREATE UNIQUE INDEX revalidation_one_active_job ON hsi_memory.revalidation_jobs(decision_id) WHERE state IN ('queued','leased');
CREATE INDEX revalidation_due_idx ON hsi_memory.revalidation_jobs(priority,due_at,job_id) WHERE state='queued';
CREATE INDEX revalidation_lease_idx ON hsi_memory.revalidation_jobs(lease_until,job_id) WHERE state='leased';
ALTER TABLE hsi_memory.revalidation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.revalidation_jobs FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.revalidation_jobs FROM PUBLIC;
