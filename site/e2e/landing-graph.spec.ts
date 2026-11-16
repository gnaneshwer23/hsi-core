import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing hero shows the live published graph with honest labels, zoom controls and no editing chrome; axe clean at both sizes',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  const hero=page.locator('.pg-hero');await expect(hero.locator('canvas')).toBeVisible();
  await expect(hero).toContainText('Live from the published snapshot');await expect(hero).toContainText('every line is a candidate and unreviewed'.replace('every','Every'));
  await expect(hero.getByRole('button',{name:'Fit network'})).toBeVisible();
  await expect(hero.getByRole('button',{name:'Display'})).toHaveCount(0);await expect(hero.getByRole('button',{name:'PNG'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.evaluate(()=>window.scrollTo(0,0));
  expect((await new AxeBuilder({page}).include('.pg-hero').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 }
});
