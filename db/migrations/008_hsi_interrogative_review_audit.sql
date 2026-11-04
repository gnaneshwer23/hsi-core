-- ARCH-003: immutable, append-only human investigation review decisions.
-- Apply to HSI staging only after explicit migration approval.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_interrogative_review_decisions (
 decision_id text PRIMARY KEY,
 investigation_id text NOT NULL REFERENCES hsi_interrogative_investigations(id),
 investigation_hash text NOT NULL CHECK(investigation_hash ~ '^[a-f0-9]{64}$'),
 reviewer_principal text NOT NULL,
 outcome text NOT NULL CHECK(outcome IN ('approve_with_limitations','request_revision','reject')),
 decision_payload jsonb NOT NULL,
 decision_hash text NOT NULL CHECK(decision_hash ~ '^[a-f0-9]{64}$'),
 reviewed_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT hsi_one_final_review_per_investigation UNIQUE(investigation_id)
);
CREATE OR REPLACE FUNCTION hsi_reject_interrogative_review_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'HSI scientific review decisions are append-only';
END;
$$;
DROP TRIGGER IF EXISTS hsi_interrogative_review_immutable ON hsi_interrogative_review_decisions;
CREATE TRIGGER hsi_interrogative_review_immutable BEFORE UPDATE OR DELETE ON hsi_interrogative_review_decisions
FOR EACH ROW EXECUTE FUNCTION hsi_reject_interrogative_review_mutation();
COMMIT;
