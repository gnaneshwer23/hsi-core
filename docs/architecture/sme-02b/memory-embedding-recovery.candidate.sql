-- Candidate recovery API; no content or provider error strings stored.
CREATE FUNCTION hsi_memory.fail_embedding(p_tenant text,p_scope text,p_id uuid,p_version integer,p_lease uuid,p_retry boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fail$
BEGIN
 PERFORM 1 FROM hsi_memory.records r WHERE (r.tenant_id,r.scope_id,r.id)=(p_tenant,p_scope,p_id) FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE hsi_memory.embedding_jobs j SET
 state=CASE WHEN p_retry IS TRUE AND j.attempts<5 THEN 'queued' ELSE 'failed' END,
 available_at=clock_timestamp()+make_interval(secs=>power(2,j.attempts)::integer*5),
 lease_id=NULL,lease_until=NULL
 WHERE (j.tenant_id,j.scope_id,j.record_id,j.version)=(p_tenant,p_scope,p_id,p_version)
 AND j.state='leased' AND j.lease_id=p_lease AND j.lease_until>clock_timestamp();
 RETURN FOUND;
END $fail$;
CREATE FUNCTION hsi_memory.recover_embedding_jobs(p_limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $recover$
DECLARE k record; n integer:=0;
BEGIN
 IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid recovery limit' USING ERRCODE='22023'; END IF;
 FOR k IN SELECT j.tenant_id,j.scope_id,j.record_id,j.version,j.model FROM hsi_memory.embedding_jobs j JOIN hsi_memory.records r ON (r.tenant_id,r.scope_id,r.id)=(j.tenant_id,j.scope_id,j.record_id)
 WHERE j.state IN ('queued','leased') AND (r.current_version<>j.version OR r.state<>'active' OR r.data_class<>'synthetic_demo' OR r.retention_until<=clock_timestamp() OR (j.state='leased' AND j.lease_until<=clock_timestamp() AND j.attempts>=5))
 ORDER BY j.created_at,j.tenant_id,j.scope_id,j.record_id,j.version LIMIT p_limit FOR UPDATE OF r SKIP LOCKED
 LOOP
 UPDATE hsi_memory.embedding_jobs j SET state=CASE WHEN EXISTS(SELECT 1 FROM hsi_memory.records r WHERE (r.tenant_id,r.scope_id,r.id)=(k.tenant_id,k.scope_id,k.record_id) AND r.current_version=k.version AND r.state='active' AND r.data_class='synthetic_demo' AND r.retention_until>clock_timestamp()) THEN 'failed' ELSE 'cancelled' END,lease_id=NULL,lease_until=NULL
 WHERE (j.tenant_id,j.scope_id,j.record_id,j.version,j.model)=(k.tenant_id,k.scope_id,k.record_id,k.version,k.model) AND j.state IN ('queued','leased');
 IF FOUND THEN n:=n+1; END IF;
 END LOOP;
 RETURN n;
END $recover$;
REVOKE ALL ON FUNCTION hsi_memory.fail_embedding(text,text,uuid,integer,uuid,boolean),hsi_memory.recover_embedding_jobs(integer) FROM PUBLIC;
