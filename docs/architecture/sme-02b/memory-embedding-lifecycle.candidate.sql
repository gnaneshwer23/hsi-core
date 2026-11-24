-- Candidate only. Restricted fixture indexer; no production grants.
CREATE FUNCTION hsi_memory.store_embedding(p_tenant text,p_scope text,p_id uuid,p_version integer,p_model text,p_vector public.vector)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $store$
DECLARE existing public.vector;
BEGIN
 IF p_model IS DISTINCT FROM 'hsi-synthetic-fixture-v1' OR p_vector IS NULL OR public.vector_dims(p_vector)<>8 OR public.vector_norm(p_vector)<=0 THEN RAISE EXCEPTION 'Invalid embedding' USING ERRCODE='22023'; END IF;
 PERFORM 1 FROM hsi_memory.records r WHERE (r.tenant_id,r.scope_id,r.id)=(p_tenant,p_scope,p_id) AND r.current_version=p_version AND r.state='active' AND r.data_class='synthetic_demo' AND r.retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO hsi_memory.embeddings(tenant_id,scope_id,record_id,version,model,dimensions,embedding)
 VALUES(p_tenant,p_scope,p_id,p_version,p_model,8,p_vector) ON CONFLICT DO NOTHING;
 SELECT e.embedding INTO existing FROM hsi_memory.embeddings e WHERE (e.tenant_id,e.scope_id,e.record_id,e.version,e.model)=(p_tenant,p_scope,p_id,p_version,p_model);
 IF existing IS NULL OR NOT (existing OPERATOR(public.=) p_vector) THEN RAISE EXCEPTION 'Embedding conflict' USING ERRCODE='40001'; END IF;
 RETURN true;
END $store$;
REVOKE ALL ON FUNCTION hsi_memory.store_embedding(text,text,uuid,integer,text,public.vector) FROM PUBLIC;
