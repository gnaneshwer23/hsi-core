-- Candidate only: re-read exact ranked versions under current authorization.
CREATE FUNCTION hsi_memory.revalidate_ranked(p_token text,p_tenant text,p_scope text,p_ids uuid[],p_versions integer[])
RETURNS TABLE(record_id uuid,version integer,body text,source_refs jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $revalidate$
DECLARE a text;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_ids IS NULL OR p_versions IS NULL OR cardinality(p_ids) NOT BETWEEN 1 AND 100 OR cardinality(p_ids)<>cardinality(p_versions) OR array_ndims(p_ids)<>1 OR array_ndims(p_versions)<>1 OR array_position(p_ids,NULL) IS NOT NULL OR array_position(p_versions,NULL) IS NOT NULL OR EXISTS(SELECT 1 FROM unnest(p_versions) v WHERE v<1) OR (SELECT count(DISTINCT x) FROM unnest(p_ids) x)<>cardinality(p_ids) THEN RAISE EXCEPTION 'Invalid ranked selection' USING ERRCODE='22023'; END IF;
 RETURN QUERY SELECT r.id,v.version,v.body,v.source_refs
 FROM unnest(p_ids,p_versions) WITH ORDINALITY AS q(id,ver,ord)
 JOIN hsi_memory.records r ON r.id=q.id AND r.current_version=q.ver AND r.tenant_id=p_tenant AND r.scope_id=p_scope
 JOIN hsi_memory.versions v ON (v.tenant_id,v.scope_id,v.record_id,v.version)=(r.tenant_id,r.scope_id,r.id,r.current_version)
 WHERE r.state='active' AND r.retention_until>clock_timestamp()
 AND (r.owner_id=a OR (r.visibility='shared' AND EXISTS(SELECT 1 FROM hsi_memory.grants g WHERE (g.tenant_id,g.scope_id,g.record_id)=(r.tenant_id,r.scope_id,r.id) AND g.principal_id=a AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp())))
 ORDER BY q.ord;
END $revalidate$;
REVOKE ALL ON FUNCTION hsi_memory.revalidate_ranked(text,text,text,uuid[],integer[]) FROM PUBLIC;
