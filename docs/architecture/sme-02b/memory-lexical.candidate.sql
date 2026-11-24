-- Offline candidate: exact-scope authorization before text scoring.
CREATE FUNCTION hsi_memory.search_lexical(p_token text,p_tenant text,p_scope text,p_query text,p_limit integer)
RETURNS TABLE(record_id uuid,version integer,lexical_rank bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $lexical$
DECLARE a text; q tsquery;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_query IS NULL OR octet_length(p_query)>2048 OR btrim(p_query)='' OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid search' USING ERRCODE='22023'; END IF;
 q:=plainto_tsquery('pg_catalog.simple'::regconfig,p_query);
 RETURN QUERY WITH authorized AS MATERIALIZED (
 SELECT r.id,r.current_version,v.body FROM hsi_memory.records r
 JOIN hsi_memory.versions v ON (v.tenant_id,v.scope_id,v.record_id,v.version)=(r.tenant_id,r.scope_id,r.id,r.current_version)
 WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.state='active' AND r.retention_until>clock_timestamp()
 AND (r.owner_id=a OR (r.visibility='shared' AND EXISTS(SELECT 1 FROM hsi_memory.grants g WHERE (g.tenant_id,g.scope_id,g.record_id)=(r.tenant_id,r.scope_id,r.id) AND g.principal_id=a AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp())))
 ), scored AS (
 SELECT z.id,z.current_version,ts_rank_cd(to_tsvector('pg_catalog.simple'::regconfig,z.body),q) AS relevance FROM authorized z
 WHERE to_tsvector('pg_catalog.simple'::regconfig,z.body) @@ q
 )
 SELECT s.id,s.current_version,row_number() OVER(ORDER BY s.relevance DESC,s.id) FROM scored s ORDER BY s.relevance DESC,s.id LIMIT p_limit;
END $lexical$;
REVOKE ALL ON FUNCTION hsi_memory.search_lexical(text,text,text,text,integer) FROM PUBLIC;
