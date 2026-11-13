/**
 * SENTINEL schedule: runs the source integrity service's re-evaluation on a fixed cadence, records every outcome, and
 * exposes freshness so consumers can refuse to rely on stale clearances. It never re-approves, edits the graph or hides a
 * failed check: a failed or skipped tick is written to the journal and shows as overdue. A tick slot is claimed with an
 * exclusive file create, so two processes cannot run the same slot. Records hold ids, counts and reason codes only.
 */
import {appendFileSync,closeSync,existsSync,mkdirSync,openSync,readFileSync} from "node:fs";
import {join} from "node:path";

export type SentinelRecord={slot:number;at:string;outcome:"ok"|"failed"|"skipped_kill_switch";checked?:number;revoked?:{receiptId:string;sourceId:string;reasonCodes:string[]}[];errorCode?:string};
export type Reevaluator={reevaluate:(o?:{signal?:AbortSignal})=>Promise<{checked:number;revoked:{receiptId:string;sourceId:string;reasonCodes:string[]}[]}>};
export class StaleClearanceError extends Error{constructor(){super("Source re-evaluation is overdue; clearances cannot be relied on")}}

export function createSentinel(cfg:{service:Reevaluator;directory:string;intervalMs:number;killed?:()=>boolean;now?:()=>number;timeoutMs?:number}){
 const now=cfg.now??Date.now,interval=cfg.intervalMs,timeout=cfg.timeoutMs??120_000;
 if(!Number.isInteger(interval)||interval<60_000||interval>7*86_400_000||!cfg.service||typeof cfg.service.reevaluate!=="function")throw Error("Invalid SENTINEL configuration");
 mkdirSync(cfg.directory,{recursive:true});const file=join(cfg.directory,"sentinel.jsonl");
 const records=():SentinelRecord[]=>existsSync(file)?readFileSync(file,"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l) as SentinelRecord):[];
 const write=(r:SentinelRecord)=>appendFileSync(file,JSON.stringify(r)+"\n",{flag:"a"});
 const slotOf=(t:number)=>Math.floor(t/interval);
 function status(){
  const all=records(),lastOk=[...all].reverse().find(r=>r.outcome==="ok")??null,last=all[all.length-1]??null;
  const lastOkAt=lastOk?Date.parse(lastOk.at):null;
  return {lastOkAt:lastOk?.at??null,lastOutcome:last?.outcome??null,overdue:lastOkAt===null||now()-lastOkAt>2*interval,consecutiveFailures:(()=>{let n=0;for(let i=all.length-1;i>=0&&all[i]!.outcome!=="ok";i--)n++;return n})()};
 }
 return {
  status,
  /** Throws StaleClearanceError when no successful re-evaluation happened within maxAgeMs. For callers about to rely on a clearance. */
  assertFresh(maxAgeMs=2*interval){const s=status();if(s.lastOkAt===null||now()-Date.parse(s.lastOkAt)>maxAgeMs)throw new StaleClearanceError()},
  /** Runs the current slot if nobody has. Safe to call as often as you like. */
  async tick():Promise<{ran:false;reason:"slot_taken"}|{ran:true;record:SentinelRecord}>{
   const slot=slotOf(now());
   try{closeSync(openSync(join(cfg.directory,`slot-${slot}.lock`),"wx"))}catch{return {ran:false,reason:"slot_taken"}}
   const at=new Date(now()).toISOString();let rec:SentinelRecord;
   let killed=false;try{killed=cfg.killed?cfg.killed()!==false:false}catch{killed=true}
   if(killed)rec={slot,at,outcome:"skipped_kill_switch"};
   else{
    const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);
    try{const r=await cfg.service.reevaluate({signal:c.signal});rec={slot,at,outcome:"ok",checked:r.checked,revoked:r.revoked.map(x=>({receiptId:x.receiptId,sourceId:x.sourceId,reasonCodes:[...x.reasonCodes]}))}}
    catch{rec={slot,at,outcome:"failed",errorCode:c.signal.aborted?"timeout":"error"}}
    finally{clearTimeout(timer)}
   }
   write(rec);return {ran:true,record:rec};
  },
 };
}
