import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('the header and footer lead to the research home, which opens the app shell',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/knowledge-graph');
 const link=page.getByRole('banner').getByRole('link',{name:'Research home'}).first();
 await expect(link).toHaveAttribute('href','/research/home');
 await expect(page.getByRole('contentinfo').getByRole('link',{name:'Research home'})).toHaveAttribute('href','/research/home');
 await link.click();
 await expect(page).toHaveURL(/\/research\/home$/);
 await expect(page.locator('.rh-app')).toBeVisible();
});
test('How it works leads with what runs today: seven steps, each with something to inspect and a stated limit, beside a real screen',async({page})=>{
 await page.goto('/how-it-works');
 const how=page.getByRole('region',{name:'What runs today, step by step.'});
 await expect(how.getByRole('heading',{level:3})).toHaveText(['Plan','Retrieve','Connect','Compare','Verify','Hypothesise','Brief']);
 await expect(how.getByText('You can inspect:')).toHaveCount(7);await expect(how.getByText('Limit:')).toHaveCount(7);
 await expect(how).toContainText('Hypotheses are unvalidated');await expect(how).toContainText('Agreement is not proof');
 await expect(how.locator('img')).toHaveAttribute('alt',/seven-stage rail/);
 await expect(page.getByRole('heading',{name:'The fuller designed workflow.'})).toBeVisible();
 await expect(page.locator('.sp-workspace')).toBeVisible(); // the simulated handoff is still there
});
for(const path of ['/platform','/knowledge-graph'])test(`${path} shows what is live, with each screen's true status`,async({page})=>{
 await page.goto(path);
 const tour=page.getByRole('region',{name:/today\.|area of the graph\./});
 await expect(tour.getByRole('listitem')).toHaveCount(3);
 await expect(tour).toContainText('Live now · no account');await expect(tour).toContainText('Live now · heuristic');await expect(tour).toContainText('model checks are switched on per deployment');
 await expect(tour.getByRole('link',{name:/Open the workspace/})).toHaveAttribute('href','/research/workspace');
 await expect(tour.getByRole('link',{name:/Set up your radar/})).toHaveAttribute('href','/welcome');
});
test('How it works, Platform and Knowledge graph pass axe and do not overflow at 390px',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/how-it-works','/platform','/knowledge-graph']){
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>path+' '+v.id+': '+v.nodes.length)).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),path).toBe(true);
 }
});
