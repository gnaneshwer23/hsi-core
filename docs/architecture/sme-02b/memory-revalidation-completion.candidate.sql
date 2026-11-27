-- Synthetic candidate only. Preserve completion lease for exact replay.
ALTER TABLE hsi_memory.revalidation_jobs ADD COLUMN completed_lease_id uuid;
ALTER TABLE hsi_memory.revalidation_jobs ADD CHECK((state='succeeded')=(completed_lease_id IS NOT NULL));
CREATE FUNCTION hsi_memory.complete_revalidation(p_job uuid,p_lease uuid,p_result uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $complete$
DECLARE j hsi_memory.revalidation_jobs%ROWTYPE; original hsi_memory.adjudication_candidates%ROWTYPE; outcome hsi_memory.adjudication_candidates%ROWTYPE;
BEGIN
 IF p_job IS NULL OR p_lease IS NULL OR p_result IS NULL THEN RAISE EXCEPTION 'Invalid completion' USING ERRCODE='22023'; END IF;
 SELECT * INTO j FROM hsi_memory.revalidation_jobs WHERE job_id=p_job FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Job unavailable' USING ERRCODE='42501'; END IF;
 IF j.state='succeeded' AND j.completed_lease_id=p_lease AND j.result_decision_id=p_result THEN RETURN p_result; END IF;
 IF j.state<>'leased' OR j.lease_id IS DISTINCT FROM p_lease OR j.lease_until<=clock_timestamp() THEN RAISE EXCEPTION 'Lease unavailable' USING ERRCODE='42501'; END IF;
 SELECT * INTO original FROM hsi_memory.adjudication_candidates WHERE decision_id=j.decision_id;
 SELECT * INTO outcome FROM hsi_memory.adjudication_candidates WHERE decision_id=p_result;
 IF NOT FOUND OR p_result=j.decision_id OR outcome.doi IS DISTINCT FROM original.doi OR outcome.source_version IS DISTINCT FROM original.source_version OR outcome.recorded_at<=original.recorded_at THEN
 RAISE EXCEPTION 'Result identity mismatch' USING ERRCODE='22023'; END IF;
 IF outcome.decision<>'quarantine' AND EXISTS(SELECT 1 FROM hsi_memory.adjudication_candidates a WHERE a.doi=original.doi AND a.source_version=original.source_version AND a.decision='quarantine') THEN
 RAISE EXCEPTION 'Quarantine cannot be cleared' USING ERRCODE='22023'; END IF;
 UPDATE hsi_memory.revalidation_jobs SET state='succeeded',result_decision_id=p_result,completed_lease_id=p_lease,lease_id=NULL,lease_until=NULL WHERE job_id=p_job;
 RETURN p_result;
END $complete$;
REVOKE ALL ON FUNCTION hsi_memory.complete_revalidation(uuid,uuid,uuid) FROM PUBLIC;
