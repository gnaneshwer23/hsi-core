-- 034 HELD. Implements accepted ADR-012 (one investigation store), ADR-013 (identity verified in the database) and
-- ADR-014 (scope registry). Owner sign-off: 28 November 2026. Production apply stays held until the independent
-- database review (Track B2) and the two-account isolation suite (db/verify/034_*, scripts/verify-investigation-
-- store-local.ts) pass on a disposable database. Requires 006 (hsi_research_access) and the Neon Auth schema.
--
-- Identity (ADR-013): every procedure verifies the caller's session token against neon_auth.session inside the same
-- transaction and derives the principal from it. No session GUC and no app-supplied owner id is trusted.
-- Access: the tables have RLS forced and NO runtime grants. The runtime role gets EXECUTE on the procedures only. The
-- definer must be a dedicated, non-superuser function-owner role.
-- Promotion (ADR-012/013/014): nothing here promotes a graph edge, records scientific approval or sets
-- scientificClaimAllowed. Scope membership permits acting inside a scope; it approves nothing. Self-grant is refused.
-- This migration does not touch, migrate or drop the six older investigation shapes; see
-- docs/architecture/ADR-012-BACKFILL-PLAN.md. Do not log session tokens.
--
-- ROLLBACK (take a backup first; this drops data):
--   DROP TABLE IF EXISTS public.hsi_investigation_outputs, public.hsi_investigation_events, public.hsi_investigations,
--     public.hsi_memberships, public.hsi_scopes CASCADE;
--   DROP FUNCTION IF EXISTS public.hsi_session_principal(text), public.hsi_store_block_mutation(),
--     public.hsi_investigation_guard(), public.hsi_membership_guard(), public.hsi_scope_member(text,text),
--     public.hsi_inv_visible(text,uuid), public.hsi_inv_owned(text,uuid), public.hsi_inv_log(uuid,text,text,jsonb,text),
--     public.hsi_inv_create(text,text,text,jsonb,text), public.hsi_inv_append_event(text,uuid,text,jsonb,text),
--     public.hsi_inv_add_output(text,uuid,text,jsonb,jsonb), public.hsi_inv_set_status(text,uuid,text),
--     public.hsi_inv_share(text,uuid,text,boolean), public.hsi_inv_list(text), public.hsi_inv_get(text,uuid),
--     public.hsi_scope_list(text), public.hsi_scope_create(text,text,text),
--     public.hsi_membership_grant(text,text,text,text), public.hsi_membership_revoke(text,bigint),
--     public.hsi_membership_bootstrap(text,text,text);

