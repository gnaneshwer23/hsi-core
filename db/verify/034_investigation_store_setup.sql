-- DISPOSABLE DATABASE ONLY. Prepares a throwaway database for scripts/verify-investigation-store-local.ts: a
-- stand-in neon_auth schema, synthetic users and sessions (no real people), a LOGIN runtime role, and migration 034
-- applied by a non-superuser owner. Drop the database afterwards. Never run this against Neon.
--   createdb hsi_store_it && psql -d hsi_store_it -v ON_ERROR_STOP=1 -f db/verify/034_investigation_store_setup.sql
CREATE ROLE hsi_store_owner NOSUPERUSER NOBYPASSRLS LOGIN;
DO $r$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='hsi_graph_runtime') THEN CREATE ROLE hsi_graph_runtime NOSUPERUSER NOBYPASSRLS LOGIN; END IF; END $r$;

CREATE SCHEMA neon_auth;
CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY,"emailVerified" boolean NOT NULL,banned boolean);
CREATE TABLE neon_auth.session(token text PRIMARY KEY,"userId" uuid NOT NULL,"expiresAt" timestamptz NOT NULL,"impersonatedBy" text);
CREATE TABLE public.hsi_research_access(principal_id text PRIMARY KEY,access_role text NOT NULL,granted_by text NOT NULL,granted_at timestamptz NOT NULL DEFAULT now(),revoked_at timestamptz);
GRANT USAGE ON SCHEMA neon_auth TO hsi_store_owner;GRANT SELECT ON ALL TABLES IN SCHEMA neon_auth TO hsi_store_owner;GRANT SELECT ON public.hsi_research_access TO hsi_store_owner;
GRANT USAGE,CREATE ON SCHEMA public TO hsi_store_owner;GRANT USAGE ON SCHEMA public TO hsi_graph_runtime;
-- A, B: verified researchers. C: verified, no research access. D: unverified email. E: banned. F: research admin.
INSERT INTO neon_auth."user" VALUES
 ('00000000-0000-4000-8000-00000000000a',true,false),('00000000-0000-4000-8000-00000000000b',true,false),
 ('00000000-0000-4000-8000-00000000000c',true,false),('00000000-0000-4000-8000-00000000000d',false,false),
 ('00000000-0000-4000-8000-00000000000e',true,true),('00000000-0000-4000-8000-00000000000f',true,false);
INSERT INTO neon_auth.session VALUES
 ('tokenAAAAAAAAAAAAAAAA','00000000-0000-4000-8000-00000000000a',now()+interval '1 day',NULL),
 ('tokenBBBBBBBBBBBBBBBB','00000000-0000-4000-8000-00000000000b',now()+interval '1 day',NULL),
 ('tokenCCCCCCCCCCCCCCCC','00000000-0000-4000-8000-00000000000c',now()+interval '1 day',NULL),
 ('tokenDDDDDDDDDDDDDDDD','00000000-0000-4000-8000-00000000000d',now()+interval '1 day',NULL),
 ('tokenEEEEEEEEEEEEEEEE','00000000-0000-4000-8000-00000000000e',now()+interval '1 day',NULL),
 ('tokenFFFFFFFFFFFFFFFF','00000000-0000-4000-8000-00000000000f',now()+interval '1 day',NULL),
 ('tokenEXPIREDEXPIRED00','00000000-0000-4000-8000-00000000000a',now()-interval '1 minute',NULL),
 ('tokenIMPERSONATED0000','00000000-0000-4000-8000-00000000000a',now()+interval '1 day','support-agent');
INSERT INTO public.hsi_research_access(principal_id,access_role,granted_by) VALUES
 ('00000000-0000-4000-8000-00000000000a','researcher','it'),('00000000-0000-4000-8000-00000000000b','researcher','it'),
 ('00000000-0000-4000-8000-00000000000d','researcher','it'),('00000000-0000-4000-8000-00000000000e','researcher','it'),
 ('00000000-0000-4000-8000-00000000000f','research_admin','it');
SET ROLE hsi_store_owner;
\i db/migrations/034_hsi_investigation_store.sql
-- Operator bootstrap: A is the first admin of ssc. The runtime cannot call this.
SELECT public.hsi_membership_bootstrap('00000000-0000-4000-8000-00000000000a','ssc','it-operator');
RESET ROLE;
