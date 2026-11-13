/**
 * Source-clearance authority tool. Run ONLY by the independent authority (a named person), on their own machine.
 * Never run by an engineer or an agent on the authority's behalf: signing a receipt asserts that a human checked the
 * source's identity, licence and retraction status. The private key stays in --private-dir (default ~/.hsi-clearance-authority,
 * never inside this repository); the runtime reads only --publish-dir.
 *
 *   keygen --publish-dir D --issuer I --key-id K [--private-dir P]   create the key pair and the public authority record
 *   attest --publish-dir D --request file.json --actions a,b --evidence "..." --operator "Name" [--valid-hours N]
 *   revoke --publish-dir D --receipt-id ID --reason "..."
 *   verify --publish-dir D --receipt file.json --passage-file file.txt   read-only; exit 0 only if the runtime would accept it
 *   list   --publish-dir D                                              read-only summary of issued receipts
 * keygen, attest and revoke require an interactive terminal and a typed confirmation.
 */
import {chmod,mkdir,readFile,readdir,stat,writeFile} from "node:fs/promises";
import {homedir} from "node:os";
import {join,relative,resolve} from "node:path";
import {createInterface} from "node:readline/promises";
import {attestSource,createFileSourceAuthority,readAuthorityInfo,revokeReceipt,type AttestRequest,type AuthorityInfo} from "../src/researchV2/clearanceAuthority";
import {ALL_ACTIONS,MAX_VALIDITY_MS,generateAuthorityKeyPair,loadPrivateKey,loadPublicKey,verifyReceipt} from "../src/researchV2/clearanceSigning";
import type {SourceUseAction} from "../src/researchV2/sourceClearanceReceipt";

const args=process.argv.slice(2),command=args[0];
const flag=(name:string)=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined};
function fail(message:string,code=2):never{console.error(message);process.exit(code)}
const repoRoot=resolve(import.meta.dir,"..");
const insideRepo=(path:string)=>{const rel=relative(repoRoot,resolve(path));return rel===""||(!rel.startsWith("..")&&!rel.startsWith("/"))};
const interactive=()=>{if(!process.stdin.isTTY||!process.stdout.isTTY)fail("Refusing to run: this command needs an interactive terminal and a human at it. An engineer or an agent must not run it for the authority.")};
const publishDir=resolve(flag("--publish-dir")??fail("--publish-dir is required"));
const privateDir=resolve(flag("--private-dir")??join(homedir(),".hsi-clearance-authority"));

async function typedConfirmation(lines:string[],phrase:string):Promise<boolean>{
 const rl=createInterface({input:process.stdin,output:process.stdout});
 try{console.log(lines.join("\n"));return (await rl.question(`Type "${phrase}" to confirm, anything else cancels: `)).trim()===phrase}finally{rl.close()}
}
async function loadKey(){
 const file=join(privateDir,"private-key.pem"),info=await stat(file).catch(()=>fail(`No private key at ${file}. Run keygen first.`));
 if((info.mode&0o077)!==0)fail(`Refusing to use a private key readable by others: ${file}`);
 return loadPrivateKey(await readFile(file,"utf8"));
}

