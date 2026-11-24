-- Candidate queue only; no production grants or worker activation.
CREATE TABLE hsi_memory.embedding_jobs (
 tenant_id text NOT NULL, scope_id text NOT NULL, record_id uuid NOT NULL, version integer NOT NULL,
 model text NOT NULL CHECK(model='hsi-synthetic-fixture-v1'),
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','leased','succeeded','failed','cancelled')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
 available_at timestamptz NOT NULL DEFAULT now(),
 lease_id uuid, lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,scope_id,record_id,version,model),
 FOREIGN KEY(tenant_id,scope_id,record_id,version) REFERENCES hsi_memory.versions(tenant_id,scope_id,record_id,version) ON DELETE CASCADE,
 CHECK((state='leased' AND lease_id IS NOT NULL AND lease_until IS NOT NULL) OR (state<>'leased' AND lease_id IS NULL AND lease_until IS NULL))
);
CREATE INDEX embedding_jobs_ready ON hsi_memory.embedding_jobs(available_at,created_at) WHERE state='queued';
ALTER TABLE hsi_memory.embedding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.embedding_jobs FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.embedding_jobs FROM PUBLIC;
CREATE FUNCTION hsi_memory.enqueue_embedding(p_tenant text,p_scope text,p_id uuid,p_version integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $enqueue$
BEGIN
 PERFORM 1 FROM hsi_memory.records r WHERE (r.tenant_id,r.scope_id,r.id)=(p_tenant,p_scope,p_id) AND r.current_version=p_version AND r.state='active' AND r.data_class='synthetic_demo' AND r.retention_until>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO hsi_memory.embedding_jobs(tenant_id,scope_id,record_id,version,model) VALUES(p_tenant,p_scope,p_id,p_version,'hsi-synthetic-fixture-v1') ON CONFLICT DO NOTHING;
 RETURN true;
END $enqueue$;
REVOKE ALL ON FUNCTION hsi_memory.enqueue_embedding(text,text,uuid,integer) FROM PUBLIC;
