-- Research permissions are HSI-owned, not inferred from Neon Auth global roles.
-- Provision grants only after accountable administrator approval.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_research_access (
 principal_id text PRIMARY KEY,
 access_role text NOT NULL CHECK(access_role IN ('researcher','research_admin')),
 granted_by text NOT NULL,
 granted_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 CHECK(length(trim(principal_id))>0 AND length(trim(granted_by))>0)
);
COMMIT;
