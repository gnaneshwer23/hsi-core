-- Synthetic-only append-only adjudication candidate; not a migration.
CREATE TABLE hsi_memory.adjudication_candidates(
 decision_id uuid PRIMARY KEY,
 doi text NOT NULL CHECK(doi ~ '^10[.]1234/fixture-[a-z0-9-]{1,80}$'),
 source_version text NOT NULL CHECK(source_version ~ '^v[1-9][0-9]{0,8}$'),
 decision text NOT NULL CHECK(decision IN ('quarantine','recheck_required','insufficient_verified_provenance')),
 provenance jsonb NOT NULL CHECK(jsonb_typeof(provenance)='array' AND jsonb_array_length(provenance)=3 AND octet_length(provenance::text)<=32768),
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 version_verified boolean NOT NULL DEFAULT false CHECK(NOT version_verified),
 authority_authenticated boolean NOT NULL DEFAULT false CHECK(NOT authority_authenticated),
 ingestion_allowed boolean NOT NULL DEFAULT false CHECK(NOT ingestion_allowed),
 scientific_claim_allowed boolean NOT NULL DEFAULT false CHECK(NOT scientific_claim_allowed)
);
CREATE INDEX adjudication_history_idx ON hsi_memory.adjudication_candidates(doi,source_version,recorded_at,decision_id);
ALTER TABLE hsi_memory.adjudication_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.adjudication_candidates FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.adjudication_candidates FROM PUBLIC;
CREATE FUNCTION hsi_memory.stage_adjudication(p_id uuid,p_doi text,p_version text,p_decision text,p_provenance jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $stage$
DECLARE item jsonb;
BEGIN
 IF p_provenance IS NULL OR jsonb_typeof(p_provenance)<>'array' OR jsonb_array_length(p_provenance)<>3 OR octet_length(p_provenance::text)>32768 THEN
 RAISE EXCEPTION 'Invalid provenance' USING ERRCODE='22023'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_provenance) LOOP
 IF jsonb_typeof(item)<>'object' OR COALESCE(item->>'authority','') NOT IN ('crossref','pubmed','europe_pmc') OR COALESCE(item->>'payloadSha256','') !~ '^[a-f0-9]{64}$' OR item->'authorityAuthenticated' IS DISTINCT FROM 'false'::jsonb OR item->'ingestionAllowed' IS DISTINCT FROM 'false'::jsonb OR item->'scientificClaimAllowed' IS DISTINCT FROM 'false'::jsonb THEN
 RAISE EXCEPTION 'Invalid provenance entry' USING ERRCODE='22023'; END IF;
 END LOOP;
 IF (SELECT count(DISTINCT value->>'authority') FROM jsonb_array_elements(p_provenance))<>3 THEN RAISE EXCEPTION 'Duplicate authority' USING ERRCODE='22023'; END IF;
 INSERT INTO hsi_memory.adjudication_candidates(decision_id,doi,source_version,decision,provenance) VALUES(p_id,p_doi,p_version,p_decision,p_provenance) ON CONFLICT DO NOTHING;
 IF NOT EXISTS(SELECT 1 FROM hsi_memory.adjudication_candidates a WHERE a.decision_id=p_id AND a.doi=p_doi AND a.source_version=p_version AND a.decision=p_decision AND a.provenance=p_provenance) THEN
 RAISE EXCEPTION 'Decision replay conflict' USING ERRCODE='40001'; END IF;
 RETURN p_id;
END $stage$;
REVOKE ALL ON FUNCTION hsi_memory.stage_adjudication(uuid,text,text,text,jsonb) FROM PUBLIC;
