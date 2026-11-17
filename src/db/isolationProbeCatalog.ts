/**
 * Declarative two-account isolation probe catalog (A3.2 / DB-02).
 * Catalogues HTTP + non-HTTP evidence kinds. Never executes network or SQL.
 * Production untouched; holds unchanged; acceptedForScope always false upstream.
 *
 * HTTP rows use real `/api/research/…` bases with distinct `?probe=` ids so a
 * deterministic endpoint / fixture transport can return digests the owner records
 * after live runs. Write/concurrency/pooled checks are non-HTTP — GET alone must
 * not claim those protections (ADR-013 / Next-B runner contract).
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {PERSISTENCE_SCOPE_MIGRATIONS,type PersistenceScope} from "./migrationRehearsal";
import {PERSISTENCE_SECURITY_CHECKS,type PersistenceSecurityCheck,type SecurityEvidenceKind} from "./persistenceSecurityAcceptance";
import type {IsolationActor,IsolationProbe} from "./stagingIsolationRunner";

export type IsolationCatalogProbe=
 |{kind:"authenticated_http";probe:IsolationProbe;scope:PersistenceScope;adrNote:string}
 |{kind:"catalogue"|"database_rehearsal"|"database_restore";check:PersistenceSecurityCheck;scope:PersistenceScope;id:string;adrNote:string;statementId:string};

/** Checks that must not be claimed by a lone GET HTTP probe. */
export const HTTP_EXCLUDED_CHECKS:ReadonlySet<PersistenceSecurityCheck>=new Set([
 "restricted_role_no_bypassrls",
 "production_readonly_confirmed",
 "migration_rollback_verified",
 "backup_restore_verified",
 "append_only_enforced",
 "pooled_connection_reuse_isolated",
 "concurrent_idempotent_submission_decision",
]);

