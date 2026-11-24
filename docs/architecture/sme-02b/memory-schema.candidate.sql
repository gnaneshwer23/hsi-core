-- SME-02B candidate only. Outside migration runner. No runtime grants.
-- Registry and identity owner decisions required before executable migration.
CREATE SCHEMA hsi_memory;
REVOKE ALL ON SCHEMA hsi_memory FROM PUBLIC;
CREATE TABLE hsi_memory.records (
 tenant_id text NOT NULL, scope_id text NOT NULL, id uuid NOT NULL,
 owner_id text NOT NULL, kind text NOT NULL CHECK(kind IN ('note','preference','hypothesis','evidence_reference','investigation_reference')),
 visibility text NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','shared')),
 state text NOT NULL DEFAULT 'active' CHECK(state IN ('active','revoked','deleted')),
 data_class text NOT NULL CHECK(data_class IN ('synthetic_demo','public_biomedical')),
 current_version integer NOT NULL CHECK(current_version>0),
 retention_until timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 scientific_claim_allowed boolean NOT NULL DEFAULT false CHECK(NOT scientific_claim_allowed),
 PRIMARY KEY(tenant_id,scope_id,id)
);
CREATE TABLE hsi_memory.versions (
 tenant_id text NOT NULL, scope_id text NOT NULL, record_id uuid NOT NULL,
 version integer NOT NULL CHECK(version>0), body text NOT NULL CHECK(octet_length(body)<=65536),
 source_refs jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(source_refs)='array'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,scope_id,record_id,version),
 FOREIGN KEY(tenant_id,scope_id,record_id) REFERENCES hsi_memory.records(tenant_id,scope_id,id) ON DELETE CASCADE
);
ALTER TABLE hsi_memory.records ADD FOREIGN KEY(tenant_id,scope_id,id,current_version)
 REFERENCES hsi_memory.versions(tenant_id,scope_id,record_id,version) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE hsi_memory.grants (
 tenant_id text NOT NULL, scope_id text NOT NULL, record_id uuid NOT NULL,
 principal_id text NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz,
 PRIMARY KEY(tenant_id,scope_id,record_id,principal_id),
 FOREIGN KEY(tenant_id,scope_id,record_id) REFERENCES hsi_memory.records(tenant_id,scope_id,id) ON DELETE CASCADE
);
CREATE TABLE hsi_memory.events (
 event_id uuid PRIMARY KEY, tenant_id text NOT NULL, scope_id text NOT NULL,
 record_id uuid NOT NULL, actor_id text NOT NULL, operation text NOT NULL
 CHECK(operation IN ('create','revise','grant','revoke','delete','export','correction_proposal')),
 version integer NOT NULL CHECK(version>0), request_id uuid NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,actor_id,operation,request_id)
);
CREATE INDEX memory_owner_scope ON hsi_memory.records(tenant_id,scope_id,owner_id) WHERE state='active';
CREATE INDEX memory_grantee_scope ON hsi_memory.grants(tenant_id,scope_id,principal_id) WHERE revoked_at IS NULL;
ALTER TABLE hsi_memory.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.records FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.versions FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.grants FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA hsi_memory FROM PUBLIC;
-- No permissive RLS policies, no SECURITY DEFINER functions, no runtime grants.
-- Deliberately inaccessible until verified session + canonical membership adapter approved.
