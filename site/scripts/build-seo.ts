import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {SEO_PAGES,renderSeoHead,SITE_ORIGIN} from '../src/lib/seo/siteSeo';
const root=resolve(import.meta.dir,'..'),dist=resolve(root,'dist');
const noindex=process.env.VERCEL_ENV==='preview'||process.env.HSI_SEO_NOINDEX==='true';
const {renderPublicPage}=await import(resolve(root,'.seo-render/prerender-entry.js'));
const template=await readFile(resolve(dist,'index.html'),'utf8');
if(!template.includes('<!--hsi-seo:start-->')||!template.includes('<div id="root"></div>'))throw Error('SEO template markers missing');
const config=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'));
const routes=new Set<string>(['/',...config.rewrites.filter((r:{destination:string})=>r.destination.startsWith('/_pages/')).map((r:{source:string})=>r.source)]);
for(const path of Object.keys(SEO_PAGES))if(!routes.has(path))throw Error('Missing exact public route rewrite: '+path);
for(const pathname of routes){
 const indexed=!!SEO_PAGES[pathname];const body=indexed?renderPublicPage(pathname):'';
 if(indexed&&(!body.includes('<h1')||body.includes('Loading the synthetic research demo')))throw Error('Incomplete public HTML: '+pathname);
 const html=template.replace(/<!--hsi-seo:start-->[\s\S]*?<!--hsi-seo:end-->/,'<!--hsi-seo:start-->\n'+renderSeoHead(pathname,noindex)+'\n<!--hsi-seo:end-->').replace('<html lang="en">','<html lang="en-GB"'+(noindex?' data-seo-noindex="true"':'')+'>').replace('<div id="root"></div>','<div id="root"'+(indexed?' data-prerendered="'+pathname+'"':'')+'>'+body+'</div>');
 const file=pathname==='/'?'index.html':'_pages/'+pathname.slice(1).replaceAll('/','--')+'.html';await mkdir(dirname(resolve(dist,file)),{recursive:true});await writeFile(resolve(dist,file),html);
}
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+Object.keys(SEO_PAGES).map(path=>'  <url><loc>'+SITE_ORIGIN+(path==='/'?'/':path)+'</loc></url>').join('\n')+'\n</urlset>\n';
await writeFile(resolve(dist,'sitemap.xml'),sitemap);
// Explicit Allow for major search + AI crawlers. Marketing HTML stays public; /api and /_pages stay disallowed.
const robots=[
 'User-agent: *',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: GPTBot',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: ChatGPT-User',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: OAI-SearchBot',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: PerplexityBot',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: ClaudeBot',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: Google-Extended',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'User-agent: Applebot-Extended',
 'Allow: /',
 'Disallow: /api/',
 'Disallow: /_pages/',
 '',
 'Sitemap: '+SITE_ORIGIN+'/sitemap.xml',
 '']
await writeFile(resolve(dist,'robots.txt'),robots.join('\n'));
await rm(resolve(root,'.seo-render'),{recursive:true,force:true});
console.log('SEO HTML generated: '+Object.keys(SEO_PAGES).length+' public pages; '+(routes.size-Object.keys(SEO_PAGES).length)+' noindex tool/account shells.');
