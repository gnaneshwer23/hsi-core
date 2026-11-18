import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const retired:[string,string][]=[['/technology','/how-it-works'],['/solutions','/how-it-works'],['/platform','/how-it-works'],['/applications','/how-it-works'],['/research','/how-it-works'],['/connected-intelligence','/how-it-works'],['/intelligence','/how-it-works'],['/intelligence/nexus','/how-it-works'],['/science','/knowledge-graph'],['/science/body','/knowledge-graph'],['/departments','/knowledge-graph'],['/community','/research/home'],['/demo','/research/journey'],['/pricing','/contact'],['/evidence-safety','/trust']];
for(const [from,to] of retired){
 test(`retired page ${from} redirects to ${to}`,async({page})=>{
  await page.goto(from);await expect(page).toHaveURL(new RegExp(to.replace(/\//g,'\\/')+'$'));
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
 });
}
test('platform and science redirects land on honest destination copy',async({page})=>{
 await page.goto('/platform');
 await expect(page).toHaveURL(/\/how-it-works$/);
 await expect(page.getByRole('note').filter({hasText:/Former “Platform”/})).toBeVisible();
 await page.goto('/science');
 await expect(page).toHaveURL(/\/knowledge-graph$/);
 await expect(page.getByRole('note').filter({hasText:/Former “Science”/})).toBeVisible();
});
test('retired pages are permanent redirects at the host and absent from the sitemap',async({request})=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8')) as {redirects:{source:string;destination:string;permanent:boolean}[]};
 for(const [from,to] of retired.filter(([f])=>f!=='/intelligence/nexus'))expect(config.redirects.find(r=>r.source===from)).toMatchObject({destination:to,permanent:true});
 expect(config.redirects.find(r=>r.source==='/intelligence/:slug')).toMatchObject({destination:'/how-it-works',permanent:true});
 for(const d of ['immunology','neuroscience','microbiome','metabolism','genomics-multi-omics','human-physiology'])expect(config.redirects.find(r=>r.source==='/departments/'+d)).toMatchObject({destination:'/research/knowledge-graph?netDepartment='+d,permanent:true});
 const sitemap=await (await request.get('/sitemap.xml')).text();
 for(const [from] of retired)expect(sitemap).not.toContain(from+'</loc>');
});

test('a retired department page lands on that department in the graph',async({page})=>{
 await page.goto('/departments/immunology');
 await expect(page).toHaveURL(/\/research\/knowledge-graph\?netDepartment=immunology/);
});
