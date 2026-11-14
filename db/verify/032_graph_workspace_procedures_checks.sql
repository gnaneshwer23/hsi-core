-- Behavioural checks for held migrations 031 and 032. Run ONLY against a disposable database, never production and
-- never a database whose roles you care about. It creates roles, a stand-in neon_auth schema, test users and rows,
-- and rolls everything back. The function owner is a NON-superuser on purpose: a superuser would bypass row-level
-- security and hide a missing policy. The stand-in neon_auth tables contain only the columns the procedures read.
--   psql "$DISPOSABLE_URL" -v ON_ERROR_STOP=1 -f db/verify/032_graph_workspace_procedures_checks.sql   (run as a superuser)
BEGIN;
CREATE ROLE hsi_v_owner NOSUPERUSER NOBYPASSRLS LOGIN;
CREATE ROLE hsi_graph_runtime NOSUPERUSER NOBYPASSRLS NOLOGIN;
CREATE SCHEMA neon_auth;
CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY,"emailVerified" boolean NOT NULL,banned boolean);
CREATE TABLE neon_auth.session(token text PRIMARY KEY,"userId" uuid NOT NULL,"expiresAt" timestamptz NOT NULL,"impersonatedBy" text);
CREATE TABLE public.hsi_research_access(principal_id text PRIMARY KEY,access_role text NOT NULL,granted_by text NOT NULL,granted_at timestamptz NOT NULL DEFAULT now(),revoked_at timestamptz);
GRANT USAGE ON SCHEMA neon_auth TO hsi_v_owner;GRANT SELECT ON ALL TABLES IN SCHEMA neon_auth TO hsi_v_owner;
GRANT SELECT ON public.hsi_research_access TO hsi_v_owner;GRANT USAGE,CREATE ON SCHEMA public TO hsi_v_owner;GRANT USAGE ON SCHEMA public TO hsi_graph_runtime;

-- Users: A and B are researchers; C has no access grant; D is unverified; E is banned; F is revoked; G is impersonated; H has an expired session.
INSERT INTO neon_auth."user" VALUES
 ('00000000-0000-0000-0000-00000000000a',true,false),('00000000-0000-0000-0000-00000000000b',true,false),('00000000-0000-0000-0000-00000000000c',true,false),
 ('00000000-0000-0000-0000-00000000000d',false,false),('00000000-0000-0000-0000-00000000000e',true,true),('00000000-0000-0000-0000-00000000000f',true,false),
 ('00000000-0000-0000-0000-000000000010',true,false),('00000000-0000-0000-0000-000000000011',true,false);
INSERT INTO neon_auth.session VALUES
 ('tokenAAAAAAAAAAAAAAAA','00000000-0000-0000-0000-00000000000a',now()+interval '1 hour',NULL),('tokenBBBBBBBBBBBBBBBB','00000000-0000-0000-0000-00000000000b',now()+interval '1 hour',NULL),
 ('tokenCCCCCCCCCCCCCCCC','00000000-0000-0000-0000-00000000000c',now()+interval '1 hour',NULL),('tokenDDDDDDDDDDDDDDDD','00000000-0000-0000-0000-00000000000d',now()+interval '1 hour',NULL),
 ('tokenEEEEEEEEEEEEEEEE','00000000-0000-0000-0000-00000000000e',now()+interval '1 hour',NULL),('tokenFFFFFFFFFFFFFFFF','00000000-0000-0000-0000-00000000000f',now()+interval '1 hour',NULL),
 ('tokenGGGGGGGGGGGGGGGG','00000000-0000-0000-0000-000000000010',now()+interval '1 hour','admin-1'),('tokenHHHHHHHHHHHHHHHH','00000000-0000-0000-0000-000000000011',now()-interval '1 minute',NULL);
INSERT INTO public.hsi_research_access(principal_id,access_role,granted_by,revoked_at) VALUES
 ('00000000-0000-0000-0000-00000000000a','researcher','t',NULL),('00000000-0000-0000-0000-00000000000b','researcher','t',NULL),
 ('00000000-0000-0000-0000-00000000000d','researcher','t',NULL),('00000000-0000-0000-0000-00000000000e','researcher','t',NULL),
 ('00000000-0000-0000-0000-00000000000f','researcher','t',now()-interval '1 day'),('00000000-0000-0000-0000-000000000010','researcher','t',NULL),('00000000-0000-0000-0000-000000000011','researcher','t',NULL);

-- Apply 031 and 032 as the non-superuser function owner.
SET LOCAL ROLE hsi_v_owner;
\i db/migrations/031_hsi_graph_workspace_storage.sql
\i db/migrations/032_hsi_graph_workspace_procedures.sql
GRANT EXECUTE ON FUNCTION public.hsi_graph_save_investigation(text,text,integer,text,text,text,jsonb),public.hsi_graph_list_investigations(text),public.hsi_graph_get_investigation(text,text,integer),
 public.hsi_graph_record_recommendation(text,text,integer,text,text,text,text,text,text,text,text,text,timestamptz),public.hsi_graph_list_recommendations(text),public.hsi_graph_ontology_lookup(text,text,text,text,integer) TO hsi_graph_runtime;
