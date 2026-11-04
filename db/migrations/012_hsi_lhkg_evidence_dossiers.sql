-- ARCH-002 Phase 3.9: evidence dossier persistence proposal. NOT APPLIED.
-- Do not apply without independent reviewer authority, RLS and source rights review.
CREATE TABLE IF NOT EXISTS hsi_lhkg_dossiers (
 relationship_id text NOT NULL,
 relationship_version text NOT NULL,
 payload jsonb NOT NULL,
 content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(relationship_id,relationship_version)
);
CREATE INDEX IF NOT EXISTS hsi_lhkg_dossiers_relationship_idx ON hsi_lhkg_dossiers(relationship_id);
-- Explicitly deny ordinary roles until policies are reviewed and provisioned.
ALTER TABLE hsi_lhkg_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_dossiers FORCE ROW LEVEL SECURITY;
-- No permissive policy is created. Live queries must fail closed.
-- No mutation or reviewer verification is authorised by this proposal.
