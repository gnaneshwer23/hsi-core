/** P1.10 read-only Neon staging security acceptance gate.
 * Does not execute migrations or issue database writes.
 */
import type {ReadonlySqlClient} from "./neonEvidenceSchemaReadiness";
import {inspectNeonEvidenceSchema} from "./neonEvidenceSchemaReadiness";

const TABLES=["hsi_research_evidence_snapshots","hsi_research_evidence_review_events"] as const;
const POLICIES=[
 "hsi_evidence_snapshots_tenant_select",
 "hsi_evidence_snapshots_tenant_insert",
 "hsi_evidence_snapshots_tenant_update",
 "hsi_evidence_reviews_tenant_select",
 "hsi_evidence_reviews_tenant_insert",
] as const;
export type StagingSecurityAcceptance={
 schemaReady:boolean;
 applicationRolePresent:boolean;
 applicationRoleCannotBypassRls:boolean;
 applicationRoleDoesNotOwnEvidenceTables:boolean;
 expectedPoliciesPresent:boolean;
 policiesTenantScoped:boolean;
 readyForSyntheticIntegrationTests:boolean;
};
export async function inspectStagingSecurityAcceptance(db:ReadonlySqlClient):
 Promise<StagingSecurityAcceptance>{
 const schema=await inspectNeonEvidenceSchema(db);
 const roles=await db.query<{rolname:string;rolbypassrls:boolean;rolsuper:boolean}>(`
 SELECT rolname,rolbypassrls,rolsuper FROM pg_roles
 WHERE rolname='hsi_evidence_app'`);
 const owners=await db.query<{tablename:string;ownername:string}>(`
 SELECT c.relname AS tablename,r.rolname AS ownername
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 JOIN pg_roles r ON r.oid=c.relowner
 WHERE n.nspname='public' AND c.relname=ANY($1::text[])`,[[...TABLES]]);
 const policies=await db.query<{tablename:string;policyname:string;roles:string[];
   qual:string|null;with_check:string|null}>(`
 SELECT tablename,policyname,roles,qual,with_check FROM pg_policies
 WHERE schemaname='public' AND tablename=ANY($1::text[])`,[[...TABLES]]);
 const role=roles[0];
 const applicationRolePresent=Boolean(role);
 const applicationRoleCannotBypassRls=Boolean(role&&!role.rolbypassrls&&!role.rolsuper);
 const applicationRoleDoesNotOwnEvidenceTables=owners.length===TABLES.length&&
   owners.every(o=>o.ownername!=='hsi_evidence_app');
 const expectedPoliciesPresent=POLICIES.every(name=>policies.some(p=>
   p.policyname===name&&p.roles.includes('hsi_evidence_app')));
 const policiesTenantScoped=expectedPoliciesPresent&&
   POLICIES.every(name=>policies.some(p=>p.policyname===name&&
     [p.qual,p.with_check].filter(Boolean).some(s=>
       s!.includes("hsi.organization_id")&&s!.includes("organization_id"))));
 const readyForSyntheticIntegrationTests=schema.readyForIntegrationTests&&
   applicationRolePresent&&applicationRoleCannotBypassRls&&
   applicationRoleDoesNotOwnEvidenceTables&&expectedPoliciesPresent&&policiesTenantScoped;
 return {schemaReady:schema.readyForIntegrationTests,applicationRolePresent,
  applicationRoleCannotBypassRls,applicationRoleDoesNotOwnEvidenceTables,
  expectedPoliciesPresent,policiesTenantScoped,readyForSyntheticIntegrationTests};
}
