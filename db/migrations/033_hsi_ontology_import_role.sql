-- 033 DRAFT ONLY. HELD. DO NOT APPLY without HSI security approval. Requires 031 and the roles in db/roles/hsi_graph_roles.sql.
-- Lets a dedicated import role insert pinned ontology releases and their terms, and nothing else. The tables stay
-- append-only (031 triggers), so an import can add a release but never change or remove one. The import role has no
-- access to investigations or recommendations and cannot call the procedures in 032.
-- Reference data is written by the import script (scripts/import-ontologies.ts, extended in a later change) as
-- hsi_ontology_import_login. The web runtime role cannot write it.
--
-- ROLLBACK:
--   DROP POLICY IF EXISTS hsi_ontology_import_insert ON public.hsi_ontology_releases;
--   DROP POLICY IF EXISTS hsi_ontology_import_insert ON public.hsi_ontology_terms;
--   REVOKE INSERT ON public.hsi_ontology_releases, public.hsi_ontology_terms FROM hsi_ontology_import;
DO $g$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='hsi_ontology_import') THEN
  EXECUTE 'DROP POLICY IF EXISTS hsi_ontology_import_insert ON public.hsi_ontology_releases';
  EXECUTE 'CREATE POLICY hsi_ontology_import_insert ON public.hsi_ontology_releases FOR INSERT TO hsi_ontology_import WITH CHECK (true)';
  EXECUTE 'DROP POLICY IF EXISTS hsi_ontology_import_insert ON public.hsi_ontology_terms';
  EXECUTE 'CREATE POLICY hsi_ontology_import_insert ON public.hsi_ontology_terms FOR INSERT TO hsi_ontology_import WITH CHECK (true)';
  GRANT INSERT ON public.hsi_ontology_releases,public.hsi_ontology_terms TO hsi_ontology_import;
 ELSE
  RAISE NOTICE 'Role hsi_ontology_import not found; no import access was granted.';
 END IF;
END $g$;
