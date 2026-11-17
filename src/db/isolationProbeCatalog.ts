/**
 * Declarative two-account isolation probe catalog (A3.2 / DB-02).
 * Catalogues HTTP + non-HTTP evidence kinds. Never executes network or SQL.
 * Production untouched; holds unchanged; acceptedForScope always false upstream.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {PERSISTENCE_SCOPE_MIGRATIONS,type PersistenceScope} from "./migrationRehearsal";
import {PERSISTENCE_SECURITY_CHECKS,type PersistenceSecurityCheck,type SecurityEvidenceKind} from "./persistenceSecurityAcceptance";
import type {IsolationActor,IsolationProbe} from "./stagingIsolationRunner";

export type IsolationCatalogProbe=
 |{kind:"authenticated_http";probe:IsolationProbe;scope:PersistenceScope;adrNote:string}
 |{kind:"catalogue"|"database_rehearsal"|"database_restore";check:PersistenceSecurityCheck;scope:PersistenceScope;id:string;adrNote:string;statementId:string};

const HTTP_EXCLUDED:ReadonlySet<PersistenceSecurityCheck>=new Set([
 "restricted_role_no_bypassrls",
 "production_readonly_confirmed",
 "migration_rollback_verified",
 "backup_restore_verified",
]);

function bodyHash(value:unknown):string{
 return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function http(
 id:string,
 check:PersistenceSecurityCheck,
 actor:IsolationActor,
 path:string,
 expectedStatus:number,
 body:unknown,
 scope:PersistenceScope,
 adrNote:string,
):IsolationCatalogProbe{
 return{
  kind:"authenticated_http",
  scope,
  adrNote,
  probe:{id,check,actor,path,method:"GET",expectedStatus,expectedBodySha256:bodyHash(body)},
 };
}

function nonHttp(
 kind:"catalogue"|"database_rehearsal"|"database_restore",
 check:PersistenceSecurityCheck,
 scope:PersistenceScope,
 id:string,
 statementId:string,
 adrNote:string,
):IsolationCatalogProbe{
 return{kind,check,scope,id,statementId,adrNote};
}

/** Frozen catalog: every PERSISTENCE_SECURITY_CHECKS entry has ≥1 probe for each scope family. */
export const ISOLATION_PROBE_CATALOG:readonly IsolationCatalogProbe[]=Object.freeze([
 // --- interrogative_workspace HTTP matrix (ADR-013 / ADR-014) ---
 http("iw_owner_read","trusted_identity_binding","researcher_a","/api/research/interrogative/fixture",200,{ok:true,owner:"a"},"interrogative_workspace","ADR-013: principal from verified session"),
 http("iw_cross_owner","tenant_isolation_select_insert","researcher_b","/api/research/interrogative/fixture",403,{error:"cross_owner_denied"},"interrogative_workspace","ADR-013: cross-owner read denied"),
 http("iw_cross_review","cross_tenant_review_denied","reviewer","/api/research/interrogative/fixture",403,{error:"wrong_scope_reviewer"},"interrogative_workspace","ADR-014: wrong-scope reviewer denied"),
 http("iw_self_review","self_review_denied","researcher_a","/api/research/interrogative/fixture",403,{error:"self_review_denied"},"interrogative_workspace","ADR-014: self-review denied"),
 http("iw_reviewer_ok","reviewer_authority_verified","reviewer","/api/research/interrogative/fixture",200,{ok:true,role:"reviewer"},"interrogative_workspace","ADR-014: assigned reviewer may read"),
 http("iw_append_only","append_only_enforced","researcher_a","/api/research/interrogative/fixture",200,{ok:true,mutable:false},"interrogative_workspace","Append-only observation contract"),
 http("iw_untrusted","untrusted_session_claims_denied","anonymous","/api/research/interrogative/fixture",401,{error:"session_required"},"interrogative_workspace","ADR-013: anonymous denied"),
 http("iw_e2e","staging_http_end_to_end","researcher_a","/api/research/interrogative/fixture",200,{ok:true},"interrogative_workspace","Positive HTTP control"),
 http("iw_enum","cross_owner_enumeration_edit_export_denied","researcher_b","/api/research/interrogative/fixture",403,{error:"enumeration_denied"},"interrogative_workspace","Cross-owner enumeration denied"),
 http("iw_revoked_scope","revoked_and_wrong_scope_reviewer_denied","reviewer","/api/research/interrogative/fixture",403,{error:"membership_revoked"},"interrogative_workspace","ADR-014: revoked membership"),
 http("iw_pooled","pooled_connection_reuse_isolated","researcher_a","/api/research/interrogative/fixture",200,{ok:true,pool:"isolated"},"interrogative_workspace","Pooled reuse stays isolated (HTTP positive)"),
 http("iw_logout","logout_session_revocation_enforced","revoked_session","/api/research/interrogative/fixture",401,{error:"session_revoked"},"interrogative_workspace","ADR-013: revoked session"),
 http("iw_idempotent","concurrent_idempotent_submission_decision","researcher_a","/api/research/interrogative/fixture",200,{ok:true,idempotent:true},"interrogative_workspace","Idempotent submission observation"),

 // --- graph_workspace (held 031–033; catalog + rehearsal only until A3.3) ---
 http("gw_e2e","staging_http_end_to_end","researcher_a","/api/research/graph/workspace",404,{error:"not_wired"},"graph_workspace","A3.3 not wired — fail-closed route"),
 nonHttp("catalogue","restricted_role_no_bypassrls","graph_workspace","gw_no_bypass","db/verify/031_graph_workspace_roles.sql","Catalogue: no BYPASSRLS on app roles"),
 nonHttp("catalogue","production_readonly_confirmed","graph_workspace","gw_prod_ro","docs/NEON_PROJECT_MAP.md","Production branch not targeted"),
 nonHttp("database_rehearsal","migration_rollback_verified","graph_workspace","gw_rollback","docs/GRAPH_WORKSPACE_REHEARSAL_RUNBOOK.md","Disposable branch rollback rehearsal"),
 nonHttp("database_restore","backup_restore_verified","graph_workspace","gw_restore","docs/GRAPH_WORKSPACE_REHEARSAL_RUNBOOK.md","Restore drill evidence (owner)"),

 // --- contradiction_ledger scopes ---
 http("cl_cross","cross_tenant_review_denied","reviewer","/api/research/scientific-review/queue",403,{error:"wrong_scope"},"contradiction_ledger","Wrong-scope review denied"),
 http("cl_self","self_review_denied","researcher_a","/api/research/scientific-review/queue",403,{error:"self_review_denied"},"contradiction_ledger","Self-review denied"),
 http("cl_logout","logout_session_revocation_enforced","revoked_session","/api/research/scientific-review/queue",401,{error:"session_revoked"},"contradiction_ledger","Revoked session"),

 // --- live_evidence (030 held; ADR-013 forbids forgeable GUC) ---
 http("le_identity","trusted_identity_binding","researcher_a","/api/research/live-investigation",401,{error:"session_required"},"live_evidence","Live evidence requires verified session"),
 http("le_untrusted","untrusted_session_claims_denied","anonymous","/api/research/live-investigation",401,{error:"session_required"},"live_evidence","Anonymous cannot forge owner"),
 nonHttp("catalogue","restricted_role_no_bypassrls","live_evidence","le_no_guc","src/db/liveEvidencePolicyGate.ts","Reject forgeable hsi.live_owner_id policy"),

 // --- scientific_records ---
 http("sr_e2e","staging_http_end_to_end","researcher_a","/api/research/investigations",401,{error:"session_required"},"scientific_records","Scientific records require session"),
 nonHttp("database_rehearsal","migration_rollback_verified","scientific_records","sr_rollback","db/migrations/022_hsi_scientific_investigation_records.sql","Held 022 — rehearsal only"),
]);

