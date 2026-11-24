-- Disposable CI database ONLY; never apply to Neon or production.
\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA neon_auth;
CREATE TABLE neon_auth."user"(id text PRIMARY KEY,"emailVerified" boolean,banned boolean);
CREATE TABLE neon_auth.session(token text,"userId" text,"expiresAt" timestamptz,"impersonatedBy" text);
INSERT INTO neon_auth."user" VALUES('alice',true,false),('bob',true,false),('carol',true,false);
INSERT INTO neon_auth.session SELECT 'synthetic-token-'||id,id,now()+interval '1 hour',NULL FROM neon_auth."user";
\ir memory-schema.candidate.sql
\ir memory-identity.candidate.sql
\ir scope-registry.candidate.sql
\ir memory-procedures.candidate.sql
\ir memory-mutations.candidate.sql
\ir memory-lifecycle.candidate.sql
\ir memory-retention.candidate.sql
CREATE ROLE sme_fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE sme_fixture_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE sme_fixture_scheduler NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA hsi_memory TO sme_fixture_scheduler;
GRANT EXECUTE ON FUNCTION hsi_memory.sweep_expired(integer) TO sme_fixture_scheduler;
GRANT USAGE ON SCHEMA hsi_memory TO sme_fixture_owner,sme_fixture_runtime;
GRANT USAGE ON SCHEMA neon_auth TO sme_fixture_owner;
GRANT SELECT ON ALL TABLES IN SCHEMA neon_auth TO sme_fixture_owner;
GRANT SELECT ON public.hsi_scopes,public.hsi_memberships TO sme_fixture_owner;
CREATE POLICY fixture_owner_scopes ON public.hsi_scopes TO sme_fixture_owner USING(true);
CREATE POLICY fixture_owner_memberships ON public.hsi_memberships TO sme_fixture_owner USING(true);
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA hsi_memory TO sme_fixture_owner;
CREATE POLICY fixture_owner_records ON hsi_memory.records TO sme_fixture_owner USING(true) WITH CHECK(true);
CREATE POLICY fixture_owner_versions ON hsi_memory.versions TO sme_fixture_owner USING(true) WITH CHECK(true);
CREATE POLICY fixture_owner_grants ON hsi_memory.grants TO sme_fixture_owner USING(true) WITH CHECK(true);
CREATE POLICY fixture_owner_events ON hsi_memory.events TO sme_fixture_owner USING(true) WITH CHECK(true);
CREATE POLICY fixture_owner_proposals ON hsi_memory.correction_proposals TO sme_fixture_owner USING(true) WITH CHECK(true);
GRANT CREATE ON SCHEMA hsi_memory TO sme_fixture_owner;
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='hsi_memory' LOOP
 EXECUTE format('ALTER FUNCTION %s OWNER TO sme_fixture_owner',f.signature);
 END LOOP;
