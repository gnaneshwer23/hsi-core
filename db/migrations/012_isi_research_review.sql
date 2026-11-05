-- HSI P0.4.2 research-only staging tables. Apply only after security review.
CREATE TABLE IF NOT EXISTS hsi_isi_intake (
 release_hash text PRIMARY KEY,
 source_commit text NOT NULL,
 artifact_sha256 text NOT NULL,
 imported_by text NOT NULL,
 imported_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hsi_isi_review_events (
 event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 release_hash text NOT NULL REFERENCES hsi_isi_intake(release_hash),
 subject_id text NOT NULL,
 subject_kind text NOT NULL,
 decision text NOT NULL,
 source_locator text NOT NULL,
 rationale text NOT NULL,
 submitted_by text NOT NULL,
 reviewer_principal text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT independent_reviewer CHECK (submitted_by <> reviewer_principal)
);
-- No database writes until permissions, immutability and RLS have been reviewed.

ALTER TABLE hsi_isi_intake ADD CONSTRAINT isi_intake_hash_format CHECK (release_hash ~ '^[a-f0-9]{64}$' AND artifact_sha256 ~ '^[a-f0-9]{64}$' AND source_commit ~ '^[a-f0-9]{40}$');
ALTER TABLE hsi_isi_review_events ADD CONSTRAINT isi_review_decision CHECK (decision IN ('approved','rejected','needs_evidence'));
ALTER TABLE hsi_isi_review_events ADD CONSTRAINT isi_review_kind CHECK (subject_kind IN ('ontology','claim'));
ALTER TABLE hsi_isi_review_events ADD CONSTRAINT isi_review_nonempty CHECK (length(trim(subject_id))>0 AND length(trim(source_locator))>0 AND length(trim(rationale))>0);
CREATE OR REPLACE FUNCTION hsi_isi_deny_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Immutable ISI scientific research record'; END $$;
CREATE TRIGGER hsi_isi_intake_immutable BEFORE UPDATE OR DELETE ON hsi_isi_intake FOR EACH ROW EXECUTE FUNCTION hsi_isi_deny_mutation();
CREATE TRIGGER hsi_isi_review_immutable BEFORE UPDATE OR DELETE ON hsi_isi_review_events FOR EACH ROW EXECUTE FUNCTION hsi_isi_deny_mutation();
ALTER TABLE hsi_isi_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_isi_intake FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_isi_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_isi_review_events FORCE ROW LEVEL SECURITY;
-- Deliberately no public policies: owner/service grants must be reviewed separately.