-- 1. Scope registry (ADR-014). A programme is a row, not a literal in SQL or TypeScript.
CREATE TABLE IF NOT EXISTS public.hsi_scopes(
 id text PRIMARY KEY CHECK(id ~ '^[a-z][a-z0-9-]{1,47}$'),
 name text NOT NULL CHECK(length(trim(name)) BETWEEN 2 AND 120),
 active boolean NOT NULL DEFAULT true,
 created_by text NOT NULL CHECK(length(trim(created_by))>0),
 created_at timestamptz NOT NULL DEFAULT now()
);
-- Seed only today's literals so behaviour does not expand silently.
INSERT INTO public.hsi_scopes(id,name,created_by) VALUES('ssc','Systemic sclerosis','migration-034'),('ra','Rheumatoid arthritis','migration-034')
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.hsi_memberships(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 principal_id text NOT NULL CHECK(length(trim(principal_id))>0),
 scope_id text NOT NULL REFERENCES public.hsi_scopes(id),
 role text NOT NULL CHECK(role IN ('researcher','reviewer','adjudicator','admin')),
 granted_by text NOT NULL CHECK(length(trim(granted_by))>0),
 granted_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 revoked_by text,
 CHECK(granted_by<>principal_id OR granted_by LIKE 'bootstrap:%'),
 CHECK((revoked_at IS NULL)=(revoked_by IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS hsi_memberships_one_active ON public.hsi_memberships(principal_id,scope_id,role) WHERE revoked_at IS NULL;

-- 2. One investigation store (ADR-012): investigation, append-only events, immutable section versions.
CREATE TABLE IF NOT EXISTS public.hsi_investigations(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL CHECK(length(trim(owner_id))>0),
 scope_id text REFERENCES public.hsi_scopes(id),
 question text NOT NULL CHECK(length(trim(question)) BETWEEN 5 AND 2000),
 entities jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(entities)='array' AND jsonb_array_length(entities)<=200),
 graph_version text NOT NULL CHECK(graph_version ~ '^[a-f0-9]{64}$'),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),
 shared boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(NOT shared OR scope_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS hsi_investigations_owner ON public.hsi_investigations(owner_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS hsi_investigations_scope ON public.hsi_investigations(scope_id) WHERE shared;

CREATE TABLE IF NOT EXISTS public.hsi_investigation_events(
 investigation_id uuid NOT NULL REFERENCES public.hsi_investigations(id),
 seq integer NOT NULL CHECK(seq>=1),
 kind text NOT NULL CHECK(kind IN ('created','note','stage','selection','status','shared','unshared','output')),
 payload jsonb NOT NULL CHECK(jsonb_typeof(payload)='object' AND pg_column_size(payload)<=65536),
 payload_digest text NOT NULL CHECK(payload_digest ~ '^[a-f0-9]{64}$'),
 run_id text CHECK(run_id IS NULL OR run_id ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,80}$'),
 actor_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(investigation_id,seq),
 CHECK(NOT jsonb_path_exists(payload,'lax $.**.scientificClaimAllowed ? (@ == true)')),
 CHECK(NOT jsonb_path_exists(payload,'lax $.**.scientificApproval ? (@ == true)'))
);

CREATE TABLE IF NOT EXISTS public.hsi_investigation_outputs(
 investigation_id uuid NOT NULL REFERENCES public.hsi_investigations(id),
 section text NOT NULL CHECK(section IN ('01','02','03','04','05','06')),
 version integer NOT NULL CHECK(version>=1),
 body jsonb NOT NULL CHECK(jsonb_typeof(body)='object' AND pg_column_size(body)<=262144),
 lineage jsonb NOT NULL CHECK(jsonb_typeof(lineage)='object'),
 digest text NOT NULL CHECK(digest ~ '^[a-f0-9]{64}$'),
 actor_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(investigation_id,section,version),
 CHECK(NOT jsonb_path_exists(body,'lax $.**.scientificClaimAllowed ? (@ == true)')),
 CHECK(NOT jsonb_path_exists(body,'lax $.**.scientificApproval ? (@ == true)'))
);

-- Append-only guards. Events and outputs never change. Investigations change only status, shared, scope and
-- updated_at. Memberships change only by revocation.
CREATE OR REPLACE FUNCTION public.hsi_store_block_mutation() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN RAISE EXCEPTION '% is append-only; % is not permitted',TG_TABLE_NAME,TG_OP USING ERRCODE='42501'; END $f$;
CREATE OR REPLACE FUNCTION public.hsi_investigation_guard() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'investigations are not deleted; archive instead' USING ERRCODE='42501'; END IF;
 IF NEW.id<>OLD.id OR NEW.owner_id<>OLD.owner_id OR NEW.question<>OLD.question OR NEW.entities<>OLD.entities
  OR NEW.graph_version<>OLD.graph_version OR NEW.created_at<>OLD.created_at THEN
  RAISE EXCEPTION 'only status, sharing and scope may change' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END $f$;
CREATE OR REPLACE FUNCTION public.hsi_membership_guard() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'memberships are revoked, not deleted' USING ERRCODE='42501'; END IF;
 IF OLD.revoked_at IS NOT NULL OR NEW.revoked_at IS NULL OR NEW.id<>OLD.id OR NEW.principal_id<>OLD.principal_id
  OR NEW.scope_id<>OLD.scope_id OR NEW.role<>OLD.role OR NEW.granted_by<>OLD.granted_by OR NEW.granted_at<>OLD.granted_at THEN
  RAISE EXCEPTION 'a membership can only be revoked once' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END $f$;
DROP TRIGGER IF EXISTS hsi_investigation_events_append_only ON public.hsi_investigation_events;
CREATE TRIGGER hsi_investigation_events_append_only BEFORE UPDATE OR DELETE ON public.hsi_investigation_events FOR EACH ROW EXECUTE FUNCTION public.hsi_store_block_mutation();
DROP TRIGGER IF EXISTS hsi_investigation_outputs_append_only ON public.hsi_investigation_outputs;
CREATE TRIGGER hsi_investigation_outputs_append_only BEFORE UPDATE OR DELETE ON public.hsi_investigation_outputs FOR EACH ROW EXECUTE FUNCTION public.hsi_store_block_mutation();
DROP TRIGGER IF EXISTS hsi_investigations_guard ON public.hsi_investigations;
CREATE TRIGGER hsi_investigations_guard BEFORE UPDATE OR DELETE ON public.hsi_investigations FOR EACH ROW EXECUTE FUNCTION public.hsi_investigation_guard();
DROP TRIGGER IF EXISTS hsi_memberships_guard ON public.hsi_memberships;
CREATE TRIGGER hsi_memberships_guard BEFORE UPDATE OR DELETE ON public.hsi_memberships FOR EACH ROW EXECUTE FUNCTION public.hsi_membership_guard();
DROP TRIGGER IF EXISTS hsi_scopes_no_delete ON public.hsi_scopes;
CREATE TRIGGER hsi_scopes_no_delete BEFORE DELETE ON public.hsi_scopes FOR EACH ROW EXECUTE FUNCTION public.hsi_store_block_mutation();
DO $t$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['hsi_investigation_events','hsi_investigation_outputs','hsi_investigations','hsi_memberships','hsi_scopes'] LOOP
  EXECUTE format('CREATE OR REPLACE TRIGGER %I BEFORE TRUNCATE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.hsi_store_block_mutation()',t||'_no_truncate',t);
 END LOOP;
END $t$;

-- Deny by default: RLS forced, no grants. The function owner (the role running this migration) gets explicit
-- policies because FORCE applies to the table owner too.
ALTER TABLE public.hsi_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_scopes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_investigations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_investigation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_investigation_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_investigation_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_investigation_outputs FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.hsi_scopes,public.hsi_memberships,public.hsi_investigations,public.hsi_investigation_events,public.hsi_investigation_outputs FROM PUBLIC;
DO $p$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['hsi_scopes','hsi_memberships','hsi_investigations','hsi_investigation_events','hsi_investigation_outputs'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS hsi_store_definer_all ON public.%I',t);
  EXECUTE format('CREATE POLICY hsi_store_definer_all ON public.%I FOR ALL TO %I USING (true) WITH CHECK (true)',t,current_user);
 END LOOP;
END $p$;

-- 3. Identity (ADR-013): the principal comes from a verified session, never from the caller.
CREATE OR REPLACE FUNCTION public.hsi_session_principal(p_token text) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, neon_auth AS $$
DECLARE v_principal text;
BEGIN
 IF p_token IS NULL OR length(p_token)<16 OR length(p_token)>4096 OR p_token ~ '[[:space:]]' THEN
  RAISE EXCEPTION 'Invalid authenticated session' USING ERRCODE='28000';
 END IF;
 SELECT u.id::text INTO v_principal
 FROM neon_auth.session s JOIN neon_auth."user" u ON u.id=s."userId"
 WHERE s.token=p_token AND s."expiresAt">now() AND s."impersonatedBy" IS NULL
  AND u."emailVerified"=true AND COALESCE(u.banned,false)=false LIMIT 1;
 IF v_principal IS NULL THEN RAISE EXCEPTION 'Invalid authenticated session' USING ERRCODE='28000'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.hsi_research_access a WHERE a.principal_id=v_principal
   AND a.access_role IN ('researcher','research_admin') AND a.revoked_at IS NULL AND a.granted_at<=now()) THEN
  RAISE EXCEPTION 'Researcher access denied' USING ERRCODE='42501';
 END IF;
 RETURN v_principal;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_scope_member(p_principal text,p_scope text,p_role text DEFAULT NULL) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
 SELECT EXISTS(SELECT 1 FROM public.hsi_memberships m JOIN public.hsi_scopes s ON s.id=m.scope_id
  WHERE m.principal_id=p_principal AND m.scope_id=p_scope AND m.revoked_at IS NULL AND s.active
   AND (p_role IS NULL OR m.role=p_role));
$$;

-- Visible: the owner, or an active member of the scope an investigation is shared into.
CREATE OR REPLACE FUNCTION public.hsi_inv_visible(p_principal text,p_id uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
 SELECT CASE WHEN i.owner_id=p_principal THEN 'owner'
  WHEN i.shared AND public.hsi_scope_member(p_principal,i.scope_id) THEN 'scope' END
 FROM public.hsi_investigations i WHERE i.id=p_id;
$$;

-- Owned: writes are the owner's only. Unknown and not-yours give the same error, so ids cannot be probed.
CREATE OR REPLACE FUNCTION public.hsi_inv_owned(p_principal text,p_id uuid) RETURNS void
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.hsi_investigations WHERE id=p_id AND owner_id=p_principal) THEN
  RAISE EXCEPTION 'Investigation not found' USING ERRCODE='P0002';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_log(p_id uuid,p_actor text,p_kind text,p_payload jsonb,p_run text) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_seq integer;
BEGIN
 PERFORM 1 FROM public.hsi_investigations WHERE id=p_id FOR UPDATE;
 SELECT COALESCE(max(seq),0)+1 INTO v_seq FROM public.hsi_investigation_events WHERE investigation_id=p_id;
 INSERT INTO public.hsi_investigation_events(investigation_id,seq,kind,payload,payload_digest,run_id,actor_id)
 VALUES(p_id,v_seq,p_kind,p_payload,encode(sha256(convert_to(p_payload::text,'UTF8')),'hex'),p_run,p_actor);
 UPDATE public.hsi_investigations SET updated_at=now() WHERE id=p_id;
 RETURN v_seq;
END $$;

-- 4. Procedures: the runtime's only access path.
CREATE OR REPLACE FUNCTION public.hsi_inv_create(p_token text,p_scope text,p_question text,p_entities jsonb,p_graph_version text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token); v_id uuid;
BEGIN
 IF p_scope IS NOT NULL AND NOT public.hsi_scope_member(v_principal,p_scope) THEN
  RAISE EXCEPTION 'Not a member of this scope' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.hsi_investigations(owner_id,scope_id,question,entities,graph_version)
 VALUES(v_principal,p_scope,p_question,COALESCE(p_entities,'[]'::jsonb),p_graph_version) RETURNING id INTO v_id;
 PERFORM public.hsi_inv_log(v_id,v_principal,'created',jsonb_build_object('graphVersion',p_graph_version,'scope',p_scope),NULL);
 RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_append_event(p_token text,p_id uuid,p_kind text,p_payload jsonb,p_run text) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token);
BEGIN
 PERFORM public.hsi_inv_owned(v_principal,p_id);
 IF p_kind NOT IN ('note','stage','selection') THEN RAISE EXCEPTION 'Event kind not allowed here' USING ERRCODE='22023'; END IF;
 RETURN public.hsi_inv_log(p_id,v_principal,p_kind,p_payload,p_run);
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_add_output(p_token text,p_id uuid,p_section text,p_body jsonb,p_lineage jsonb) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token); v_version integer; v_digest text;
BEGIN
 PERFORM public.hsi_inv_owned(v_principal,p_id);
 PERFORM 1 FROM public.hsi_investigations WHERE id=p_id FOR UPDATE;
 SELECT COALESCE(max(version),0)+1 INTO v_version FROM public.hsi_investigation_outputs WHERE investigation_id=p_id AND section=p_section;
 v_digest:=encode(sha256(convert_to(jsonb_build_object('body',p_body,'lineage',p_lineage)::text,'UTF8')),'hex');
 INSERT INTO public.hsi_investigation_outputs(investigation_id,section,version,body,lineage,digest,actor_id)
 VALUES(p_id,p_section,v_version,p_body,p_lineage,v_digest,v_principal);
 PERFORM public.hsi_inv_log(p_id,v_principal,'output',jsonb_build_object('section',p_section,'version',v_version,'digest',v_digest),NULL);
 RETURN v_version;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_set_status(p_token text,p_id uuid,p_status text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token);
BEGIN
 PERFORM public.hsi_inv_owned(v_principal,p_id);
 UPDATE public.hsi_investigations SET status=p_status WHERE id=p_id;
 PERFORM public.hsi_inv_log(p_id,v_principal,'status',jsonb_build_object('status',p_status),NULL);
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_share(p_token text,p_id uuid,p_scope text,p_shared boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token);
BEGIN
 PERFORM public.hsi_inv_owned(v_principal,p_id);
 IF p_shared THEN
  IF p_scope IS NULL OR NOT public.hsi_scope_member(v_principal,p_scope) THEN
   RAISE EXCEPTION 'Not a member of this scope' USING ERRCODE='42501';
  END IF;
  UPDATE public.hsi_investigations SET scope_id=p_scope,shared=true WHERE id=p_id;
  PERFORM public.hsi_inv_log(p_id,v_principal,'shared',jsonb_build_object('scope',p_scope),NULL);
 ELSE
  UPDATE public.hsi_investigations SET shared=false WHERE id=p_id;
  PERFORM public.hsi_inv_log(p_id,v_principal,'unshared',jsonb_build_object('scope',p_scope),NULL);
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_list(p_token text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token);
BEGIN
 RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('id',i.id,'question',i.question,'scope',i.scope_id,'shared',i.shared,
   'status',i.status,'graphVersion',i.graph_version,'createdAt',i.created_at,'updatedAt',i.updated_at,
   'access',public.hsi_inv_visible(v_principal,i.id),'owner',i.owner_id=v_principal) ORDER BY i.updated_at DESC)
  FROM public.hsi_investigations i WHERE public.hsi_inv_visible(v_principal,i.id) IS NOT NULL),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.hsi_inv_get(p_token text,p_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token); v_access text:=public.hsi_inv_visible(v_principal,p_id);
