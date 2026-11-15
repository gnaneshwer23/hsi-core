/**
 * Pre-flight check for the live investigation model step. Reads the environment (Bun loads .env.local), prints PASS/FAIL per check and
 * NEVER prints a key or any value other than model ids. Makes one free request (list models) and no model calls, so it costs nothing.
 * Usage: bun scripts/live-model-doctor.ts
 */
export {}; // makes this file a module so top-level await is valid
type Check={name:string;ok:boolean;detail:string};
const env=process.env,checks:Check[]=[];
const add=(name:string,ok:boolean,detail:string)=>checks.push({name,ok,detail});
const set=(k:string)=>!!env[k]?.trim();
add("OPENAI_API_KEY is set",set("OPENAI_API_KEY"),set("OPENAI_API_KEY")?"set":"missing");
add("HSI_OPENAI_MODEL is set",set("HSI_OPENAI_MODEL"),env.HSI_OPENAI_MODEL??"missing");
add("HSI_OPENAI_MODEL_2 is set",set("HSI_OPENAI_MODEL_2"),env.HSI_OPENAI_MODEL_2??"missing");
add("the two model ids differ",!!env.HSI_OPENAI_MODEL&&!!env.HSI_OPENAI_MODEL_2&&env.HSI_OPENAI_MODEL!==env.HSI_OPENAI_MODEL_2,"the verifier needs two different models");
add("HSI_LIVE_MODEL_STEP_ENABLED is exactly \"true\"",env.HSI_LIVE_MODEL_STEP_ENABLED==="true",env.HSI_LIVE_MODEL_STEP_ENABLED===undefined?"unset (model step stays off)":"set");
const cap=env.HSI_LIVE_MODEL_DAILY_RUNS;
add("daily ceiling is valid",cap===undefined||(Number.isInteger(Number(cap))&&Number(cap)>=0&&Number(cap)<=10000),cap===undefined?"unset (default 50 model-checked runs per instance per day)":`${cap} per instance per day`);
add("no VITE_ copy of a secret exists",!Object.keys(env).some(k=>/^VITE_.*(KEY|SECRET|TOKEN)/i.test(k)),"secrets must never be exposed to the browser bundle");
if(set("OPENAI_API_KEY")){
 try{
  const r=await fetch("https://api.openai.com/v1/models",{headers:{Authorization:"Bearer "+env.OPENAI_API_KEY},signal:AbortSignal.timeout(15000)});
  if(!r.ok)add("the key can list models",false,"HTTP "+r.status);
  else{
   const ids=new Set(((await r.json()) as {data:{id:string}[]}).data.map(m=>m.id));
   add("the key can list models",true,"ok");
   for(const k of ["HSI_OPENAI_MODEL","HSI_OPENAI_MODEL_2"])if(env[k])add(`${k} is available to this key`,ids.has(env[k]!),ids.has(env[k]!)?"available":"not in this key's model list (typo or no access)");
   for(const k of ["HSI_OPENAI_MODEL","HSI_OPENAI_MODEL_2"])if(env[k]&&/^(o\d|gpt-5)/.test(env[k]!))add(`${k} accepts the request parameters`,false,"reasoning-family models reject temperature and max_tokens; use a non-reasoning model until the runner supports them");
  }
 }catch(e){add("the key can list models",false,e instanceof Error?e.message.replace(/sk-[A-Za-z0-9_-]+/g,"[redacted]"):"network error")}
}
for(const c of checks)console.log((c.ok?"PASS":"FAIL")+"  "+c.name+" - "+c.detail);
const failed=checks.filter(c=>!c.ok).length;
console.log(failed?`\n${failed} check(s) failed. The model step will not run correctly until they pass.`:"\nAll checks passed. Also confirm the provider-side spend limit is set; the app cannot enforce it for you.");
process.exit(failed?1:0);
