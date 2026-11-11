/** P1.11: inspect effective grants and policies without mutating staging. */
import type {ReadonlySqlClient} from "./neonEvidenceSchemaReadiness";
export type RestrictedRoleGrantReport={
 appRolePresent:boolean;roleNoLogin:boolean;roleNoBypass:boolean;
 snapshotsReadWrite:boolean;reviewsAppendOnly:boolean;
 readyForRestrictedRoleTesting:boolean;
};
export async function inspectRestrictedRoleGrants(db:ReadonlySqlClient):
 Promise<RestrictedRoleGrantReport>{
 const rows=await db.query<{rolcanlogin:boolean;rolbypassrls:boolean;rolsuper:boolean;
  snapshots_select:boolean;snapshots_insert:boolean;snapshots_update:boolean;
  reviews_select:boolean;reviews_insert:boolean;reviews_update:boolean;reviews_delete:boolean}>(`
 SELECT r.rolcanlogin,r.rolbypassrls,r.rolsuper,
 has_table_privilege(r.oid,'public.hsi_research_evidence_snapshots','SELECT') AS snapshots_select,
 has_table_privilege(r.oid,'public.hsi_research_evidence_snapshots','INSERT') AS snapshots_insert,
 has_table_privilege(r.oid,'public.hsi_research_evidence_snapshots','UPDATE') AS snapshots_update,
 has_table_privilege(r.oid,'public.hsi_research_evidence_review_events','SELECT') AS reviews_select,
 has_table_privilege(r.oid,'public.hsi_research_evidence_review_events','INSERT') AS reviews_insert,
 has_table_privilege(r.oid,'public.hsi_research_evidence_review_events','UPDATE') AS reviews_update,
 has_table_privilege(r.oid,'public.hsi_research_evidence_review_events','DELETE') AS reviews_delete
 FROM pg_roles r WHERE r.rolname='hsi_evidence_app'`);
 const r=rows[0];
 const appRolePresent=Boolean(r);
 const roleNoLogin=Boolean(r&&!r.rolcanlogin);
 const roleNoBypass=Boolean(r&&!r.rolbypassrls&&!r.rolsuper);
 const snapshotsReadWrite=Boolean(r&&r.snapshots_select&&r.snapshots_insert&&r.snapshots_update);
 const reviewsAppendOnly=Boolean(r&&r.reviews_select&&r.reviews_insert&&!r.reviews_update&&!r.reviews_delete);
 return {appRolePresent,roleNoLogin,roleNoBypass,snapshotsReadWrite,reviewsAppendOnly,
  readyForRestrictedRoleTesting:appRolePresent&&roleNoLogin&&roleNoBypass&&snapshotsReadWrite&&reviewsAppendOnly};
}
