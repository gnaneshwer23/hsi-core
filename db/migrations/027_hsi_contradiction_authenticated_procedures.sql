-- P0.2.5 PROPOSED privileged database API. HELD and NOT APPLIED.
-- SECURITY REVIEW REQUIRED: deploy only using dedicated function-owner role
-- with narrowly scoped grants. Do not expose direct table grants to runtime.
-- The caller's token is validated against neon_auth.session *inside the same
-- transaction* as the membership check and write. No session GUC is trusted.
-- Do not log session tokens or include them in telemetry.
CREATE OR REPLACE FUNCTION public.hsi_contradiction_session_principal(p_token text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, neon_auth AS $$
DECLARE v_principal text;
BEGIN
 IF p_token IS NULL OR length(p_token)<16 OR length(p_token)>4096 OR p_token ~ '[[:space:]]' THEN
   RAISE EXCEPTION 'Invalid authenticated session';
 END IF;
 SELECT u.id::text INTO v_principal
 FROM neon_auth.session s JOIN neon_auth."user" u ON u.id=s."userId"
 WHERE s.token=p_token AND s."expiresAt">now()
  AND s."impersonatedBy" IS NULL AND u."emailVerified"=true
  AND COALESCE(u.banned,false)=false LIMIT 1;
 IF v_principal IS NULL THEN RAISE EXCEPTION 'Invalid authenticated session'; END IF;
 RETURN v_principal;
END $$;
REVOKE ALL ON FUNCTION public.hsi_contradiction_session_principal(text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.hsi_contradiction_create(
 p_token text,p_tenant text,p_id text,p_left text,p_right text,
 p_schema text,p_classification text,p_snapshot jsonb,p_sources jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE v_principal text;
BEGIN
 v_principal:=public.hsi_contradiction_session_principal(p_token);
 IF NOT EXISTS (
  SELECT 1 FROM public.hsi_research_access a WHERE a.principal_id=v_principal
   AND a.access_role IN ('researcher','research_admin')
   AND a.revoked_at IS NULL AND a.granted_at<=now()
 ) THEN RAISE EXCEPTION 'Researcher access denied'; END IF;
 IF NOT EXISTS (
  SELECT 1 FROM public.hsi_contradiction_tenant_memberships m
  WHERE m.tenant_id=p_tenant AND m.principal_id=v_principal
   AND m.member_role='researcher' AND m.revoked_at IS NULL
   AND m.granted_at<=now()
 ) THEN RAISE EXCEPTION 'Tenant access denied'; END IF;
 INSERT INTO public.hsi_contradiction_records
 (id,tenant_id,submitted_by,left_edge_id,right_edge_id,schema_version,
 classification,snapshot,source_evidence_ids)
 VALUES(p_id,p_tenant,v_principal,p_left,p_right,p_schema,p_classification,p_snapshot,p_sources);
 RETURN p_id;
END $$;
REVOKE ALL ON FUNCTION public.hsi_contradiction_create(text,text,text,text,text,text,text,jsonb,jsonb) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.hsi_contradiction_review(
 p_token text,p_tenant text,p_contradiction text,p_decision text,
 p_rationale text,p_source_locator text,p_scope text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE v_principal text;v_submitter text;v_event uuid;
BEGIN
 v_principal:=public.hsi_contradiction_session_principal(p_token);
 IF NOT EXISTS (
  SELECT 1 FROM public.hsi_contradiction_tenant_memberships m
  WHERE m.tenant_id=p_tenant AND m.principal_id=v_principal
   AND m.member_role='scientific_reviewer' AND m.revoked_at IS NULL
   AND m.granted_at<=now()
 ) THEN RAISE EXCEPTION 'Tenant reviewer access denied'; END IF;
 IF NOT EXISTS (
  SELECT 1 FROM public.hsi_reviewer_authority r
  WHERE r.principal_id=v_principal AND r.reviewer_role='scientific_reviewer'
   AND r.scope=p_scope AND r.revoked_at IS NULL AND r.granted_at<=now()
 ) THEN RAISE EXCEPTION 'Reviewer authority denied'; END IF;
 SELECT submitted_by INTO v_submitter FROM public.hsi_contradiction_records
 WHERE id=p_contradiction AND tenant_id=p_tenant FOR UPDATE;
 IF v_submitter IS NULL THEN RAISE EXCEPTION 'Contradiction unavailable'; END IF;
 IF v_submitter=v_principal THEN RAISE EXCEPTION 'Self-review prohibited'; END IF;
 INSERT INTO public.hsi_contradiction_review_events
 (contradiction_id,tenant_id,submitted_by,reviewer_principal,decision,rationale,source_locator)
 VALUES(p_contradiction,p_tenant,v_submitter,v_principal,p_decision,p_rationale,p_source_locator)
 RETURNING event_id INTO v_event;
 RETURN v_event;
END $$;
REVOKE ALL ON FUNCTION public.hsi_contradiction_review(text,text,text,text,text,text,text) FROM PUBLIC;
-- No EXECUTE grants. Deployment must explicitly review SECURITY DEFINER owner
-- privileges, FORCE RLS implications, and restricted runtime role before grants.
