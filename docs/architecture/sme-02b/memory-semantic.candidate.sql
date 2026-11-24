-- Offline candidate. Exact authorized scan, no approximate index or live grants.
CREATE FUNCTION hsi_memory.search_semantic(p_token text,p_tenant text,p_scope text,p_model text,p_query public.vector,p_limit integer)
RETURNS TABLE(record_id uuid,version integer,semantic_rank bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $semantic$
DECLARE a text;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_model IS NULL OR length(p_model) NOT BETWEEN 1 AND 128 OR p_query IS NULL OR public.vector_dims(p_query) NOT BETWEEN 1 AND 4096 OR public.vector_norm(p_query)<=0 OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid search' USING ERRCODE='22023'; END IF;
 RETURN QUERY WITH authorized AS MATERIALIZED (
 SELECT r.id,r.current_version,e.embedding FROM hsi_memory.records r
 JOIN hsi_memory.embeddings e ON (e.tenant_id,e.scope_id,e.record_id,e.version)=(r.tenant_id,r.scope_id,r.id,r.current_version)
 WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.state='active' AND r.retention_until>clock_timestamp()
 AND e.model=p_model AND e.dimensions=public.vector_dims(p_query)
 AND (r.owner_id=a OR (r.visibility='shared' AND EXISTS(SELECT 1 FROM hsi_memory.grants g WHERE (g.tenant_id,g.scope_id,g.record_id)=(r.tenant_id,r.scope_id,r.id) AND g.principal_id=a AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp())))
 ), scored AS (
 SELECT z.id,z.current_version,z.embedding OPERATOR(public.<=>) p_query AS distance FROM authorized z
 )
 SELECT s.id,s.current_version,row_number() OVER(ORDER BY s.distance,s.id) FROM scored s ORDER BY s.distance,s.id LIMIT p_limit;
END $semantic$;
REVOKE ALL ON FUNCTION hsi_memory.search_semantic(text,text,text,text,public.vector,integer) FROM PUBLIC;
