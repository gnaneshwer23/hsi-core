#!/usr/bin/env bun
/** Metadata-only SSc ingestion into the dedicated HSI database; requires migration 002. */
import { SQL } from "bun";
import { assertHsiNeonDatabaseUrl } from "../db/neonGuard";
import { resolveDatabaseUrl } from "../db/resolveDatabaseUrl";
import { fetchEuropePmcMetadata, SSC_INITIAL_PMIDS } from "../evidenceIngestion";

const dryRun = process.argv.includes("--dry-run");
const fromNeonctl = process.argv.includes("--from-neonctl");
const pmids = process.argv.filter(arg => /^--pmid=\d{1,9}$/.test(arg)).map(arg => arg.split("=")[1]!);
const selected = pmids.length ? pmids : [...SSC_INITIAL_PMIDS];
if (new Set(selected).size !== selected.length || selected.length > 25) throw new Error("Duplicate or excessive PMIDs");
const {databaseUrl,neonProjectId} = dryRun ? {databaseUrl:"",neonProjectId:""} : resolveDatabaseUrl({fromNeonctl});
if (!dryRun) {
 const check = assertHsiNeonDatabaseUrl(databaseUrl,{neonProjectId});
 if (!check.ok) throw new Error(`Refusing database write: ${check.reason}`);
}
const sql = dryRun ? null : new SQL(databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
let succeeded = 0;
let failed = 0;
try {
 for (const pmid of selected) {
  try {
   const source = await fetchEuropePmcMetadata(pmid);
   if (sql) {
    const metadataJson = JSON.stringify(source.metadata);
    await sql`INSERT INTO hsi_evidence_sources
      (id,source_kind,external_id,title,source_url,doi,pmid,licence_status,retraction_status,retrieved_at,metadata)
      VALUES (${source.id},${source.source_kind},${source.external_id},${source.title},${source.source_url},${source.doi},${source.pmid},${source.licence_status},${source.retraction_status},${source.retrieved_at},${metadataJson}::jsonb)
      ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,source_url=EXCLUDED.source_url,
      doi=EXCLUDED.doi,retraction_status=EXCLUDED.retraction_status,retrieved_at=EXCLUDED.retrieved_at,
      metadata=EXCLUDED.metadata
      WHERE hsi_evidence_sources.retrieved_at <= EXCLUDED.retrieved_at`;
   }
   console.log(JSON.stringify({pmid,ok:true,dryRun,title:source.title,recordHash:source.metadata.recordHash,claimSupport:"not_assessed"}));
   succeeded++;
  } catch (error) {
   failed++;
   console.error(JSON.stringify({pmid,ok:false,error:error instanceof Error?error.message:"Unknown error"}));
  }
 }
} finally {if(sql) await sql.close();}
console.log(JSON.stringify({succeeded,failed,dryRun,source:"Europe PMC metadata",approvedClaims:0}));
if (failed) process.exitCode=1;
