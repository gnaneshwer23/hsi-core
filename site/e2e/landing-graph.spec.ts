import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing graph: nothing preselected, filters and search narrow it in place, selecting shows relationships on the page; axe clean at both sizes',async({page})=>{
 await page.goto('/');
 const hero=page.locator('.pg-hero');
 await expect(hero.getByRole('complementary',{name:'Selected concept'})).toContainText('Select a concept');
 const caption=hero.locator('.og-cap');await expect(caption).toContainText(/showing \d+ of 153 concepts/);
 const before=await caption.innerText();
 await hero.getByRole('list',{name:'Filter by department'}).getByRole('button').first().click();
 await expect(caption).not.toHaveText(before);
 await hero.getByRole('button',{name:'Human evidence only'}).click();await expect(hero.getByRole('button',{name:'Human evidence only'})).toHaveAttribute('aria-pressed','true');
 await hero.getByRole('button',{name:'Reset'}).click();await expect(caption).toHaveText(before);
 await hero.getByLabel('Find a concept').fill('IL-21');
 const firstHit=hero.getByRole('list',{name:'Matching concepts'}).getByRole('button').first();
 await expect(firstHit).toHaveText('IL-21');await firstHit.click();
 const panel=hero.getByRole('complementary',{name:'Selected concept'});
 await expect(panel.getByRole('heading',{name:'IL-21'})).toBeVisible();await expect(panel).toContainText('unreviewed');
 await expect(panel.getByRole('link',{name:'Open in the explorer'})).toHaveAttribute('href',/node=/);
});

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
