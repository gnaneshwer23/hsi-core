/** Fails the site build if a public page names one of the separately governed products. Runs on the prerendered HTML, so it
 * checks what visitors and crawlers actually receive (text, attributes and metadata), not just source files.
 * No page is exempt: the /modules pages now redirect to /connected-intelligence. */
import {readdir,readFile} from "node:fs/promises";
import {resolve} from "node:path";

export const PRODUCT_NAME_PATTERN=/Aksh Health|Aksh|AKSH|HSI Clinical|HSI Trials|HSI TRIALS|\bISI\b|Immune Super Intelligence|Akeno/g;
export const ALLOWED_PAGES:ReadonlySet<string>=new Set<string>();
/** Names found in a page's HTML, ignoring external script tags (bundled code is not page copy). */
export function findProductNames(html:string):string[]{
 return [...html.replace(/<script[^>]*\bsrc=[^>]*><\/script>/g,"").matchAll(PRODUCT_NAME_PATTERN)].map(m=>m[0]);
}
export async function scanDist(dist:string):Promise<{file:string;names:string[]}[]>{
 const files=[{file:"index.html",path:resolve(dist,"index.html")},...(await readdir(resolve(dist,"_pages"))).filter(f=>f.endsWith(".html")).map(f=>({file:f,path:resolve(dist,"_pages",f)}))];
 const found:{file:string;names:string[]}[]=[];
 for(const f of files){if(ALLOWED_PAGES.has(f.file))continue;const names=findProductNames(await readFile(f.path,"utf8"));if(names.length)found.push({file:f.file,names:[...new Set(names)]})}
 return found;
}
if(import.meta.main){
 const found=await scanDist(resolve(import.meta.dir,"..","dist"));
 if(found.length){for(const f of found)console.error(`Public page ${f.file} names a separately governed product: ${f.names.join(", ")}`);process.exit(1)}
 console.log("Public pages are free of separately governed product names (excluding the allowed /modules pages).");
}
