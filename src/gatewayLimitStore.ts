/** Counters behind the governed tool gateway's per-task call budget and per-provider rate limit.
 * Both are consumed atomically: a call that would exceed a limit counts nothing and is refused.
 *
 * - `createMemoryLimitStore`: in this process only, reset on restart. The gateway default; behaviour unchanged.
 * - `createFileLimitStore`: persisted on one host (or a shared volume), atomic across processes via `fileLock`. A recovered
 *   or restarted worker continues the same budget instead of receiving a fresh one. It stores keys only as hashes and holds
 *   counts and timestamps, never inputs, outputs or credentials.
 *
 * Fail closed: an unreadable, corrupt or locked counter throws, so the gateway refuses the call. It is never reset to zero.
 * Conservative by design: a call that consumed budget and then failed, or whose process died before it recorded a result,
 * stays counted. Idempotent replays never reach the store, so they cost nothing.
 * Not provided: a distributed store (several hosts), and protection from clock skew between hosts for rate windows. */
import {createHash} from "node:crypto";
import {existsSync,mkdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {withFileLock,writeFileAtomic,type FileLockOptions} from "./fileLock";

export interface GatewayLimitStore{
 /** Counts one call against `key`'s budget. Returns false, counting nothing, when `max` calls are already spent. */
 consumeBudget(key:string,max:number):Promise<boolean>;
 /** Records one request in a sliding window. Returns false, recording nothing, when `limit` requests fall inside it. */
 consumeRate(key:string,limit:number,nowMs:number,windowMs:number):Promise<boolean>;
}

export function createMemoryLimitStore():GatewayLimitStore{
 const budget=new Map<string,number>(),rate=new Map<string,number[]>();
 return {
  async consumeBudget(key,max){const n=budget.get(key)??0;if(n>=max)return false;budget.set(key,n+1);return true},
  async consumeRate(key,limit,nowMs,windowMs){
   const live=(rate.get(key)??[]).filter(t=>nowMs-t<windowMs);
   if(live.length>=limit){rate.set(key,live);return false}
   live.push(nowMs);rate.set(key,live);return true;
  },
 };
}

const MAX_STAMPS=10_000;
export function createFileLimitStore(dir:string,opts:FileLockOptions={}):GatewayLimitStore{
 for(const sub of ["budgets","rates"])mkdirSync(join(dir,sub),{recursive:true});
 const file=(kind:"budgets"|"rates",key:string)=>join(dir,kind,createHash("sha256").update(key).digest("hex").slice(0,40)+".json");
 const load=(f:string):unknown=>existsSync(f)?JSON.parse(readFileSync(f,"utf8")):null;
 return {
  consumeBudget(key,max){
   const f=file("budgets",key);
   return withFileLock(f+".lock",()=>{
    const v=load(f) as {count?:unknown}|null;
    const n=v===null?0:v.count;
    if(typeof n!=="number"||!Number.isInteger(n)||n<0)throw Error("Budget counter is corrupt");
    if(n>=max)return false;
    writeFileAtomic(f,JSON.stringify({count:n+1}));return true;
   },opts);
  },
  consumeRate(key,limit,nowMs,windowMs){
   const f=file("rates",key);
   return withFileLock(f+".lock",()=>{
    const v=load(f) as {t?:unknown}|null;
    const stamps=v===null?[]:v.t;
    if(!Array.isArray(stamps)||stamps.length>MAX_STAMPS||stamps.some(x=>typeof x!=="number"||!Number.isFinite(x)))throw Error("Rate window is corrupt");
    const live=(stamps as number[]).filter(t=>nowMs-t<windowMs);
    if(live.length>=limit){writeFileAtomic(f,JSON.stringify({t:live}));return false}
    live.push(nowMs);writeFileAtomic(f,JSON.stringify({t:live}));return true;
   },opts);
  },
 };
}