BEGIN
 IF v_access IS NULL THEN RAISE EXCEPTION 'Investigation not found' USING ERRCODE='P0002'; END IF;
 RETURN (SELECT jsonb_build_object(
  'id',i.id,'question',i.question,'entities',i.entities,'scope',i.scope_id,'shared',i.shared,'status',i.status,
  'graphVersion',i.graph_version,'createdAt',i.created_at,'updatedAt',i.updated_at,'access',v_access,
  'events',COALESCE((SELECT jsonb_agg(jsonb_build_object('seq',e.seq,'kind',e.kind,'payload',e.payload,
    'payloadDigest',e.payload_digest,'runId',e.run_id,'byOwner',e.actor_id=i.owner_id,'at',e.created_at) ORDER BY e.seq)
    FROM public.hsi_investigation_events e WHERE e.investigation_id=i.id),'[]'::jsonb),
  'outputs',COALESCE((SELECT jsonb_agg(jsonb_build_object('section',o.section,'version',o.version,'body',o.body,
    'lineage',o.lineage,'digest',o.digest,'at',o.created_at) ORDER BY o.section,o.version)
    FROM public.hsi_investigation_outputs o WHERE o.investigation_id=i.id),'[]'::jsonb))
  FROM public.hsi_investigations i WHERE i.id=p_id);