RESET ROLE;
-- Reference data is written by a separate import role in practice (no policy lets the function owner insert it); the superuser stands in here.
INSERT INTO public.hsi_ontology_releases VALUES('MONDO','v1','Mondo','CC BY 4.0','https://example.test/mondo.json',repeat('a',64),10,2,NULL,'2026-11-14','curator',now());
INSERT INTO public.hsi_ontology_terms VALUES('MONDO','v1','MONDO:0000001','disease','{illness}','{}',false),('MONDO','v1','MONDO:0000002','old','{}','{}',true);

CREATE OR REPLACE FUNCTION pg_temp.expect_fail(sql text,why text) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE want text:=CASE why
 WHEN 'direct select' THEN 'permission denied' WHEN 'direct insert' THEN 'permission denied' WHEN 'direct update' THEN 'permission denied'
 WHEN 'principal helper' THEN 'permission denied' WHEN 'forged guc still denied' THEN 'permission denied'
 WHEN 'bad token' THEN 'Invalid authenticated session' WHEN 'expired' THEN 'Invalid authenticated session' WHEN 'unverified email' THEN 'Invalid authenticated session'
 WHEN 'banned' THEN 'Invalid authenticated session' WHEN 'impersonated' THEN 'Invalid authenticated session' WHEN 'short token' THEN 'Invalid authenticated session'
 WHEN 'no grant' THEN 'Researcher access denied' WHEN 'revoked grant' THEN 'Researcher access denied'
 WHEN 'broken chain' THEN 'does not extend' WHEN 'approval flag' THEN 'check constraint' WHEN 'obsolete term' THEN 'is obsolete'
 WHEN 'short label' THEN 'Label must be' WHEN 'backdated' THEN 'out of range' END;
BEGIN
 IF want IS NULL THEN RAISE EXCEPTION 'no expected reason registered for %',why; END IF;
 BEGIN EXECUTE sql; EXCEPTION WHEN OTHERS THEN
  IF SQLERRM NOT ILIKE '%'||want||'%' THEN RAISE EXCEPTION 'check "%" failed for the wrong reason: %',why,SQLERRM; END IF;
  RETURN;
 END;
 RAISE EXCEPTION 'EXPECTED FAILURE DID NOT HAPPEN: %',why;
END $f$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_fail(text,text) TO PUBLIC;
CREATE OR REPLACE FUNCTION pg_temp.rec(inv text) RETURNS jsonb LANGUAGE sql AS $f$
 SELECT jsonb_build_object('schemaVersion','hsi-graph-investigation-1','graphVersion',repeat('b',64),'context',jsonb_build_object('graphVersion',repeat('b',64),'investigationId',inv,'question','Q for '||inv),
  'checks',jsonb_build_object('candidateOnly',true,'scopedToSnapshot',true),'scientificApproval',false)
$f$;
GRANT EXECUTE ON FUNCTION pg_temp.rec(text) TO PUBLIC;

SET LOCAL ROLE hsi_graph_runtime;
-- The runtime has no direct access, even with a forged owner setting.
SELECT pg_temp.expect_fail($q$SELECT * FROM public.hsi_graph_investigations$q$,'direct select');
SELECT pg_temp.expect_fail($q$SELECT * FROM public.hsi_ontology_terms$q$,'direct select');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,record) VALUES('x','inv-zzz',1,repeat('b',64),repeat('1',64),'{}')$q$,'direct insert');
SELECT pg_temp.expect_fail($q$UPDATE public.hsi_graph_investigations SET review_status='unreviewed'$q$,'direct update');
SELECT set_config('hsi.graph_owner_id','00000000-0000-0000-0000-00000000000b',true);
SELECT pg_temp.expect_fail($q$SELECT * FROM public.hsi_graph_investigations$q$,'forged guc still denied');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_principal('tokenAAAAAAAAAAAAAAAA')$q$,'principal helper');

-- Rejected sessions.
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('not-a-real-token-123')$q$,'bad token');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('short')$q$,'short token');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenHHHHHHHHHHHHHHHH')$q$,'expired');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenDDDDDDDDDDDDDDDD')$q$,'unverified email');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenEEEEEEEEEEEEEEEE')$q$,'banned');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenGGGGGGGGGGGGGGGG')$q$,'impersonated');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenCCCCCCCCCCCCCCCC')$q$,'no grant');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_list_investigations('tokenFFFFFFFFFFFFFFFF')$q$,'revoked grant');

