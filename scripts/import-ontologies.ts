/**
 * Downloads the approved, pinned ontology releases into the gitignored .ontology-cache/, checks them against the
 * manifest's sha256, and writes compact term tables. Network access happens only with --execute.
 *   bun scripts/import-ontologies.ts                 dry run: prints what would be downloaded
 *   bun scripts/import-ontologies.ts --execute       download, verify, extract
 *   bun scripts/import-ontologies.ts --execute --record   also write sha256, bytes and term counts into the manifest
 * Writes nothing to any database.
 */
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {ingestRelease,type ImportManifest} from "../src/ontology/ontologyImport";

const MANIFEST="research/ontology/import-manifest.v1.json",CACHE=".ontology-cache";
const execute=process.argv.includes("--execute"),record=process.argv.includes("--record");
const manifest=JSON.parse(readFileSync(MANIFEST,"utf8")) as ImportManifest;
if(!execute){for(const s of manifest.sources)console.log(`would download ${s.prefix} ${s.release} (${s.licence}) from ${s.url}${s.sha256?" and verify "+s.sha256.slice(0,12):" (hash not yet recorded)"}`);console.log("Dry run. Pass --execute to download.");process.exit(0)}
mkdirSync(`${CACHE}/raw`,{recursive:true});mkdirSync(`${CACHE}/terms`,{recursive:true});
for(const s of manifest.sources){
 const res=await fetch(s.url,{redirect:"follow",signal:AbortSignal.timeout(600000)});
 if(!res.ok)throw Error(`${s.prefix}: download failed with HTTP ${res.status}`);
 const bytes=new Uint8Array(await res.arrayBuffer());
 const {sha256,extracted}=await ingestRelease(s,bytes);
 writeFileSync(`${CACHE}/raw/${s.prefix}.${s.format==="obo"?"obo":"json"}`,bytes);
 writeFileSync(`${CACHE}/terms/${s.prefix}.json`,JSON.stringify({schemaVersion:"hsi-ontology-terms-1",prefix:s.prefix,release:s.release,licence:s.licence,sha256,dataVersion:extracted.dataVersion,terms:extracted.terms}));
 console.log(`${s.prefix} ${s.release}: ${extracted.terms.length} terms, ${bytes.length} bytes, sha256 ${sha256.slice(0,16)}`);
 if(record){s.sha256=sha256;s.bytes=bytes.length;s.termCount=extracted.terms.length;s.dataVersion=extracted.dataVersion}
}
if(record){writeFileSync(MANIFEST,JSON.stringify(manifest,null,1)+"\n");console.log("Manifest updated with hashes and counts.")}