END $$;
REVOKE CREATE ON SCHEMA hsi_memory FROM sme_fixture_owner;
GRANT EXECUTE ON FUNCTION hsi_memory.create_record(text,text,text,uuid,text,text,jsonb,timestamptz,uuid),hsi_memory.read_current(text,text,text,uuid),hsi_memory.revise(text,text,text,uuid,integer,text,jsonb,uuid),hsi_memory.set_share(text,text,text,uuid,text,timestamptz,boolean,uuid),hsi_memory.delete_record(text,text,text,uuid,uuid) TO sme_fixture_runtime;
GRANT EXECUTE ON FUNCTION hsi_memory.list_current(text,text,text,uuid,integer),hsi_memory.export_current(text,text,text,uuid,uuid),hsi_memory.propose_correction(text,text,text,uuid,integer,text,uuid) TO sme_fixture_runtime;
INSERT INTO public.hsi_scopes(tenant_id,id,name,kind,active) VALUES('a','s','A','project',true),('b','s','B','project',true);
INSERT INTO public.hsi_memberships(tenant_id,scope_id,principal_id,role,granted_by) VALUES('a','s','alice','researcher','fixture'),('a','s','carol','researcher','fixture'),('b','s','bob','researcher','fixture');
SET ROLE sme_fixture_runtime;
DO $$ DECLARE r uuid:='00000000-0000-4000-8000-000000000001'; retry_id uuid:=gen_random_uuid(); export_id uuid:=gen_random_uuid(); proposal_id uuid:=gen_random_uuid(); create_id uuid:=gen_random_uuid(); delete_id uuid:=gen_random_uuid(); BEGIN
 PERFORM hsi_memory.create_record('synthetic-token-alice','a','s',r,'note','fixture','[]',now()+interval '1 day',create_id);
 IF hsi_memory.create_record('synthetic-token-alice','a','s',r,'note','fixture','[]',now()+interval '1 day',create_id)<>r THEN RAISE EXCEPTION 'create replay failed'; END IF;
 BEGIN PERFORM hsi_memory.create_record('synthetic-token-alice','a','s',r,'note','changed','[]',now()+interval '1 day',create_id); RAISE EXCEPTION 'changed create accepted'; EXCEPTION WHEN serialization_failure THEN NULL; END;
 IF (SELECT count(*) FROM hsi_memory.read_current('synthetic-token-alice','a','s',r))<>1 THEN RAISE EXCEPTION 'owner read failed'; END IF;
 BEGIN PERFORM hsi_memory.read_current('synthetic-token-bob','a','s',r); RAISE EXCEPTION 'cross tenant read accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM 1 FROM hsi_memory.records; RAISE EXCEPTION 'direct read accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF EXISTS(SELECT 1 FROM hsi_memory.read_current('synthetic-token-carol','a','s',r)) THEN RAISE EXCEPTION 'private read accepted'; END IF;
 PERFORM hsi_memory.set_share('synthetic-token-alice','a','s',r,'carol',now()+interval '1 hour',false,gen_random_uuid());
 IF (SELECT count(*) FROM hsi_memory.read_current('synthetic-token-carol','a','s',r))<>1 THEN RAISE EXCEPTION 'share failed'; END IF;
 PERFORM hsi_memory.set_share('synthetic-token-alice','a','s',r,'carol',NULL,true,gen_random_uuid());
 IF EXISTS(SELECT 1 FROM hsi_memory.read_current('synthetic-token-carol','a','s',r)) THEN RAISE EXCEPTION 'revocation failed'; END IF;
 IF hsi_memory.revise('synthetic-token-alice','a','s',r,1,'revised','[]',retry_id)<>2 THEN RAISE EXCEPTION 'revision failed'; END IF;
 IF hsi_memory.revise('synthetic-token-alice','a','s',r,1,'revised','[]',retry_id)<>2 THEN RAISE EXCEPTION 'replay failed'; END IF;
 BEGIN PERFORM hsi_memory.revise('synthetic-token-alice','a','s',r,1,'changed','[]',retry_id); RAISE EXCEPTION 'changed replay accepted'; EXCEPTION WHEN serialization_failure THEN NULL; END;
 BEGIN PERFORM hsi_memory.revise('synthetic-token-alice','a','s',r,1,'stale','[]',gen_random_uuid()); RAISE EXCEPTION 'stale revision accepted'; EXCEPTION WHEN serialization_failure THEN NULL; END;
 IF (SELECT count(*) FROM hsi_memory.list_current('synthetic-token-alice','a','s',NULL,10))<>1 THEN RAISE EXCEPTION 'list failed'; END IF;
 IF EXISTS(SELECT 1 FROM hsi_memory.list_current('synthetic-token-carol','a','s',NULL,10)) THEN RAISE EXCEPTION 'revoked list leaked'; END IF;
 BEGIN PERFORM hsi_memory.list_current('synthetic-token-bob','a','s',NULL,10); RAISE EXCEPTION 'cross tenant list accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF (SELECT count(*) FROM hsi_memory.export_current('synthetic-token-alice','a','s',r,export_id))<>1 THEN RAISE EXCEPTION 'export failed'; END IF;
 BEGIN PERFORM hsi_memory.export_current('synthetic-token-carol','a','s',r,gen_random_uuid()); RAISE EXCEPTION 'nonowner export accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF (SELECT count(*) FROM hsi_memory.export_current('synthetic-token-alice','a','s',r,export_id))<>1 THEN RAISE EXCEPTION 'export replay failed'; END IF;
 PERFORM hsi_memory.propose_correction('synthetic-token-alice','a','s',r,2,'unverified proposal',proposal_id);
 IF hsi_memory.propose_correction('synthetic-token-alice','a','s',r,2,'unverified proposal',proposal_id)<>proposal_id THEN RAISE EXCEPTION 'proposal replay failed'; END IF;
 BEGIN PERFORM hsi_memory.propose_correction('synthetic-token-alice','a','s',r,2,'changed proposal',proposal_id); RAISE EXCEPTION 'changed proposal accepted'; EXCEPTION WHEN serialization_failure THEN NULL; END;
 IF (SELECT version FROM hsi_memory.read_current('synthetic-token-alice','a','s',r))<>2 THEN RAISE EXCEPTION 'proposal changed memory'; END IF;
 PERFORM hsi_memory.delete_record('synthetic-token-alice','a','s',r,delete_id);
 PERFORM hsi_memory.delete_record('synthetic-token-alice','a','s',r,delete_id);
 IF EXISTS(SELECT 1 FROM hsi_memory.read_current('synthetic-token-alice','a','s',r)) THEN RAISE EXCEPTION 'deleted record visible'; END IF;