END $$;

CREATE OR REPLACE FUNCTION public.hsi_scope_list(p_token text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token);
BEGIN
 RETURN jsonb_build_object(
  'scopes',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id,'name',s.name) ORDER BY s.name) FROM public.hsi_scopes s WHERE s.active),'[]'::jsonb),
  'memberships',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',m.id,'scope',m.scope_id,'role',m.role,'grantedAt',m.granted_at) ORDER BY m.scope_id,m.role)
   FROM public.hsi_memberships m JOIN public.hsi_scopes s ON s.id=m.scope_id WHERE m.principal_id=v_principal AND m.revoked_at IS NULL AND s.active),'[]'::jsonb),
  'members',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',m.id,'principal',m.principal_id,'scope',m.scope_id,'role',m.role,'grantedBy',m.granted_by) ORDER BY m.scope_id,m.principal_id)
   FROM public.hsi_memberships m WHERE m.revoked_at IS NULL AND public.hsi_scope_member(v_principal,m.scope_id,'admin')),'[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.hsi_scope_create(p_token text,p_id text,p_name text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token);
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.hsi_research_access a WHERE a.principal_id=v_principal AND a.access_role='research_admin' AND a.revoked_at IS NULL) THEN
  RAISE EXCEPTION 'Research admin access required' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.hsi_scopes(id,name,created_by) VALUES(p_id,p_name,v_principal);
