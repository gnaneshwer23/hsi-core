-- ARCH-002 Gate C hardening. Additive, no backfill, no automatic approval.
BEGIN;
ALTER TABLE hsi_evidence_review_decisions
 ADD COLUMN IF NOT EXISTS evidence_reviewed jsonb NOT NULL DEFAULT '[]'::jsonb,
 ADD COLUMN IF NOT EXISTS conflict_of_interest_declared boolean NOT NULL DEFAULT false;
ALTER TABLE hsi_evidence_review_decisions
 ADD CONSTRAINT hsi_review_rationale_minimum CHECK (length(trim(rationale)) >= 30),
 ADD CONSTRAINT hsi_review_coi_required CHECK (conflict_of_interest_declared = true),
 ADD CONSTRAINT hsi_review_evidence_array CHECK (jsonb_typeof(evidence_reviewed) = 'array' AND jsonb_array_length(evidence_reviewed) > 0);
-- Prevent changing history even with ordinary application UPDATE/DELETE privileges.
CREATE OR REPLACE FUNCTION hsi_block_review_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'Scientific review decisions are append-only';
END $$;
DROP TRIGGER IF EXISTS hsi_review_decisions_immutable ON hsi_evidence_review_decisions;
CREATE TRIGGER hsi_review_decisions_immutable BEFORE UPDATE OR DELETE ON hsi_evidence_review_decisions
 FOR EACH ROW EXECUTE FUNCTION hsi_block_review_mutation();
-- Publication is NOT granted by this migration. Approvals remain human decisions
-- and must be checked against evidence quality, rights and latest revocations.
COMMIT;
