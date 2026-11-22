/** ARCH-009 durable checkpoint store on the local file system.
 * Implements `HsiCheckpointStore` so a recovered process can read the checkpoints a crashed one wrote. It exists because the
 * Neon checkpoint adapter needs a migration and migrations 022-033 stay held until approved; this is a file store on purpose,
 * like `nexusJobs.ts`. It is for one host (a single machine or a shared volume with working `mkdir` and `rename`), not a
 * distributed lock service.
 *
 * Compare-and-swap is atomic across processes: a lock directory is created with `mkdir` (which fails if it exists), the stored
 * version is compared under the lock, and the new record is written to a temporary file, flushed, then renamed into place, so a
 * reader never sees a partial record. A lock left by a crashed process is reclaimed after `staleLockMs`.
 * Versions must advance by exactly one, so a stale writer cannot skip over a newer record.
 * Records hold identifiers, states, hashes and references only. Nothing here reads or writes passages, prompts or credentials.
 */
import {closeSync,fsyncSync,mkdirSync,openSync,readFileSync,renameSync,rmdirSync,statSync,unlinkSync,writeSync,existsSync} from "node:fs";
import {join} from "node:path";
import {validateHsiCheckpoint,type HsiCheckpointStore,type HsiDurableCheckpoint} from "./hsiAgentDurableCheckpoint";

const ID=/^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
const safe=(label:string,v:string)=>{if(!ID.test(v)||v.includes(".."))throw Error(`Invalid ${label}`);return v};
const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));

export function createFileCheckpointStore(dir:string,opts:{lockTimeoutMs?:number;staleLockMs?:number;now?:()=>number}={}):HsiCheckpointStore{
 const lockTimeoutMs=opts.lockTimeoutMs??5_000,staleLockMs=opts.staleLockMs??30_000,now=opts.now??Date.now;
 mkdirSync(dir,{recursive:true});
 const paths=(investigationId:string,taskId:string)=>{
  const folder=join(dir,safe("investigation id",investigationId));
  const base=join(folder,safe("task id",taskId));
  return {folder,file:base+".json",lock:base+".lock",tmp:()=>`${base}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`};
 };
 const load=(file:string):HsiDurableCheckpoint|null=>{
  if(!existsSync(file))return null;
  const c=JSON.parse(readFileSync(file,"utf8")) as HsiDurableCheckpoint;
  validateHsiCheckpoint(c);return c;
 };
 async function withLock<T>(lock:string,fn:()=>T):Promise<T>{
  const deadline=now()+lockTimeoutMs;
  for(;;){
   try{mkdirSync(lock);break}catch(e){
    if((e as NodeJS.ErrnoException).code!=="EEXIST")throw e;
    try{if(now()-statSync(lock).mtimeMs>staleLockMs){rmdirSync(lock);continue}}catch{/* released by its owner meanwhile */}
    if(now()>=deadline)throw Error("Checkpoint lock timeout");
    await sleep(5+Math.random()*10);
   }
  }
  try{return fn()}finally{try{rmdirSync(lock)}catch{/* already reclaimed as stale */}}
 }
 return {
  async read(investigationId,taskId){return load(paths(investigationId,taskId).file)},
  async compareAndSwap(expectedVersion,next){
   validateHsiCheckpoint(next);
   const {folder,file,lock,tmp}=paths(next.investigationId,next.taskId);
   mkdirSync(folder,{recursive:true});
   return withLock(lock,()=>{
    const current=load(file);
    if(expectedVersion===null){if(current)return false}
    else if(!current||current.version!==expectedVersion)return false;
    if(next.version!==(expectedVersion===null?1:expectedVersion+1))throw Error("Checkpoint version must advance by one");
    const t=tmp();
    const fd=openSync(t,"wx");
    try{writeSync(fd,JSON.stringify(next));fsyncSync(fd)}finally{closeSync(fd)}
    try{renameSync(t,file)}catch(e){try{unlinkSync(t)}catch{/* best effort */}throw e}
    return true;
   });
  },
 };
}