END $$;

CREATE OR REPLACE FUNCTION public.hsi_membership_grant(p_token text,p_principal text,p_scope text,p_role text) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token); v_id bigint;
BEGIN
 IF p_principal=v_principal THEN RAISE EXCEPTION 'Self-grant is not permitted' USING ERRCODE='42501'; END IF;
 IF NOT public.hsi_scope_member(v_principal,p_scope,'admin') THEN RAISE EXCEPTION 'Scope admin required' USING ERRCODE='42501'; END IF;
 INSERT INTO public.hsi_memberships(principal_id,scope_id,role,granted_by) VALUES(p_principal,p_scope,p_role,v_principal) RETURNING id INTO v_id;
 RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_membership_revoke(p_token text,p_membership bigint) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_session_principal(p_token); v_scope text;
BEGIN
 SELECT scope_id INTO v_scope FROM public.hsi_memberships WHERE id=p_membership AND revoked_at IS NULL;
 IF v_scope IS NULL OR NOT public.hsi_scope_member(v_principal,v_scope,'admin') THEN
  RAISE EXCEPTION 'Membership not found' USING ERRCODE='P0002';
 END IF;
 UPDATE public.hsi_memberships SET revoked_at=now(),revoked_by=v_principal WHERE id=p_membership;
END $$;

