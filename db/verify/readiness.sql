-- Run only on HSI red-wave / hsi-production-branch / neondb.
-- Read-only release evidence; never applies migrations or changes reviews.
BEGIN TRANSACTION READ ONLY;

SELECT current_database() AS database_name;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('hsi_schema_migrations', 'hsi_claims', 'hsi_markers', 'hsi_edges', 'hsi_gate_c_reviews')
ORDER BY table_name;

SELECT id, applied_at
FROM public.hsi_schema_migrations
ORDER BY id;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('hsi_claims', 'hsi_markers', 'hsi_edges', 'hsi_gate_c_reviews')
ORDER BY table_name, ordinal_position;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.hsi_gate_c_reviews'::regclass;

SELECT count(*) AS invalid_auto_approve_rows
FROM public.hsi_gate_c_reviews
WHERE auto_approve IS DISTINCT FROM FALSE;

COMMIT;
