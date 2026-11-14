-- DISPOSABLE DATABASE ONLY. Prepares a throwaway database for scripts/verify-graph-workspace-local.ts: stand-in
-- neon_auth schema, test users and sessions, a LOGIN runtime role, migrations 031 and 032 applied by a non-superuser
-- owner, and a small ontology release. Nothing is rolled back; drop the database afterwards.
--   createdb hsi_graph_it && psql -d hsi_graph_it -v ON_ERROR_STOP=1 -f db/verify/graph_workspace_integration_setup.sql
CREATE ROLE hsi_it_owner NOSUPERUSER NOBYPASSRLS LOGIN;
CREATE ROLE hsi_graph_runtime NOSUPERUSER NOBYPASSRLS LOGIN;
CREATE SCHEMA neon_auth;
CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY,"emailVerified" boolean NOT NULL,banned boolean);
CREATE TABLE neon_auth.session(token text PRIMARY KEY,"userId" uuid NOT NULL,"expiresAt" timestamptz NOT NULL,"impersonatedBy" text);
CREATE TABLE public.hsi_research_access(principal_id text PRIMARY KEY,access_role text NOT NULL,granted_by text NOT NULL,granted_at timestamptz NOT NULL DEFAULT now(),revoked_at timestamptz);
GRANT USAGE ON SCHEMA neon_auth TO hsi_it_owner;GRANT SELECT ON ALL TABLES IN SCHEMA neon_auth TO hsi_it_owner;GRANT SELECT ON public.hsi_research_access TO hsi_it_owner;
GRANT USAGE,CREATE ON SCHEMA public TO hsi_it_owner;GRANT USAGE ON SCHEMA public TO hsi_graph_runtime;
INSERT INTO neon_auth."user" VALUES('00000000-0000-0000-0000-00000000000a',true,false),('00000000-0000-0000-0000-00000000000b',true,false);
INSERT INTO neon_auth.session VALUES('tokenAAAAAAAAAAAAAAAA','00000000-0000-0000-0000-00000000000a',now()+interval '1 day',NULL),('tokenBBBBBBBBBBBBBBBB','00000000-0000-0000-0000-00000000000b',now()+interval '1 day',NULL);
INSERT INTO public.hsi_research_access(principal_id,access_role,granted_by) VALUES('00000000-0000-0000-0000-00000000000a','researcher','it'),('00000000-0000-0000-0000-00000000000b','researcher','it');
SET ROLE hsi_it_owner;
\i db/migrations/031_hsi_graph_workspace_storage.sql
\i db/migrations/032_hsi_graph_workspace_procedures.sql
RESET ROLE;
INSERT INTO public.hsi_ontology_releases VALUES('MONDO','v2026-11-03','Mondo','CC BY 4.0','https://example.test/mondo.json',repeat('a',64),10,3,NULL,'2026-11-14','it');
INSERT INTO public.hsi_ontology_terms VALUES('MONDO','v2026-11-03','MONDO:0008383','rheumatoid arthritis','{}','{}',false),('MONDO','v2026-11-03','MONDO:0005100','systemic sclerosis','{scleroderma}','{}',false);
