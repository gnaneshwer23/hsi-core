/** Protected, single-writer isolated-staging journal. Never use on ephemeral/serverless storage. */
import {open,unlink,lstat} from "node:fs/promises";
import {constants} from "node:fs";
import {dirname,resolve} from "node:path";
import {createHash} from "node:crypto";
export interface StagingOperationStore {
 append(event:Readonly<Record<string,unknown>>):Promise<void>;
 reserve(scope:string,runId:string,units:number,limit:number):Promise<boolean>;
 read():readonly Readonly<Record<string,unknown>>[];
 close():Promise<void>;
}
const digest=(text:string)=>createHash("sha256").update(text).digest("hex");
/** Caller supplies only policy-approved receipt/metadata events, never payloads/credentials. */
export async function openStagingOperationStore(file:string):Promise<StagingOperationStore>{
 file=resolve(file);const parent=await lstat(dirname(file));
 if(!parent.isDirectory()||parent.isSymbolicLink()||(parent.mode&0o077)!==0||parent.uid!==process.geteuid?.())throw Error("Private staging directory required");
 const lock=await open(file+".lock",constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);
 let handle:Awaited<ReturnType<typeof open>>|undefined;
 try{
  handle=await open(file,constants.O_CREAT|constants.O_APPEND|constants.O_RDWR|constants.O_NOFOLLOW,0o600);
  const info=await handle.stat();
  if(!info.isFile()||(info.mode&0o077)!==0||info.uid!==process.geteuid?.()||info.size>16_000_000)throw Error("Unsafe staging journal");
  const directory=await open(dirname(file),constants.O_RDONLY|constants.O_DIRECTORY);
  try{await directory.sync();}finally{await directory.close();}
  const text=await handle.readFile("utf8"),events:Record<string,unknown>[]=[];let previous="0".repeat(64),seq=0;
  if(text&&!text.endsWith("\n"))throw Error("Incomplete staging journal; operator recovery required");
  for(const line of text.split("\n").filter(Boolean)){
   const entry=JSON.parse(line),body=JSON.stringify({seq:entry.seq,previous:entry.previous,event:entry.event});
   if(!entry||Object.keys(entry).sort().join(",")!=="event,hash,previous,seq"||!entry.event||typeof entry.event!=="object"||Array.isArray(entry.event)||entry.seq!==++seq||entry.previous!==previous||entry.hash!==digest(body))throw Error("Staging journal integrity failure");
   events.push(entry.event);previous=entry.hash;
  }
  let tail:Promise<void>=Promise.resolve(),closed=false,closing=false,poisoned=false,bytes=info.size,closePromise:Promise<void>|undefined;
  async function persist(captured:Record<string,unknown>){
   if(closed||poisoned)throw Error("Staging journal unavailable");
   const body={seq:seq+1,previous,event:captured},hash=digest(JSON.stringify(body)),line=JSON.stringify({...body,hash})+"\n";
   if(bytes+Buffer.byteLength(line)>16_000_000)throw Error("Staging journal capacity reached");
   try{await handle!.appendFile(line);await handle!.sync();}
   catch{poisoned=true;throw Error("Staging journal write uncertain; operator recovery required");}
   seq++;previous=hash;bytes+=Buffer.byteLength(line);events.push(captured);
  }
  function enqueue(captured:Record<string,unknown>){
   if(closing||closed)return Promise.reject(Error("Staging journal unavailable"));
   if(!captured||typeof captured!=="object"||Array.isArray(captured))throw Error("Staging metadata object required");
   const inspect=(value:unknown):void=>{
    if(value&&typeof value==="object")for(const [key,item] of Object.entries(value)){
     if(/^(?:passage|claim|instruction|body|headers|authorization|apiKey|secret|prompt|reason|evidenceSpan)$/i.test(key))throw Error("Payload/secret field refused by staging journal");
     inspect(item);
    }
   };
   inspect(captured);if(JSON.stringify(captured).length>32000)throw Error("Staging event too large");
   const operation=tail.then(()=>persist(captured));tail=operation.catch(()=>{});return operation;
  }
  return {
   read:()=>structuredClone(events),
   append(event){return enqueue(structuredClone(event));},
   reserve(scope,runId,units,limit){
    if(closing||closed)return Promise.reject(Error("Staging journal unavailable"));
    if(!/^[A-Za-z0-9:_.-]{1,256}$/.test(scope)||!/^[A-Za-z0-9:_.-]{1,256}$/.test(runId)||![units,limit].every(n=>Number.isSafeInteger(n)&&n>0&&n<=1e12))return Promise.reject(Error("Invalid staging reservation"));
    let accepted=false;
    const operation=tail.then(async()=>{
     if(closed||poisoned)throw Error("Staging journal unavailable");
     const reservations=events.filter(e=>e.type==="budget_reservation"&&e.scope===scope);
     const used=reservations.reduce((sum,e)=>sum+Number(e.units),0);
     if(!Number.isSafeInteger(used)||reservations.some(e=>e.runId===runId)||used+units>limit)return;
     await persist({type:"budget_reservation",scope,runId,units,limit});accepted=true;
    });
    tail=operation.catch(()=>{});return operation.then(()=>accepted);
   },
   close(){
    if(closePromise)return closePromise;closing=true;
    closePromise=(async()=>{await tail;closed=true;await handle!.close();await lock.close();await unlink(file+".lock");})();return closePromise;
   },
  };
 }catch(error){await handle?.close();await lock.close();await unlink(file+".lock");throw error;}
}
