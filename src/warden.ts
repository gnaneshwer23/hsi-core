/**
 * WARDEN minimum: one place that enforces the run-wide limits around live work. It contains, it never grants:
 * it cannot approve science, cannot grant access and cannot raise its own limits (limits are fixed at construction and
 * clamped to code-level hard ceilings). Every check fails closed: an unreadable kill switch, an unreadable run counter or a
 * non-finite number all refuse rather than allow.
 */
export type WardenLimits={maxModelCalls:number;maxRunsPerDay:number;maxRequestsPerWindow:number;windowMs:number};
export const WARDEN_CEILINGS:Readonly<WardenLimits>=Object.freeze({maxModelCalls:60,maxRunsPerDay:20,maxRequestsPerWindow:30,windowMs:60_000});
export class WardenRefusal extends Error{constructor(public readonly code:"kill_switch"|"daily_cap"|"model_budget"|"rate_limit"|"unreadable_state"){super("WARDEN refused: "+code)}}
const posInt=(n:unknown,max:number)=>typeof n==="number"&&Number.isInteger(n)&&n>=1&&n<=max;

export function createWarden(cfg:{limits:WardenLimits;killed:()=>boolean;runsToday:()=>number;now?:()=>number}){
 const {limits}=cfg,now=cfg.now??Date.now;
 if(!posInt(limits?.maxModelCalls,WARDEN_CEILINGS.maxModelCalls)||!posInt(limits.maxRunsPerDay,WARDEN_CEILINGS.maxRunsPerDay)||!posInt(limits.maxRequestsPerWindow,WARDEN_CEILINGS.maxRequestsPerWindow)||!posInt(limits.windowMs,3_600_000)||typeof cfg.killed!=="function"||typeof cfg.runsToday!=="function")throw Error("Invalid WARDEN configuration");
 let calls=0;const stamps:number[]=[];
 const frozen=Object.freeze({...limits});
 function checkKill(){let k:unknown;try{k=cfg.killed()}catch{throw new WardenRefusal("unreadable_state")}if(k!==false)throw new WardenRefusal("kill_switch")}
 return {
  limits:frozen,
  /** Call before starting a run. */
  admitRun(){checkKill();let n:unknown;try{n=cfg.runsToday()}catch{throw new WardenRefusal("unreadable_state")}if(typeof n!=="number"||!Number.isFinite(n)||n<0)throw new WardenRefusal("unreadable_state");if(n>=limits.maxRunsPerDay)throw new WardenRefusal("daily_cap")},
  /** Call immediately before every model call; spends one unit or refuses. Checked before any text leaves. */
  spendModelCall(){checkKill();if(calls>=limits.maxModelCalls)throw new WardenRefusal("model_budget");calls++},
  /** Call before every outbound source request; sliding window. */
  admitRequest(){checkKill();const t=now();while(stamps.length&&t-stamps[0]!>=limits.windowMs)stamps.shift();if(stamps.length>=limits.maxRequestsPerWindow)throw new WardenRefusal("rate_limit");stamps.push(t)},
  snapshot:()=>({modelCalls:calls,modelCallsRemaining:limits.maxModelCalls-calls,requestsInWindow:stamps.length}),
 };
}
export type Warden=ReturnType<typeof createWarden>;
