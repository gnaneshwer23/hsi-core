-- Disposable PostgreSQL only. Run as fixture administrator after schema.
BEGIN;
CREATE SCHEMA neon_auth;
CREATE TABLE neon_auth."user"(id text PRIMARY KEY,"emailVerified" boolean,banned boolean);
CREATE TABLE neon_auth.session(token text,"userId" text,"expiresAt" timestamptz,"impersonatedBy" text);
INSERT INTO neon_auth."user" VALUES('alice',true,false),('bob',true,false),('banned',true,true);
INSERT INTO neon_auth.session VALUES
 ('fixture-alice-token-001','alice',now()+interval '1 hour',NULL),
 ('fixture-bob-token-00001','bob',now()+interval '1 hour',NULL),
 ('fixture-expired-token-1','alice',now()-interval '1 hour',NULL),
 ('fixture-banned-token-01','banned',now()+interval '1 hour',NULL),
 ('fixture-impersonated-01','alice',now()+interval '1 hour','bob');
\ir memory-identity.candidate.sql
\ir memory-procedures.candidate.sql
DO $$ BEGIN
 IF hsi_memory.resolve_principal('fixture-alice-token-001') IS DISTINCT FROM 'alice' THEN RAISE EXCEPTION 'valid session failed'; END IF;
 IF hsi_memory.resolve_principal('fixture-bob-token-00001') IS DISTINCT FROM 'bob' THEN RAISE EXCEPTION 'second session failed'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(ARRAY['fixture-expired-token-1','fixture-banned-token-01','fixture-impersonated-01','fixture-unknown-token-01']) t(token) WHERE hsi_memory.resolve_principal(t.token) IS NOT NULL) THEN RAISE EXCEPTION 'invalid session accepted'; END IF;
 PERFORM set_config('hsi.live_owner_id','alice',true);
 IF hsi_memory.resolve_principal('fixture-unknown-token-01') IS NOT NULL THEN RAISE EXCEPTION 'forged setting accepted'; END IF;
 IF hsi_memory.active_membership('alice','tenant-a','scope-a') IS DISTINCT FROM false THEN RAISE EXCEPTION 'unapproved membership accepted'; END IF;
 BEGIN
 PERFORM hsi_memory.read_current('fixture-alice-token-001','tenant-b','scope-b','00000000-0000-4000-8000-000000000001');
 RAISE EXCEPTION 'unapproved read accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
-- No positive membership or live Neon isolation claim.
