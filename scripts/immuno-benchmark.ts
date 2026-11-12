#!/usr/bin/env bun
/** Public protocol only. Never reads a gold vault, runs a provider, or exports held-out questions/answers. */
import {readFileSync,writeFileSync,readdirSync,statSync,existsSync} from "node:fs";
import {resolve,join} from "node:path";
import {buildImmunoProtocol,IMMUNO_PATH,benchmarkDigest,assertNoStructuredBenchmarkGold} from "../src/evidence/immunoBenchmark";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
const root=resolve(import.meta.dir,".."),path=resolve(root,IMMUNO_PATH,"protocol.v1.json"),expected=buildImmunoProtocol();
if(process.argv.includes("--write"))writeFileSync(path,JSON.stringify(expected,null,2)+"\n");
if(canonicalEvidenceJson(JSON.parse(readFileSync(path,"utf8")))!==canonicalEvidenceJson(expected))throw Error("Public immunology protocol drift or private field injection");
// Defense in depth for structured private gold accidentally copied to public JSON.
function scan(path:string){if(!existsSync(path))return;for(const name of readdirSync(path)){const file=join(path,name);if(statSync(file).isDirectory())scan(file);else if(file.endsWith(".json"))assertNoStructuredBenchmarkGold(JSON.parse(readFileSync(file,"utf8")))}}
scan(resolve(root,"site/public"));scan(resolve(root,"site/dist"));
console.log(JSON.stringify({benchmark:expected.benchmark,protocolHash:expected.protocolHash,slots:expected.slots.length,authoredCases:0,adjudicatedCases:0,scientificAcceptance:"BLOCKED",publicArtifactScan:"passed_structured_fields_only",scanHash:benchmarkDigest({protocolHash:expected.protocolHash,ruleVersion:2})}));
