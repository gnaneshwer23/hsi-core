import {expect,test} from "bun:test";
import {readdirSync,statSync} from "node:fs";
import {join,relative} from "node:path";

// Vercel Functions on the Bun runtime accept `export default {fetch}` or named method exports (GET, POST, ...).
// A bare `export default function` returned FUNCTION_INVOCATION_FAILED in production (13 Nov 2026) while
// every unit test stayed green, because tests imported the library, not the deployed entry point.
const API_ROOT=join(import.meta.dir,"..","site","api");
const METHODS=["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"];
function handlerFiles(dir:string):string[]{
 return readdirSync(dir).flatMap(name=>{
  const path=join(dir,name);
  if(statSync(path).isDirectory())return handlerFiles(path);
  return name.endsWith(".ts")&&name!=="tsconfig.json"?[path]:[];
 });
}
const files=handlerFiles(API_ROOT);

test("site/api contains handlers to check",()=>{expect(files.length).toBeGreaterThan(20)});

for(const file of files){
 test("handler shape: "+relative(API_ROOT,file),async()=>{
  const mod=await import(file) as Record<string,unknown>;
  const def=mod.default as {fetch?:unknown}|undefined;
  const hasFetchObject=Boolean(def&&typeof def==="object"&&typeof def.fetch==="function");
  const hasMethodExport=METHODS.some(m=>typeof mod[m]==="function");
  expect(hasFetchObject||hasMethodExport).toBe(true);
 });
}

test("legacy literature handlers answer bad input without any network call",async()=>{
 const blocked=(()=>{throw Error("network call attempted")}) as unknown as typeof fetch;
 const original=globalThis.fetch;globalThis.fetch=blocked;
 try{
  for(const [file,badUrl] of [
   ["scientific-pubmed.ts","https://x.test/api/scientific-pubmed?q=a"],
   ["scientific-abstract.ts","https://x.test/api/scientific-abstract?pmid=abc"],
   ["scientific-investigation-trace.ts","https://x.test/api/scientific-investigation-trace?q=a"],
  ] as const){
   const mod=await import(join(API_ROOT,file)) as {default:{fetch:(r:Request)=>Promise<Response>}};
   expect((await mod.default.fetch(new Request(badUrl))).status).toBe(400);
   expect((await mod.default.fetch(new Request(badUrl,{method:"POST"}))).status).toBe(405);
  }
 }finally{globalThis.fetch=original}
});
