import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const pages=['/','/how-it-works','/research','/evidence-intelligence'];
for(const path of pages)test(`premium scientific page remains responsive and accessible: ${path}`,async({page},info)=>{
 test.setTimeout(90000);
 for(const width of [375,768,1024,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(path);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} ${width}`).toBe(true);
  if(width===375||width===1440)await page.screenshot({path:info.outputPath(`${path==='/'?'home':path.slice(1)}-${width}.png`),fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
test('workflow is user-driven and keeps live execution boundaries visible',async({page})=>{
 await page.goto('/how-it-works');const flow=page.getByRole('group',{name:'Explore the investigation workflow'});
 await flow.getByRole('button',{name:/03.*Compare/}).click();await expect(page.locator('.ps-process-detail')).toContainText('Compare and challenge');
 await expect(page.locator('.ps-process-detail')).toContainText('remains gated');
 await flow.getByRole('button',{name:/04.*Brief/}).click();await expect(page.locator('.ps-process-detail')).toContainText('unreviewed research draft');
 await expect(page.locator('.ps-process-caption')).toContainText('No live agent run');
});
