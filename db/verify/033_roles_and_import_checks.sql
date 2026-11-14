-- Behavioural checks for db/roles/hsi_graph_roles.sql and held migration 033, with 031 and 032 applied by the real
-- function-owner role. DISPOSABLE database only (it creates cluster roles inside a transaction it rolls back). Run as a
-- superuser:  psql "$DISPOSABLE_URL" -v ON_ERROR_STOP=1 -f db/verify/033_roles_and_import_checks.sql
BEGIN;
CREATE SCHEMA neon_auth;
CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY,"emailVerified" boolean NOT NULL,banned boolean);
CREATE TABLE neon_auth.session(token text PRIMARY KEY,"userId" uuid NOT NULL,"expiresAt" timestamptz NOT NULL,"impersonatedBy" text);
CREATE TABLE public.hsi_research_access(principal_id text PRIMARY KEY,access_role text NOT NULL,granted_by text NOT NULL,granted_at timestamptz NOT NULL DEFAULT now(),revoked_at timestamptz);
INSERT INTO neon_auth."user" VALUES('00000000-0000-0000-0000-00000000000a',true,false);
INSERT INTO neon_auth.session VALUES('tokenAAAAAAAAAAAAAAAA','00000000-0000-0000-0000-00000000000a',now()+interval '1 hour',NULL);
INSERT INTO public.hsi_research_access(principal_id,access_role,granted_by) VALUES('00000000-0000-0000-0000-00000000000a','researcher','t');

\i db/roles/hsi_graph_roles.sql
-- Idempotent: running it again must not fail or loosen anything.
\i db/roles/hsi_graph_roles.sql
DO $$ DECLARE r record; BEGIN
 FOR r IN SELECT rolname,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolcanlogin FROM pg_roles WHERE rolname IN ('hsi_graph_function_owner','hsi_graph_runtime','hsi_graph_runtime_login','hsi_ontology_import','hsi_ontology_import_login') LOOP
  IF r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb THEN RAISE EXCEPTION 'role % has an unsafe attribute',r.rolname; END IF;
  IF r.rolname IN ('hsi_graph_runtime','hsi_ontology_import') AND r.rolcanlogin THEN RAISE EXCEPTION 'group role % must not log in',r.rolname; END IF;
  IF r.rolname LIKE '%\_login' AND NOT r.rolcanlogin THEN RAISE EXCEPTION 'login role % cannot log in',r.rolname; END IF;
 END LOOP;
 IF (SELECT count(*) FROM pg_roles WHERE rolname IN ('hsi_graph_function_owner','hsi_graph_runtime','hsi_graph_runtime_login','hsi_ontology_import','hsi_ontology_import_login'))<>5 THEN RAISE EXCEPTION 'expected five roles'; END IF;
 IF EXISTS(SELECT 1 FROM pg_authid WHERE rolname LIKE 'hsi\_%' AND rolpassword IS NOT NULL) THEN RAISE EXCEPTION 'the roles file must not set a password'; END IF;
END $$;

-- The real function owner applies the migrations (a non-superuser, as it must be).
SET LOCAL ROLE hsi_graph_function_owner;
\i db/migrations/031_hsi_graph_workspace_storage.sql
\i db/migrations/032_hsi_graph_workspace_procedures.sql
\i db/migrations/033_hsi_ontology_import_role.sql
RESET ROLE;

CREATE OR REPLACE FUNCTION pg_temp.expect_fail(sql text,why text) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE want text:=CASE why
 WHEN 'import select investigations' THEN 'permission denied' WHEN 'import update release' THEN 'permission denied' WHEN 'import delete term' THEN 'permission denied'
 WHEN 'import select terms' THEN 'permission denied' WHEN 'import call procedure' THEN 'permission denied' WHEN 'runtime insert release' THEN 'permission denied'
 WHEN 'runtime select terms' THEN 'permission denied' WHEN 'runtime principal helper' THEN 'permission denied' WHEN 'import duplicate release' THEN 'duplicate key'
 WHEN 'import orphan term' THEN 'foreign key' WHEN 'owner truncate' THEN 'append-only' END;
BEGIN
 IF want IS NULL THEN RAISE EXCEPTION 'no expected reason registered for %',why; END IF;
 BEGIN EXECUTE sql; EXCEPTION WHEN OTHERS THEN
  IF SQLERRM NOT ILIKE '%'||want||'%' THEN RAISE EXCEPTION 'check "%" failed for the wrong reason: %',why,SQLERRM; END IF;
  RETURN;
 END;
 RAISE EXCEPTION 'EXPECTED FAILURE DID NOT HAPPEN: %',why;
