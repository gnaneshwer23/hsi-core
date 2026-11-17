/**
 * VER-05 label vault authoring stubs (A4.1).
 *
 *   bun run label-vault:init
 *   bun run label-vault:status
 *   bun run label-vault:validate
 *   bun run label-vault:scaffold-conflict -- --id CB-001 --question "..."
 *   bun run label-vault:freeze -- --track conflict
 *
 * Writes only under gitignored `.hsi-private-benchmark/`. Never invents gold labels.
 */
import {resolve} from "node:path";
import {
  LABEL_VAULT_LAYOUT,
  appendConflictCaseStub,
  freezeConflictLabels,
  initLabelVault,
  labelVaultStatus,
  scaffoldConflictCaseStub,
  validateLabelVaultLayout,
} from "../src/evidence/labelVault";

const root=resolve(import.meta.dir,"..");
const args=process.argv.slice(2);
const cmd=args[0]??"status";
const flag=(name:string)=>args.includes(name);
const value=(name:string)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]!:undefined};

if(cmd==="layout"){
  console.log(JSON.stringify(LABEL_VAULT_LAYOUT,null,2));
  process.exit(0);
}

if(cmd==="init"){
  const result=initLabelVault(root);
  console.log(JSON.stringify({ok:true,root:result.root.slice(root.length+1),created:result.created,scientificApproval:false,goldCommittedInGit:false},null,2));
  process.exit(0);
}

if(cmd==="status"){
  console.log(JSON.stringify(labelVaultStatus(root),null,2));
  process.exit(0);
}

if(cmd==="validate"){
  const status=validateLabelVaultLayout(root);
  console.log(JSON.stringify({ok:true,...status},null,2));
  process.exit(0);
}

if(cmd==="scaffold-conflict"){
  const id=value("--id");
  const question=value("--question");
  if(!id||!question){
    console.error("Usage: bun run label-vault:scaffold-conflict -- --id CB-001 --question \"...\"");
    process.exit(1);
  }
  initLabelVault(root);
  const stub=scaffoldConflictCaseStub({id,question});
  if(flag("--dry-run")){
    console.log(JSON.stringify({dryRun:true,stub,note:"labels left empty; curator fills privately"},null,2));
    process.exit(0);
  }
  const written=appendConflictCaseStub(root,stub);
  console.log(JSON.stringify({wrote:written.path,id,total:written.total,labelsInvented:false,scientificApproval:false},null,2));
  process.exit(0);
}

if(cmd==="freeze"){
  const track=value("--track")??"conflict";
  if(track!=="conflict"){
    console.error("Only --track conflict is stubbed in A4.1");
    process.exit(1);
  }
  const record=freezeConflictLabels(root);
  console.log(JSON.stringify({froze:true,track:record.track,contentSha256:record.contentSha256,caseIds:record.caseIds.length,scientificApproval:false,floorsOwnerApproved:false},null,2));
  process.exit(0);
}

console.error("Unknown command. Use: layout | init | status | validate | scaffold-conflict | freeze");
process.exit(1);
