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

export type SentinelAlertCode="no_successful_run"|"overdue"|"consecutive_failures"|"repeated_timeouts"|"kill_switch_active"|"missed_slots"|"coverage_drop"|"revocations_in_last_run";
export type SentinelAlert={code:SentinelAlertCode;severity:"warning"|"critical";detail:string};

/** Derives monitoring alerts from the journal alone. Pure: no clock, files or network. It does not deliver anything; a
 *  scheduler or pager reads this. Detail strings hold counts only (no source titles, no error text).
 *  - coverage_drop: the latest successful run checked under half the median of the previous five, which usually means the
 *    source list shrank or a provider silently returned less (drift in what is being re-evaluated, not in the sources). */
export function assessSentinelHealth(all:readonly SentinelRecord[],nowMs:number,intervalMs:number):SentinelAlert[]{
 const out:SentinelAlert[]=[];
 const oks=all.filter(r=>r.outcome==="ok"),lastOk=oks[oks.length-1]??null,last=all[all.length-1]??null;
 if(!lastOk)out.push({code:"no_successful_run",severity:"critical",detail:"No successful re-evaluation is on record"});
 else{const age=nowMs-Date.parse(lastOk.at);if(age>2*intervalMs)out.push({code:"overdue",severity:"critical",detail:`Last successful re-evaluation was ${Math.floor(age/intervalMs)} intervals ago`})}
 let fails=0;for(let i=all.length-1;i>=0&&all[i]!.outcome==="failed";i--)fails++;
 if(fails>=2)out.push({code:"consecutive_failures",severity:fails>=3?"critical":"warning",detail:`${fails} consecutive failed re-evaluations`});
 const recent=all.slice(-5),timeouts=recent.filter(r=>r.outcome==="failed"&&r.errorCode==="timeout").length;
 if(timeouts>=2)out.push({code:"repeated_timeouts",severity:"warning",detail:`${timeouts} of the last ${recent.length} runs timed out`});
 if(last?.outcome==="skipped_kill_switch")out.push({code:"kill_switch_active",severity:"warning",detail:"The latest tick was skipped by the kill switch; clearances are not being re-checked"});
 if(all.length>=2){const slots=all.map(r=>r.slot),gap=Math.max(...slots.slice(1).map((s,i)=>s-slots[i]!));if(gap>1)out.push({code:"missed_slots",severity:"warning",detail:`Up to ${gap-1} scheduled slot(s) had no tick`})}
 if(lastOk&&oks.length>=4){
  const prev=oks.slice(-6,-1).map(r=>r.checked??0).sort((a,b)=>a-b),median=prev[Math.floor(prev.length/2)]!;
  if(median>0&&(lastOk.checked??0)<median/2)out.push({code:"coverage_drop",severity:"warning",detail:`Latest run checked ${lastOk.checked??0} sources; the recent median is ${median}`});
 }
 if(lastOk?.revoked?.length&&last===lastOk)out.push({code:"revocations_in_last_run",severity:"warning",detail:`${lastOk.revoked.length} clearance(s) revoked in the latest run`});
 return out;
}

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
  /** Monitoring alerts derived from the journal. Empty means healthy by these checks only, not that sources are correct. */
  health():SentinelAlert[]{return assessSentinelHealth(records(),now(),interval)},
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
