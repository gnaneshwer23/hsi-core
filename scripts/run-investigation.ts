/** Local investigation runner. Usage: bun scripts/run-investigation.ts --fixture <name|path> [--out <dir>] [--json]
 * Fixture mode only: replays recorded synthetic inputs, makes no network or model call, and writes an append-only,
 * hash-chained audit under --out (default out/investigations, which is git-ignored).
 * Live mode needs an approved source-policy owner and an approved model deployment and is not available here.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {runFixtureInvestigation} from "../src/investigationRunner";

const args=process.argv.slice(2);
const flag=(name:string)=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined};
if(flag("--mode")==="live"||args.includes("--live")){
 console.error("Live mode is not available: it requires an approved source-policy owner and terms, and an approved model deployment (see the roadmap's human-held inputs).");
 process.exit(2);
}
const fixtureArg=flag("--fixture");
if(!fixtureArg){console.error("Usage: bun scripts/run-investigation.ts --fixture <name|path> [--out <dir>] [--json]");process.exit(2)}
const path=/[\\/]/.test(fixtureArg)?resolve(fixtureArg):resolve(import.meta.dir,"..","research","runner-fixtures",fixtureArg+".v1.json");
let fixture:unknown;
try{fixture=JSON.parse(readFileSync(path,"utf8"))}catch{console.error("Cannot read a JSON fixture at "+path);process.exit(2)}
try{
 const result=await runFixtureInvestigation({fixture,storeDirectory:resolve(flag("--out")??"out/investigations")});
 console.log(args.includes("--json")?JSON.stringify({notice:result.notice,auditHash:result.audit.auditHash,version:result.audit.version,scope:result.audit.diseaseScope,verifier:result.audit.verifier,report:result.audit.report,rejections:result.rejections,orientation:result.orientation?{entities:result.orientation.entities,searchTerms:result.orientation.searchTerms,navigationOnly:true}:null},null,1):result.brief);
}catch(error){console.error("Run failed: "+(error instanceof Error?error.message:"unknown error"));process.exit(1)}
export {};