-- Operator-only: the first admin of a scope. Never granted to the runtime role. Refused once a scope has an admin.
CREATE OR REPLACE FUNCTION public.hsi_membership_bootstrap(p_principal text,p_scope text,p_operator text) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_id bigint;
BEGIN
 IF EXISTS(SELECT 1 FROM public.hsi_memberships WHERE scope_id=p_scope AND role='admin' AND revoked_at IS NULL) THEN
  RAISE EXCEPTION 'This scope already has an admin; grant through hsi_membership_grant' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.hsi_memberships(principal_id,scope_id,role,granted_by) VALUES(p_principal,p_scope,'admin','bootstrap:'||p_operator) RETURNING id INTO v_id;
 RETURN v_id;
END $$;

DO $r$
DECLARE f text;
BEGIN
 FOREACH f IN ARRAY ARRAY['hsi_session_principal(text)','hsi_scope_member(text,text,text)','hsi_inv_visible(text,uuid)','hsi_inv_owned(text,uuid)',
  'hsi_inv_log(uuid,text,text,jsonb,text)','hsi_inv_create(text,text,text,jsonb,text)','hsi_inv_append_event(text,uuid,text,jsonb,text)',
  'hsi_inv_add_output(text,uuid,text,jsonb,jsonb)','hsi_inv_set_status(text,uuid,text)','hsi_inv_share(text,uuid,text,boolean)',
  'hsi_inv_list(text)','hsi_inv_get(text,uuid)','hsi_scope_list(text)','hsi_scope_create(text,text,text)',
  'hsi_membership_grant(text,text,text,text)','hsi_membership_revoke(text,bigint)','hsi_membership_bootstrap(text,text,text)'] LOOP
  EXECUTE 'REVOKE ALL ON FUNCTION public.'||f||' FROM PUBLIC';
 END LOOP;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='hsi_graph_runtime') THEN
  REVOKE ALL ON public.hsi_scopes,public.hsi_memberships,public.hsi_investigations,public.hsi_investigation_events,public.hsi_investigation_outputs FROM hsi_graph_runtime;
  GRANT EXECUTE ON FUNCTION public.hsi_inv_create(text,text,text,jsonb,text),public.hsi_inv_append_event(text,uuid,text,jsonb,text),
   public.hsi_inv_add_output(text,uuid,text,jsonb,jsonb),public.hsi_inv_set_status(text,uuid,text),public.hsi_inv_share(text,uuid,text,boolean),
   public.hsi_inv_list(text),public.hsi_inv_get(text,uuid),public.hsi_scope_list(text),public.hsi_scope_create(text,text,text),
   public.hsi_membership_grant(text,text,text,text),public.hsi_membership_revoke(text,bigint) TO hsi_graph_runtime;
 END IF;
END $r$;
