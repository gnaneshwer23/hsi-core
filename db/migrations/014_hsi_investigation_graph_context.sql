-- Phase C. Apply only to explicitly approved HSI staging; never grants roles or publishes evidence.
BEGIN;
-- Existing SSc authority stays scoped. RA requires a separately provisioned grant.
ALTER TABLE hsi_reviewer_authority DROP CONSTRAINT IF EXISTS hsi_reviewer_authority_scope_check;
ALTER TABLE hsi_reviewer_authority ADD CONSTRAINT hsi_reviewer_authority_scope_check CHECK(scope IN ('ssc','ra'));
ALTER TABLE hsi_reviewer_authority DROP CONSTRAINT IF EXISTS hsi_reviewer_authority_pkey;
ALTER TABLE hsi_reviewer_authority ADD PRIMARY KEY(principal_id,scope);
CREATE TABLE IF NOT EXISTS hsi_investigation_graph_contexts (
 investigation_id text PRIMARY KEY REFERENCES hsi_interrogative_investigations(id),
 actor_principal text NOT NULL,
 release_id text NOT NULL REFERENCES hsi_evidence_graph_releases(id),
 release_manifest_hash text NOT NULL CHECK(release_manifest_hash ~ '^[a-f0-9]{64}$'),
 content_hash text NOT NULL CHECK(content_hash ~ '^[a-f0-9]{64}$'),
 payload jsonb NOT NULL,
 captured_at timestamptz NOT NULL,
 CHECK((payload->>'schemaVersion'='hsi-investigation-graph-context-1') IS TRUE),
 CHECK((payload->>'investigationId'=investigation_id) IS TRUE),
 CHECK((payload->>'contentHash'=content_hash) IS TRUE),
 CHECK((payload->'primary'->'release'->>'id'=release_id) IS TRUE),
 CHECK((payload->'primary'->'release'->>'manifestHash'=release_manifest_hash) IS TRUE)
);
CREATE OR REPLACE FUNCTION hsi_immutable_investigation_graph_context() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Investigation evidence context is immutable'; END $$;
DROP TRIGGER IF EXISTS hsi_graph_context_immutable ON hsi_investigation_graph_contexts;
CREATE TRIGGER hsi_graph_context_immutable BEFORE UPDATE OR DELETE ON hsi_investigation_graph_contexts
FOR EACH ROW EXECUTE FUNCTION hsi_immutable_investigation_graph_context();
REVOKE ALL ON hsi_investigation_graph_contexts FROM PUBLIC;
COMMENT ON TABLE hsi_investigation_graph_contexts IS 'Trusted server only. No browser/agent grants. Context capture is not scientific or publication approval.';
COMMIT;
