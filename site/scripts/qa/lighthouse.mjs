/** Local lab audit only. No field CWV or launch approval is inferred. */
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
const origin='http://127.0.0.1:4179';
const output=process.env.HSI_QA_OUTPUT??'/tmp/hsi-qa-performance';
const preview=spawn('bun',['run','preview','--host','127.0.0.1','--port','4179','--strictPort'],{stdio:'ignore'});
let chrome;let lighthouseVersion=null;
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(origin)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}
 if(!ready)throw Error('Local preview not ready');
 chrome=await chromeLauncher.launch({chromePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE??'/usr/bin/chromium',chromeFlags:['--headless','--no-sandbox']});
 await mkdir(output,{recursive:true});const pages=[];
 for(const path of ['/','/how-it-works','/research','/evidence-intelligence','/context-conflict-audit','/platform']){
  const result=await lighthouse(origin+path,{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
  const lhr=result.lhr;lighthouseVersion=lhr.lighthouseVersion;await writeFile(output+'/'+(path==='/'?'home':path.slice(1))+'.json',JSON.stringify(lhr,null,2));
  pages.push({path,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),lcpMs:lhr.audits['largest-contentful-paint'].numericValue,cls:lhr.audits['cumulative-layout-shift'].numericValue,totalBlockingTimeMs:lhr.audits['total-blocking-time'].numericValue,warnings:lhr.runWarnings});
 }
 const summary={kind:'local_mobile_lab_only',fieldCwvVerified:false,recordedAt:new Date().toISOString(),lighthouseVersion,pages};
 await writeFile(output+'/summary.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
}finally{if(chrome)await chrome.kill();preview.kill('SIGTERM')}
