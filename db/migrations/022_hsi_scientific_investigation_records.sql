-- Scientific investigation records. NOT APPLIED by this commit.
-- Held in src/db/migrate.ts HELD_MIGRATION_IDS until the owner removes the hold
-- and runs `bun run db:migrate` against the HSI Neon project only.
--
-- Rollback (do not run against another product database):
--   DROP TABLE IF EXISTS hsi_scientific_investigation_records;

CREATE TABLE IF NOT EXISTS hsi_scientific_investigation_records (
  id text PRIMARY KEY,
  owner_principal text NOT NULL,
  question text NOT NULL,
  record jsonb NOT NULL,
  review_status text NOT NULL CHECK (review_status IN ('not_independently_reviewed', 'comments_recorded')),
  scientific_truth_established boolean NOT NULL CHECK (scientific_truth_established = false),
  patient_data_connected boolean NOT NULL CHECK (patient_data_connected = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hsi_scientific_investigation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_scientific_investigation_records FORCE ROW LEVEL SECURITY;

-- No SELECT, INSERT, UPDATE or DELETE policy. Ordinary roles fail closed
-- until a later reviewed policy names the owner principal.
REVOKE ALL ON hsi_scientific_investigation_records FROM PUBLIC;
