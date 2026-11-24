-- Candidate only; no production grants. All access is checked in database.
CREATE FUNCTION hsi_memory.list_current(p_token text,p_tenant text,p_scope text,p_after uuid,p_limit integer)
RETURNS TABLE(record_id uuid,version integer,kind text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a text;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid limit' USING ERRCODE='22023'; END IF;
 RETURN QUERY SELECT r.id,r.current_version,r.kind FROM hsi_memory.records r
 WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND (p_after IS NULL OR r.id>p_after)
 AND r.state='active' AND r.retention_until>clock_timestamp()
 AND (r.owner_id=a OR (r.visibility='shared' AND EXISTS(SELECT 1 FROM hsi_memory.grants g WHERE (g.tenant_id,g.scope_id,g.record_id)=(r.tenant_id,r.scope_id,r.id) AND g.principal_id=a AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp())))
 ORDER BY r.id LIMIT p_limit;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.list_current(text,text,text,uuid,integer) FROM PUBLIC;
-- Export is owner-only, current version only, with audit. No external delivery.
CREATE FUNCTION hsi_memory.export_current(p_token text,p_tenant text,p_scope text,p_id uuid,p_request uuid)
RETURNS TABLE(record_id uuid,version integer,body text,source_refs jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a text; n integer; prior hsi_memory.events%ROWTYPE;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 SELECT r.current_version INTO n FROM hsi_memory.records r WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.id=p_id AND r.owner_id=a AND r.state='active' AND r.retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 SELECT e.* INTO prior FROM hsi_memory.events e WHERE e.tenant_id=p_tenant AND e.actor_id=a AND e.operation='export' AND e.request_id=p_request;
 IF FOUND THEN
 IF prior.scope_id IS DISTINCT FROM p_scope OR prior.record_id IS DISTINCT FROM p_id THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='40001'; END IF;
 n:=prior.version;
 ELSE
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id) VALUES(gen_random_uuid(),p_tenant,p_scope,p_id,a,'export',n,p_request);
 END IF;
 RETURN QUERY SELECT v.record_id,v.version,v.body,v.source_refs FROM hsi_memory.versions v WHERE v.tenant_id=p_tenant AND v.scope_id=p_scope AND v.record_id=p_id AND v.version=n;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.export_current(text,text,text,uuid,uuid) FROM PUBLIC;
-- Correction proposals are separate unverified records, not graph mutations.
CREATE TABLE hsi_memory.correction_proposals(
 tenant_id text NOT NULL,scope_id text NOT NULL,record_id uuid NOT NULL,proposal_id uuid NOT NULL,actor_id text NOT NULL,
 target_version integer NOT NULL,body text NOT NULL CHECK(octet_length(body)<=65536),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,scope_id,record_id,proposal_id),
 FOREIGN KEY(tenant_id,scope_id,record_id,target_version) REFERENCES hsi_memory.versions(tenant_id,scope_id,record_id,version) ON DELETE CASCADE
);
ALTER TABLE hsi_memory.correction_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.correction_proposals FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.correction_proposals FROM PUBLIC;
CREATE FUNCTION hsi_memory.propose_correction(p_token text,p_tenant text,p_scope text,p_id uuid,p_expected integer,p_body text,p_request uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a text; n integer;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 SELECT r.current_version INTO n FROM hsi_memory.records r WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.id=p_id AND r.owner_id=a AND r.state='active' AND r.retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF EXISTS(SELECT 1 FROM hsi_memory.events e WHERE e.tenant_id=p_tenant AND e.actor_id=a AND e.operation='correction_proposal' AND e.request_id=p_request) THEN
 IF NOT EXISTS(SELECT 1 FROM hsi_memory.correction_proposals q WHERE q.tenant_id=p_tenant AND q.scope_id=p_scope AND q.record_id=p_id AND q.proposal_id=p_request AND q.actor_id=a AND q.target_version=p_expected AND q.body IS NOT DISTINCT FROM p_body) THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='40001'; END IF;
 RETURN p_request;
 END IF;
 IF n IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Version conflict' USING ERRCODE='40001'; END IF;
 INSERT INTO hsi_memory.correction_proposals(tenant_id,scope_id,record_id,proposal_id,actor_id,target_version,body) VALUES(p_tenant,p_scope,p_id,p_request,a,n,p_body);
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id) VALUES(gen_random_uuid(),p_tenant,p_scope,p_id,a,'correction_proposal',n,p_request);
 RETURN p_request;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.propose_correction(text,text,text,uuid,integer,text,uuid) FROM PUBLIC;
