/**
 * P2: append-only, hash-chained local store for context-conflict audit versions (single researcher, one host).
 * Matches the runner's `append` contract: the caller passes the previous audit hash and the store refuses to
 * write unless it is still the latest version, never overwriting an existing version file. This is a local
 * reference store; hosted, tenant-scoped persistence is a separate approved step (held migrations).
 */
import {mkdir,open,readdir,readFile,unlink} from "node:fs/promises";
import {join,resolve} from "node:path";
import {validateContextConflictAudit,type ContextConflictAudit} from "./contextConflictAudit";

const SAFE=/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
export class AuditChainConflictError extends Error{constructor(){super("Audit version conflict")}}

export function createAuditFileStore(directory:string){
 const root=resolve(directory);
 const dir=(investigationId:string)=>{if(!SAFE.test(investigationId))throw Error("Invalid investigation id");return join(root,investigationId)};
 async function versions(investigationId:string):Promise<{version:number;file:string}[]>{
  let names:string[];
  try{names=await readdir(dir(investigationId))}catch(e){if((e as NodeJS.ErrnoException).code==="ENOENT")return [];throw e}
  return names.map(n=>/^v(\d{1,6})-[a-f0-9]{64}\.json$/.exec(n)).filter((m):m is RegExpExecArray=>m!==null).map(m=>({version:Number(m[1]),file:join(dir(investigationId),m[0])})).sort((a,b)=>a.version-b.version);
 }
 async function load(file:string):Promise<ContextConflictAudit>{
  const audit=JSON.parse(await readFile(file,"utf8")) as ContextConflictAudit;validateContextConflictAudit(audit);return audit;
 }
 return {
  async latest(investigationId:string):Promise<ContextConflictAudit|null>{const all=await versions(investigationId);return all.length?load(all[all.length-1]!.file):null},
  async history(investigationId:string):Promise<ContextConflictAudit[]>{return Promise.all((await versions(investigationId)).map(v=>load(v.file)))},
  async append(artifact:Readonly<ContextConflictAudit>,expectedPrevious:string|null):Promise<void>{
   validateContextConflictAudit(artifact as ContextConflictAudit);
   const check=async()=>{
    const all=await versions(artifact.investigationId),latest=all.length?await load(all[all.length-1]!.file):null;
    if((latest?.auditHash??null)!==expectedPrevious||artifact.version!==(latest?.version??0)+1||artifact.parentAuditHash!==expectedPrevious)throw new AuditChainConflictError();
   };
   await check();
   await mkdir(dir(artifact.investigationId),{recursive:true,mode:0o700});
   // Exclusive per-version claim: file names include the hash, so only this marker stops two writers creating the same version.
   const claim=join(dir(artifact.investigationId),`v${artifact.version}.claim`);
   let claimHandle;
   try{claimHandle=await open(claim,"wx",0o600)}catch(e){if((e as NodeJS.ErrnoException).code==="EEXIST")throw new AuditChainConflictError();throw e}
   await claimHandle.close();
   try{
    await check();
    const handle=await open(join(dir(artifact.investigationId),`v${artifact.version}-${artifact.auditHash}.json`),"wx",0o600);
    try{await handle.writeFile(JSON.stringify(artifact));await handle.sync()}finally{await handle.close()}
   }catch(e){await unlink(claim).catch(()=>{});throw e}
  },
 };
}
