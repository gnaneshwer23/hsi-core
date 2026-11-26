import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';

/** The live published graph on the homepage (moved from the old homepage's proof band). Read-only, candidate-only, unreviewed. */
const home=async(page:Page)=>{await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.hydrated==='home');};
const graph='#published-graph .lg';

test('the published graph says it is live, candidate-only and unreviewed, and nothing is preselected',async({page})=>{
 await home(page);
 const g=page.locator(graph);
 await expect(g.getByText('Live snapshot · candidate-only · unreviewed')).toBeVisible();
 await expect(g.locator('canvas')).toBeVisible();
 await expect(g).toContainText('Live from the published snapshot');
 await expect(g.getByRole('complementary',{name:'Selected concept'})).toContainText('Select a concept');
 await expect(g.getByRole('button',{name:'Display'})).toHaveCount(0);
 await expect(g.getByRole('button',{name:'PNG'})).toHaveCount(0);
 await expect(page.locator('#published-graph')).toContainText('The atlas above is illustrative');
});

test('filters and search narrow the graph in place and selecting a concept shows unreviewed relationships',async({page})=>{
 await home(page);
 const g=page.locator(graph);
 const caption=g.locator('.og-cap');
 await expect(caption).toContainText(/showing \d+ of \d+ concepts/);
 const before=await caption.innerText();
 await g.getByRole('list',{name:'Filter by department'}).getByRole('button').first().click();
 await expect(caption).not.toHaveText(before);
 await g.getByRole('button',{name:'Reset'}).click();
 await expect(caption).toHaveText(before);
 await g.getByLabel('Find a concept').fill('IL-21');
 const hit=g.getByRole('list',{name:'Matching concepts'}).getByRole('button').first();
 await expect(hit).toHaveText('IL-21');
 await hit.click();
 const panel=g.getByRole('complementary',{name:'Selected concept'});
 await expect(panel.getByRole('heading',{name:'IL-21'})).toBeVisible();
 await expect(panel).toContainText('unreviewed');
 await expect(panel.getByRole('link',{name:'Open in the explorer'})).toHaveAttribute('href',/node=/);
});

test('a failed snapshot says so and shows no substitute graph',async({page})=>{
 await page.route('**/api/research/graph-snapshot*',r=>r.fulfill({status:500,body:'{}'}));
 await page.route('**/research/domain-graph/**',r=>r.fulfill({status:500,body:'{}'}));
 await home(page);
 await expect(page.locator(graph).getByText('Snapshot unavailable. No substitute graph is shown.')).toBeVisible();
 await expect(page.locator(graph).locator('canvas')).toHaveCount(0);
});

test('the published graph section has no overflow at 390px and passes axe',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  await home(page);
  await expect(page.locator(graph).locator('canvas')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('#published-graph').scrollIntoViewIfNeeded();
  const res=await new AxeBuilder({page}).include('#published-graph').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(res.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 }
});
