-- Offline candidate, not an approved migration. Requires reviewed Neon Auth schema.
CREATE FUNCTION hsi_memory.resolve_principal(p_token text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_principal text;
BEGIN
 IF p_token IS NULL OR length(p_token)<16 OR length(p_token)>4096 OR p_token ~ '[[:space:]]' THEN RETURN NULL; END IF;
 SELECT u.id::text INTO STRICT v_principal
 FROM neon_auth.session s JOIN neon_auth."user" u ON u.id=s."userId"
 WHERE s.token=p_token AND s."expiresAt">clock_timestamp()
 AND s."impersonatedBy" IS NULL AND u."emailVerified" IS TRUE AND COALESCE(u.banned,false)=false;
 RETURN v_principal;
 EXCEPTION WHEN no_data_found OR too_many_rows THEN RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION hsi_memory.resolve_principal(text) FROM PUBLIC;
-- ADR-014 is proposed and lacks canonical tenant binding. No fallback to
-- contradiction-specific memberships or app-set GUCs. Deny all until approved.
CREATE FUNCTION hsi_memory.active_membership(p_principal text,p_tenant text,p_scope text)
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT false $$;
REVOKE ALL ON FUNCTION hsi_memory.active_membership(text,text,text) FROM PUBLIC;
