-- P0.2 security hardening; HELD, never automatically applied.
-- Requires 024 and 025. These invariants are enforced even if application checks fail.
-- Do not grant application roles direct table DML. No RLS allow policies in this migration.
ALTER TABLE hsi_contradiction_review_events
 ADD CONSTRAINT hsi_contradiction_review_unique_per_reviewer
 UNIQUE(contradiction_id,reviewer_principal);
ALTER TABLE hsi_contradiction_review_events
 ADD CONSTRAINT hsi_contradiction_review_unique_decision
 UNIQUE(contradiction_id);
CREATE OR REPLACE FUNCTION hsi_contradiction_verify_review_parent()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE parent_submitter text;
BEGIN
 SELECT submitted_by INTO parent_submitter
 FROM hsi_contradiction_records
 WHERE id=NEW.contradiction_id AND tenant_id=NEW.tenant_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Contradiction not accessible in tenant'; END IF;
 IF NEW.submitted_by IS DISTINCT FROM parent_submitter THEN
   RAISE EXCEPTION 'Review submitter does not match parent';
 END IF;
 IF NEW.reviewer_principal IS NOT DISTINCT FROM parent_submitter THEN
   RAISE EXCEPTION 'Self-review prohibited';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hsi_contradiction_verify_review_parent_insert
 BEFORE INSERT ON hsi_contradiction_review_events
 FOR EACH ROW EXECUTE FUNCTION hsi_contradiction_verify_review_parent();
-- Membership modifications remain denied under FORCE RLS.
-- No role grants or policy exceptions. Trusted principal binding and security
-- definer function audit are mandatory before activation.
