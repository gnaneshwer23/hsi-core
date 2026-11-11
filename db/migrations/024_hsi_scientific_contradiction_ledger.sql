-- P0.2 proposed scientific contradiction ledger. NOT APPLIED.
-- No runtime grants/policies: fail closed until authenticated staging E2E is reviewed.
-- Rollback (only if never populated): DROP TABLE hsi_contradiction_review_events; DROP TABLE hsi_contradiction_records;
CREATE TABLE IF NOT EXISTS hsi_contradiction_records (
 id text PRIMARY KEY,
 tenant_id text NOT NULL CHECK(length(trim(tenant_id))>0),
 submitted_by text NOT NULL CHECK(length(trim(submitted_by))>0),
 left_edge_id text NOT NULL,
 right_edge_id text NOT NULL,
 schema_version text NOT NULL CHECK(schema_version='hsi-contextual-evidence-edge-1'),
 classification text NOT NULL CHECK(classification IN
  ('candidate_conflict','context_explained_divergence','no_conflict','cannot_compare')),
 snapshot jsonb NOT NULL CHECK(jsonb_typeof(snapshot)='object'),
 source_evidence_ids jsonb NOT NULL CHECK(jsonb_typeof(source_evidence_ids)='array'),
 review_status text NOT NULL DEFAULT 'pending' CHECK(review_status='pending'),
 scientific_conclusion boolean NOT NULL DEFAULT false CHECK(scientific_conclusion=false),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT hsi_contradiction_distinct_edges CHECK(left_edge_id<>right_edge_id)
);
CREATE TABLE IF NOT EXISTS hsi_contradiction_review_events (
 event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contradiction_id text NOT NULL REFERENCES hsi_contradiction_records(id),
 tenant_id text NOT NULL,
 submitted_by text NOT NULL,
 reviewer_principal text NOT NULL,
 decision text NOT NULL CHECK(decision IN ('approved','rejected','needs_evidence')),
 rationale text NOT NULL CHECK(length(trim(rationale))>0),
 source_locator text NOT NULL CHECK(length(trim(source_locator))>0),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT hsi_contradiction_independent_reviewer CHECK(submitted_by<>reviewer_principal)
);
CREATE OR REPLACE FUNCTION hsi_contradiction_deny_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Immutable scientific contradiction ledger'; END $$;
CREATE TRIGGER hsi_contradiction_records_immutable BEFORE UPDATE OR DELETE
 ON hsi_contradiction_records FOR EACH ROW EXECUTE FUNCTION hsi_contradiction_deny_mutation();
CREATE TRIGGER hsi_contradiction_review_events_immutable BEFORE UPDATE OR DELETE
 ON hsi_contradiction_review_events FOR EACH ROW EXECUTE FUNCTION hsi_contradiction_deny_mutation();
ALTER TABLE hsi_contradiction_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_contradiction_records FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_contradiction_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_contradiction_review_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_contradiction_records,hsi_contradiction_review_events FROM PUBLIC;
-- No policies and no app grants: staging activation requires a separate reviewed migration.
