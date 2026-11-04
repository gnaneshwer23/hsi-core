-- ARCH-002 Phase 3.4 canonical graph storage proposal.
-- NOT automatically applied. Apply only on isolated Neon test branch after review.
-- No PHI in these general biomedical graph tables; patient context has separate store.
CREATE TABLE IF NOT EXISTS hsi_lhkg_nodes (
 id text NOT NULL,
 version text NOT NULL,
 layer text NOT NULL CHECK (layer IN ('human_biology','gut_immune_metabolic','biomedical_evidence')),
 visibility text NOT NULL CHECK (visibility IN ('governed_research','public_biomedical')),
 review_state text NOT NULL CHECK (review_state IN ('draft','in_review','approved','rejected','retired')),
 payload jsonb NOT NULL,
 content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(id,version),
 CHECK (visibility <> 'public_biomedical' OR review_state='approved')
);
CREATE TABLE IF NOT EXISTS hsi_lhkg_relationships (
 id text NOT NULL,
 version text NOT NULL,
 subject_id text NOT NULL,
 object_id text NOT NULL,
 predicate text NOT NULL,
 layer text NOT NULL CHECK (layer IN ('human_biology','gut_immune_metabolic','biomedical_evidence')),
 visibility text NOT NULL CHECK (visibility IN ('governed_research','public_biomedical')),
 review_state text NOT NULL CHECK (review_state IN ('draft','in_review','approved','rejected','retired')),
 epistemic_type text NOT NULL CHECK (epistemic_type IN ('established_evidence','association','computational_inference','unvalidated_hypothesis')),
 review_decision_id text,
 payload jsonb NOT NULL,
 content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(id,version),
 CHECK (visibility <> 'public_biomedical' OR (review_state='approved' AND review_decision_id IS NOT NULL AND epistemic_type IN ('established_evidence','association')))
);
CREATE INDEX IF NOT EXISTS hsi_lhkg_relationships_subject_idx ON hsi_lhkg_relationships(subject_id,visibility);
CREATE INDEX IF NOT EXISTS hsi_lhkg_relationships_object_idx ON hsi_lhkg_relationships(object_id,visibility);
CREATE OR REPLACE FUNCTION hsi_lhkg_reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'HSI immutable graph record'; END $$;
CREATE TRIGGER hsi_lhkg_nodes_immutable BEFORE UPDATE OR DELETE ON hsi_lhkg_nodes FOR EACH ROW EXECUTE FUNCTION hsi_lhkg_reject_mutation();
CREATE TRIGGER hsi_lhkg_relationships_immutable BEFORE UPDATE OR DELETE ON hsi_lhkg_relationships FOR EACH ROW EXECUTE FUNCTION hsi_lhkg_reject_mutation();
-- WARNING: physical CHECK constraints do not independently authenticate reviewer
-- or validate payload evidence; trusted application services and access-scoped
-- database roles/RLS are required before these tables serve live traffic.
