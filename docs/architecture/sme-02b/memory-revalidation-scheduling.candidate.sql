-- Synthetic fixture only. All future queue writers must preserve this identity lock.
CREATE FUNCTION hsi_memory.schedule_revalidation(p_job uuid,p_decision uuid,p_due timestamptz)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $schedule$
DECLARE d hsi_memory.adjudication_candidates%ROWTYPE; existing hsi_memory.revalidation_jobs%ROWTYPE; pr smallint;
BEGIN
 IF p_job IS NULL OR p_decision IS NULL OR p_due IS NULL OR NOT isfinite(p_due) OR p_due>clock_timestamp()+interval '30 days' THEN
 RAISE EXCEPTION 'Invalid schedule' USING ERRCODE='22023'; END IF;
 SELECT * INTO d FROM hsi_memory.adjudication_candidates WHERE decision_id=p_decision;
 IF NOT FOUND THEN RAISE EXCEPTION 'Decision unavailable' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sme-revalidation:'||d.doi||':'||d.source_version,0));
 pr:=CASE d.decision WHEN 'quarantine' THEN 0 WHEN 'recheck_required' THEN 1 ELSE 2 END;
 SELECT * INTO existing FROM hsi_memory.revalidation_jobs WHERE job_id=p_job;
 IF FOUND THEN
 IF existing.decision_id=p_decision AND existing.original_due_at=p_due AND existing.priority=pr THEN RETURN p_job; END IF;
 RAISE EXCEPTION 'Schedule replay conflict' USING ERRCODE='40001'; END IF;
 IF EXISTS(SELECT 1 FROM hsi_memory.revalidation_jobs j JOIN hsi_memory.adjudication_candidates a ON a.decision_id=j.decision_id WHERE a.doi=d.doi AND a.source_version=d.source_version AND j.state IN ('queued','leased')) THEN
 RAISE EXCEPTION 'Publication already scheduled' USING ERRCODE='40001'; END IF;
 INSERT INTO hsi_memory.revalidation_jobs(job_id,decision_id,due_at,priority) VALUES(p_job,p_decision,p_due,pr);
 RETURN p_job;
END $schedule$;
REVOKE ALL ON FUNCTION hsi_memory.schedule_revalidation(uuid,uuid,timestamptz) FROM PUBLIC;
