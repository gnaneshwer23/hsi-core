-- Fixture only. Preserve original scheduling timestamp for replay.
ALTER TABLE hsi_memory.revalidation_jobs ADD COLUMN original_due_at timestamptz;
UPDATE hsi_memory.revalidation_jobs SET original_due_at=due_at;
ALTER TABLE hsi_memory.revalidation_jobs ALTER COLUMN original_due_at SET NOT NULL;
CREATE FUNCTION hsi_memory.capture_revalidation_due() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $due$
BEGIN NEW.original_due_at:=NEW.due_at; RETURN NEW; END $due$;
CREATE TRIGGER revalidation_original_due BEFORE INSERT ON hsi_memory.revalidation_jobs FOR EACH ROW EXECUTE FUNCTION hsi_memory.capture_revalidation_due();
REVOKE ALL ON FUNCTION hsi_memory.capture_revalidation_due() FROM PUBLIC;
CREATE FUNCTION hsi_memory.fail_revalidation(p_job uuid,p_lease uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fail$
DECLARE j hsi_memory.revalidation_jobs%ROWTYPE; next_state text;
BEGIN
 SELECT * INTO j FROM hsi_memory.revalidation_jobs WHERE job_id=p_job FOR UPDATE;
 IF NOT FOUND OR p_lease IS NULL OR j.state<>'leased' OR j.lease_id IS DISTINCT FROM p_lease OR j.lease_until<=clock_timestamp() THEN RAISE EXCEPTION 'Lease unavailable' USING ERRCODE='42501'; END IF;
 next_state:=CASE WHEN j.attempts>=5 THEN 'failed' ELSE 'queued' END;
 UPDATE hsi_memory.revalidation_jobs SET state=next_state,lease_id=NULL,lease_until=NULL,due_at=clock_timestamp()+make_interval(secs=>60*power(2,j.attempts-1)) WHERE job_id=p_job;
 RETURN next_state;
END $fail$;
CREATE FUNCTION hsi_memory.recover_revalidation(p_limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $recover$
DECLARE n integer;
BEGIN
 IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid recovery limit' USING ERRCODE='22023'; END IF;
 WITH expired AS (SELECT job_id FROM hsi_memory.revalidation_jobs WHERE state='leased' AND lease_until<=clock_timestamp() ORDER BY lease_until,job_id LIMIT p_limit FOR UPDATE SKIP LOCKED)
 UPDATE hsi_memory.revalidation_jobs j SET state=CASE WHEN j.attempts>=5 THEN 'failed' ELSE 'queued' END,lease_id=NULL,lease_until=NULL,due_at=clock_timestamp()+make_interval(secs=>60*power(2,j.attempts-1)) FROM expired e WHERE j.job_id=e.job_id;
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END $recover$;
REVOKE ALL ON FUNCTION hsi_memory.fail_revalidation(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION hsi_memory.recover_revalidation(integer) FROM PUBLIC;
