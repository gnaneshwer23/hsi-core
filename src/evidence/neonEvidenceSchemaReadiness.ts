/** P1.6: read-only schema readiness checks. No migrations or writes. */
export type ReadonlySqlClient={
 query<T extends Record<string,unknown>>(sql:string,params?:readonly unknown[]):Promise<readonly T[]>;
};
export type NeonStagingReadiness={
 tables:Readonly<Record<string,boolean>>;
 rowLevelSecurityEnabled:Readonly<Record<string,boolean>>;
 rowLevelSecurityForced:Readonly<Record<string,boolean>>;
 requiredConstraintsPresent:Readonly<Record<string,boolean>>;
 readyForIntegrationTests:boolean;
 migrationAppliedByThisCheck:false;
};
const TABLES=["hsi_research_evidence_snapshots","hsi_research_evidence_review_events"] as const;
const CONSTRAINTS=[
 "hsi_research_evidence_snapshots_pkey",
 "hsi_research_evidence_snapshots_organization_id_idempotency_key_key",
 "hsi_research_evidence_review_events_pkey",
 "hsi_research_evidence_review_events_organization_id_snapshot_id_key",
] as const;
export async function inspectNeonEvidenceSchema(db:ReadonlySqlClient):Promise<NeonStagingReadiness>{
 const rows=await db.query<{tablename:string;rowsecurity:boolean;forcerowsecurity:boolean}>(`
  SELECT c.relname AS tablename,c.relrowsecurity AS rowsecurity,
         c.relforcerowsecurity AS forcerowsecurity
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname=current_schema() AND c.relkind='r'
    AND c.relname=ANY($1::text[])
 `,[[...TABLES]]);
 const constraints=await db.query<{conname:string}>(`
  SELECT con.conname FROM pg_constraint con
  JOIN pg_class c ON c.oid=con.conrelid
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname=current_schema() AND c.relname=ANY($1::text[])
 `,[[...TABLES]]);
 const found=new Map(rows.map(r=>[r.tablename,r]));
 const foundConstraints=new Set(constraints.map(c=>c.conname));
 const tables=Object.fromEntries(TABLES.map(t=>[t,found.has(t)]));
 const rowLevelSecurityEnabled=Object.fromEntries(TABLES.map(t=>[t,found.get(t)?.rowsecurity===true]));
 const rowLevelSecurityForced=Object.fromEntries(TABLES.map(t=>[t,found.get(t)?.forcerowsecurity===true]));
 const requiredConstraintsPresent=Object.fromEntries(CONSTRAINTS.map(c=>[c,foundConstraints.has(c)]));
 return {tables,rowLevelSecurityEnabled,rowLevelSecurityForced,requiredConstraintsPresent,
   readyForIntegrationTests:Object.values(tables).every(Boolean)&&
    Object.values(rowLevelSecurityEnabled).every(Boolean)&&
    Object.values(rowLevelSecurityForced).every(Boolean)&&
    Object.values(requiredConstraintsPresent).every(Boolean),
   migrationAppliedByThisCheck:false};
}
