-- P1: HSI-owned append-only research investigation record.
-- Deployment requires HSI-only DB guard, role grants and trusted API identity verification.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_research_investigation_runs (
 id text PRIMARY KEY,
 actor_principal text NOT NULL,
 release_id text NOT NULL REFERENCES hsi_evidence_graph_releases(id),
 release_manifest_hash text NOT NULL,
 question text NOT NULL,
 status text NOT NULL CHECK (status IN ('evidence_found','insufficient_evidence')),
 mode text NOT NULL CHECK (mode='deterministic_release_analysis'),
 data_class text NOT NULL CHECK (data_class IN ('public_biomedical','licensed_partner')),
 source_claim_ids jsonb NOT NULL,
 investigation jsonb NOT NULL,
 content_hash text NOT NULL CHECK (length(content_hash)=64),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (length(trim(actor_principal))>0),
 CHECK (length(trim(question)) BETWEEN 1 AND 500),
 CHECK (jsonb_typeof(source_claim_ids)='array'),
 CHECK (jsonb_typeof(investigation)='object')
);
CREATE INDEX IF NOT EXISTS hsi_research_runs_actor_idx ON hsi_research_investigation_runs(actor_principal,created_at DESC);
CREATE OR REPLACE FUNCTION hsi_block_investigation_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'HSI investigation runs are append-only';
END;
$$;
DROP TRIGGER IF EXISTS hsi_research_runs_immutable ON hsi_research_investigation_runs;
CREATE TRIGGER hsi_research_runs_immutable
 BEFORE UPDATE OR DELETE ON hsi_research_investigation_runs
 FOR EACH ROW EXECUTE FUNCTION hsi_block_investigation_mutation();
COMMIT;
