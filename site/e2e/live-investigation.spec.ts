import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const result={question:'q',scenarioId:'il21-autoimmune',version:1,briefHash:'a'.repeat(64),
 searches:[{provider:'europe-pmc',context:'ssc',status:'ok',count:1,error:null},{provider:'openalex',context:'ssc',status:'failed',count:0,error:'HTTP 500'}],
 records:[{sourceId:'s1',title:'IL-21 in SSc',doi:'10.1/x',pmid:'1',publicationDate:'2020-01-01',sourceUrl:'https://europepmc.org/article/MED/1',retrievedAt:'2026-11-15T00:00:00Z',provider:'europe-pmc',abstract:'a',retraction:'not_flagged_by_provider'}],
 candidates:[{id:'c1',subject:'IL-21',object:'T follicular helper cells',contexts:['ssc'],species:'human',sourceId:'s1',sourceUrl:'https://europepmc.org/article/MED/1',sentence:'IL-21 was increased and Tfh cells expanded in patients.',lexicalPolarity:'supporting',polarity:'uncertain',polarityBasis:'not_assessed',verification:'not_run',verdicts:[],retraction:'not_flagged_by_provider'}],
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
 await expect(page.getByRole('status').filter({hasText:'No findings were generated'}).first()).toBeVisible();
});
