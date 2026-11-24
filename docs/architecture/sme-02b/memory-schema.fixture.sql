-- Run only in a disposable PostgreSQL database after candidate schema.
-- Transaction rolls back all fixtures. No Neon credentials needed.
BEGIN;
INSERT INTO hsi_memory.records(tenant_id,scope_id,id,owner_id,kind,data_class,current_version,retention_until)
VALUES('fixture-a','scope-a','00000000-0000-4000-8000-000000000001','alice','note','synthetic_demo',1,now()+interval '1 day');
INSERT INTO hsi_memory.versions(tenant_id,scope_id,record_id,version,body)
VALUES('fixture-a','scope-a','00000000-0000-4000-8000-000000000001',1,'synthetic');
SET CONSTRAINTS ALL IMMEDIATE;
DO $$ BEGIN
 BEGIN
 INSERT INTO hsi_memory.versions(tenant_id,scope_id,record_id,version,body)
 VALUES('fixture-b','scope-a','00000000-0000-4000-8000-000000000001',2,'invalid');
 RAISE EXCEPTION 'Cross-tenant foreign key unexpectedly accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 BEGIN
 UPDATE hsi_memory.records SET scientific_claim_allowed=true;
 RAISE EXCEPTION 'Claim promotion unexpectedly accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
 UPDATE hsi_memory.records SET current_version=99;
 RAISE EXCEPTION 'Missing version unexpectedly accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='hsi_memory' AND c.relkind='r' AND c.relrowsecurity AND c.relforcerowsecurity)<>4
 THEN RAISE EXCEPTION 'Forced RLS missing'; END IF;
END $$;
ROLLBACK;
-- These are structural checks under a privileged fixture runner, not proof
-- of runtime tenant isolation. Role/session/adapter tests remain mandatory.
