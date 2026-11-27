-- Synthetic linkage only; not verified publication identity.
CREATE TABLE hsi_memory.revalidation_identity_candidates(
 decision_id uuid PRIMARY KEY REFERENCES hsi_memory.adjudication_candidates(decision_id) ON DELETE RESTRICT,
 pmid text NOT NULL CHECK(pmid ~ '^[1-9][0-9]{0,11}$'),
 pmcid text CHECK(pmcid ~ '^PMC[1-9][0-9]{0,11}$'),
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 identity_verified boolean NOT NULL DEFAULT false CHECK(NOT identity_verified),
 ingestion_allowed boolean NOT NULL DEFAULT false CHECK(NOT ingestion_allowed)
);
ALTER TABLE hsi_memory.revalidation_identity_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.revalidation_identity_candidates FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.revalidation_identity_candidates FROM PUBLIC;
CREATE FUNCTION hsi_memory.stage_revalidation_identity(p_decision uuid,p_pmid text,p_pmcid text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $identity$
BEGIN
 IF p_decision IS NULL OR p_pmid IS NULL OR p_pmid !~ '^[1-9][0-9]{0,11}$' OR (p_pmcid IS NOT NULL AND p_pmcid !~ '^PMC[1-9][0-9]{0,11}$') THEN
 RAISE EXCEPTION 'Invalid identity candidate' USING ERRCODE='22023'; END IF;
 INSERT INTO hsi_memory.revalidation_identity_candidates(decision_id,pmid,pmcid) VALUES(p_decision,p_pmid,p_pmcid) ON CONFLICT DO NOTHING;
 IF NOT EXISTS(SELECT 1 FROM hsi_memory.revalidation_identity_candidates WHERE decision_id=p_decision AND pmid=p_pmid AND pmcid IS NOT DISTINCT FROM p_pmcid) THEN
 RAISE EXCEPTION 'Identity replay conflict' USING ERRCODE='40001'; END IF;
 RETURN p_decision;
END $identity$;
REVOKE ALL ON FUNCTION hsi_memory.stage_revalidation_identity(uuid,text,text) FROM PUBLIC;
