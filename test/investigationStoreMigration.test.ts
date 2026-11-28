import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {HELD_MIGRATION_IDS} from "../src/db/migrationHolds";
import {splitPostgresStatements} from "../src/db/migrationRehearsal";
import {carriesApproval,createInvestigationStore,type StoreSql} from "../src/db/investigationStore";

const ID="034_hsi_investigation_store",sql=readFileSync(`db/migrations/${ID}.sql`,"utf8");
const TABLES=["hsi_investigation_events","hsi_investigation_outputs","hsi_investigations","hsi_memberships","hsi_scopes"];

test("034 is held for production and names the accepted ADRs and the review it waits for",()=>{
 expect((HELD_MIGRATION_IDS as readonly string[]).includes(ID)).toBe(true);
 expect(sql.split("\n")[0]).toContain("HELD");
 for(const k of ["ADR-012","ADR-013","ADR-014","Track B2","ROLLBACK"])expect(sql).toContain(k);
});
test("034 creates exactly the ADR-012 and ADR-014 tables, each deny-by-default",()=>{
 expect(splitPostgresStatements(sql).length).toBeGreaterThan(30);
 expect([...sql.matchAll(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g)].map(m=>m[1]).sort()).toEqual(TABLES);
 for(const t of TABLES){expect(sql).toContain(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`);expect(sql).toContain(`ALTER TABLE public.${t} FORCE ROW LEVEL SECURITY`)}
 expect(/GRANT\s+(SELECT|INSERT|UPDATE|DELETE|ALL)/i.test(sql)).toBe(false);
});
test("034 trusts no session or owner setting (ADR-013)",()=>{
 expect(/current_setting\(/i.test(sql)).toBe(false);expect(/set_config\(/i.test(sql)).toBe(false);
 expect(sql).toContain("neon_auth.session s JOIN neon_auth.\"user\"");
 const fns=[...sql.matchAll(/CREATE OR REPLACE FUNCTION public\.(hsi_(?:inv|scope|membership)_\w+)\(p_token/g)].map(m=>m[1]);
 expect(fns.length).toBeGreaterThanOrEqual(11);
 for(const f of fns){const body=sql.slice(sql.indexOf(`FUNCTION public.${f}(`));expect(body.slice(0,body.indexOf("BEGIN"))).toContain("hsi_session_principal(p_token)")}
});
test("034 seeds only today's two scopes and keeps the bootstrap away from the runtime",()=>{
 expect(sql).toContain("('ssc','Systemic sclerosis','migration-034'),('ra','Rheumatoid arthritis','migration-034')");
 const grant=sql.slice(sql.indexOf("GRANT EXECUTE"));expect(grant).not.toContain("hsi_membership_bootstrap");expect(grant).not.toContain("hsi_session_principal");
});
test("nothing in 034 can carry scientific approval",()=>{
 expect(sql.match(/scientificApproval \? \(@ == true\)/g)?.length).toBe(2);
 expect(sql.match(/scientificClaimAllowed \? \(@ == true\)/g)?.length).toBe(2);
 expect(/approved_at|approval_status|promote/i.test(sql.replace(/promotes a graph edge/,""))).toBe(false);
});
test("the disposable isolation suite exists and covers each guarantee",()=>{
 const s=readFileSync("scripts/verify-investigation-store-local.ts","utf8"),setup=readFileSync("db/verify/034_investigation_store_setup.sql","utf8");
 expect(setup).toContain("DISPOSABLE");expect(setup).toContain("Never run this against Neon");
 for(const k of ["forged token","expired session","impersonated session","unverified email","banned user","forged session setting","cannot read","self-grant","revoked membership loses access","inactive scope","append-only","immutable","scientific approval"])expect(s).toContain(k);
});

const fake=()=>{const calls:{q:string;p:unknown[]}[]=[];const sql:StoreSql={async unsafe(q,p){calls.push({q,p:p??[]});return [{r:q.includes("hsi_inv_list")?"[]":q.includes("hsi_inv_create")?"00000000-0000-4000-8000-000000000001":1}]}};return{sql,calls}};
test("the adapter sends the token and never an owner id, and refuses approval before the database",async()=>{
 const {sql,calls}=fake(),s=createInvestigationStore(sql,"tokenAAAAAAAAAAAAAAAA");
 expect(await s.create({question:"Is this a fair question?",graphVersion:"a".repeat(64)})).toBe("00000000-0000-4000-8000-000000000001");
 expect(calls[0]!.p[0]).toBe("tokenAAAAAAAAAAAAAAAA");expect(calls[0]!.q).toContain("hsi_inv_create");
 await expect(s.addOutput("00000000-0000-4000-8000-000000000001",{section:"01",body:{x:[{scientificApproval:true}]},lineage:{}})).rejects.toThrow("approval");
 await expect(s.create({question:"Is this a fair question?",graphVersion:"latest"})).rejects.toThrow("Pin the graph version");
 expect(await s.get("not-a-uuid")).toBeNull();
 expect(()=>createInvestigationStore(sql,"short")).toThrow("Invalid authenticated session");
 expect(carriesApproval({a:{scientificClaimAllowed:false}})).toBe(false);
 expect(calls.length).toBe(1);
});
