/** Read-only operator report plus a disposable PUBLIC artifact recovery drill. No live service calls. */
import {readFileSync,writeFileSync,lstatSync} from "node:fs";
import {resolve,join} from "node:path";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {assessResearchPilotReadiness} from "../src/researchPilotReadiness";
import {runPublicArtifactRecoveryDrill} from "../src/researchRecovery";
import {readResearchDeploymentConfig} from "../src/server/vercelResearch";
const root=resolve(import.meta.dir,".."),args=process.argv.slice(2),opts=new Map<string,string>();
try{
 for(let i=0;i<args.length;i+=2){const key=args[i],v=args[i+1];if(!key||!["--evidence","--out"].includes(key)||!v||v.startsWith("--")||opts.has(key))throw Error();opts.set(key,v)}
 const path=opts.has("--evidence")?resolve(opts.get("--evidence")!):join(root,"operations/pilot/evidence.pending.json"),stat=lstatSync(path);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>100000)throw Error();
 const evidence=JSON.parse(readFileSync(path,"utf8")),readiness=assessResearchPilotReadiness(evidence),commit=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim(),config=readResearchDeploymentConfig(process.env);
 const recovery=await runPublicArtifactRecoveryDrill(root,commit);
 const locks=["bun.lock","site/bun.lock"].map(path=>({path,sha256:createHash("sha256").update(readFileSync(join(root,path))).digest("hex")}));
 const report={...readiness,candidateCommit:commit,checkedAt:new Date().toISOString(),localRecovery:recovery,lockfiles:locks,configuration:{validationAttempted:true,configurationValidated:config.ok,databaseConnectionTested:false,authCredentialsTested:false,writesEnabled:config.ok&&config.writesEnabled,sharedAdmissionRequired:process.env.HSI_PILOT_REQUIRE_SHARED_LIMITER==="true",maintenance:process.env.HSI_RESEARCH_MAINTENANCE==="true"},dependencyVulnerabilitiesChecked:false,liveDeploymentVerified:false};
 const text=JSON.stringify(report,null,2)+"\n";if(opts.has("--out"))writeFileSync(resolve(opts.get("--out")!),text,{flag:"wx"});else process.stdout.write(text);
}catch{console.error("Pilot report refused: check evidence schema, bounded file paths, lockfiles and public artifact integrity. No live restore, deployment or scientific approval was performed.");process.exitCode=1}
