-- Synthetic-only worker claim; no network or production grants.
CREATE FUNCTION hsi_memory.claim_revalidation()
RETURNS TABLE(job_id uuid,decision_id uuid,doi text,source_version text,lease_id uuid,lease_until timestamptz,attempts integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $claim$
BEGIN
 RETURN QUERY
 WITH selected AS (
 SELECT j.job_id FROM hsi_memory.revalidation_jobs j
 WHERE j.state='queued' AND j.due_at<=clock_timestamp() AND j.attempts<5
 ORDER BY j.priority,j.due_at,j.job_id LIMIT 1 FOR UPDATE SKIP LOCKED
 ), claimed AS (
 UPDATE hsi_memory.revalidation_jobs j SET state='leased',attempts=j.attempts+1,lease_id=gen_random_uuid(),lease_until=clock_timestamp()+interval '60 seconds'
 FROM selected s WHERE j.job_id=s.job_id
 RETURNING j.job_id,j.decision_id,j.lease_id,j.lease_until,j.attempts
 )
 SELECT c.job_id,c.decision_id,a.doi,a.source_version,c.lease_id,c.lease_until,c.attempts
 FROM claimed c JOIN hsi_memory.adjudication_candidates a ON a.decision_id=c.decision_id;
END $claim$;
REVOKE ALL ON FUNCTION hsi_memory.claim_revalidation() FROM PUBLIC;
