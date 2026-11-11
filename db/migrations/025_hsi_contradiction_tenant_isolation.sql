-- P0.2.3: HELD tenant-isolated contradiction persistence policy design.
-- Requires 024. No client-controlled GUC tenant identity is trusted.
-- No role grants or activation; privileged backend must prove verified principal
-- through a non-forgeable database role/transaction binding before applying.
CREATE TABLE IF NOT EXISTS hsi_contradiction_tenant_memberships (
 tenant_id text NOT NULL CHECK(length(trim(tenant_id))>0),
 principal_id text NOT NULL CHECK(length(trim(principal_id))>0),
 member_role text NOT NULL CHECK(member_role IN ('researcher','scientific_reviewer')),
 granted_by text NOT NULL CHECK(length(trim(granted_by))>0),
 granted_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 PRIMARY KEY(tenant_id,principal_id,member_role),
 CHECK(revoked_at IS NULL OR revoked_at>=granted_at)
);
ALTER TABLE hsi_contradiction_tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_contradiction_tenant_memberships FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_contradiction_tenant_memberships FROM PUBLIC;
-- Strong referential tenant isolation: review events must reference same-tenant parent.
ALTER TABLE hsi_contradiction_records
 ADD CONSTRAINT hsi_contradiction_id_tenant_unique UNIQUE(id,tenant_id);
ALTER TABLE hsi_contradiction_review_events
 ADD CONSTRAINT hsi_contradiction_review_parent_tenant_fk
 FOREIGN KEY(contradiction_id,tenant_id)
 REFERENCES hsi_contradiction_records(id,tenant_id);
-- No policies. All ordinary reads/writes remain denied.
-- Before activating, add server-verified principal binding, RLS and role grants
-- in a separate reviewed migration and demonstrate non-spoofability.
