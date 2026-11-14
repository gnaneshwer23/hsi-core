-- Behavioural checks for held migration 031. Run ONLY against a disposable database or a disposable Neon child branch,
-- never production. It creates a role, inserts rows and rolls everything back; it fails loudly if a guarantee breaks.
--   psql "$DISPOSABLE_URL" -v ON_ERROR_STOP=1 -f db/migrations/031_hsi_graph_workspace_storage.sql  (after creating role below)
--   psql "$DISPOSABLE_URL" -v ON_ERROR_STOP=1 -f db/verify/031_graph_workspace_storage_checks.sql
BEGIN;
\i db/migrations/031_hsi_graph_workspace_storage.sql

INSERT INTO public.hsi_ontology_releases VALUES('MONDO','v1','Mondo','CC BY 4.0','https://example.test/mondo.json',repeat('a',64),10,2,NULL,'2026-11-14','curator',now());
INSERT INTO public.hsi_ontology_terms VALUES('MONDO','v1','MONDO:0000001','disease','{}','{}',false),('MONDO','v1','MONDO:0000002','old','{}','{}',true);

-- Each expected failure must happen for the intended reason, not for any error (a typo would otherwise pass).
CREATE OR REPLACE FUNCTION pg_temp.expect_fail(sql text,why text) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE want text:=CASE why
 WHEN 'broken chain' THEN 'does not extend' WHEN 'skipped revision' THEN 'does not extend'
 WHEN 'approval flag true' THEN 'check constraint' WHEN 'scalar record' THEN 'check constraint' WHEN 'missing approval key' THEN 'check constraint' WHEN 'missing checks' THEN 'check constraint' WHEN 'graph version mismatch' THEN 'check constraint'
 WHEN 'update' THEN 'append-only' WHEN 'delete' THEN 'append-only' WHEN 'truncate' THEN 'append-only'
 WHEN 'terms update' THEN 'append-only' WHEN 'release delete' THEN 'append-only'
 WHEN 'obsolete term' THEN 'is obsolete' WHEN 'unknown term' THEN 'foreign key'
 WHEN 'accept without term' THEN 'check constraint' WHEN 'verified without principal' THEN 'check constraint' WHEN 'short reason' THEN 'check constraint'
 WHEN 'recommendation update' THEN 'append-only' WHEN 'recommendation delete' THEN 'append-only'
 END;
BEGIN
 IF want IS NULL THEN RAISE EXCEPTION 'no expected reason registered for %',why; END IF;
 BEGIN EXECUTE sql; EXCEPTION WHEN OTHERS THEN
  IF SQLERRM NOT ILIKE '%'||want||'%' THEN RAISE EXCEPTION 'check "%" failed for the wrong reason: %',why,SQLERRM; END IF;
  RETURN;
 END;
 RAISE EXCEPTION 'EXPECTED FAILURE DID NOT HAPPEN: %',why;
END $f$;
CREATE OR REPLACE FUNCTION pg_temp.rec(inv text,rev int,prev text,dig text,approval text DEFAULT 'false') RETURNS jsonb LANGUAGE sql AS $f$
 SELECT jsonb_build_object('schemaVersion','hsi-graph-investigation-1','graphVersion',repeat('b',64),'context',jsonb_build_object('graphVersion',repeat('b',64),'investigationId',inv),'checks',jsonb_build_object('candidateOnly',true,'scopedToSnapshot',true),'scientificApproval',approval::jsonb)
$f$;

