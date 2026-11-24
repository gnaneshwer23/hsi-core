-- Proposed canonical ADR-014 extension, NOT an executable production migration.
CREATE TABLE public.hsi_scopes (
 tenant_id text NOT NULL, id text NOT NULL, name text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('institution','department','group','project','personal')),
 parent_id text, active boolean NOT NULL DEFAULT false,
 PRIMARY KEY(tenant_id,id),
 FOREIGN KEY(tenant_id,parent_id) REFERENCES public.hsi_scopes(tenant_id,id),
 CHECK(parent_id IS DISTINCT FROM id)
);
CREATE TABLE public.hsi_memberships (
 tenant_id text NOT NULL, scope_id text NOT NULL, principal_id text NOT NULL,
 role text NOT NULL CHECK(role IN ('researcher','reviewer','adjudicator','admin','collaborator')),
 granted_by text NOT NULL, granted_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz, expires_at timestamptz,
 PRIMARY KEY(tenant_id,scope_id,principal_id,role),
 FOREIGN KEY(tenant_id,scope_id) REFERENCES public.hsi_scopes(tenant_id,id),
 CHECK(revoked_at IS NULL OR revoked_at>=granted_at)
);
ALTER TABLE public.hsi_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_scopes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_memberships FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.hsi_scopes,public.hsi_memberships FROM PUBLIC;
-- No implicit parent inheritance. No grants or seeds. Hierarchy cycle validation
-- and provisioning authority are required before administrative writes.
CREATE OR REPLACE FUNCTION hsi_memory.active_membership(p_principal text,p_tenant text,p_scope text)
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$
 SELECT EXISTS(SELECT 1 FROM public.hsi_memberships m JOIN public.hsi_scopes s
 ON (s.tenant_id,s.id)=(m.tenant_id,m.scope_id)
 WHERE m.principal_id=p_principal AND m.tenant_id=p_tenant AND m.scope_id=p_scope
 AND s.active AND m.role IN ('researcher','collaborator') AND m.granted_at<=clock_timestamp()
 AND m.revoked_at IS NULL AND (m.expires_at IS NULL OR m.expires_at>clock_timestamp()))
$$;
REVOKE ALL ON FUNCTION hsi_memory.active_membership(text,text,text) FROM PUBLIC;
