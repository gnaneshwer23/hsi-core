-- A-01 PREVIEW-ONLY PROPOSAL. HELD: never apply automatically.
-- Requires independent DBA/security review, isolated preview branch and role audit.
-- Execute as dedicated migration owner with read access to Neon Auth and research grants.
-- Function owner MUST NOT be hsi_live_runtime. Runtime cannot CREATE/ALTER in public.
CREATE OR REPLACE FUNCTION public.hsi_live_verified_owner()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, neon_auth
AS $$
 SELECT u.id::text
 FROM neon_auth.session s
 JOIN neon_auth."user" u ON u.id=s."userId"
 JOIN public.hsi_research_access a ON a.principal_id=u.id::text
 WHERE s.token = NULLIF(current_setting('hsi.live_session_token',true),'')
   AND s."expiresAt" > now()
   AND s."impersonatedBy" IS NULL
   AND u."emailVerified" = true
   AND COALESCE(u.banned,false)=false
   AND a.access_role IN ('researcher','research_admin')
   AND a.revoked_at IS NULL
   AND a.granted_at <= now()
 LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.hsi_live_verified_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hsi_live_verified_owner() TO hsi_live_runtime;
DROP POLICY IF EXISTS hsi_live_owner_isolation ON public.hsi_live_investigations;
CREATE POLICY hsi_live_verified_session_isolation
 ON public.hsi_live_investigations FOR ALL TO hsi_live_runtime
 USING (owner_id = public.hsi_live_verified_owner())
 WITH CHECK (owner_id = public.hsi_live_verified_owner());
ALTER TABLE public.hsi_live_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_live_investigations FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.hsi_live_investigations FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE ON public.hsi_live_investigations TO hsi_live_runtime;
-- Do not grant DELETE, TRUNCATE, REFERENCES, TRIGGER or table ownership.
