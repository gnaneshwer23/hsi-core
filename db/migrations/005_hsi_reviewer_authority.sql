-- HSI reviewer authority: deny by default; never bootstrap a reviewer or auto-approve.
-- The authenticated principal must come from verified Neon Auth JWT/session in the API.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_reviewer_authority (
 principal_id text PRIMARY KEY,
 reviewer_role text NOT NULL CHECK (reviewer_role='scientific_reviewer'),
 granted_by text NOT NULL,
 granted_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 scope text NOT NULL DEFAULT 'ssc' CHECK (scope IN ('ssc')),
 CHECK (length(trim(principal_id))>0 AND length(trim(granted_by))>0),
 CHECK (revoked_at IS NULL OR revoked_at>=granted_at)
);
CREATE INDEX IF NOT EXISTS hsi_reviewer_authority_active_idx
 ON hsi_reviewer_authority(principal_id) WHERE revoked_at IS NULL;
COMMIT;
