/**
 * Notify IndexNow (Bing + partners) of public HSI marketing URLs.
 * Key files live under site/public/ — IndexNow does not push Google.
 */
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {SEO_PAGES,SITE_ORIGIN} from '../site/src/lib/seo/siteSeo';

const HOST='www.humansuperintelligence.tech';
const URLS=Object.keys(SEO_PAGES).map((path)=>SITE_ORIGIN+(path==='/'?'/':path));

function loadKey():string{
 if(process.env.INDEXNOW_KEY?.trim())return process.env.INDEXNOW_KEY.trim();
 const path=join(process.cwd(),'site','public','indexnow-key.txt');
 if(!existsSync(path))throw new Error('Missing site/public/indexnow-key.txt');
 return readFileSync(path,'utf8').trim();
}

const key=loadKey();
if(!/^[a-f0-9]{32}$/i.test(key))throw new Error('IndexNow key must be 32 hex chars');
const keyFile=join(process.cwd(),'site','public',`${key}.txt`);
if(!existsSync(keyFile))throw new Error(`Missing public key file site/public/${key}.txt`);

const body={host:HOST,key,keyLocation:`${SITE_ORIGIN}/${key}.txt`,urlList:URLS};
const res=await fetch('https://api.indexnow.org/indexnow',{
 method:'POST',
 headers:{'Content-Type':'application/json; charset=utf-8'},
 body:JSON.stringify(body),
});
console.log('IndexNow status:',res.status,res.statusText);
const text=await res.text();
if(text)console.log(text.slice(0,500));
if(!res.ok&&res.status!==202)process.exit(1);
console.log(`Submitted ${URLS.length} indexable hub URLs for ${HOST}`);