-- Owner scoping: A saves, B cannot see it, A can.
SELECT public.hsi_graph_save_investigation('tokenAAAAAAAAAAAAAAAA','inv-a-001',1,repeat('b',64),repeat('1',64),NULL,pg_temp.rec('inv-a-001'));
SELECT public.hsi_graph_save_investigation('tokenAAAAAAAAAAAAAAAA','inv-a-001',2,repeat('b',64),repeat('2',64),repeat('1',64),pg_temp.rec('inv-a-001'));
SELECT public.hsi_graph_save_investigation('tokenBBBBBBBBBBBBBBBB','inv-b-001',1,repeat('b',64),repeat('3',64),NULL,pg_temp.rec('inv-b-001'));
DO $$ DECLARE a jsonb; b jsonb; g jsonb; BEGIN
 a:=public.hsi_graph_list_investigations('tokenAAAAAAAAAAAAAAAA');b:=public.hsi_graph_list_investigations('tokenBBBBBBBBBBBBBBBB');
 IF jsonb_array_length(a)<>1 OR a->0->>'investigationId'<>'inv-a-001' OR (a->0->>'latestRevision')::int<>2 THEN RAISE EXCEPTION 'A should see only its own latest revision: %',a; END IF;
 IF jsonb_array_length(b)<>1 OR b->0->>'investigationId'<>'inv-b-001' THEN RAISE EXCEPTION 'B should see only its own: %',b; END IF;
 IF public.hsi_graph_get_investigation('tokenBBBBBBBBBBBBBBBB','inv-a-001',1) IS NOT NULL THEN RAISE EXCEPTION 'B must not read A''s record'; END IF;
 g:=public.hsi_graph_get_investigation('tokenAAAAAAAAAAAAAAAA','inv-a-001',2);
 IF g->>'digest'<>repeat('2',64) OR g->>'previousDigest'<>repeat('1',64) THEN RAISE EXCEPTION 'A should read its own revision 2'; END IF;
END $$;
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_save_investigation('tokenAAAAAAAAAAAAAAAA','inv-a-001',3,repeat('b',64),repeat('4',64),repeat('9',64),pg_temp.rec('inv-a-001'))$q$,'broken chain');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_save_investigation('tokenAAAAAAAAAAAAAAAA','inv-a-002',1,repeat('b',64),repeat('5',64),NULL,jsonb_set(pg_temp.rec('inv-a-002'),'{scientificApproval}','true'))$q$,'approval flag');

-- Recommendations: identity comes from the session; a term must be live; reads are owner-scoped.
SELECT public.hsi_graph_record_recommendation('tokenAAAAAAAAAAAAAAAA','concept:a',1,'accept_candidate','MONDO','v1','MONDO:0000001','Label and synonym agree.','Curator A',repeat('d',64),repeat('6',64),NULL,now());
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_record_recommendation('tokenAAAAAAAAAAAAAAAA','concept:b',1,'accept_candidate','MONDO','v1','MONDO:0000002','Names an obsolete term.','Curator A',repeat('d',64),repeat('7',64),NULL,now())$q$,'obsolete term');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_record_recommendation('tokenAAAAAAAAAAAAAAAA','concept:c',1,'defer',NULL,NULL,NULL,'Backdated on purpose here.','Curator A',repeat('d',64),repeat('8',64),NULL,now()-interval '2 days')$q$,'backdated');
DO $$ DECLARE a jsonb; b jsonb; BEGIN
 a:=public.hsi_graph_list_recommendations('tokenAAAAAAAAAAAAAAAA');b:=public.hsi_graph_list_recommendations('tokenBBBBBBBBBBBBBBBB');
 IF jsonb_array_length(a)<>1 OR (a->0->>'reviewerVerified')<>'true' THEN RAISE EXCEPTION 'A should see one recommendation with a verified identity: %',a; END IF;
 IF jsonb_array_length(b)<>0 THEN RAISE EXCEPTION 'B must see none of A''s recommendations'; END IF;
END $$;

-- Ontology lookup is bounded and requires a valid session.
DO $$ DECLARE r jsonb; BEGIN
 r:=public.hsi_graph_ontology_lookup('tokenBBBBBBBBBBBBBBBB','MONDO','v1','Illness');
 IF jsonb_array_length(r)<>1 OR r->0->>'id'<>'MONDO:0000001' THEN RAISE EXCEPTION 'synonym lookup failed: %',r; END IF;
END $$;
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_ontology_lookup('tokenBBBBBBBBBBBBBBBB','MONDO','v1','ab')$q$,'short label');
SELECT pg_temp.expect_fail($q$SELECT public.hsi_graph_ontology_lookup('not-a-real-token-123','MONDO','v1','disease')$q$,'bad token');
RESET ROLE;
SELECT 'ALL 032 CHECKS PASSED' AS result;
ROLLBACK;