END $$;
RESET ROLE;
DO $fixture$ BEGIN IF EXISTS(SELECT 1 FROM hsi_memory.correction_proposals) THEN RAISE EXCEPTION 'proposal deletion failed'; END IF; END $fixture$;
-- Seed expired and active records as fixture administrator.
INSERT INTO hsi_memory.records(tenant_id,scope_id,id,owner_id,kind,data_class,current_version,retention_until) VALUES
('a','s','00000000-0000-4000-8000-000000000002','alice','note','synthetic_demo',1,now()-interval '1 day'),
('a','s','00000000-0000-4000-8000-000000000003','alice','note','synthetic_demo',1,now()+interval '1 day');
INSERT INTO hsi_memory.versions(tenant_id,scope_id,record_id,version,body) SELECT tenant_id,scope_id,id,1,'fixture' FROM hsi_memory.records;
SET ROLE sme_fixture_runtime;
DO $retention$ BEGIN
 IF EXISTS(SELECT 1 FROM hsi_memory.read_current('synthetic-token-alice','a','s','00000000-0000-4000-8000-000000000002')) THEN RAISE EXCEPTION 'expired read'; END IF;
 BEGIN PERFORM hsi_memory.sweep_expired(1); RAISE EXCEPTION 'runtime sweep accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $retention$;
RESET ROLE;
SET ROLE sme_fixture_scheduler;
DO $retention$ BEGIN
 IF hsi_memory.sweep_expired(1)<>1 OR hsi_memory.sweep_expired(1)<>0 THEN RAISE EXCEPTION 'sweep count failed'; END IF;
END $retention$;
RESET ROLE;
DO $retention$ BEGIN
 IF (SELECT count(*) FROM hsi_memory.records)<>1 OR (SELECT count(*) FROM hsi_memory.versions)<>1 OR (SELECT count(*) FROM hsi_memory.events WHERE operation='retention_delete')<>1 THEN RAISE EXCEPTION 'retention cascade or audit failed'; END IF;
END $retention$;
SET CONSTRAINTS ALL IMMEDIATE;
ROLLBACK;
