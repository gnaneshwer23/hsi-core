import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const result={question:'q',scenarioId:'il21-autoimmune',version:1,briefHash:'a'.repeat(64),
 searches:[{provider:'europe-pmc',context:'ssc',status:'ok',count:1,error:null},{provider:'openalex',context:'ssc',status:'failed',count:0,error:'HTTP 500'}],
 records:[{sourceId:'s1',title:'IL-21 in SSc',doi:'10.1/x',pmid:'1',publicationDate:'2020-01-01',sourceUrl:'https://europepmc.org/article/MED/1',retrievedAt:'2026-11-15T00:00:00Z',provider:'europe-pmc',abstract:'a',retraction:'not_flagged_by_provider'}],
 candidates:[{id:'c1',subject:'IL-21',object:'T follicular helper cells',contexts:['ssc'],species:'human',sourceId:'s1',sourceUrl:'https://europepmc.org/article/MED/1',sentence:'IL-21 was increased and Tfh cells expanded in patients.',lexicalPolarity:'supporting',direction:'not_assessed',polarity:'uncertain',polarityBasis:'not_assessed',verification:'not_run',verdicts:[],retraction:'not_flagged_by_provider'}],
 targets:[],byContext:{ssc:{label:'Systemic sclerosis',records:1,supporting:[],opposing:[],uncertain:['c1']}},
 verification:{status:'not_configured',reason:'The model step is disabled on this deployment.',checked:0,independence:null},
 gaps:['Search failed: openalex for ssc (HTTP 500). Absence of results there is not evidence of absence.'],
 events:[{stage:'scoped',at:'t',status:'ok',detail:'scoped'},{stage:'challenged',at:'t',status:'skipped',detail:'The model step is disabled on this deployment.'}],budget:null};
test('live investigation shows failures, keeps direction unassessed and labels the claim as a candidate',async({page})=>{
 await page.route('**/api/research/live-investigation',r=>r.fulfill({json:result}));
 await page.goto('/research/investigate');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 const panel=page.locator('.li-panel');
 await expect(panel).toContainText('failed (HTTP 500)');
 await expect(panel).toContainText('Direction not assessed');
 await expect(panel).toContainText('Not assessed: the model challenge did not run.');
 await panel.getByRole('button',{name:/IL-21 ~ T follicular helper cells/}).click();
 const inspector=panel.getByLabel('Selected claim');
 await expect(inspector).toContainText('Candidate · unreviewed · not promotable to the graph');
 await expect(inspector).toContainText('Not assessed');
 await expect(inspector).toContainText('licence not assessed');
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).include('.li-panel').analyze();
 expect(axe.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
});
test('a failed run says no findings were generated',async({page})=>{
 await page.route('**/api/research/live-investigation',r=>r.fulfill({status:502,json:{error:'Investigation could not run. No findings were generated.'}}));
 await page.goto('/research/investigate');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByRole('alert').filter({hasText:'No findings were generated'}).first()).toBeVisible();
});

test('Home to live run to saved run: a matching question offers a live run that needs a click, and Home resumes it',async({page})=>{
 let calls=0;
 await page.route('**/api/research/live-investigation',r=>{calls++;return r.fulfill({json:{...result,question:'Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?',
  candidates:[{...result.candidates[0],id:'c2',direction:'positive',polarity:'supporting',verification:'agree_directional',polarityBasis:'two_model_challenge',verdicts:[{verifier:'a',model:'m',direction:'positive',evidenceSpan:'IL-21 was increased',reason:'r'},{verifier:'b',model:'m2',direction:'positive',evidenceSpan:'IL-21 was increased',reason:'r'}],priority:{score:7,reasons:['States an effect or direction']}}],
  byContext:{ssc:{label:'Systemic sclerosis',records:1,supporting:['c2'],opposing:[],uncertain:[]}},verification:{status:'completed',reason:null,checked:1,independence:'independent_execution_only'}}})});
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await page.locator('#rh-q').fill('Why might IL-21 signalling differ across autoimmune diseases?');
 await expect(page.getByText('This matches a curated scenario')).toBeVisible();
 expect(calls).toBe(0);
 await page.getByRole('link',{name:'Deep Investigate: run live'}).click();
 await expect(page).toHaveURL(/\/research\/investigate#live-investigation/);
 expect(calls).toBe(0); // nothing runs until the researcher presses Run
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.locator('.li-panel')).toContainText('Supporting');
 await page.getByRole('button',{name:'Save in this browser'}).click();
 await page.goto('/research/home');
 const cont=page.getByRole('region',{name:'Continue researching'});
 await expect(cont).toContainText('Live investigation · saved in this browser');
 await expect(cont).toContainText('1 supporting');
 await cont.getByRole('link',{name:'Reopen'}).click();
 await expect(page.locator('.li-panel')).toContainText('Supporting');
 expect(calls).toBe(1); // reopening reads the saved run and does not call the sources again
});
test('a question outside the curated scenarios offers only the saved-question path',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await page.locator('#rh-q').fill('How do microbial metabolites influence immune signalling and brain inflammation?');
 await expect(page.getByRole('link',{name:'Deep Investigate: run live'})).toHaveCount(0);
 await expect(page.getByText('Live runs cover curated scenarios only')).toBeVisible();
});
