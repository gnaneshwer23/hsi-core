-- Offline candidate. Public biomedical status metadata only; no private research identifiers.
CREATE TABLE hsi_memory.evidence_observations(
 observation_id uuid PRIMARY KEY,
 source_id text NOT NULL CHECK(length(source_id) BETWEEN 1 AND 1000),
 source_version text NOT NULL CHECK(length(source_version) BETWEEN 1 AND 1000),
 authority text NOT NULL CHECK(authority='synthetic-fixture'),
 status text NOT NULL CHECK(status IN ('current','corrected','retracted','superseded','expression_of_concern','unknown')),
 checked_at timestamptz NOT NULL,
 notice_ref text NOT NULL CHECK(length(notice_ref) BETWEEN 1 AND 1000),
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(checked_at<=recorded_at)
);
CREATE INDEX evidence_observation_lookup ON hsi_memory.evidence_observations(source_id,source_version,checked_at DESC);
ALTER TABLE hsi_memory.evidence_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.evidence_observations FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.evidence_observations FROM PUBLIC;
CREATE FUNCTION hsi_memory.record_evidence_observation(p_id uuid,p_source text,p_version text,p_status text,p_checked timestamptz,p_notice text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $observation$
BEGIN
 IF p_checked IS NULL OR p_checked>clock_timestamp() THEN RAISE EXCEPTION 'Invalid observation time' USING ERRCODE='22023'; END IF;
 INSERT INTO hsi_memory.evidence_observations(observation_id,source_id,source_version,authority,status,checked_at,notice_ref)
 VALUES(p_id,p_source,p_version,'synthetic-fixture',p_status,p_checked,p_notice) ON CONFLICT DO NOTHING;
 IF NOT EXISTS(SELECT 1 FROM hsi_memory.evidence_observations e WHERE e.observation_id=p_id AND e.source_id=p_source AND e.source_version=p_version AND e.status=p_status AND e.checked_at=p_checked AND e.notice_ref=p_notice) THEN RAISE EXCEPTION 'Observation conflict' USING ERRCODE='40001'; END IF;
 RETURN p_id;
END $observation$;
REVOKE ALL ON FUNCTION hsi_memory.record_evidence_observation(uuid,text,text,text,timestamptz,text) FROM PUBLIC;
