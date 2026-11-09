import {test,expect} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {SEO_PAGES,SITE_ORIGIN,getSeoMetadata,renderSeoHead,safeJsonLd,sanitizeGoogleSiteVerification} from '../site/src/lib/seo/siteSeo';
test('canonical metadata is unique, query-free and does not index research/account tools',()=>{
 const titles=new Set<string>();for(const path of Object.keys(SEO_PAGES)){const m=getSeoMetadata(path);expect(m.indexable).toBe(true);expect(m.canonical).toBe(SITE_ORIGIN+(path==='/'?'/':path));expect(titles.has(m.title)).toBe(false);titles.add(m.title);expect(m.description.length).toBeGreaterThan(80);expect(m.structuredData).not.toBeNull()}
 for(const path of ['/sign-in','/sign-up','/research/account','/research/validation','/research/dashboard','/community','/not-a-page']){const m=getSeoMetadata(path);expect(m.indexable).toBe(false);expect(m.structuredData).toBeNull();expect(renderSeoHead(path)).toContain('noindex, follow')}
 expect(getSeoMetadata('constructor').indexable).toBe(false);expect(getSeoMetadata('/platform',true).indexable).toBe(false);expect(getSeoMetadata('//evil.example').canonical).toBe(SITE_ORIGIN+'/');
});
test('structured data describes actual pages without ratings, prices or invented credentials',()=>{
 const data=JSON.stringify(getSeoMetadata('/platform').structuredData);for(const absent of ['aggregateRating','reviewRating','priceCurrency','MedicalOrganization','SearchAction'])expect(data).not.toContain(absent);
 const malicious='</script><script>alert(1)</script>';expect(safeJsonLd({value:malicious})).not.toContain('</script>');expect(JSON.parse(safeJsonLd({value:malicious})).value).toBe(malicious);
 expect(renderSeoHead('/platform')).toContain('property="og:url"');expect(renderSeoHead('/platform')).toContain('name="twitter:card"');
});
test('optional Search Console HTML tag is sanitized and IndexNow key files stay public',()=>{
 expect(sanitizeGoogleSiteVerification('ab')).toBe('');
 expect(sanitizeGoogleSiteVerification('<script>')).toBe('');
 expect(sanitizeGoogleSiteVerification('Abc_def-0123456789')).toBe('Abc_def-0123456789');
 expect(renderSeoHead('/')).not.toContain('google-site-verification');
 expect(renderSeoHead('/',false,{googleSiteVerification:'token_for_search_console_1'})).toContain('name="google-site-verification" content="token_for_search_console_1"');
 const key=readFileSync(join(process.cwd(),'site','public','indexnow-key.txt'),'utf8').trim();
 expect(key).toMatch(/^[a-f0-9]{32}$/i);
 expect(existsSync(join(process.cwd(),'site','public',`${key}.txt`))).toBe(true);
 expect(SITE_ORIGIN).toBe('https://www.humansuperintelligence.tech');
});
