/**
 * P0.2.1 security gate: no DB activation unless each independent check is evidenced.
 * This does not authenticate users, grant permissions, or apply migrations.
 */
export type GateCheck =
  | "trusted_identity_binding"
  | "tenant_isolation_select_insert"
  | "cross_tenant_review_denied"
  | "self_review_denied"
  | "reviewer_authority_verified"
  | "append_only_enforced"
  | "untrusted_session_claims_denied"
  | "restricted_role_no_bypassrls"
  | "staging_http_end_to_end"
  | "migration_rollback_verified";
export const REQUIRED_ACTIVATION_CHECKS:readonly GateCheck[] = [
  "trusted_identity_binding","tenant_isolation_select_insert",
  "cross_tenant_review_denied","self_review_denied",
  "reviewer_authority_verified","append_only_enforced",
  "untrusted_session_claims_denied","restricted_role_no_bypassrls",
  "staging_http_end_to_end","migration_rollback_verified",
] as const;
export type GateEvidence = {
  check:GateCheck;passed:boolean;artifactUrl:string;verifiedBy:string;verifiedAt:string;
};
const nonempty=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
export function evaluateContradictionActivationGate(evidence:readonly GateEvidence[]):{
  ready:false;structurallyComplete:boolean;missing:GateCheck[];invalid:GateCheck[]
} {
 const missing:GateCheck[]=[],invalid:GateCheck[]=[];
 for(const check of REQUIRED_ACTIVATION_CHECKS) {
  const matches=evidence.filter(e=>e.check===check);
  if(matches.length===0){missing.push(check);continue;}
  if(matches.length!==1||!matches[0]!.passed||
    !matches[0]!.artifactUrl.startsWith("https://")||
    !nonempty(matches[0]!.verifiedBy)||
    !Number.isFinite(Date.parse(matches[0]!.verifiedAt))) invalid.push(check);
 }
 // Descriptive unsigned checklist rows cannot establish independent security acceptance.
 return {ready:false,structurallyComplete:missing.length===0&&invalid.length===0,missing,invalid};
}
