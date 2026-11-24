-- Offline candidates; no runtime grants. Owner-only mutations.
CREATE FUNCTION hsi_memory.create_record(p_token text,p_tenant text,p_scope text,p_id uuid,p_kind text,p_body text,p_sources jsonb,p_until timestamptz,p_request uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a text;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true OR p_until IS NULL OR p_until<=clock_timestamp() THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 INSERT INTO hsi_memory.records(tenant_id,scope_id,id,owner_id,kind,data_class,current_version,retention_until)
 VALUES(p_tenant,p_scope,p_id,a,p_kind,'synthetic_demo',1,p_until);
 INSERT INTO hsi_memory.versions(tenant_id,scope_id,record_id,version,body,source_refs) VALUES(p_tenant,p_scope,p_id,1,p_body,p_sources);
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id)
 VALUES(gen_random_uuid(),p_tenant,p_scope,p_id,a,'create',1,p_request);
 RETURN p_id;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.create_record(text,text,text,uuid,text,text,jsonb,timestamptz,uuid) FROM PUBLIC;
CREATE FUNCTION hsi_memory.set_share(p_token text,p_tenant text,p_scope text,p_id uuid,p_grantee text,p_until timestamptz,p_revoke boolean,p_request uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a text; v integer;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true OR p_revoke IS NULL THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 SELECT current_version INTO v FROM hsi_memory.records WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id AND owner_id=a AND state='active' AND retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_revoke THEN
 UPDATE hsi_memory.grants SET revoked_at=clock_timestamp() WHERE tenant_id=p_tenant AND scope_id=p_scope AND record_id=p_id AND principal_id=p_grantee;
 ELSE
 IF p_grantee=a OR p_until IS NULL OR p_until<=clock_timestamp() OR hsi_memory.active_membership(p_grantee,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 INSERT INTO hsi_memory.grants(tenant_id,scope_id,record_id,principal_id,expires_at) VALUES(p_tenant,p_scope,p_id,p_grantee,p_until)
 ON CONFLICT(tenant_id,scope_id,record_id,principal_id) DO UPDATE SET expires_at=EXCLUDED.expires_at,revoked_at=NULL;
 UPDATE hsi_memory.records SET visibility='shared' WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id;
 END IF;
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id)
 VALUES(gen_random_uuid(),p_tenant,p_scope,p_id,a,CASE WHEN p_revoke THEN 'revoke' ELSE 'grant' END,v,p_request);
END $$;
REVOKE ALL ON FUNCTION hsi_memory.set_share(text,text,text,uuid,text,timestamptz,boolean,uuid) FROM PUBLIC;
CREATE FUNCTION hsi_memory.delete_record(p_token text,p_tenant text,p_scope text,p_id uuid,p_request uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a text; v integer;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 SELECT current_version INTO v FROM hsi_memory.records WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id AND owner_id=a FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id)
 VALUES(gen_random_uuid(),p_tenant,p_scope,p_id,a,'delete',v,p_request);
 DELETE FROM hsi_memory.records WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.delete_record(text,text,text,uuid,uuid) FROM PUBLIC;
-- Deletion cascades to versions and grants only. Audit, backups, indexes,
-- retention sweeper and replay-safe idempotency remain unresolved.
