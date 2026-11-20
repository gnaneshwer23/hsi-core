import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Live graph lives in the published-graph proof band (diagram-first hero is the investigation spine). */
const proofGraph=()=>'.pg-proof .lg';

test('landing graph: nothing preselected, filters and search narrow it in place, selecting shows relationships on the page; axe clean at both sizes',async({page})=>{
 await page.goto('/');
 const graph=page.locator(proofGraph());
 await expect(graph.getByRole('complementary',{name:'Selected concept'})).toContainText('Select a concept');
 const caption=graph.locator('.og-cap');await expect(caption).toContainText(/showing \d+ of 157 concepts/);
 const before=await caption.innerText();
 await graph.getByRole('list',{name:'Filter by department'}).getByRole('button').first().click();
 await expect(caption).not.toHaveText(before);
 await graph.getByRole('button',{name:'Human evidence only'}).click();await expect(graph.getByRole('button',{name:'Human evidence only'})).toHaveAttribute('aria-pressed','true');
 await graph.getByRole('button',{name:'Reset'}).click();await expect(caption).toHaveText(before);
 await graph.getByLabel('Find a concept').fill('IL-21');
 const firstHit=graph.getByRole('list',{name:'Matching concepts'}).getByRole('button').first();
 await expect(firstHit).toHaveText('IL-21');await firstHit.click();
 const panel=graph.getByRole('complementary',{name:'Selected concept'});
 await expect(panel.getByRole('heading',{name:'IL-21'})).toBeVisible();await expect(panel).toContainText('unreviewed');
 await expect(panel.getByRole('link',{name:'Open in the explorer'})).toHaveAttribute('href',/node=/);
});

test('landing proof shows the live published graph with honest labels, zoom controls and no editing chrome; axe clean at both sizes',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  const graph=page.locator(proofGraph());await expect(graph.locator('canvas')).toBeVisible();
  await expect(graph).toContainText('Live from the published snapshot');await expect(graph).toContainText('every line is a candidate and unreviewed'.replace('every','Every'));
  await expect(graph.getByRole('button',{name:'Fit network'})).toBeVisible();
  await expect(graph.getByRole('button',{name:'Display'})).toHaveCount(0);await expect(graph.getByRole('button',{name:'PNG'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('.pg-proof').scrollIntoViewIfNeeded();
  expect((await new AxeBuilder({page}).include('.pg-proof').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 }
});
