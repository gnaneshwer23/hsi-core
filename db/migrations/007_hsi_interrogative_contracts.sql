-- ARCH-003 versioned research investigation contract storage.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_interrogative_investigations (
 id text PRIMARY KEY,
 schema_version text NOT NULL CHECK(schema_version='hsi-interrogative-investigation-1'),
 actor_principal text NOT NULL,
 release_id text NOT NULL REFERENCES hsi_evidence_graph_releases(id),
 release_manifest_hash text NOT NULL,
 data_class text NOT NULL CHECK(data_class IN ('public_biomedical','licensed_partner')),
 state text NOT NULL CHECK(state IN ('draft','awaiting_scientific_review','reviewed','rejected')),
 payload jsonb NOT NULL,
 content_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hsi_interrogative_release_idx ON hsi_interrogative_investigations(release_id,created_at DESC);
COMMIT;