if(command==="keygen"){
 interactive();
 const issuer=flag("--issuer"),keyId=flag("--key-id");
 if(!issuer||!keyId)fail("--issuer and --key-id are required");
 if(insideRepo(privateDir))fail(`Refusing: the private key directory must be outside this repository: ${privateDir}`);
 if(resolve(privateDir)===publishDir)fail("Refusing: the publish directory must differ from the private directory");
 const pair=generateAuthorityKeyPair();
 await mkdir(privateDir,{recursive:true,mode:0o700});await chmod(privateDir,0o700);
 await writeFile(join(privateDir,"private-key.pem"),pair.privateKeyPem,{mode:0o600,flag:"wx"}).catch(()=>fail(`A private key already exists in ${privateDir}; refusing to overwrite it.`));
 await mkdir(publishDir,{recursive:true});
 const info:AuthorityInfo={schemaVersion:"hsi-clearance-authority-1",issuer,keyId,publicKeyPem:pair.publicKeyPem};
 await writeFile(join(publishDir,"authority.json"),`${JSON.stringify(info,null,1)}\n`,{mode:0o644});
 console.log(`Key pair created. Private key: ${join(privateDir,"private-key.pem")} (mode 600, never share it). Public record: ${join(publishDir,"authority.json")}.`);
 console.log("Give the public record to whoever configures the runtime; they pin issuer, key id and public key. Back the private key up offline.");
}else if(command==="attest"){
 interactive();
 const requestFile=flag("--request")??fail("--request is required");
 const request=JSON.parse(await readFile(resolve(requestFile),"utf8")) as AttestRequest;
 const actions=(flag("--actions")??fail("--actions is required, for example storage,display,comparison,export")).split(",").map(a=>a.trim()) as SourceUseAction[];
 if(actions.some(a=>!ALL_ACTIONS.includes(a)))fail(`Unknown action. Allowed: ${ALL_ACTIONS.join(", ")}`);
 const hours=Number(flag("--valid-hours")??"12");
 if(!Number.isFinite(hours)||hours<=0||hours*3600_000>MAX_VALIDITY_MS)fail("--valid-hours must be greater than 0 and at most 24");
 const authority=await readAuthorityInfo(publishDir),privateKey=await loadKey();
 const out=await attestSource({request,authority,privateKey,publishDir,privateDir,actions,validForMs:Math.round(hours*3600_000),evidence:flag("--evidence")??"",operator:flag("--operator")??"",
  confirm:s=>typedConfirmation([
   "","You are attesting, with your key, that you personally checked this source:",
   `  source:        ${s.sourceId} (${s.canonicalId})`,`  licence:       ${s.licenceId}`,`  actions:       ${s.actions.join(", ")}`,`  valid until:   ${s.validUntil}`,
   `  evidence:      ${s.evidence}`,`  operator:      ${s.operator}`,`  passages (${s.passages.length}):`,...s.passages.map(p=>`    ${p.sha256.slice(0,12)}  ${p.preview.replace(/\s+/g," ")}`),
   "","Identity matched, rights verified for these actions, and no retraction or correction found.",""],request.canonicalId)});
 console.log(out.declined?"Cancelled. Nothing was signed.":`Signed ${out.receipts.length} receipt(s) into ${join(publishDir,"receipts")}. Audit entry appended in ${privateDir}.`);
}else if(command==="revoke"){
 interactive();
 const receiptId=flag("--receipt-id")??fail("--receipt-id is required"),reason=flag("--reason")??fail("--reason is required");
 const authority=await readAuthorityInfo(publishDir),privateKey=await loadKey();
 const out=await revokeReceipt({receiptId,reason,authority,privateKey,publishDir,confirm:s=>typedConfirmation(["",`Revoke ${s.receiptId}`,`Reason: ${s.reason}`,""],s.receiptId)});
 console.log(out.declined?"Cancelled. Nothing was signed.":`Revocation signed and appended to ${join(publishDir,"revocations.jsonl")}.`);
}else if(command==="verify"){
 const file=flag("--receipt")??fail("--receipt is required"),passageFile=flag("--passage-file")??fail("--passage-file is required");
 const info=await readAuthorityInfo(publishDir);
 const passage=await readFile(resolve(passageFile),"utf8");
 const receipt=JSON.parse(await readFile(resolve(file),"utf8"));
 const {isRevoked}=await createFileSourceAuthority({publishDir,policyRef:"policy:verify"});
 const ok=await verifyReceipt(receipt,{publicKey:loadPublicKey(info.publicKeyPem),passage:passage.replace(/\n$/,""),isRevoked:id=>isRevoked(id,info.issuer)});
 console.log(ok?"VALID: the runtime would accept this receipt now.":"INVALID: the runtime would reject this receipt (bad signature, wrong passage, expired, revoked, or malformed).");
 process.exit(ok?0:1);
}else if(command==="list"){
 const names=await readdir(join(publishDir,"receipts")).catch(()=>[] as string[]);
 const {isRevoked,info}=await createFileSourceAuthority({publishDir,policyRef:"policy:list"});
 for(const name of names.filter(n=>n.endsWith(".json")).sort()){
  const r=JSON.parse(await readFile(join(publishDir,"receipts",name),"utf8"));
  console.log(`${r.id}  ${r.sourceId}  ${r.permittedActions.join(",")}  expires ${r.expiresAt}${await isRevoked(r.id,info.issuer)?"  REVOKED":""}`);
 }
 if(!names.length)console.log("No receipts issued.");
}else fail("Usage: bun scripts/clearance-authority.ts <keygen|attest|revoke|verify|list> --publish-dir <dir> ... (see the header of this file)");
