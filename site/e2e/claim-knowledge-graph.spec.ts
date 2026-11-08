import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
const graph=JSON.parse(await readFile(new URL('../public/research/claim-graph/graph.v1.json',import.meta.url),'utf8'));
async function ready(page:any){await page.goto('/research/knowledge-graph?dataset=source-corpus');await expect(page.getByRole('heading',{name:'Claim-linked network',exact:true})).toBeVisible()}
test('claim graph is connected to the topic explorer and shows actual source counts without approval',async({page})=>{
 await page.goto('/science/graph');await page.getByRole('link',{name:'Claim-linked research graph',exact:true}).click();await page.getByRole('link',{name:'RA/SSc source corpus',exact:true}).click();await expect(page.getByRole('heading',{name:'Claim-linked network',exact:true})).toBeVisible();
 await expect(page.locator('.cg-release')).toContainText('15 concepts · 7 claims · 5 sources');await expect(page.locator('.cg-release')).toContainText('0 human-reviewed');await expect(page.getByRole('button',{name:'Approve',exact:true})).toHaveCount(0);
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');
});
test('negative findings show source passage, context, missing calibration and release blockers',async({page})=>{
 await ready(page);await page.locator('.cg-text-view button').filter({hasText:'No significant association reported'}).first().click();const chain=page.getByRole('region',{name:'Claim provenance chain'});
 await expect(chain).toContainText('No significant association reported');await expect(chain).toContainText('confidence: not calibrated');await expect(chain).toContainText('24586782');
 await chain.getByText('Passage · PMID-24586782-ABSTRACT-3',{exact:true}).click();await expect(chain.locator('blockquote').first()).toContainText('14 studies');await chain.getByText('Release blockers for this claim',{exact:true}).click();await expect(chain).toContainText('independent scientific review required');
 const event=page.waitForEvent('download');await chain.getByRole('button',{name:'Export review preparation'}).click();const packet=JSON.parse(await readFile((await (await event).path())!,'utf8'));expect(packet.graphPublicationApproved).toBe(false);expect(packet.reviewStatus).toBe('not_submitted');expect(packet.graphVersion).toBe(graph.version);
});
test('locator-only SSc claims never invent quotations, mappings or text mentions',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'circulating Tfh cells cell state',exact:true}).click();await page.locator('.cg-edge-choice').filter({hasText:'HSI-C-SSC-001'}).first().click();const chain=page.getByRole('region',{name:'Claim provenance chain'});await expect(chain).toContainText('Source version: Not independently captured');await chain.locator('summary').filter({hasText:'Passage ·'}).first().click();await expect(chain).toContainText('Exact supporting text is unavailable');await expect(chain.locator('blockquote')).toHaveCount(0);await expect(page.getByRole('complementary',{name:'Claim graph inspector'})).toContainText('No exact text mention available');
});
test('filters preserve source context and label unsupported slices as empty',async({page})=>{
 await ready(page);await page.getByLabel('Species',{exact:true}).selectOption('mouse');await expect(page.locator('.kg-stage-head')).toContainText('2 relationships');
 await page.getByLabel('Evidence status',{exact:true}).selectOption('supported');await expect(page.getByRole('heading',{name:'No graph records match.'})).toBeVisible();await expect(page.locator('.cg-text-view button')).toHaveCount(0);
 await page.getByRole('button',{name:'Clear graph filters'}).click();
 await expect(page.getByLabel('Species',{exact:true})).toHaveValue('');
 await expect(page.getByLabel('Evidence status',{exact:true})).toHaveValue('');
 await expect(page.locator('.kg-stage-head')).toContainText('16 relationships');
 await page.getByLabel('Search names, aliases or IDs').fill('RF');await expect(page.getByText(/Resolution: same/)).toBeVisible();await page.getByRole('button',{name:'Rheumatoid factor biomarker',exact:true}).click();await expect(page.locator('.kg-stage-head')).toContainText('16 relationships');
});
test('multi-hop path inspection preserves negative results, incoming edges and cross-study context',async({page})=>{
 await ready(page);await page.getByRole('button').filter({hasText:'2 sources · 2 steps'}).first().click();const path=page.getByRole('article',{name:'Selected reasoning path'});await expect(path).toContainText('negative finding');await expect(path).toContainText('Context changes');await expect(path).toContainText('incoming edges');
 const wait=page.waitForEvent('download');await path.getByRole('button',{name:'Export this path'}).click();const packet=JSON.parse(await readFile((await (await wait).path())!,'utf8'));expect(packet.path.causalConclusionAllowed).toBe(false);expect(packet.path.contextKeys.length).toBeGreaterThan(1);
 await page.getByLabel('Traversal direction').selectOption('outgoing');await expect(page.getByText('No path in the current filtered snapshot. Broader scientific absence is not inferred.')).toBeVisible();
});
test('saved views pin the version, omit search text and exports retain evidence lineage',async({page})=>{
 await ready(page);await page.getByLabel('Search names, aliases or IDs').fill('RF');await page.getByRole('button',{name:'Save public view',exact:true}).click();expect(await page.evaluate(()=>localStorage.getItem('hsi-claim-graph-views'))).not.toContain('q=');await page.reload();await expect(page.locator('.cg-saved').first()).toBeVisible();await page.locator('.cg-saved').first().click();await expect(page).toHaveURL(new RegExp('version='+graph.version));
 const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Export evidence graph JSON'}).click();const packet=JSON.parse(await readFile((await (await wait).path())!,'utf8'));expect(packet.graph.version).toBe(graph.version);expect(packet.scientificApproval).toBe(false);expect(packet.graph.corpus.sources).toHaveLength(5);
 const svg=page.waitForEvent('download');await page.getByRole('button',{name:'Download graph SVG'}).click();expect(await readFile((await (await svg).path())!,'utf8')).toContain(graph.version);
});
test('tampered snapshots fail closed and a clean retry restores the actual graph',async({page})=>{
 const route='**/research/claim-graph/versions/*.json';await page.route(route,r=>r.fulfill({json:{...graph,graphPromotable:true}}));await page.goto('/research/knowledge-graph?dataset=source-corpus');await expect(page.getByRole('alert')).toContainText('could not be verified');await expect(page.locator('.cg-text-view')).toHaveCount(0);await page.unroute(route);await page.getByRole('button',{name:'Retry graph'}).click();await expect(page.getByRole('heading',{name:'Claim-linked network',exact:true})).toBeVisible();
});
test('graph fits mobile, keyboard inspection works, and automatic accessibility checks pass',async({page},info)=>{
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await ready(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const candidate=page.locator('.cg-text-view button').first();await candidate.focus();await page.keyboard.press('Enter');await expect(page.getByRole('region',{name:'Claim provenance chain'})).toBeVisible();
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))}))).toEqual([]);
  await page.screenshot({path:info.outputPath('claim-graph-'+width+'.png'),fullPage:true});
 }
});
test('governed SSc discovery is wired to the trusted backend and permission denial stays explicit',async({page})=>{
 let calls=0;await page.route('**/api/research/discovery/ssc?*',r=>{calls++;return r.fulfill({status:403,json:{error:'Research permission denied'}})});
 await ready(page);await page.getByRole('button',{name:'circulating Tfh cells cell state',exact:true}).click();await page.getByRole('button',{name:'Investigate selected SSc concept',exact:true}).click();await expect(page.getByRole('region',{name:'Authenticated SSc discovery investigation'})).toContainText('Research permission denied');expect(calls).toBe(1);await expect(page.locator('.cg-release')).toContainText('0 human-reviewed');
});
test('snapshot replay is explicitly pinned and malformed versions never select arbitrary URLs',async({page})=>{
 await ready(page);await page.getByText('Snapshot history and reproducibility',{exact:true}).click();await page.getByLabel('Pinned snapshot hash').fill(graph.version);await page.getByRole('button',{name:'Open pinned snapshot',exact:true}).click();await expect(page).toHaveURL(new RegExp('version='+graph.version));await expect(page.getByRole('heading',{name:'Claim-linked network',exact:true})).toBeVisible();
 await page.goto('/research/knowledge-graph?version=invalid');await expect(page.getByRole('alert')).toContainText('could not be verified');await expect(page.locator('.cg-text-view')).toHaveCount(0);
});
