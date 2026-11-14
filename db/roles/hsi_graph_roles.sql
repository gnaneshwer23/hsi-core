-- OWNER STEP. NOT A MIGRATION: it is not run by db:migrate and creates cluster-level roles. DRAFT, NOT APPLIED.
-- Creates the least-privilege roles for the graph workspace (held migrations 031 to 033). Idempotent. It sets no
-- passwords: login roles have none until an owner sets one out of band (Neon console or API, never in SQL or chat).
-- Run it as the project owner, first, on a DISPOSABLE Neon child branch (see docs/GRAPH_WORKSPACE_REHEARSAL_RUNBOOK.md),
-- and again on the real branch only after the rehearsal is accepted.
--
--   hsi_graph_function_owner   LOGIN, no superuser, no BYPASSRLS. Runs 031 to 033 and owns the tables and procedures.
--                              Do NOT run the migrations as neondb_owner or any superuser or BYPASSRLS role: that would
--                              hide a missing policy. Needs read access to Neon Auth tables, granted below.
--   hsi_graph_runtime          NOLOGIN group. EXECUTE on the six public procedures only (granted by 032). No table access.
--   hsi_graph_runtime_login    LOGIN member of the group; the application connects as this role.
--   hsi_ontology_import        NOLOGIN group. INSERT on the two ontology tables only (granted by 033).
--   hsi_ontology_import_login  LOGIN member of the group; used only by the import script, never by the web runtime.
--
-- ROLLBACK (after dropping what the migrations created):
--   REASSIGN OWNED BY hsi_graph_function_owner TO <owner>; DROP OWNED BY hsi_graph_function_owner;
--   DROP OWNED BY hsi_graph_runtime; DROP OWNED BY hsi_ontology_import;
--   DROP ROLE hsi_graph_runtime_login, hsi_ontology_import_login, hsi_graph_runtime, hsi_ontology_import, hsi_graph_function_owner;
DO $r$
DECLARE r record;
BEGIN
 FOR r IN SELECT * FROM (VALUES
   ('hsi_graph_function_owner',true),('hsi_graph_runtime',false),('hsi_graph_runtime_login',true),
   ('hsi_ontology_import',false),('hsi_ontology_import_login',true)) AS v(name,login) LOOP
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=r.name) THEN
   EXECUTE format('CREATE ROLE %I %s NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION',r.name,CASE WHEN r.login THEN 'LOGIN' ELSE 'NOLOGIN' END);
  ELSE
   -- Re-assert the safe attributes on an existing role instead of trusting it.
   EXECUTE format('ALTER ROLE %I NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION',r.name);
  END IF;
 END LOOP;
END $r$;
GRANT hsi_graph_runtime TO hsi_graph_runtime_login;
GRANT hsi_ontology_import TO hsi_ontology_import_login;
-- The migrations create objects in schema public.
GRANT USAGE,CREATE ON SCHEMA public TO hsi_graph_function_owner;
GRANT USAGE ON SCHEMA public TO hsi_graph_runtime,hsi_ontology_import;
-- The session-validating procedures read Neon Auth and the researcher grant table as the function owner.
DO $a$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='neon_auth') THEN
  GRANT USAGE ON SCHEMA neon_auth TO hsi_graph_function_owner;
  GRANT SELECT ON neon_auth.session,neon_auth."user" TO hsi_graph_function_owner;
 ELSE
  RAISE NOTICE 'Schema neon_auth not found: Neon Auth is not provisioned here, so session-validating procedures cannot work yet.';
 END IF;
 IF to_regclass('public.hsi_research_access') IS NOT NULL THEN
  GRANT SELECT ON public.hsi_research_access TO hsi_graph_function_owner;
 ELSE
  RAISE NOTICE 'Table hsi_research_access not found: migration 006 has not been applied here.';
 END IF;
END $a$;
