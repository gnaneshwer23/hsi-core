/** Pure preparation helpers. Never connects, removes migration holds or activates writes. */
export function splitPostgresStatements(sql:string):string[]{
 if(typeof sql!=="string"||sql.length>1_000_000)throw Error("Invalid rehearsal SQL");
 const statements:string[]=[];let start=0,i=0,quote:"'"|'"'|null=null,dollar:string|null=null,line=false,block=0,token=false,escape=false;
 const push=(end:number)=>{if(token)statements.push(sql.slice(start,end).trim());start=end;token=false;};
 while(i<sql.length){
  const c=sql[i]!,next=sql[i+1];
  if(line){if(c==="\n")line=false;i++;continue;}
  if(block){if(c==="/"&&next==="*"){block++;i+=2;}else if(c==="*"&&next==="/"){block--;i+=2;}else i++;continue;}
  if(dollar){if(sql.startsWith(dollar,i)){i+=dollar.length;dollar=null;}else i++;continue;}
  if(quote){if(quote==="'"&&escape&&c==="\\"){i+=2;continue;}if(c===quote){if(next===quote){i+=2;continue;}quote=null;}i++;continue;}
  if(c==="-"&&next==="-"){line=true;i+=2;continue;}
  if(c==="/"&&next==="*"){block=1;i+=2;continue;}
  if(c==="'"||c==='"'){quote=c;escape=c==="'"&&i>0&&/[eE]/.test(sql[i-1]!)&&(i<2||!/[\w$]/.test(sql[i-2]!));token=true;i++;continue;}
  if(c==="$"){const match=sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/);if(match){dollar=match[0];token=true;i+=dollar.length;continue;}}
  if(c===";"){push(i+1);i++;continue;}
  if(!/\s/.test(c))token=true;i++;
 }
 if(quote||dollar||block)throw Error("Unterminated rehearsal SQL");
 push(sql.length);return statements;
}
export type PersistenceScope="interrogative_workspace"|"scientific_records"|"contradiction_ledger"|"live_evidence";
export const PERSISTENCE_SCOPE_MIGRATIONS:Readonly<Record<PersistenceScope,readonly string[]>>=Object.freeze({
 interrogative_workspace:Object.freeze(["007_hsi_interrogative_contracts","008_hsi_interrogative_review_audit","014_hsi_investigation_graph_context","015_hsi_review_delivery"]),
 scientific_records:Object.freeze(["022_hsi_scientific_investigation_records"]),
 contradiction_ledger:Object.freeze(["024_hsi_scientific_contradiction_ledger","025_hsi_contradiction_tenant_isolation","026_hsi_contradiction_review_integrity","027_hsi_contradiction_authenticated_procedures","028_hsi_contradiction_restricted_api","029_hsi_contradiction_scoped_read_integrity"]),
 live_evidence:Object.freeze(["030_hsi_live_evidence_investigations"]),
});
export function assertDisposableRehearsalTarget(target:{projectId:string;branchId:string;parentId:string|null;isDefault:boolean;isPrimary:boolean;expiresAt:string|null},pins:{projectId:string;productionBranchId:string;disposableBranchId:string},now=Date.now()){
 const expiry=Date.parse(target.expiresAt??"");
 if(!pins.projectId||!pins.productionBranchId||!pins.disposableBranchId||target.projectId!==pins.projectId||target.branchId!==pins.disposableBranchId||target.branchId===pins.productionBranchId||target.parentId!==pins.productionBranchId||target.isDefault!==false||target.isPrimary!==false||!Number.isFinite(expiry)||expiry<=now||expiry-now>86400000)throw Error("Disposable HSI rehearsal target not verified");
 return {normalMigrationHoldsChanged:false as const,productionWritesApproved:false as const,scopeActivationApproved:false as const};
}
