import {test,expect} from '@playwright/test';
import {SEO_PAGES,SITE_ORIGIN} from '../src/lib/seo/siteSeo';
import {readFile} from 'node:fs/promises';
const dist=new URL('../dist/',import.meta.url);
test('public landing HTML contains page content, unique canonicals and social metadata before JavaScript',async()=>{
 for(const path of Object.keys(SEO_PAGES)){
  const file=path==='/'?'index.html':'_pages/'+path.slice(1).replaceAll('/','--')+'.html',html=await readFile(new URL(file,dist),'utf8');
  expect(html).toContain('<h1');expect(html).toContain('data-prerendered="'+path+'"');expect(html).toContain('<link rel="canonical" href="'+SITE_ORIGIN+(path==='/'?'/':path)+'"');expect(html).toContain('property="og:title"');expect(html).toContain('name="twitter:card"');expect(html).toContain('id="hsi-seo-schema"');expect(html).not.toContain('"aggregateRating"');expect(html).not.toContain('content="noindex, follow"');
 }
});
test('public route hydrates from generated HTML without losing content or mismatching the server',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/platform',async route=>route.fulfill({contentType:'text/html',body:await readFile(new URL('_pages/platform.html',dist),'utf8')}));
 await page.goto('/platform');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page).toHaveTitle(SEO_PAGES['/platform']!.title);expect(errors).toEqual([]);
 await page.getByRole('button',{name:'Research',exact:true}).click();await page.locator('#research-pages').getByRole('link',{name:'Evidence Intelligence',exact:true}).click();await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',SITE_ORIGIN+'/evidence-intelligence');await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content',SITE_ORIGIN+'/evidence-intelligence');
 await page.goto('/research/account');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');await expect(page.locator('#hsi-seo-schema')).toHaveCount(0);
});
test('sitemap contains only public canonical pages and tool shells are noindex without saved data',async({request})=>{
 const sitemap=await (await request.get('/sitemap.xml')).text();for(const path of Object.keys(SEO_PAGES))expect(sitemap).toContain('<loc>'+SITE_ORIGIN+(path==='/'?'/':path)+'</loc>');for(const value of ['/sign-in','/research/validation','/api/','/community'])expect(sitemap).not.toContain('<loc>'+SITE_ORIGIN+value+'</loc>');
 const robots=await (await request.get('/robots.txt')).text();expect(robots).toContain('Sitemap: '+SITE_ORIGIN+'/sitemap.xml');expect(robots).not.toContain('Disallow: /research/');expect(robots).toContain('User-agent: GPTBot');expect(robots).toContain('User-agent: PerplexityBot');expect(robots).toContain('User-agent: ChatGPT-User');
 const llms=await request.get('/llms.txt');expect(llms.status()).toBe(200);expect(await llms.text()).toContain('Human Super Intelligence');
 const shell=await readFile(new URL('_pages/research--dashboard.html',dist),'utf8');expect(shell).toContain('content="noindex, follow"');expect(shell).toContain('<div id="root"></div>');expect(shell).not.toContain('data-prerendered=');expect(shell).not.toContain('id="hsi-seo-schema"');
 const cover=await request.get('/social/hsi-research.png');expect(cover.status()).toBe(200);expect(cover.headers()['content-type']).toContain('image/png');
 const faviconIco=await request.get('/favicon.ico');expect(faviconIco.status()).toBe(200);expect((await faviconIco.body()).byteLength).toBeGreaterThan(100);
 const faviconSvg=await request.get('/favicon.svg');expect(faviconSvg.status()).toBe(200);expect(await faviconSvg.text()).toContain('<svg');
 const appleTouch=await request.get('/apple-touch-icon.png');expect(appleTouch.status()).toBe(200);expect(appleTouch.headers()['content-type']).toContain('image/png');
 const brandIcon=await request.get('/icon.svg');expect(brandIcon.status()).toBe(200);expect(await brandIcon.text()).toContain('<svg');
 const indexNow=await request.get('/indexnow-key.txt');expect(indexNow.status()).toBe(200);const key=(await indexNow.text()).trim();expect(key).toMatch(/^[a-f0-9]{32}$/i);expect((await request.get('/'+key+'.txt')).status()).toBe(200);
});
test('direct HTML remains useful when JavaScript is disabled',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.route('**/research',async route=>route.fulfill({contentType:'text/html',body:await readFile(new URL('_pages/research.html',dist),'utf8')}));await page.goto('/research');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.getByRole('main').getByRole('link',{name:'Research Sign In',exact:true}).first()).toBeVisible();await context.close();
});
