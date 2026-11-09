-- HSI Living Health Knowledge Graph row-level security policies.
-- NOT APPLIED. src/db/migrate.ts lists this file in HELD_MIGRATION_IDS.
-- Do not remove that hold, and do not run this file against a live database,
-- until an owner security review accepts the role split below.
--
-- 011 creates hsi_lhkg_nodes and hsi_lhkg_relationships.
-- 012_hsi_lhkg_evidence_dossiers creates hsi_lhkg_dossiers.
-- 013 enables FORCE ROW LEVEL SECURITY and creates no policies, so every
-- ordinary role fails closed. This migration adds the missing policies:
-- one explicit reader role, and no insert, update or delete policy.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hsi_lhkg_reader') THEN
    CREATE ROLE hsi_lhkg_reader NOLOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO hsi_lhkg_reader;
GRANT SELECT ON hsi_lhkg_nodes, hsi_lhkg_relationships, hsi_lhkg_dossiers TO hsi_lhkg_reader;

ALTER TABLE hsi_lhkg_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_nodes FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_relationships FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_dossiers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hsi_lhkg_nodes_reader_select ON hsi_lhkg_nodes;
CREATE POLICY hsi_lhkg_nodes_reader_select
  ON hsi_lhkg_nodes
  FOR SELECT
  TO hsi_lhkg_reader
  USING (true);

DROP POLICY IF EXISTS hsi_lhkg_relationships_reader_select ON hsi_lhkg_relationships;
CREATE POLICY hsi_lhkg_relationships_reader_select
  ON hsi_lhkg_relationships
  FOR SELECT
  TO hsi_lhkg_reader
  USING (true);

DROP POLICY IF EXISTS hsi_lhkg_dossiers_reader_select ON hsi_lhkg_dossiers;
CREATE POLICY hsi_lhkg_dossiers_reader_select
  ON hsi_lhkg_dossiers
  FOR SELECT
  TO hsi_lhkg_reader
  USING (true);

-- No insert, update or delete policy is created.
-- Under FORCE ROW LEVEL SECURITY those commands fail closed for hsi_lhkg_reader
-- and for the table owner. Superuser and BYPASSRLS remain a separate audit.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON hsi_lhkg_nodes, hsi_lhkg_relationships, hsi_lhkg_dossiers FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON hsi_lhkg_nodes, hsi_lhkg_relationships, hsi_lhkg_dossiers FROM hsi_lhkg_reader;
