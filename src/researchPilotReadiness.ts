/** Evidence inventory only: operator-supplied JSON can never authorise a pilot or approve science. */
export const RESEARCH_PILOT_GATES=[
 {id:"artifact_integrity_and_public_recovery",scope:"local_engineering"},
 {id:"request_bounds_and_redacted_telemetry",scope:"local_engineering"},
 {id:"locked_build_and_dependency_review",scope:"local_engineering"},
 {id:"keyboard_accessibility_and_performance",scope:"local_engineering"},
 {id:"deployment_and_shared_admission",scope:"live_operations"},
 {id:"two_identity_and_cross_owner_acceptance",scope:"live_operations"},
 {id:"revoked_session_and_reviewer_independence",scope:"live_operations"},
 {id:"hsionly_staging_schema_and_write_guards",scope:"live_operations"},
 {id:"database_backup_restore_and_isolation",scope:"live_operations"},
 {id:"deployment_rollback_rehearsal",scope:"live_operations"},
 {id:"monitoring_retention_and_incident_ownership",scope:"live_operations"},
 {id:"approved_sources_and_scientific_claims",scope:"scientific"},
 {id:"pilot_data_terms_and_team_acceptance",scope:"scientific"},
] as const;
export type PilotEvidence={schemaVersion:"hsi-research-pilot-evidence-1";records:{gateId:string;status:"not_run"|"operator_reported_unverified";ownerRef:string|null;evidenceRef:string|null;evidenceSha256:string|null}[]};
export function parsePilotEvidence(value:unknown):PilotEvidence{
 const exact=(x:unknown,keys:string[])=>{if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join(",")!==[...keys].sort().join(","))throw Error("Invalid pilot evidence fields")};
 exact(value,["schemaVersion","records"]);const x=value as PilotEvidence;
 if(x.schemaVersion!=="hsi-research-pilot-evidence-1"||!Array.isArray(x.records)||x.records.length!==RESEARCH_PILOT_GATES.length||new Set(x.records.map(r=>r.gateId)).size!==x.records.length)throw Error("Every pilot gate must appear exactly once");
 for(const r of x.records){exact(r,["gateId","status","ownerRef","evidenceRef","evidenceSha256"]);if(!RESEARCH_PILOT_GATES.some(g=>g.id===r.gateId)||!["not_run","operator_reported_unverified"].includes(r.status))throw Error("Unknown pilot gate or unauthorised approval state");
  if(r.status==="not_run"){if(r.ownerRef!==null||r.evidenceRef!==null||r.evidenceSha256!==null)throw Error("Unrun gate must not imply assigned authority")}
  else if(typeof r.ownerRef!=="string"||!/^ops:[A-Za-z0-9_.:-]{2,100}$/.test(r.ownerRef)||typeof r.evidenceRef!=="string"||!/^record:[A-Za-z0-9_.:-]{2,120}$/.test(r.evidenceRef)||typeof r.evidenceSha256!=="string"||!/^[a-f0-9]{64}$/.test(r.evidenceSha256))throw Error("Bounded owner and evidence references required; never use credentials or secret URLs");
 }
 return x;
}
export function assessResearchPilotReadiness(value:unknown){
 const e=parsePilotEvidence(value);
 return {schemaVersion:"hsi-research-pilot-readiness-1",status:"blocked_pending_trusted_acceptance",pilotReady:false,scientificApprovalGranted:false,operatorEvidenceAuthenticated:false,
  gates:RESEARCH_PILOT_GATES.map(g=>({...g,...e.records.find(r=>r.gateId===g.id)!,trustedAcceptanceVerified:false})),
  blockers:["Verified staging identity, database and source prerequisites remain required.","Operator-reported receipts need independent authority, scope and freshness verification.","Public artifact recovery does not demonstrate database restore or role/session isolation.","Shared admission, deployment rollback, observability ownership and real-team acceptance require live evidence.","Scientific review and pilot data terms must be signed off by accountable humans."]};
}

/** P1-C detailed operating/release evidence, still subject to all existing pilot gates. */
export const OPERATIONAL_PILOT_ACCEPTANCE_PATH="evaluation/independent-evaluation/operations-pilot" as const;
