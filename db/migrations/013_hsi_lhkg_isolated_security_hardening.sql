-- Phase 3 isolated-branch hardening; apply after 011 and 012.
-- No permissive SELECT policies or grants: deny-by-default pending verified session-bound DB access.
ALTER TABLE hsi_lhkg_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_nodes FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_relationships FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_dossiers FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_lhkg_nodes ADD CONSTRAINT hsi_lhkg_nodes_semver CHECK (version ~ '^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$');
ALTER TABLE hsi_lhkg_relationships ADD CONSTRAINT hsi_lhkg_relationships_semver CHECK (version ~ '^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$');
ALTER TABLE hsi_lhkg_dossiers ADD CONSTRAINT hsi_lhkg_dossiers_semver CHECK (relationship_version ~ '^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$');
CREATE TRIGGER hsi_lhkg_dossiers_immutable BEFORE UPDATE OR DELETE ON hsi_lhkg_dossiers FOR EACH ROW EXECUTE FUNCTION hsi_lhkg_reject_mutation();
REVOKE ALL ON hsi_lhkg_nodes,hsi_lhkg_relationships,hsi_lhkg_dossiers FROM PUBLIC;
-- Owner and BYPASSRLS/superuser privileges must be separately audited.
-- No live research role is granted; absence of RLS policies is intentional.
