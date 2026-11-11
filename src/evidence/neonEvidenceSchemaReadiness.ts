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
 "snapshots_primary_key",
 "snapshots_idempotency_unique",
 "review_events_primary_key",
 "review_events_snapshot_unique",
] as const;
export async function inspectNeonEvidenceSchema(db:ReadonlySqlClient):Promise<NeonStagingReadiness>{
 const rows=await db.query<{tablename:string;rowsecurity:boolean;forcerowsecurity:boolean}>(`
  SELECT c.relname AS tablename,c.relrowsecurity AS rowsecurity,
         c.relforcerowsecurity AS forcerowsecurity
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname=current_schema() AND c.relkind='r'
    AND c.relname=ANY($1::text[])
 `,[[...TABLES]]);
 const constraints=await db.query<{tablename:string;constraint_type:string;definition:string}>(`
  SELECT c.relname AS tablename,con.contype AS constraint_type,\n         pg_get_constraintdef(con.oid) AS definition FROM pg_constraint con
  JOIN pg_class c ON c.oid=con.conrelid
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname=current_schema() AND c.relname=ANY($1::text[])
 `,[[...TABLES]]);
 const found=new Map(rows.map(r=>[r.tablename,r]));
 const hasConstraint=(table:string,type:string,columns:string)=>constraints.some(c=>\n   c.tablename===table&&c.constraint_type===type&&\n   c.definition.includes(`(${columns})`));
 const tables=Object.fromEntries(TABLES.map(t=>[t,found.has(t)]));
 const rowLevelSecurityEnabled=Object.fromEntries(TABLES.map(t=>[t,found.get(t)?.rowsecurity===true]));
 const rowLevelSecurityForced=Object.fromEntries(TABLES.map(t=>[t,found.get(t)?.forcerowsecurity===true]));
 const requiredConstraintsPresent={\n   snapshots_primary_key:hasConstraint(TABLES[0],"p","organization_id, snapshot_id"),\n   snapshots_idempotency_unique:hasConstraint(TABLES[0],"u","organization_id, idempotency_key"),\n   review_events_primary_key:hasConstraint(TABLES[1],"p","event_id"),\n   review_events_snapshot_unique:hasConstraint(TABLES[1],"u","organization_id, snapshot_id"),\n };
 return {tables,rowLevelSecurityEnabled,rowLevelSecurityForced,requiredConstraintsPresent,
   readyForIntegrationTests:Object.values(tables).every(Boolean)&&
    Object.values(rowLevelSecurityEnabled).every(Boolean)&&
    Object.values(rowLevelSecurityForced).every(Boolean)&&
    Object.values(requiredConstraintsPresent).every(Boolean),
   migrationAppliedByThisCheck:false};
}
