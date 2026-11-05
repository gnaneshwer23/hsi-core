/** Offline preparation only: no ClinicalTrials.gov connector, patient input or scientific acceptance. */
import {readFileSync,writeFileSync,lstatSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {prepareRegistrySnapshot} from "../src/researchCoverage";
const args=process.argv.slice(2);
try{
 if(args.length!==4||args[0]!=="--input"||args[2]!=="--out")throw Error();
 const input=resolve(args[1]!),output=resolve(args[3]!),stat=lstatSync(input);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>500000||input===output)throw Error();
 const snapshot=await prepareRegistrySnapshot(JSON.parse(readFileSync(input,"utf8")),async text=>createHash("sha256").update(text).digest("hex"));
 if(Date.parse(snapshot.retrievedAt)>Date.now())throw Error();
 writeFileSync(output,JSON.stringify({schemaVersion:"hsi-registry-import-status-1",status:"operator_snapshot_supplied",snapshot},null,2)+"\n",{flag:"wx"});
 console.log(JSON.stringify({status:"prepared_for_operator_review",version:snapshot.version,records:snapshot.records.length,origin:snapshot.origin,liveRegistryQueried:false,eligibilityAssessed:false,canonicalCatalogueChanged:false}));
}catch{console.error("Registry preparation refused. Use --input FILE --out NEW_FILE with bounded, non-identifying public registry metadata, supported fields and a non-future retrieval timestamp. No registry query or catalogue change occurred.");process.exitCode=1}
