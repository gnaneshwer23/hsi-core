/** Fails the site build when the shipped JavaScript or CSS grows past the budget in bundle-budget.json.
 *  Sizes are gzip, measured on dist/ after the build. Raising a budget is a deliberate, reviewed edit of that file. */
import {readdir,readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {gzipSync} from "node:zlib";

export type Budget={entryJsGzipBytes:number;totalCssGzipBytes:number;largestLazyChunkGzipBytes:number};
export type Measured={entryJs:string;entryJsGzip:number;totalCssGzip:number;largestLazy:{file:string;gzip:number}};

export function evaluateBudget(m:Measured,b:Budget):string[]{
 const problems:string[]=[];
 if(m.entryJsGzip>b.entryJsGzipBytes)problems.push(`Entry script ${m.entryJs} is ${m.entryJsGzip} bytes gzipped; budget ${b.entryJsGzipBytes}`);
 if(m.totalCssGzip>b.totalCssGzipBytes)problems.push(`Total CSS is ${m.totalCssGzip} bytes gzipped; budget ${b.totalCssGzipBytes}`);
 if(m.largestLazy.gzip>b.largestLazyChunkGzipBytes)problems.push(`Lazy chunk ${m.largestLazy.file} is ${m.largestLazy.gzip} bytes gzipped; budget ${b.largestLazyChunkGzipBytes}`);
 return problems;
}
export async function measureDist(dist:string):Promise<Measured>{
 const html=await readFile(resolve(dist,"index.html"),"utf8");
 const entry=/<script[^>]+src="\/assets\/([^"]+\.js)"/.exec(html)?.[1];if(!entry)throw Error("Entry script not found in dist/index.html");
 const files=await readdir(resolve(dist,"assets"));
 const gz=async(f:string)=>gzipSync(await readFile(resolve(dist,"assets",f)),{level:9}).length;
 let totalCssGzip=0,largestLazy={file:"",gzip:0};
 for(const f of files){
  if(f.endsWith(".css"))totalCssGzip+=await gz(f);
  else if(f.endsWith(".js")&&f!==entry&&!f.startsWith("rolldown-runtime")){const g=await gz(f);if(g>largestLazy.gzip)largestLazy={file:f,gzip:g}}
 }
 return {entryJs:entry,entryJsGzip:await gz(entry),totalCssGzip,largestLazy};
}
if(import.meta.main){
 const root=resolve(import.meta.dir,".."),budget=JSON.parse(await readFile(resolve(root,"bundle-budget.json"),"utf8")) as Budget;
 const m=await measureDist(resolve(root,"dist")),problems=evaluateBudget(m,budget);
 console.log(`Bundle: entry ${m.entryJsGzip} gz (budget ${budget.entryJsGzipBytes}), CSS ${m.totalCssGzip} gz (budget ${budget.totalCssGzipBytes}), largest lazy ${m.largestLazy.file} ${m.largestLazy.gzip} gz (budget ${budget.largestLazyChunkGzipBytes})`);
 if(problems.length){console.error(problems.join("\n"));process.exit(1)}
}
