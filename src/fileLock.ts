/** Cross-process mutual exclusion and atomic writes on a local or shared file system, used by the file-backed stores.
 * A lock is a directory created with `mkdir`, which fails if it already exists. A lock left by a crashed process is
 * reclaimed once it is older than `staleMs`. It guards one host (or a shared volume with working `mkdir` and `rename`);
 * it is not a distributed lock service, and clock skew between hosts can break stale-lock reclamation. */
import {closeSync,fsyncSync,mkdirSync,openSync,renameSync,rmdirSync,statSync,unlinkSync,writeSync} from "node:fs";

export type FileLockOptions={timeoutMs?:number;staleMs?:number;now?:()=>number};
const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));

export async function withFileLock<T>(lock:string,fn:()=>T,opts:FileLockOptions={}):Promise<T>{
 const now=opts.now??Date.now,timeoutMs=opts.timeoutMs??5_000,staleMs=opts.staleMs??30_000,deadline=now()+timeoutMs;
 for(;;){
  try{mkdirSync(lock);break}catch(e){
   if((e as NodeJS.ErrnoException).code!=="EEXIST")throw e;
   try{if(now()-statSync(lock).mtimeMs>staleMs){rmdirSync(lock);continue}}catch{/* released by its owner meanwhile */}
   if(now()>=deadline)throw Error("File lock timeout");
   await sleep(5+Math.random()*10);
  }
 }
 try{return fn()}finally{try{rmdirSync(lock)}catch{/* already reclaimed as stale */}}
}

/** Writes to a temporary file, flushes it, then renames it into place, so a reader never sees a partial file. */
export function writeFileAtomic(path:string,data:string):void{
 const tmp=`${path}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
 const fd=openSync(tmp,"wx");
 try{writeSync(fd,data);fsyncSync(fd)}finally{closeSync(fd)}
 try{renameSync(tmp,path)}catch(e){try{unlinkSync(tmp)}catch{/* best effort */}throw e}
}
