import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
const bundle=JSON.parse(await readFile(new URL('../public/research/domain-graph/graph.v1.json',import.meta.url),'utf8'));
async function ready(page:any){await page.goto('/research/knowledge-graph');await expect(page.getByRole('heading',{name:'Connected research network',exact:true})).toBeVisible()}
const trial={protocolSection:{identificationModule:{nctId:'NCT01030861',briefTitle:'Browser test registry record, not independently verified'},conditionsModule:{conditions:['Diabetes Mellitus, Type 1']},statusModule:{overallStatus:'COMPLETED',lastUpdatePostDateStruct:{date:'2020-01-01'}},eligibilityModule:{minimumAge:'8 Years',maximumAge:'45 Years',eligibilityCriteria:'Test-only unparsed criteria. Investigator assessment required.'}}};
test('the default graph connects domains and preserves the original source-corpus entry',async({page})=>{
 await ready(page);await expect(page.getByRole('navigation',{name:'Research workspace'}).getByRole('link',{name:'Knowledge graph',exact:true})).toHaveAttribute('aria-current','page');await expect(page.getByRole('complementary',{name:'Research snapshot scope'})).toContainText('153 concepts');await expect(page.getByRole('complementary',{name:'Research snapshot scope'})).toContainText('0 independently approved');
 await page.getByRole('button',{name:'All domains',exact:true}).click();await expect(page.locator('.kg-stage-head')).toContainText('153 concepts');
 await page.getByRole('link',{name:'RA/SSc source corpus',exact:true}).click();await expect(page.getByRole('heading',{name:'Claim-linked network',exact:true})).toBeVisible();
});
test('model filters keep human-donor mouse experiments separate from human participant evidence',async({page})=>{
 await ready(page);await page.getByLabel('Search concepts',{exact:true}).fill('Human microbiota Clostridia');
 const row=page.locator('.cg-text-view button').filter({hasText:'Human microbiota Clostridia mix'}).first();await row.click();const inspector=page.getByRole('region',{name:'Cross-domain relationship evidence'});await expect(inspector).toContainText('Mouse');await expect(inspector).toContainText('Human-derived strains tested in mice');
 await page.getByLabel('Search concepts',{exact:true}).fill('');await page.getByLabel('Study model',{exact:true}).selectOption('human_in_vivo');
 const text=await page.locator('.cg-text-view').innerText();expect(text).toContain('Human participants');expect(text).not.toContain('Mouse');expect(text).not.toContain('Human cells / ex vivo');
});
test('type 1 research outcomes preserve animal translation gaps and falsifiable proposals',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Gut metabolites → islet autoimmunity → type 1 diabetes',exact:true}).click();await page.getByRole('tab',{name:'Research outcomes',exact:true}).click();
 await expect(page.locator('.dg-path').first()).toContainText('Includes animal or mixed-model evidence');await expect(page.getByRole('tabpanel')).toContainText('Islet autoimmunity');await expect(page.getByRole('tabpanel')).toContainText('What would challenge it?');await expect(page.getByRole('tabpanel')).toContainText('Which antigen-specific immune-cell changes');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export this research brief',exact:true}).click();const brief=JSON.parse(await readFile((await (await event).path())!,'utf8'));expect(brief.scientificApproval).toBe(false);expect(brief.summaryMethod).toBe('editorial_template_not_live_llm');expect(brief.question.id).toBe('gut-t1d');
});
test('a research gap opens as missing evidence rather than a supported biological edge',async({page})=>{
 await ready(page);await page.getByRole('tab',{name:'Research outcomes',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('No complete directed source path');
 const gap=page.locator('.dg-gap').filter({hasText:'Does the intestinal Treg change'});await gap.getByRole('button',{name:'Locate this gap in the graph',exact:true}).click();
 const inspector=page.getByRole('region',{name:'Cross-domain relationship evidence'});await expect(inspector).toContainText('Unresolved research connection');await expect(inspector).toContainText('No supporting source is attached');await expect(inspector).toContainText('excluded from source-only paths');
});
test('validation cohort filters and study overlap retain type specificity and no eligibility decision',async({page})=>{
 await ready(page);await page.getByRole('tab',{name:'Cohorts & trials',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('synthetic validation data');await expect(page.getByRole('tabpanel')).toContainText('No registry snapshot loaded');
 await page.getByLabel('Cohort condition',{exact:true}).selectOption('Type 1 diabetes');await page.getByLabel('Minimum age',{exact:true}).fill('0');await page.getByLabel('Maximum age',{exact:true}).fill('120');await expect(page.locator('.dg-cohort-count')).toContainText('10');
 await page.getByLabel('Import public registry JSON',{exact:true}).setInputFiles({name:'public-study.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(trial))});await expect(page.locator('.dg-study')).toContainText('10 validation profiles with exact condition overlap');await expect(page.locator('.dg-study')).toContainText('Eligibility is unconfirmed');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export study-overlap report',exact:true}).click();const report=JSON.parse(await readFile((await (await event).path())!,'utf8'));expect(report.confirmedEligible).toBe(false);expect(report.researchOverlap[0].patientEligibilityAssessed).toBe(false);expect(report.studies[0].sourceStatus).toBe('operator_uploaded_unverified');
 await page.getByLabel('Cohort condition',{exact:true}).selectOption('Type 2 diabetes');await expect(page.locator('.dg-study')).toContainText('0 validation profiles with exact condition overlap');
 await page.getByLabel('Latest HbA1c at least (%)',{exact:true}).fill('8');const expected=bundle.validationProfiles.filter((p:any)=>p.condition==='Type 2 diabetes'&&p.lastHba1c>=8).length;await expect(page.locator('.dg-cohort-count strong')).toHaveText(String(expected));
 await page.getByLabel('Import public registry JSON',{exact:true}).setInputFiles({name:'private.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...trial,patient_id:'private'}))});await expect(page.getByRole('status')).toContainText('Import rejected');await expect(page.locator('.dg-study')).toHaveCount(0);
});
test('future AI capabilities are proposals with evaluation criteria and make no model or write requests',async({page})=>{
 const posts:string[]=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});await ready(page);await page.getByRole('tab',{name:'Future discovery',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('not running services');await expect(page.getByRole('tabpanel')).toContainText('Independent wet-lab replication');await expect(page.locator('.dg-future .dg-card')).toHaveCount(5);expect(posts).toEqual([]);
});
test('pinned snapshots and altered scope flags fail closed',async({page})=>{
 await page.goto('/research/knowledge-graph?domainVersion='+bundle.version);await expect(page.getByRole('heading',{name:'Connected research network',exact:true})).toBeVisible();
 await page.goto('/research/knowledge-graph?domainVersion='+bundle.parentVersion);await expect(page.getByRole('alert')).toContainText('could not be verified');
 await page.goto('/research/knowledge-graph?domainVersion='+bundle.version);await expect(page.getByRole('heading',{name:'Connected research network',exact:true})).toBeVisible();
 await page.route('**/research/domain-graph/versions/*.json',r=>r.fulfill({json:{...bundle,scientificApproval:true}}));await page.reload();await expect(page.getByRole('alert')).toContainText('could not be verified');await expect(page.locator('.dg-workspace')).toHaveCount(0);
});
test('cross-domain graph and each investigation view pass mobile/desktop accessibility checks',async({page},info)=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:950});await page.emulateMedia({reducedMotion:'reduce'});await ready(page);
  for(const title of ['Connected graph','Research outcomes','Cohorts & trials','Future discovery']){
   await page.getByRole('tab',{name:title,exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),title+' at '+width).toBe(true);
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))}))).toEqual([]);
   if(title==='Connected graph')await page.screenshot({path:info.outputPath('domain-graph-'+width+'.png'),fullPage:true});
  }
 }
 expect(errors).toEqual([]);
});