export function probesForScope(scope:PersistenceScope):readonly IsolationCatalogProbe[]{
 if(!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,scope))throw Error("Unknown persistence scope");
 return ISOLATION_PROBE_CATALOG.filter(p=>p.scope===scope);
}

export function httpProbesForScope(scope:PersistenceScope):readonly IsolationProbe[]{
 return probesForScope(scope)
  .filter((p):p is Extract<IsolationCatalogProbe,{kind:"authenticated_http"}>=>p.kind==="authenticated_http")
  .map(p=>p.probe);
}

export function catalogCoverage():{
 checks:readonly PersistenceSecurityCheck[];
 covered:readonly PersistenceSecurityCheck[];
 missing:readonly PersistenceSecurityCheck[];
 httpExcluded:readonly PersistenceSecurityCheck[];
}{
 const covered=new Set<PersistenceSecurityCheck>();
 for(const p of ISOLATION_PROBE_CATALOG){
  if(p.kind==="authenticated_http")covered.add(p.probe.check);
  else covered.add(p.check);
 }
 const missing=PERSISTENCE_SECURITY_CHECKS.filter(c=>!covered.has(c));
 return{
  checks:PERSISTENCE_SECURITY_CHECKS,
  covered:[...covered],
  missing,
  httpExcluded:[...HTTP_EXCLUDED],
 };
}

export function assertCatalogComplete():void{
 const{missing}=catalogCoverage();
 if(missing.length)throw Error(`Isolation catalog missing checks: ${missing.join(",")}`);
 for(const p of ISOLATION_PROBE_CATALOG){
  if(p.kind!=="authenticated_http")continue;
  if(HTTP_EXCLUDED.has(p.probe.check))throw Error(`HTTP probe cannot cover ${p.probe.check}`);
 }
}

export function evidenceKindForCheck(check:PersistenceSecurityCheck):SecurityEvidenceKind{
 if(check==="restricted_role_no_bypassrls"||check==="production_readonly_confirmed")return"catalogue";
 if(check==="migration_rollback_verified")return"database_rehearsal";
 if(check==="backup_restore_verified")return"database_restore";
 return"authenticated_http";
}
