import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';

/** The live published graph on the homepage, as a domain tree. Read-only, candidate-only, unreviewed. */
const home=async(page:Page)=>{await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.hydrated==='home');};
const graph='#published-graph .gt-shell';
const DOMAINS=['Immunology & Inflammation','Neuroscience','Microbiome & Metabolism','Genomics & Multi-omics','Organ & Tissue Biology','Disease Mechanisms'];

test('the published graph says it is live, candidate-only and unreviewed, and lists all six domains',async({page})=>{
 await home(page);
 const g=page.locator(graph);
 await expect(g.getByText('Live snapshot · candidate-only · unreviewed')).toBeVisible();
 await expect(g).toContainText('Live from the published snapshot');
 const chips=g.getByRole('group',{name:'Domains'}).getByRole('button');
 await expect(chips).toHaveCount(6);
 for(const d of DOMAINS) await expect(g.getByRole('group',{name:'Domains'})).toContainText(d);
 await expect(g.locator('.gt > .gt-sum')).toContainText(/\d+ concepts and \d+ relationships\. Every relationship is a candidate and unreviewed\./);
 await expect(g.locator('canvas')).toHaveCount(0);
});

test('search opens the matching branch and shows the study behind each relationship',async({page})=>{
 await home(page);
 const g=page.locator(graph);
 const sum=g.locator('.gt > .gt-sum');
 const before=await sum.innerText();
 await g.getByLabel('Search the graph').fill('butyrate');
 await expect(sum).toContainText('match');
 await expect(sum).not.toHaveText(before);
 const rel=g.locator('.gt-rels li:visible').first();
 await expect(rel).toBeVisible();
 await expect(rel).toContainText('candidate');
 await expect(rel).toContainText(/PMID \d+|DOI |No identifier recorded/);
 await expect(g.getByRole('link',{name:/in the explorer$/}).first()).toHaveAttribute('href',/\/workspace\/graph\?q=/);
 await g.getByRole('button',{name:'Clear filters'}).click();
 await expect(sum).toHaveText(before);
});

test('domain and human-evidence filters narrow the tree, and an empty result says it is a filter result',async({page})=>{
 await home(page);
 const g=page.locator(graph);
 const sum=g.locator('.gt > .gt-sum');
 const before=await sum.innerText();
 await g.getByRole('group',{name:'Domains'}).getByRole('button',{name:/^Neuroscience/}).click();
 await expect(g.getByRole('group',{name:'Domains'}).getByRole('button',{name:/^Neuroscience/})).toHaveAttribute('aria-pressed','true');
 await expect(sum).not.toHaveText(before);
 await g.getByRole('button',{name:'Clear filters'}).click();
 await g.getByLabel('Human evidence only').check();
 await expect(sum).toContainText('match');
 await g.getByLabel('Search the graph').fill('zzqx no such concept');
 await expect(g.getByText('Nothing matches. This is a filter result, not a statement that the graph lacks it.')).toBeVisible();
});

test('a failed snapshot says so and shows no substitute graph',async({page})=>{
 await page.route('**/api/research/graph-snapshot*',r=>r.fulfill({status:500,body:'{}'}));
 await page.route('**/research/domain-graph/**',r=>r.fulfill({status:500,body:'{}'}));
 await home(page);
 await expect(page.locator(graph).getByText('Snapshot unavailable. No substitute graph is shown.')).toBeVisible();
 await expect(page.locator(graph).locator('.gt-tree')).toHaveCount(0);
});

test('the published graph section has no overflow at 1440, 390 and 320px and passes axe',async({page})=>{
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  await home(page);
  const g=page.locator(graph);
  await expect(g.locator('.gt-tree')).toBeVisible();
  await g.getByLabel('Search the graph').fill('butyrate');
  await expect(g.locator('.gt-rels li:visible').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('#published-graph').scrollIntoViewIfNeeded();
  const res=await new AxeBuilder({page}).include('#published-graph').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(res.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 }
});

test('the workspace offers a Tree view that inspects a relationship',async({page})=>{
 await page.goto('/workspace/graph');
 await page.getByRole('radio',{name:'Tree'}).click();
 await page.getByLabel('Search the graph').fill('butyrate');
 const inspect=page.locator('.gt-rels').getByRole('button',{name:'Inspect'}).first();
 await expect(inspect).toBeVisible();
 await inspect.click();
 const insp=page.getByRole('complementary',{name:'Inspector'});
 await expect(insp).not.toContainText('Select a concept or a relationship');
 await expect(insp).toContainText(/unreviewed|candidate/i);
});