END $f$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_fail(text,text) TO PUBLIC;

-- Import role: may add a release and its terms, nothing more.
SET LOCAL ROLE hsi_ontology_import_login;
INSERT INTO public.hsi_ontology_releases VALUES('MONDO','v1','Mondo','CC BY 4.0','https://example.test/mondo.json',repeat('a',64),10,2,NULL,'2026-11-14','curator',now());
INSERT INTO public.hsi_ontology_terms VALUES('MONDO','v1','MONDO:0000001','disease','{illness}','{}',false),('MONDO','v1','MONDO:0000002','old','{}','{}',true);
SELECT pg_temp.expect_fail($q$SELECT * FROM public.hsi_graph_investigations$q$,'import select investigations');
SELECT pg_temp.expect_fail($q$SELECT * FROM public.hsi_ontology_terms$q$,'import select terms');
SELECT pg_temp.expect_fail($q$UPDATE public.hsi_ontology_releases SET name='x'$q$,'import update release');
SELECT pg_temp.expect_fail($q$DELETE FROM public.hsi_ontology_terms$q$,'import delete term');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenAAAAAAAAAAAAAAAA')$q$,'import call procedure');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_releases VALUES('MONDO','v1','Mondo','CC BY 4.0','https://example.test/mondo.json',repeat('a',64),10,2,NULL,'2026-11-14','curator',now())$q$,'import duplicate release');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_terms VALUES('MONDO','v9','MONDO:0000009','x','{}','{}',false)$q$,'import orphan term');
RESET ROLE;

-- Runtime login role: procedures only, no tables, no helper, no import.
SET LOCAL ROLE hsi_graph_runtime_login;
SELECT pg_temp.expect_fail($q$SELECT * FROM public.hsi_ontology_terms$q$,'runtime select terms');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_releases VALUES('GO','v1','GO','CC BY 4.0','https://example.test/go.json',repeat('b',64),10,2,NULL,'2026-11-14','x',now())$q$,'runtime insert release');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_principal('tokenAAAAAAAAAAAAAAAA')$q$,'runtime principal helper');
DO $$ DECLARE r jsonb; BEGIN
 r:=public.hsi_graph_ontology_lookup('tokenAAAAAAAAAAAAAAAA','MONDO','v1','Illness');
 IF jsonb_array_length(r)<>1 OR r->0->>'id'<>'MONDO:0000001' THEN RAISE EXCEPTION 'the runtime should read imported terms through the procedure: %',r; END IF;
 PERFORM public.hsi_graph_save_investigation('tokenAAAAAAAAAAAAAAAA','inv-role-001',1,repeat('b',64),repeat('1',64),NULL,
  jsonb_build_object('schemaVersion','hsi-graph-investigation-1','graphVersion',repeat('b',64),'context',jsonb_build_object('graphVersion',repeat('b',64),'investigationId','inv-role-001','question','Q'),'checks',jsonb_build_object('candidateOnly',true,'scopedToSnapshot',true),'scientificApproval',false));
 IF jsonb_array_length(public.hsi_graph_list_investigations('tokenAAAAAAAAAAAAAAAA'))<>1 THEN RAISE EXCEPTION 'save and list through the runtime role failed'; END IF;
END $$;
RESET ROLE;
-- Trigger functions are not callable by PUBLIC, and the triggers still fire (append-only holds for the function owner).
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'hsi\_graph\_%' AND p.prokind='f' AND has_function_privilege('public',p.oid,'EXECUTE')) THEN
  RAISE EXCEPTION 'PUBLIC can execute a graph workspace function';
 END IF;
 IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='hsi_mapping_recommendation_chain' AND has_function_privilege('public',p.oid,'EXECUTE')) THEN
  RAISE EXCEPTION 'PUBLIC can execute a trigger function';
 END IF;
END $$;
SET LOCAL ROLE hsi_graph_function_owner;
SELECT pg_temp.expect_fail($q$TRUNCATE public.hsi_graph_investigations$q$,'owner truncate');
RESET ROLE;
SELECT 'ALL 033 ROLE CHECKS PASSED' AS result;
ROLLBACK;