test('pinned views restore model filters and Markdown briefs preserve source status and uncertainty',async({page})=>{
 await ready(page);await page.getByLabel('Study model',{exact:true}).selectOption('human_in_vivo');const pinned=await page.getByRole('link',{name:'Pinned investigation',exact:true}).getAttribute('href');await page.goto(pinned!);await expect(page.getByRole('heading',{name:'Connected research network',exact:true})).toBeVisible();await expect(page.getByLabel('Study model',{exact:true})).toHaveValue('human_in_vivo');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download Markdown brief',exact:true}).click();const text=await readFile((await (await event).path())!,'utf8');expect(text).toContain('# HSI Research Brief');expect(text).toContain(bundle.version);expect(text).toContain('bibliographic_candidate_not_retrieved');expect(text).toContain('Falsification:');
 await page.getByRole('tab',{name:'Research outcomes',exact:true}).click();await expect(page.getByRole('region',{name:'Evidence context comparison'})).toContainText('no pooled effect or confirmed contradiction');
});

test('concept and relationship lists paginate without clipped click targets',async({page})=>{
 await ready(page);const concepts=page.locator('.cg-concepts');const initial=await concepts.innerText();await page.getByRole('button',{name:'Next concept page',exact:true}).click();expect(await concepts.innerText()).not.toBe(initial);await page.getByRole('button',{name:'Previous concept page',exact:true}).click();await expect.poll(()=>concepts.innerText()).toBe(initial);
 const relations=page.locator('.cg-text-view');const before=await relations.innerText();await page.getByRole('button',{name:'Next relationship page',exact:true}).click();expect(await relations.innerText()).not.toBe(before);await page.getByRole('button',{name:'Previous relationship page',exact:true}).click();await expect.poll(()=>relations.innerText()).toBe(before);
});
