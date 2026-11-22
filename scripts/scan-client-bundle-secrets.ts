#!/usr/bin/env bun
/**
 * Defensive scan of built client assets for high-confidence secret patterns (PROD-QA-003).
 * Scans site/dist when present. Exit 0 when clean or when dist is missing (not yet built).
 * Exit 2 when a high-confidence pattern is found. Does not invent AppSec acceptance.
 */
import {readdirSync,readFileSync,statSync,existsSync} from "node:fs";
import {join,relative} from "node:path";

const ROOT=join(import.meta.dir,"..");
const DIST=join(ROOT,"site/dist");

/** High-confidence only — avoid noisy false positives on demo/docs strings. */
const PATTERNS:readonly{id:string;re:RegExp}[]=[
  {id:"pem_private_key",re:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/},
  {id:"aws_access_key_id",re:/\bAKIA[0-9A-Z]{16}\b/},
  {id:"stripe_live_secret",re:/\bsk_live_[A-Za-z0-9]{16,}\b/},
  {id:"github_pat",re:/\bghp_[A-Za-z0-9]{36}\b/},
  {id:"vite_secret_env",re:/\bVITE_(?:[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY))[A-Z0-9_]*=\s*["']?[^"'\s]{8,}/},
  {id:"neon_password_url",re:/postgres(?:ql)?:\/\/[^:\s]+:[^@\s]{8,}@/i},
];

const TEXT_EXT=new Set([".js",".mjs",".cjs",".css",".html",".json",".map",".txt",".svg"]);

function walk(dir:string,out:string[]=[]):string[]{
  for(const name of readdirSync(dir)){
    const path=join(dir,name);
    const st=statSync(path);
    if(st.isDirectory())walk(path,out);
    else{
      const ext=name.includes(".")?`.${name.split(".").pop()!.toLowerCase()}`:"";
      if(TEXT_EXT.has(ext)&&st.size<=8_000_000)out.push(path);
    }
  }
  return out;
}

if(!existsSync(DIST)){
  console.log(JSON.stringify({
    schemaVersion:"hsi-client-bundle-secret-scan-1",
    status:"skipped_no_dist",
    note:"site/dist missing — build the site before claiming a clean client-bundle scan. Not AppSec acceptance.",
    findings:[] as const,
    scientificApproval:false,
    appSecAccepted:false,
  },null,2));
  process.exit(0);
}

const files=walk(DIST);
const findings:{id:string;file:string}[]=[];
for(const file of files){
  let text:string;
  try{text=readFileSync(file,"utf8")}catch{continue}
  for(const pattern of PATTERNS){
    if(pattern.re.test(text))findings.push({id:pattern.id,file:relative(ROOT,file)});
  }
}

const report={
  schemaVersion:"hsi-client-bundle-secret-scan-1" as const,
  status:findings.length===0?"clean":"findings",
  scannedFiles:files.length,
  note:findings.length===0
    ?"No high-confidence secret patterns found in site/dist. Not a substitute for full-history Gitleaks or independent AppSec review."
    :"High-confidence secret pattern(s) found in client bundle — investigate before public launch.",
  findings,
  scientificApproval:false as const,
  appSecAccepted:false as const,
};

console.log(JSON.stringify(report,null,2));
process.exit(findings.length===0?0:2);
