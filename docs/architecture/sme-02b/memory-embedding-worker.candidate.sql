-- Candidate worker API. Synthetic only. Record locks precede job locks.
CREATE FUNCTION hsi_memory.claim_embedding()
RETURNS TABLE(tenant_id text,scope_id text,record_id uuid,version integer,lease_id uuid,body text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $claim$
DECLARE k hsi_memory.embedding_jobs%ROWTYPE; token uuid:=gen_random_uuid();
BEGIN
 SELECT j.* INTO k FROM hsi_memory.embedding_jobs j JOIN hsi_memory.records r ON (r.tenant_id,r.scope_id,r.id)=(j.tenant_id,j.scope_id,j.record_id)
 WHERE r.current_version=j.version AND r.state='active' AND r.data_class='synthetic_demo' AND r.retention_until>clock_timestamp()
 AND j.attempts<5 AND ((j.state='queued' AND j.available_at<=clock_timestamp()) OR (j.state='leased' AND j.lease_until<=clock_timestamp()))
 ORDER BY j.available_at,j.created_at,j.tenant_id,j.scope_id,j.record_id,j.version LIMIT 1 FOR UPDATE OF r SKIP LOCKED;
 IF NOT FOUND THEN RETURN; END IF;
 UPDATE hsi_memory.embedding_jobs j SET state='leased',attempts=j.attempts+1,lease_id=token,lease_until=clock_timestamp()+interval '60 seconds'
 WHERE (j.tenant_id,j.scope_id,j.record_id,j.version,j.model)=(k.tenant_id,k.scope_id,k.record_id,k.version,k.model)
 AND j.attempts<5 AND ((j.state='queued' AND j.available_at<=clock_timestamp()) OR (j.state='leased' AND j.lease_until<=clock_timestamp()));
 IF NOT FOUND THEN RETURN; END IF;
 RETURN QUERY SELECT k.tenant_id,k.scope_id,k.record_id,k.version,token,v.body FROM hsi_memory.versions v WHERE (v.tenant_id,v.scope_id,v.record_id,v.version)=(k.tenant_id,k.scope_id,k.record_id,k.version);
END $claim$;
CREATE FUNCTION hsi_memory.finish_embedding(p_tenant text,p_scope text,p_id uuid,p_version integer,p_lease uuid,p_vector public.vector)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $finish$
BEGIN
 PERFORM 1 FROM hsi_memory.records r WHERE (r.tenant_id,r.scope_id,r.id)=(p_tenant,p_scope,p_id) AND r.current_version=p_version AND r.state='active' AND r.data_class='synthetic_demo' AND r.retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 PERFORM 1 FROM hsi_memory.embedding_jobs j WHERE (j.tenant_id,j.scope_id,j.record_id,j.version)=(p_tenant,p_scope,p_id,p_version) AND j.state='leased' AND j.lease_id=p_lease AND j.lease_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF NOT hsi_memory.store_embedding(p_tenant,p_scope,p_id,p_version,'hsi-synthetic-fixture-v1',p_vector) THEN RETURN false; END IF;
 UPDATE hsi_memory.embedding_jobs j SET state='succeeded',lease_id=NULL,lease_until=NULL WHERE (j.tenant_id,j.scope_id,j.record_id,j.version)=(p_tenant,p_scope,p_id,p_version);
 RETURN true;
END $finish$;
REVOKE ALL ON FUNCTION hsi_memory.claim_embedding(),hsi_memory.finish_embedding(text,text,uuid,integer,uuid,public.vector) FROM PUBLIC;