function bodyHash(value:unknown):string{
 return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function http(
 id:string,
 check:PersistenceSecurityCheck,
 actor:IsolationActor,
 basePath:string,
 expectedStatus:number,
 body:unknown,
 scope:PersistenceScope,
 adrNote:string,
):IsolationCatalogProbe{
 const path=`${basePath}${basePath.includes("?")?"&":"?"}probe=${id}`;
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

/** Real interrogative resource id shape required by vercelResearch / interrogativeApi. */
const IW_A="/api/research/interrogative/hsi-interrogative-isolation-a";
const IW_B="/api/research/interrogative/hsi-interrogative-isolation-b";
const SRQ="/api/research/scientific-review/queue";
const LIVE="/api/research/live-investigations";
const INV="/api/research/investigations";
const GRAPH="/api/research/graph/ssc";
const SD="/api/research/session-diagnostics";

/** Frozen catalog: every PERSISTENCE_SECURITY_CHECKS entry has ≥1 probe. */
export const ISOLATION_PROBE_CATALOG:readonly IsolationCatalogProbe[]=Object.freeze([
 // --- interrogative_workspace HTTP matrix (ADR-013 / ADR-014) ---
 http("iw_owner_read","trusted_identity_binding","researcher_a",IW_A,200,{ok:true,probe:"iw_owner_read"},"interrogative_workspace","ADR-013: principal from verified session"),
 http("iw_cross_owner","tenant_isolation_select_insert","researcher_b",IW_A,403,{error:"cross_owner_denied",probe:"iw_cross_owner"},"interrogative_workspace","ADR-013: cross-owner read denied"),
 http("iw_cross_review","cross_tenant_review_denied","reviewer",IW_B,403,{error:"wrong_scope_reviewer",probe:"iw_cross_review"},"interrogative_workspace","ADR-014: wrong-scope reviewer denied"),
 http("iw_self_review","self_review_denied","researcher_a",`${IW_A}/submit-review`,403,{error:"self_review_denied",probe:"iw_self_review"},"interrogative_workspace","ADR-014: self-review denied"),
 http("iw_reviewer_ok","reviewer_authority_verified","reviewer",IW_A,200,{ok:true,probe:"iw_reviewer_ok"},"interrogative_workspace","ADR-014: assigned reviewer may read"),
 http("iw_untrusted","untrusted_session_claims_denied","anonymous",IW_A,401,{error:"session_required",probe:"iw_untrusted"},"interrogative_workspace","ADR-013: anonymous denied"),
 http("iw_e2e","staging_http_end_to_end","researcher_a",SD,200,{ok:true,probe:"iw_e2e"},"interrogative_workspace","Positive HTTP control via session-diagnostics"),
 http("iw_enum","cross_owner_enumeration_edit_export_denied","researcher_b",IW_B,403,{error:"enumeration_denied",probe:"iw_enum"},"interrogative_workspace","Cross-owner enumeration denied"),
 http("iw_revoked_scope","revoked_and_wrong_scope_reviewer_denied","reviewer",IW_B,403,{error:"membership_revoked",probe:"iw_revoked_scope"},"interrogative_workspace","ADR-014: revoked membership"),
 http("iw_logout","logout_session_revocation_enforced","revoked_session",IW_A,401,{error:"session_revoked",probe:"iw_logout"},"interrogative_workspace","ADR-013: revoked session"),

 nonHttp("catalogue","append_only_enforced","interrogative_workspace","iw_append","docs/audits/HSI_NEXT_B_ISOLATION_RUNNER.md","GET cannot prove append-only — separate write driver"),
 nonHttp("catalogue","pooled_connection_reuse_isolated","interrogative_workspace","iw_pooled","docs/audits/HSI_NEXT_B_ISOLATION_RUNNER.md","GET cannot prove pooled reuse — separate pool driver"),
 nonHttp("catalogue","concurrent_idempotent_submission_decision","interrogative_workspace","iw_idempotent","docs/audits/HSI_NEXT_B_ISOLATION_RUNNER.md","Sequential runner is not concurrency evidence"),

 // --- graph_workspace (held 031–033; catalog + rehearsal until A3.3) ---
 http("gw_e2e","staging_http_end_to_end","anonymous",GRAPH,401,{error:"session_required",probe:"gw_e2e"},"graph_workspace","Unauthenticated graph route denied"),
 nonHttp("catalogue","restricted_role_no_bypassrls","graph_workspace","gw_no_bypass","db/verify/031_graph_workspace_roles.sql","Catalogue: no BYPASSRLS on app roles"),
 nonHttp("catalogue","production_readonly_confirmed","graph_workspace","gw_prod_ro","docs/NEON_PROJECT_MAP.md","Production branch not targeted"),
 nonHttp("database_rehearsal","migration_rollback_verified","graph_workspace","gw_rollback","docs/GRAPH_WORKSPACE_REHEARSAL_RUNBOOK.md","Disposable branch rollback rehearsal"),
 nonHttp("database_restore","backup_restore_verified","graph_workspace","gw_restore","docs/GRAPH_WORKSPACE_REHEARSAL_RUNBOOK.md","Restore drill evidence (owner)"),

 // --- contradiction_ledger ---
 http("cl_cross","cross_tenant_review_denied","reviewer",SRQ,403,{error:"wrong_scope",probe:"cl_cross"},"contradiction_ledger","Wrong-scope review denied"),
 http("cl_self","self_review_denied","researcher_a",SRQ,403,{error:"self_review_denied",probe:"cl_self"},"contradiction_ledger","Self-review denied"),
 http("cl_logout","logout_session_revocation_enforced","revoked_session",SRQ,401,{error:"session_revoked",probe:"cl_logout"},"contradiction_ledger","Revoked session"),

 // --- live_evidence (030 held; ADR-013 forbids forgeable GUC) ---
 http("le_identity","trusted_identity_binding","anonymous",LIVE,401,{error:"session_required",probe:"le_identity"},"live_evidence","Anonymous live investigations denied"),
 http("le_untrusted","untrusted_session_claims_denied","anonymous",LIVE,401,{error:"session_required",probe:"le_untrusted"},"live_evidence","Anonymous cannot forge owner"),
 nonHttp("catalogue","restricted_role_no_bypassrls","live_evidence","le_no_guc","src/db/liveEvidencePolicyGate.ts","Reject forgeable hsi.live_owner_id policy"),

 // --- scientific_records ---
 http("sr_untrusted","untrusted_session_claims_denied","anonymous",INV,401,{error:"session_required",probe:"sr_untrusted"},"scientific_records","Anonymous scientific records denied"),
 http("sr_e2e","staging_http_end_to_end","researcher_a",INV,200,{ok:true,probe:"sr_e2e"},"scientific_records","Authenticated scientific records positive control (owner digests)"),
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

export function catalogCoverage(scope?:PersistenceScope):{
 checks:readonly PersistenceSecurityCheck[];
 covered:readonly PersistenceSecurityCheck[];
 missing:readonly PersistenceSecurityCheck[];
 httpExcluded:readonly PersistenceSecurityCheck[];
}{
 const rows=scope?probesForScope(scope):ISOLATION_PROBE_CATALOG;
 const covered=new Set<PersistenceSecurityCheck>();
 for(const p of rows){
  if(p.kind==="authenticated_http")covered.add(p.probe.check);
  else covered.add(p.check);
 }
 const missing=PERSISTENCE_SECURITY_CHECKS.filter(c=>!covered.has(c));
 return{
  checks:PERSISTENCE_SECURITY_CHECKS,
  covered:[...covered],
  missing,
  httpExcluded:[...HTTP_EXCLUDED_CHECKS],
 };
}

export function assertCatalogComplete():void{
 const{missing}=catalogCoverage();
 if(missing.length)throw Error(`Isolation catalog missing checks: ${missing.join(",")}`);
 for(const p of ISOLATION_PROBE_CATALOG){
  if(p.kind!=="authenticated_http")continue;
  if(HTTP_EXCLUDED_CHECKS.has(p.probe.check))throw Error(`HTTP probe cannot cover ${p.probe.check}`);
 }
 const ids=ISOLATION_PROBE_CATALOG.map(p=>p.kind==="authenticated_http"?p.probe.id:p.id);
 if(new Set(ids).size!==ids.length)throw Error("Duplicate isolation probe ids");
}

export function evidenceKindForCheck(check:PersistenceSecurityCheck):SecurityEvidenceKind{
 if(
  check==="restricted_role_no_bypassrls"
  ||check==="production_readonly_confirmed"
  ||check==="append_only_enforced"
  ||check==="pooled_connection_reuse_isolated"
  ||check==="concurrent_idempotent_submission_decision"
 )return"catalogue";
 if(check==="migration_rollback_verified")return"database_rehearsal";
 if(check==="backup_restore_verified")return"database_restore";
 return"authenticated_http";
}

/** Synthetic fixture transport keyed by `?probe=` — never used for live mode. */
export function fixtureIsolationTransport(request:Request):Response{
 const url=new URL(request.url);
 const probe=url.searchParams.get("probe")??"";
 const cookie=request.headers.get("cookie");
 if(!cookie)return Response.json({error:"session_required",probe},{status:401});
 if(cookie.includes("revoked")||probe==="iw_logout"||probe==="cl_logout"){
  return Response.json({error:"session_revoked",probe},{status:401});
 }
 if((probe==="iw_e2e"||probe==="iw_owner_read"||probe==="iw_reviewer_ok"||probe==="sr_e2e")&&cookie==="synthetic=fixture"){
  return Response.json({ok:true,probe},{status:200});
 }
 if(probe==="iw_cross_owner")return Response.json({error:"cross_owner_denied",probe},{status:403});
 if(probe==="iw_cross_review")return Response.json({error:"wrong_scope_reviewer",probe},{status:403});
 if(probe==="iw_self_review"||probe==="cl_self")return Response.json({error:"self_review_denied",probe},{status:403});
 if(probe==="iw_enum")return Response.json({error:"enumeration_denied",probe},{status:403});
 if(probe==="iw_revoked_scope")return Response.json({error:"membership_revoked",probe},{status:403});
 if(probe==="cl_cross")return Response.json({error:"wrong_scope",probe},{status:403});
 return Response.json({error:"cross_owner_denied",probe},{status:403});
}
