-- P0.2.8 HELD: staging-only restricted database API. No runtime activation.
-- Dedicated NOLOGIN roles; deployer must explicitly provision a separate LOGIN role.
CREATE ROLE hsi_contradiction_function_owner NOLOGIN NOINHERIT NOBYPASSRLS;
CREATE ROLE hsi_contradiction_runtime NOLOGIN NOINHERIT NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO hsi_contradiction_function_owner,hsi_contradiction_runtime;
GRANT SELECT ON public.hsi_research_access,public.hsi_reviewer_authority TO hsi_contradiction_function_owner;
GRANT SELECT ON public.hsi_contradiction_tenant_memberships TO hsi_contradiction_function_owner;
GRANT SELECT,INSERT ON public.hsi_contradiction_records,public.hsi_contradiction_review_events TO hsi_contradiction_function_owner;
CREATE POLICY hsi_contradiction_owner_read ON public.hsi_contradiction_records FOR SELECT TO hsi_contradiction_function_owner USING (true);
CREATE POLICY hsi_contradiction_owner_insert ON public.hsi_contradiction_records FOR INSERT TO hsi_contradiction_function_owner WITH CHECK (true);
CREATE POLICY hsi_contradiction_owner_review_read ON public.hsi_contradiction_review_events FOR SELECT TO hsi_contradiction_function_owner USING (true);
CREATE POLICY hsi_contradiction_owner_review_insert ON public.hsi_contradiction_review_events FOR INSERT TO hsi_contradiction_function_owner WITH CHECK (true);
CREATE POLICY hsi_contradiction_owner_membership_read ON public.hsi_contradiction_tenant_memberships FOR SELECT TO hsi_contradiction_function_owner USING (true);
GRANT EXECUTE ON FUNCTION public.hsi_contradiction_session_principal(text) TO hsi_contradiction_function_owner;
GRANT hsi_contradiction_function_owner TO neondb_owner WITH SET TRUE;
ALTER FUNCTION public.hsi_contradiction_create(text,text,text,text,text,text,text,jsonb,jsonb) OWNER TO hsi_contradiction_function_owner;
ALTER FUNCTION public.hsi_contradiction_review(text,text,text,text,text,text) OWNER TO hsi_contradiction_function_owner;
REVOKE hsi_contradiction_function_owner FROM neondb_owner;
GRANT EXECUTE ON FUNCTION public.hsi_contradiction_create(text,text,text,text,text,text,text,jsonb,jsonb) TO hsi_contradiction_runtime;
GRANT EXECUTE ON FUNCTION public.hsi_contradiction_review(text,text,text,text,text,text) TO hsi_contradiction_runtime;
REVOKE ALL ON FUNCTION public.hsi_contradiction_session_principal(text) FROM hsi_contradiction_runtime;
