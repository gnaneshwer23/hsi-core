-- Candidate only. Extension provisioning requires separate approval.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE TABLE hsi_memory.embeddings (
 tenant_id text NOT NULL, scope_id text NOT NULL, record_id uuid NOT NULL,
 version integer NOT NULL, model text NOT NULL CHECK(length(model) BETWEEN 1 AND 128),
 dimensions integer NOT NULL CHECK(dimensions BETWEEN 1 AND 4096),
 embedding public.vector NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,scope_id,record_id,version,model),
 FOREIGN KEY(tenant_id,scope_id,record_id,version)
 REFERENCES hsi_memory.versions(tenant_id,scope_id,record_id,version) ON DELETE CASCADE,
 CHECK(public.vector_dims(embedding)=dimensions),
 CHECK(public.vector_norm(embedding)>0)
);
ALTER TABLE hsi_memory.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.embeddings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.embeddings FROM PUBLIC;
-- No runtime grants or write API. Historical embeddings must never be retrieved as current.
