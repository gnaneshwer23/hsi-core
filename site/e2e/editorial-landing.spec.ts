import {test,expect} from '@playwright/test';
const publicPaths=['/','/platform','/technology','/connected-intelligence','/departments','/solutions','/research','/evidence-safety','/how-it-works','/science','/pricing','/contact'];
test('public website excludes fixture promotion and keeps actual product scope',async({page})=>{
 test.setTimeout(90000);const fixtureLoads:string[]=[];page.on('request',r=>{if(r.url().includes('/research/validation/v0.1/'))fixtureLoads.push(r.url())});
 for(const path of publicPaths){
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  const text=await page.getByRole('main').innerText();
  if(path==='/')expect(text).toMatch(/Research preview/);
  expect(text,path).not.toMatch(/clinically proven platform|100% accurate/i);
  await expect(page.getByRole('main').locator('a[href*="/research/validation"]')).toHaveCount(0);
 }
 expect(fixtureLoads).toEqual([]);await page.goto('/connected-intelligence');await expect(page.getByRole('main')).toContainText('Planned');await expect(page.getByRole('main')).toContainText('No live matching and no enrolment are offered');
});
test('homepage graph and workspace remain usable at narrow widths',async({page},info)=>{
 for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:1000});await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Biological research,');
 await expect(page.locator('#home-knowledge-graph')).toContainText('Public research snapshot');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true);
 if(width===390||width===1440)await page.screenshot({path:info.outputPath(`graph-home-${width}.png`),fullPage:true});
 }
 await expect(page.locator('.concise-home>section')).toHaveCount(6);await expect(page.locator('.concise-home .sp-workspace')).toHaveCount(0);
 await page.goto('/how-it-works');const workspace=page.locator('.sp-workspace');await workspace.getByRole('button',{name:/Review, version/}).click();
 await expect(workspace).toContainText('Graph promotion is a separate governed decision');
 await expect(workspace).toContainText('simulated');
});
test('public graph search filters real snapshot records and retains a versioned handoff',async({page})=>{
 await page.goto('/');const graph=page.locator('#home-knowledge-graph');
 await graph.getByRole('searchbox',{name:'Search graph'}).fill('IL-21');
 await expect(graph.locator('[data-graph-node]')).toHaveCount(11);
 await expect(graph.getByRole('link',{name:'Open this selection in the research workspace ↗'})).toHaveAttribute('href',/netQuery=IL-21/);
 await graph.getByRole('searchbox',{name:'Search graph'}).fill('no-such-scientific-concept');await expect(graph).toContainText('No records match this view');
 await graph.getByRole('button',{name:'Reset search'}).click();await expect(graph.locator('[data-graph-node]')).not.toHaveCount(0);
});
