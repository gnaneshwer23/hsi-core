-- P0.2.9 HELD. Restricted tenant-scoped read and creation integrity.
-- No public grants and no persistence activation.
CREATE OR REPLACE FUNCTION public.hsi_contradiction_read(
 p_token text,p_tenant text,p_contradiction text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public AS $$
DECLARE v_principal text;v_record jsonb;
BEGIN
 v_principal:=public.hsi_contradiction_session_principal(p_token);
 IF NOT EXISTS (
  SELECT 1 FROM public.hsi_research_access a WHERE a.principal_id=v_principal
  AND a.access_role IN ('researcher','research_admin','scientific_reviewer')
  AND a.revoked_at IS NULL AND a.granted_at<=now()
 ) THEN RAISE EXCEPTION 'Research access denied'; END IF;
 IF NOT EXISTS (
  SELECT 1 FROM public.hsi_contradiction_tenant_memberships m
  WHERE m.tenant_id=p_tenant AND m.principal_id=v_principal
  AND m.member_role IN ('researcher','scientific_reviewer')
  AND m.revoked_at IS NULL AND m.granted_at<=now()
 ) THEN RAISE EXCEPTION 'Tenant access denied'; END IF;
 SELECT jsonb_build_object('id',d.id,'tenantId',d.tenant_id,
  'schemaVersion',d.schema_version,'classification',d.classification,
  'snapshot',d.snapshot,'reviewStatus',d.review_status,
  'sourceEvidenceIds',d.source_evidence_ids)
 INTO v_record FROM public.hsi_contradiction_records d
 WHERE d.id=p_contradiction AND d.tenant_id=p_tenant;
 IF v_record IS NULL THEN RAISE EXCEPTION 'Contradiction unavailable'; END IF;
 RETURN v_record;
END $$;
REVOKE ALL ON FUNCTION public.hsi_contradiction_read(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hsi_contradiction_read(text,text,text) TO hsi_contradiction_runtime;
-- Owner transfer requires temporary deployer role membership and CREATE permission.
GRANT CREATE ON SCHEMA public TO hsi_contradiction_function_owner;
GRANT hsi_contradiction_function_owner TO neondb_owner WITH SET TRUE;
ALTER FUNCTION public.hsi_contradiction_read(text,text,text) OWNER TO hsi_contradiction_function_owner;
REVOKE hsi_contradiction_function_owner FROM neondb_owner;
REVOKE CREATE ON SCHEMA public FROM hsi_contradiction_function_owner;
-- Validate that supplied immutable snapshot matches top-level write fields.
CREATE OR REPLACE FUNCTION public.hsi_contradiction_verify_snapshot()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path=pg_catalog,public AS $$
BEGIN
 IF NEW.snapshot->>'id' IS DISTINCT FROM NEW.id
 OR NEW.snapshot->>'tenantId' IS DISTINCT FROM NEW.tenant_id
 OR NEW.snapshot->>'submittedBy' IS DISTINCT FROM NEW.submitted_by
 OR NEW.snapshot->>'schemaVersion' IS DISTINCT FROM NEW.schema_version
 OR NEW.snapshot->>'leftEdgeId' IS DISTINCT FROM NEW.left_edge_id
 OR NEW.snapshot->>'rightEdgeId' IS DISTINCT FROM NEW.right_edge_id
 OR NEW.snapshot->>'classification' IS DISTINCT FROM NEW.classification
 OR NEW.snapshot->'left'->>'id' IS DISTINCT FROM NEW.left_edge_id
 OR NEW.snapshot->'right'->>'id' IS DISTINCT FROM NEW.right_edge_id
 OR NEW.snapshot->'sourceEvidenceIds' IS DISTINCT FROM NEW.source_evidence_ids
 OR NEW.snapshot->>'reviewStatus' IS DISTINCT FROM 'pending'
 OR NEW.snapshot->'scientificConclusion' IS DISTINCT FROM 'false'::jsonb
 THEN RAISE EXCEPTION 'Contradiction snapshot integrity violation'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER hsi_contradiction_snapshot_integrity
BEFORE INSERT ON public.hsi_contradiction_records
FOR EACH ROW EXECUTE FUNCTION public.hsi_contradiction_verify_snapshot();
