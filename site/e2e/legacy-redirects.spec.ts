import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const retired:[string,string][]=[['/technology','/platform'],['/solutions','/applications'],['/pricing','/contact'],['/evidence-safety','/trust']];
for(const [from,to] of retired){
 test(`retired page ${from} redirects to ${to}`,async({page})=>{
  await page.goto(from);await expect(page).toHaveURL(new RegExp(to.replace('/','\\/')+'$'));
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
 });
}
test('retired pages are permanent redirects at the host and absent from the sitemap',async({request})=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8')) as {redirects:{source:string;destination:string;permanent:boolean}[]};
 for(const [from,to] of retired)expect(config.redirects.find(r=>r.source===from)).toMatchObject({destination:to,permanent:true});
 const sitemap=await (await request.get('/sitemap.xml')).text();
 for(const [from] of retired)expect(sitemap).not.toContain(from+'</loc>');
});
