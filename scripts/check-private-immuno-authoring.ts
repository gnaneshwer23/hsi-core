#!/usr/bin/env bun
/** Offline private preparation validator. No network, vault, accounts or scientific approval. */
import {readFileSync,lstatSync} from "node:fs";
import {validatePrivateDraftWorkbook} from "../src/evidence/benchmarkCuration";
try{
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=="--private-workbook")throw Error();
 const info=lstatSync(args[1]!);
 if(!info.isFile()||info.isSymbolicLink()||info.size>8_000_000||(info.mode&0o077)!==0||info.uid!==process.geteuid?.())throw Error();
 const report=validatePrivateDraftWorkbook(JSON.parse(readFileSync(args[1]!,"utf8")));
 console.log(JSON.stringify({...report,mode:"offline_private_preparation",liveServicesUsed:false}));
}catch{console.error("Private workbook validation failed: require an owner-only regular file with canonical draft-only content. No case content logged.");process.exitCode=1;}
