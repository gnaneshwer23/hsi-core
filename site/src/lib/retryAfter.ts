/** Parse `Retry-After` as a positive whole-second delay. HTTP-date forms are ignored (rare for our APIs). */
export function parseRetryAfterSeconds(res:Response):number|undefined{
 const raw=res.headers.get("Retry-After");
 if(!raw)return undefined;
 const n=Number(raw);
 return Number.isFinite(n)&&n>0?Math.floor(n):undefined;
}

/** Human hint for rate-limit UI copy. Prefers minutes when the delay is ≥ 60s. */
export function formatRetryAfterHint(retryAfterSeconds?:number,fallback="Try again later."):string{
 if(retryAfterSeconds===undefined)return fallback;
 if(retryAfterSeconds<60){
  const seconds=Math.max(1,retryAfterSeconds);
  return`Try again in about ${seconds} second${seconds===1?"":"s"}.`;
 }
 const minutes=Math.max(1,Math.ceil(retryAfterSeconds/60));
 return`Try again in about ${minutes} minute${minutes===1?"":"s"}.`;
}

/** Prefer server error text; append a Retry-After hint on 429 when present. */
export function rateLimitedMessage(res:Response,serverError:string|undefined,fallback:string):string{
 const base=(serverError&&serverError.trim())||fallback;
 const hint=formatRetryAfterHint(parseRetryAfterSeconds(res),"");
 if(!hint)return base;
 return `${base.replace(/\.\s*$/,"")}. ${hint}`;
}
