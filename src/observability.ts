/** Correlation ids and a structured logger for the HSI server side.
 *
 * What exists here, stated plainly:
 * - `runWithCorrelation` carries a request id (and a W3C trace id when the caller sent a valid `traceparent`) through async work in
 *   one process via AsyncLocalStorage. It does not propagate across processes or hosts by itself: a worker that continues a request
 *   must be given the ids and call `runWithCorrelation` again.
 * - Server-generated ids only. A client-supplied request id is never adopted (it would let a caller forge log lines); a valid
 *   `traceparent` trace id is adopted because it is how distributed tracing joins up, and it is shape-checked first.
 * - `createLogger` writes one JSON object per line with a fixed envelope. Callers pass an event NAME and flat primitive fields.
 *   It is built for codes, ids and counts. It is not a place for free text, inputs, passages, prompts or patient data, and the
 *   redaction below is a backstop for mistakes, not permission to log them.
 *
 * What it does not do: no metrics, no span timings or trace export (OpenTelemetry), no sampling, no retention or access control
 * (those belong to the log drain and the operations owner), and no service-level objectives. SLOs must come from measured values
 * and none have been measured. */
import {AsyncLocalStorage} from "node:async_hooks";
import {randomUUID} from "node:crypto";

export type Correlation={requestId:string;traceId?:string};
const store=new AsyncLocalStorage<Readonly<Correlation>>();
const SAFE_ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
const TRACEPARENT=/^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/;

export const newRequestId=():string=>randomUUID();

/** The trace id of a valid W3C `traceparent` header, else undefined. An all-zero trace id is invalid by the specification. */
export function traceIdFromHeaders(headers:Pick<Headers,"get">|null|undefined):string|undefined{
 const m=TRACEPARENT.exec((headers?.get("traceparent")??"").trim());
 return m&&!/^0+$/.test(m[1]!)&&!/^0+$/.test(m[2]!)?m[1]:undefined;
}

/** Runs `fn` with the given ids visible to `currentCorrelation()`. An unsafe request id is replaced, never echoed. */
export function runWithCorrelation<T>(c:Correlation,fn:()=>T):T{
 const requestId=SAFE_ID.test(String(c?.requestId??""))?c.requestId:newRequestId();
 const traceId=typeof c?.traceId==="string"&&/^[0-9a-f]{32}$/.test(c.traceId)?c.traceId:undefined;
 return store.run(Object.freeze({requestId,...(traceId?{traceId}:{})}),fn);
}
export const currentCorrelation=():Readonly<Correlation>|null=>store.getStore()??null;

/* ---------- logger ---------- */
export type LogLevel="debug"|"info"|"warn"|"error";
const RANK:Record<LogLevel,number>={debug:10,info:20,warn:30,error:40};
export type LogSink=(line:string,level:LogLevel)=>void;
export type LogFields=Record<string,unknown>;

const EVENT=/^[a-z][a-z0-9_.]{2,63}$/;
const RESERVED=new Set(["ts","level","component","event","requestId","traceId"]);
const SENSITIVE_KEY=/authorization|cookie|token|secret|passw(or)?d|api[-_]?key|apikey|bearer|session|credential|private|signature/i;
const SENSITIVE_VALUE:readonly RegExp[]=[
 /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/i,
 /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/,           // JWT
 /\b(sk|pk|rk|ghp|gho|xox[bap])[-_][A-Za-z0-9_-]{16,}/,                      // common API key prefixes
 /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i,                              // URL with credentials
 /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,                           // email address (personal data)
];
const MAX_FIELDS=32,MAX_VALUE=300;
// eslint-disable-next-line no-control-regex
const CTRL=/[\u0000-\u001F\u007F-\u009F]|\p{Cf}/gu;
const REDACTED="[redacted]";

/** Exported for tests: the scrubber applied to every field. Non-primitive values are dropped, not serialised. */
export function scrubField(key:string,value:unknown):string|number|boolean|null|undefined{
 if(SENSITIVE_KEY.test(key))return REDACTED;
 if(value===null||typeof value==="boolean")return value;
 if(typeof value==="number")return Number.isFinite(value)?value:null;
 if(typeof value==="string"){
  const clean=value.replace(CTRL," ").slice(0,MAX_VALUE);
  return SENSITIVE_VALUE.some(r=>r.test(clean))?REDACTED:clean;
 }
 return undefined; // objects, arrays, functions, symbols, bigint, undefined: not loggable here
}

export function createLogger(opts:{component:string;sink?:LogSink;minLevel?:LogLevel;now?:()=>number}){
 if(!EVENT.test(opts.component))throw Error("Invalid logger component");
 const now=opts.now??Date.now,min=RANK[opts.minLevel??"info"];
 const sink:LogSink=opts.sink??((line,level)=>{(level==="error"||level==="warn"?console.error:console.log)(line)});
 return {
  /** Never throws and never blocks the caller: a logging failure must not change a request's outcome. */
  log(level:LogLevel,event:string,fields:LogFields={},correlation?:Correlation|null):void{
   try{
    if(RANK[level]===undefined||RANK[level]<min)return;
    const corr=correlation??currentCorrelation();
    const safe:Record<string,unknown>={};let n=0;
    for(const [k,v] of Object.entries(fields??{})){
     if(RESERVED.has(k)||!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(k)||n>=MAX_FIELDS)continue;
     const s=scrubField(k,v);if(s===undefined)continue;
     safe[k]=s;n++;
    }
    const line=JSON.stringify({ts:new Date(now()).toISOString(),level,component:opts.component,event:EVENT.test(event)?event:"invalid_event",
     ...(corr?.requestId&&SAFE_ID.test(corr.requestId)?{requestId:corr.requestId}:{}),...(corr?.traceId&&/^[0-9a-f]{32}$/.test(corr.traceId)?{traceId:corr.traceId}:{}),...safe});
    sink(line,level);
   }catch{/* swallowed on purpose */}
  },
 };
}
export type Logger=ReturnType<typeof createLogger>;
