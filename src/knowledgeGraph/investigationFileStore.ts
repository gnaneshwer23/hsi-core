/** Node-only file adapter for the investigation store. One file per revision; an existing revision is never replaced. */
import {mkdirSync,readdirSync,readFileSync,writeFileSync,existsSync} from "node:fs";
import {join} from "node:path";
import type {KeyValueStore} from "./investigationStore";

const safe=(k:string)=>k.replace(/[^A-Za-z0-9:_-]/g,"_").replace(/:/g,"__");
const unsafe=(f:string)=>f.replace(/\.json$/,"").replace(/__/g,":");
export function fileStore(dir:string):KeyValueStore{
 mkdirSync(dir,{recursive:true});
 return {
  get:k=>{const p=join(dir,safe(k)+".json");return existsSync(p)?readFileSync(p,"utf8"):null},
  create:(k,v)=>{writeFileSync(join(dir,safe(k)+".json"),v,{flag:"wx"})},
  keys:()=>readdirSync(dir).filter(f=>f.endsWith(".json")).map(unsafe),
 };
}