-- Investigations: valid chain accepted.
INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-001',1,repeat('b',64),repeat('1',64),NULL,pg_temp.rec('inv-001',1,NULL,repeat('1',64)));
INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-001',2,repeat('b',64),repeat('2',64),repeat('1',64),pg_temp.rec('inv-001',2,repeat('1',64),repeat('2',64)));
-- Rejected: wrong chain, skipped revision, approval flag, scope mismatch, mutation, delete, truncate.
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-001',3,repeat('b',64),repeat('3',64),repeat('9',64),pg_temp.rec('inv-001',3,NULL,NULL))$q$,'broken chain');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-001',5,repeat('b',64),repeat('5',64),repeat('2',64),pg_temp.rec('inv-001',5,NULL,NULL))$q$,'skipped revision');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-002',1,repeat('b',64),repeat('4',64),NULL,pg_temp.rec('inv-002',1,NULL,NULL,'true'))$q$,'approval flag true');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-003',1,repeat('c',64),repeat('4',64),NULL,pg_temp.rec('inv-003',1,NULL,NULL))$q$,'graph version mismatch');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-004',1,repeat('b',64),repeat('8',64),NULL,to_jsonb(pg_temp.rec('inv-004',1,NULL,NULL)::text))$q$,'scalar record');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-005',1,repeat('b',64),repeat('9',64),NULL,pg_temp.rec('inv-005',1,NULL,NULL)-'scientificApproval')$q$,'missing approval key');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record) VALUES('u1','inv-006',1,repeat('b',64),repeat('a',64),NULL,pg_temp.rec('inv-006',1,NULL,NULL)-'checks')$q$,'missing checks');
SELECT pg_temp.expect_fail($q$UPDATE public.hsi_graph_investigations SET review_status='unreviewed'$q$,'update');
SELECT pg_temp.expect_fail($q$DELETE FROM public.hsi_graph_investigations$q$,'delete');
SELECT pg_temp.expect_fail($q$TRUNCATE public.hsi_graph_investigations$q$,'truncate');
SELECT pg_temp.expect_fail($q$UPDATE public.hsi_ontology_terms SET label='changed'$q$,'terms update');
SELECT pg_temp.expect_fail($q$DELETE FROM public.hsi_ontology_releases$q$,'release delete');

-- Mapping recommendations: valid, then each guard.
INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,concept_id,revision,decision,ontology_prefix,ontology_release,ontology_term_id,reason,reviewer_label,candidates_digest,digest,previous_digest) VALUES('u1','concept:a',1,'accept_candidate','MONDO','v1','MONDO:0000001','Label and synonym agree.','Curator A',repeat('d',64),repeat('1',64),NULL);
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,concept_id,revision,decision,ontology_prefix,ontology_release,ontology_term_id,reason,reviewer_label,candidates_digest,digest,previous_digest) VALUES('u1','concept:b',1,'accept_candidate','MONDO','v1','MONDO:0000002','Names an obsolete term.','Curator A',repeat('d',64),repeat('2',64),NULL)$q$,'obsolete term');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,concept_id,revision,decision,ontology_prefix,ontology_release,ontology_term_id,reason,reviewer_label,candidates_digest,digest,previous_digest) VALUES('u1','concept:c',1,'accept_candidate','MONDO','v1','MONDO:9999999','Term does not exist here.','Curator A',repeat('d',64),repeat('3',64),NULL)$q$,'unknown term');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,concept_id,revision,decision,reason,reviewer_label,candidates_digest,digest,previous_digest) VALUES('u1','concept:d',1,'accept_candidate','Accept without naming a term.','Curator A',repeat('d',64),repeat('4',64),NULL)$q$,'accept without term');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,concept_id,revision,decision,reason,reviewer_label,candidates_digest,digest,previous_digest,reviewer_verified) VALUES('u1','concept:e',1,'defer','Claims verification, no principal.','Curator A',repeat('d',64),repeat('5',64),NULL,true)$q$,'verified without principal');
SELECT pg_temp.expect_fail($q$INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,concept_id,revision,decision,reason,reviewer_label,candidates_digest,digest,previous_digest) VALUES('u1','concept:f',1,'defer','short','Curator A',repeat('d',64),repeat('6',64),NULL)$q$,'short reason');
SELECT pg_temp.expect_fail($q$UPDATE public.hsi_ontology_mapping_recommendations SET reason='Edited afterwards by hand.'$q$,'recommendation update');
SELECT pg_temp.expect_fail($q$DELETE FROM public.hsi_ontology_mapping_recommendations$q$,'recommendation delete');

-- Access control (no direct runtime access, session-validated procedures) is checked in 032_graph_workspace_procedures_checks.sql.
SELECT 'ALL 031 CHECKS PASSED' AS result;
ROLLBACK;
