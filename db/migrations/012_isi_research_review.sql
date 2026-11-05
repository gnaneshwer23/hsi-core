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
