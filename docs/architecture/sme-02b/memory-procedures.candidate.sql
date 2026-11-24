-- OFFLINE REHEARSAL ONLY. Requires fixture adapters and a dedicated non-login
-- function owner with reviewed RLS policies. No grants or policies installed here.
-- Adapter contract: hsi_memory.resolve_principal(token) verifies session in DB;
-- hsi_memory.active_membership(principal,tenant,scope) checks canonical registry.
-- Neither adapter is implemented here: production registry remains unresolved.
CREATE FUNCTION hsi_memory.read_current(p_token text,p_tenant text,p_scope text,p_id uuid)
RETURNS TABLE(record_id uuid,version integer,body text,source_refs jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_actor text;
BEGIN
 v_actor:=hsi_memory.resolve_principal(p_token);
 IF v_actor IS NULL OR hsi_memory.active_membership(v_actor,p_tenant,p_scope) IS DISTINCT FROM true THEN
  RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501';
 END IF;
 RETURN QUERY SELECT r.id,v.version,v.body,v.source_refs
 FROM hsi_memory.records r JOIN hsi_memory.versions v
 ON (v.tenant_id,v.scope_id,v.record_id,v.version)=(r.tenant_id,r.scope_id,r.id,r.current_version)
 WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.id=p_id
 AND r.state='active' AND r.retention_until>clock_timestamp()
 AND (r.owner_id=v_actor OR (r.visibility='shared' AND EXISTS(
 SELECT 1 FROM hsi_memory.grants g WHERE (g.tenant_id,g.scope_id,g.record_id)=(r.tenant_id,r.scope_id,r.id)
 AND g.principal_id=v_actor AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp())));
END $$;
REVOKE ALL ON FUNCTION hsi_memory.read_current(text,text,text,uuid) FROM PUBLIC;
CREATE FUNCTION hsi_memory.revise(p_token text,p_tenant text,p_scope text,p_id uuid,p_expected integer,p_body text,p_sources jsonb,p_request uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_actor text; v_current integer;
BEGIN
 v_actor:=hsi_memory.resolve_principal(p_token);
 IF v_actor IS NULL OR hsi_memory.active_membership(v_actor,p_tenant,p_scope) IS DISTINCT FROM true THEN
 RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 SELECT r.current_version INTO v_current FROM hsi_memory.records r
 WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.id=p_id AND r.owner_id=v_actor
 AND r.state='active' AND r.retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_expected IS DISTINCT FROM v_current THEN RAISE EXCEPTION 'Version conflict' USING ERRCODE='40001'; END IF;
 INSERT INTO hsi_memory.versions(tenant_id,scope_id,record_id,version,body,source_refs)
 VALUES(p_tenant,p_scope,p_id,v_current+1,p_body,p_sources);
 UPDATE hsi_memory.records SET current_version=v_current+1 WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id;
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id)
 VALUES(gen_random_uuid(),p_tenant,p_scope,p_id,v_actor,'revise',v_current+1,p_request);
 RETURN v_current+1;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.revise(text,text,text,uuid,integer,text,jsonb,uuid) FROM PUBLIC;
-- Duplicate request IDs roll back, not yet replay-safe. No create/share/delete
-- until retention, canonical membership and idempotency contracts are resolved.
