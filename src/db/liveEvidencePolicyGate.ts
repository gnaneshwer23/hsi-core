/** Reject RLS policies that trust caller-settable custom session variables. */
export function assertNoForgeableOwnerPolicy(rows:readonly Record<string,unknown>[]):void {
 if(!rows.length)throw Error("A-01 denied: missing RLS policies");
 for(const row of rows){
  const name=String(row.policyname??"");
  const expr=String(row.qual??"")+" "+String(row.with_check??"");
  if(!name||!expr.trim()||/current_setting\s*\(|hsi\.live_owner_id|set_config\s*\(/i.test(expr))
   throw Error("A-01 denied: forgeable or unreviewed RLS identity policy");
 }
}
/** Catalogue expressions must be exactly the reviewed equality, not merely contain its name. */
export function assertVerifiedLiveOwnerPolicy(rows:readonly Record<string,unknown>[]):void{
 assertNoForgeableOwnerPolicy(rows);
 const row=rows[0];
 const exact=(value:unknown)=>{
  if(typeof value!=="string"||!/hsi_live_verified_owner\s*\(\s*\)/.test(value))return false;
  const normalized=value.replace(/[\s()"]+/g,"");
  return normalized==="owner_id=hsi_live_verified_owner"||normalized==="owner_id=public.hsi_live_verified_owner";
 };
 if(rows.length!==1||!row||row.policyname!=="hsi_live_verified_session_isolation"||row.cmd!=="ALL"||!Array.isArray(row.roles)||row.roles.length!==1||row.roles[0]!=="hsi_live_runtime"||!exact(row.qual)||!exact(row.with_check))throw Error("A-01 denied: unapproved owner policy expression or scope");
}
export function assertRestrictedLiveRuntime(rows:readonly Record<string,unknown>[],privilegedMemberships:readonly Record<string,unknown>[]):void{
 const role=rows[0];
 if(rows.length!==1||!role||role.name!=="hsi_live_runtime"||role.login!=="hsi_live_runtime"||role.canlogin!==true||role.inherit!==false||role.bypass!==false||role.superuser!==false||role.createrole!==false||role.createdb!==false||role.table_exists!==true||role.table_owner!==false||role.auth_session_read!==false||role.auth_user_read!==false||role.schema_create!==false||role.can_delete!==false||role.can_truncate!==false||privilegedMemberships.length!==0)throw Error("A-01 denied: runtime login or inherited privilege is unsafe");
}
/** Compare exact compute labels while allowing its pooled runtime form. */
export function assertAlignedLiveStagingHosts(identityHost:string,runtimeHost:string,pin:string):void{
 const label=(host:string)=>host.split(".")[0]?.replace(/-pooler$/,"");
 if(!/^ep-[a-z0-9-]+$/.test(pin)||pin==="ep-hsi-staging"||pin.endsWith("-pooler")||label(identityHost)!==pin||label(runtimeHost)!==pin)throw Error("A-01 denied: identity and runtime must share an explicitly pinned staging compute");
}
