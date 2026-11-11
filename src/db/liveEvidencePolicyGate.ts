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
