-- P1.9 PROPOSED staging-only security migration. NOT applied.
-- Requires a separately provisioned LOGIN role hsi_evidence_app (NO BYPASSRLS,
-- not owner of these tables), with credentials stored only in server secrets.
-- Review role ownership and existing grants before applying.
BEGIN;
REVOKE ALL ON TABLE public.hsi_research_evidence_snapshots FROM PUBLIC;
REVOKE ALL ON TABLE public.hsi_research_evidence_review_events FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO hsi_evidence_app;
GRANT SELECT,INSERT,UPDATE ON public.hsi_research_evidence_snapshots TO hsi_evidence_app;
GRANT SELECT,INSERT ON public.hsi_research_evidence_review_events TO hsi_evidence_app;
CREATE POLICY hsi_evidence_snapshots_tenant_select
 ON public.hsi_research_evidence_snapshots FOR SELECT TO hsi_evidence_app
 USING (organization_id = nullif(current_setting('hsi.organization_id',true),''));
CREATE POLICY hsi_evidence_snapshots_tenant_insert
 ON public.hsi_research_evidence_snapshots FOR INSERT TO hsi_evidence_app
 WITH CHECK (organization_id = nullif(current_setting('hsi.organization_id',true),''));
CREATE POLICY hsi_evidence_snapshots_tenant_update
 ON public.hsi_research_evidence_snapshots FOR UPDATE TO hsi_evidence_app
 USING (organization_id = nullif(current_setting('hsi.organization_id',true),''))
 WITH CHECK (organization_id = nullif(current_setting('hsi.organization_id',true),''));
CREATE POLICY hsi_evidence_reviews_tenant_select
 ON public.hsi_research_evidence_review_events FOR SELECT TO hsi_evidence_app
 USING (organization_id = nullif(current_setting('hsi.organization_id',true),''));
CREATE POLICY hsi_evidence_reviews_tenant_insert
 ON public.hsi_research_evidence_review_events FOR INSERT TO hsi_evidence_app
 WITH CHECK (organization_id = nullif(current_setting('hsi.organization_id',true),''));
COMMIT;
