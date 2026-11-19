import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
const cand=(o:any)=>({id:'c1',relationId:'il21-tfh',subject:'IL-21',object:'T follicular helper cells',contexts:['ssc'],species:'human',sourceId:'s1',sourceUrl:'https://europepmc.org/article/MED/1',sentence:'IL-21 was increased and Tfh cells expanded in patients with systemic sclerosis.',state:'extracted_candidate',lexicalPolarity:'supporting',polarityBasis:'not_assessed',direction:'not_assessed',polarity:'uncertain',priority:{score:7,reasons:['States an effect or direction']},verification:'not_run',verdicts:[],retraction:'not_flagged_by_provider',...o});
const emptyComparison={schemaVersion:'hsi-live-structured-comparison-1',method:'hsi.structured_evidence_comparison.v1',version:'0.3.0',pairCount:0,summary:{consistent:0,potentialContradiction:0,contextDependent:0,methodologicalDifference:0,insufficientComparability:0,insufficientEvidence:0},items:[],honesty:{metadataOrDeclaredContextOnly:true,associationScoreIsNotCausation:true,potentialContradictionIsNotProvenContradiction:true,verificationBoundBeforeContradictionLanguage:true,scientificApproval:false,graphPromotable:false,claimSupport:'not_assessed',gateCAutoApprove:false,cdsPhi:false,neonContradictionLedger:false}};
const base={schemaVersion:'hsi-live-investigation-1',mode:'live',scenarioId:'il21-autoimmune',question:'Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?',version:1,briefHash:'a'.repeat(64),
 entities:['IL-21','T follicular helper cells','B-cell responses'],
 searches:[{provider:'europe-pmc',context:'ssc',status:'ok',count:1,error:null,query:'q'},{provider:'openalex',context:'ssc',status:'failed',count:0,error:'HTTP 500',query:'q'}],
 records:[{provider:'europe-pmc',sourceId:'s1',title:'IL-21 in SSc',doi:'10.1/x',pmid:'1',publicationDate:'2020-01-01',sourceUrl:'https://europepmc.org/article/MED/1',retrievedAt:'2026-11-15T00:00:00Z',licenceStatus:'not_assessed',retraction:'not_flagged_by_provider',studyTypes:[],verificationState:'metadata_retrieved_not_claim_verified',reviewState:'unreviewed',hasAbstract:true}],
 targets:[],byContext:{ssc:{label:'Systemic sclerosis',records:1,supporting:[],opposing:[],uncertain:['c1']}},
 verification:{status:'not_configured',reason:'The model step is disabled on this deployment.',checked:0,independence:null},
 hypotheses:{status:'not_configured',reason:'Hypotheses need the two-model check, which did not run.',items:[],dropped:0,basis:{findings:0}},
 structuredComparison:emptyComparison,
 gaps:['Search failed: openalex for ssc (HTTP 500). Absence of results there is not evidence of absence.'],budget:null,
 flags:{scientificApproval:false,graphPromotable:false,consensusEstablished:false,humanReview:'required',clinicalAdvice:false,containsPhi:false},
 events:[{stage:'scoped',at:'t',status:'ok',detail:'scoped'},{stage:'searched',at:'t',status:'partial',detail:'1 of 2 searches returned; 1 failed.'},{stage:'retrieved',at:'t',status:'ok',detail:'1 record'},{stage:'mapped',at:'t',status:'ok',detail:'mapped'},{stage:'compared',at:'t',status:'ok',detail:'1 candidate'},{stage:'challenged',at:'t',status:'skipped',detail:'The model step is disabled on this deployment.'},{stage:'brief',at:'t',status:'ok',detail:'brief'}]};
const unchecked={...base,candidates:[cand({})]};
const checkedComparison={...emptyComparison,pairCount:1,summary:{...emptyComparison.summary,contextDependent:1},items:[{leftId:'c1',rightId:'c2b',leftLabel:'IL-21 ~ T follicular helper cells',rightLabel:'IL-21 ~ T follicular helper cells',leftContexts:['Systemic sclerosis'],rightContexts:['Rheumatoid arthritis'],engineOutcome:'context_dependent',outcome:'context_dependent',rationale:'Disease context differs; not treated as proven contradiction.',verificationBindNote:null,verificationLeft:'both checks agree on direction',verificationRight:'both checks agree on direction',sharedSubjectObject:true,contextDepth:'coarse_metadata_only',needsHumanReview:true,potentialContradictionIsNotProven:true}]};
const checked={...base,structuredComparison:checkedComparison,hypotheses:{status:'generated',reason:null,dropped:0,basis:{findings:2},items:[{id:'h1',statement:'Blocking IL-21 reduces Tfh expansion in systemic sclerosis cells.',rationale:'The cited finding links IL-21 to Tfh expansion.',citedClaimIds:['c1'],prediction:'Fewer Tfh cells with blockade.',experiment:'Culture cells with an IL-21 blocking antibody.',falsifier:'No change in Tfh numbers.',limits:'Human systemic sclerosis, association only.',state:'unvalidated_hypothesis',generatedBy:{verifier:'openai-a',model:'m1'},challenge:{verifier:'openai-b',model:'m2',verdict:'overreach',reason:'Blockade is not in the findings.'},challengeNote:null}]},verification:{status:'completed',reason:null,checked:1,independence:'independent_execution_only'},
 byContext:{ssc:{label:'Systemic sclerosis',records:1,supporting:['c1'],opposing:[],uncertain:[]}},
 candidates:[cand({direction:'positive',polarity:'supporting',polarityBasis:'two_model_challenge',verification:'agree_directional',verdicts:[{verifier:'openai-a',model:'m1',direction:'positive',evidenceSpan:'IL-21 was increased',reason:'States an increase.'},{verifier:'openai-b',model:'m2',direction:'positive',evidenceSpan:'IL-21 was increased',reason:'States an increase.'}]}),cand({id:'c2',object:'B-cell responses',relationId:'il21-bcell',sentence:'IL-21 is linked to B cells in lupus.',contexts:['sle']}),cand({id:'c2b',relationId:'il21-tfh',contexts:['ra'],species:'mouse',sourceId:'s2',sourceUrl:'https://europepmc.org/article/MED/2',sentence:'In murine arthritis IL-21 signalling reduced Tfh expansion.',direction:'negative',polarity:'opposing',polarityBasis:'two_model_challenge',verification:'agree_directional',verdicts:[]})]};
const mock=(page:any,body:unknown,status=200)=>page.route('**/api/research/live-investigation',(r:any)=>r.fulfill({status,json:body}));

test('workspace before a run states that nothing has started and shows no figures',async({page})=>{
 await page.goto('/research/workspace');
 await expect(page.getByRole('heading',{level:1})).toContainText('IL-21');
 await expect(page.getByText('Nothing starts until you press Run')).toBeVisible();
 await expect(page.getByRole('list',{name:/Investigation stages/})).toContainText('Not run');
 await expect(page.getByLabel('Run totals')).toContainText('—');
});

test('an unchecked run keeps direction unassessed, shows the failed search and labels claims as candidates',async({page})=>{
 await mock(page,unchecked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 const ev=page.getByRole('region',{name:/^Evidence \(/});
 await expect(ev).toContainText('Not checked (1)');
 await expect(page.getByRole('list',{name:/Investigation stages/})).toContainText('Partial');
 await expect(page.getByRole('list',{name:/Investigation stages/})).toContainText('Skipped');
 await ev.getByRole('button',{name:/IL-21 ~ T follicular helper cells/}).click();
 const insp=page.getByLabel('Selected claim');
 await expect(insp).toContainText('Candidate · unreviewed · not promotable to the graph');
 await expect(insp).toContainText('Not assessed');await expect(insp).toContainText('licence not assessed');
 await expect(page.getByRole('heading',{name:'Evidence context passport'})).toBeVisible();
 await expect(page.getByText('EVIDENCE CONTEXT PASSPORT · NOT SCIENTIFICALLY APPROVED')).toBeVisible();
 await expect(page.getByText(/Explicitly missing:/)).toBeVisible();
 await expect(page.getByText(/dose/i).first()).toBeVisible();
 await expect(page.getByRole('region',{name:'Scientific verification'})).toContainText('Not assessed: the model check did not run.');
});

test('after a run, passport empty-state prompts claim selection before inventing context',async({page})=>{
 await mock(page,unchecked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByText('Select a claim to open its Evidence Context Passport')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Evidence context passport'})).toHaveCount(0);
});

test('a checked run shows findings, a relationship map that filters evidence, verifier quotes and the brief; axe is clean',async({page})=>{
 await mock(page,checked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByLabel('Run totals')).toContainText('Key findings');
 const ev=page.getByRole('region',{name:/^Evidence \(/});
 await ev.getByRole('button',{name:'Supporting (1)'}).click();
 await expect(ev.getByRole('list').first()).not.toContainText('B cells in lupus');
 await ev.getByRole('button',{name:'All (3)'}).click();
 await page.getByRole('group',{name:'Relationships found'}).getByRole('button',{name:/B-cell responses/}).click();
 await expect(ev).toContainText('Showing IL-21 → B-cell responses');
 await expect(ev).not.toContainText('Tfh cells expanded');
 await ev.getByRole('button',{name:'Clear'}).click();
 // Two same-relation claims exist for structured comparison; select the supporting one explicitly.
 await ev.getByRole('button',{name:/IL-21 ~ T follicular helper cells.*IL-21 was increased/}).click();
 const insp=page.getByLabel('Selected claim');
 await expect(insp).toContainText('openai-a');await expect(insp).toContainText('Quoted: “IL-21 was increased”');
 await expect(page.getByRole('heading',{name:'Evidence table for this live brief'})).toBeVisible();
 await expect(page.getByText('EVIDENCE TABLE · PASSPORT COLUMNS · NOT SCIENTIFICALLY APPROVED')).toBeVisible();
 await expect(page.getByRole('region',{name:'Passport evidence table'})).toContainText('Not stated');
 // Brief auto-opens when structured comparison pairs exist (USP A trail).
 const briefToggle=page.getByRole('button',{name:/research brief/i});
 await expect(briefToggle).toBeVisible();
 if(await page.getByRole('button',{name:'Open research brief'}).count()){
  await page.getByRole('button',{name:'Open research brief'}).click();
 }
 const brief=page.getByLabel('Research brief text');
 await expect(brief).toContainText('Supporting (both checks agree) (1)');
 await expect(brief).toContainText('Claim verification status');
 await expect(brief).toContainText('Evidence table (context passport columns)');
 await expect(brief).toContainText('Structured evidence comparison (candidate)');
 await expect(brief).toContainText('potential_contradiction is not a proven contradiction');
 await expect(brief).toContainText('Scientific approval: false');
 const vf=page.getByRole('region',{name:'Scientific verification'});
 await expect(vf.getByText('Opposing / disputed checks')).toBeVisible();
 await expect(page.getByRole('navigation',{name:/USP A disagreement journey/i})).toBeVisible();
 const disagree=page.getByRole('region',{name:/Why findings may differ/i});
 await expect(disagree).toContainText('Context-dependent difference');
 await expect(disagree).toContainText('Potential contradiction is not');
 await disagree.getByRole('button',{name:/Context-dependent difference/}).click();
 await expect(page.getByRole('heading',{name:/Left claim · Evidence Context Passport/})).toBeVisible();
 await expect(page.getByRole('heading',{name:/Right claim · Evidence Context Passport/})).toBeVisible();
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(axe.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
});

test('Brief v2 JSON export carries null graph release, unreviewed counts and no approval',async({page})=>{
 await mock(page,checked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 const event=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export Brief v2 (JSON)',exact:true}).click();
 const download=await event;
 expect(download.suggestedFilename()).toBe('hsi-live-brief-v2.json');
 const brief=JSON.parse(await readFile((await download.path())!,'utf8'));
 expect(brief.schemaVersion).toBe('hsi-live-research-brief-2');
 expect(brief.briefVersion).toBe(2);
 expect(brief.graphReleaseId).toBeNull();
 expect(brief.runIds).toEqual([checked.briefHash]);
 expect(brief.reviewStates.reviewedEdgeCount).toBe(0);
 expect(brief.reviewStates.reviewed).toBe(0);
 expect(brief.scientificApproval).toBe(false);
 expect(brief.graphPromotable).toBe(false);
 expect(brief.containsPhi).toBe(false);
 expect(brief.clinicalAdvice).toBe(false);
 expect(brief.reproducibleFromSavedRecord).toBe(false);
 expect(brief.conflictClasses.every((c:any)=>c.confirmedContradiction===false)).toBe(true);
});

test('hypotheses are labelled unvalidated, cite findings, show the second model challenge and appear in the brief',async({page})=>{

 await mock(page,checked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 const vf=page.getByRole('region',{name:'Scientific verification'});
 await expect(page.getByRole('list',{name:/Investigation stages/})).toContainText('Hypothesise');
 await expect(vf).toContainText('Unvalidated model proposals from 2 agreed findings');
 await expect(vf).toContainText('Unvalidated hypothesis');
 await expect(vf).toContainText('Second model: overreach. Blockade is not in the findings.');
 await vf.getByRole('group',{name:'Findings behind h1'}).getByRole('button',{name:/IL-21 ~ T follicular helper cells/}).click();
 await expect(page.getByLabel('Selected claim')).toContainText('openai-a');
 await vf.getByText('Rationale, prediction, experiment, falsifier').click();
 await expect(vf).toContainText('Would be falsified by');
 if(await page.getByRole('button',{name:'Open research brief'}).count()){
  await page.getByRole('button',{name:'Open research brief'}).click();
 }
 await expect(page.getByLabel('Research brief text')).toContainText('Hypotheses (unvalidated model proposals) (1)');
});

test('a failed run says no findings were generated',async({page})=>{
 await mock(page,{error:'Investigation could not run. No findings were generated.'},502);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByRole('alert').filter({hasText:'No findings were generated'}).first()).toBeVisible();
});

test('Home to workspace to saved run: a matching question needs a click to run, and Home resumes the saved run without calling the sources',async({page})=>{
 let calls=0;
 await page.route('**/api/research/live-investigation',r=>{calls++;return r.fulfill({json:checked})});
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await page.locator('#rh-q').fill('Why might IL-21 signalling differ across autoimmune diseases?');
 await expect(page.getByText('This matches a curated scenario')).toBeVisible();
 expect(calls).toBe(0);
 await page.getByRole('link',{name:'Deep Investigate: run live'}).click();
 await expect(page).toHaveURL(/\/research\/workspace/);
 expect(calls).toBe(0);
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByLabel('Run totals')).toContainText('Key findings');
 await page.getByRole('button',{name:'Save in this browser'}).click();
 await page.goto('/research/home');
 await page.locator('#rh-more > summary').click();
 const cont=page.getByRole('region',{name:'Continue researching'});
 await expect(cont).toContainText('Live investigation · saved in this browser');
 await expect(cont).toContainText('1 supporting');
 await cont.getByRole('link',{name:'Reopen'}).click();
 await expect(page.getByLabel('Run totals')).toContainText('Key findings');
 expect(calls).toBe(1);
});

test('a question outside the curated scenarios offers only the saved-question path',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await page.locator('#rh-q').fill('How do microbial metabolites influence immune signalling and brain inflammation?');
 await expect(page.getByRole('link',{name:'Deep Investigate: run live'})).toHaveCount(0);
 await expect(page.getByText('Live runs cover curated scenarios only')).toBeVisible();
});

test('mobile: the workspace stacks without horizontal scroll',async({page})=>{
 await mock(page,checked);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByLabel('Run totals')).toContainText('Key findings');
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300); // settle fonts and transitions before measuring
 // Passport evidence table scrolls inside .pet-scroll; only page-level overflow fails this check.
 const wide=await page.evaluate(()=>{
  const inScroll=(el:Element)=>{
   let n:Element|null=el;
   while(n&&n!==document.body){
    const s=getComputedStyle(n);
    if((s.overflowX==="auto"||s.overflowX==="scroll")&&(n as HTMLElement).scrollWidth>(n as HTMLElement).clientWidth+1)return true;
    n=n.parentElement;
   }
   return false;
  };
  return [...document.querySelectorAll("body *")]
   .filter(e=>e.getBoundingClientRect().right>window.innerWidth+1&&!inScroll(e))
   .slice(0,6)
   .map(e=>e.tagName+"."+String(e.className).slice(0,40));
 });
 expect(wide).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});

test('gaps in a run: search limits and unrun checks are kept apart from scientific gaps; status persists in this browser',async({page})=>{
 await mock(page,unchecked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:/Run/}).first().click();
 const gaps=page.getByRole('region',{name:/Gaps in this run|Gaps in this run/}).or(page.locator('.ws-gaps'));
 await expect(gaps.getByRole('region',{name:'Limits of this search'})).toContainText('Search failed: openalex');
 await expect(gaps.getByRole('region',{name:'Checks that did not run'})).toContainText('not assessed');
 await expect(gaps.getByRole('region',{name:'Scientific gaps'})).toHaveCount(0);
 const group=gaps.getByRole('group',{name:/Status for: Search failed/});
 await group.getByRole('button',{name:'Investigating'}).click();
 await expect(group.getByRole('button',{name:'Investigating'})).toHaveAttribute('aria-pressed','true');
 await page.reload();
 await mock(page,unchecked);
 await page.getByRole('button',{name:/Run/}).first().click();
 await expect(page.getByRole('group',{name:/Status for: Search failed/}).getByRole('button',{name:'Investigating'})).toHaveAttribute('aria-pressed','true');
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
});

test('Gap Register shows gaps from the run saved in this browser',async({page})=>{
 await page.addInitScript(run=>{localStorage.setItem('hsi-live-investigation-v1',JSON.stringify(run))},unchecked);
 await page.goto('/research/gaps');
 await expect(page.getByRole('heading',{name:'From your latest investigation'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Limits of this search'})).toContainText('Search failed: openalex');
});

test('a model proposal in a run can be added to the Hypothesis Ledger once, keeping its text and origin',async({page})=>{
 await mock(page,checked);
 await page.goto('/research/workspace');
 await page.getByRole('button',{name:/Run/}).first().click();
 const add=page.getByRole('button',{name:'Add to Hypothesis Ledger'}).first();
 await add.click();
 await expect(page.getByText('Added to your Hypothesis Ledger.')).toBeVisible();
 await add.click();
 await expect(page.getByText(/Already in your Hypothesis Ledger/)).toBeVisible();
 await page.goto('/research/ledger');
 const card=page.getByRole('list',{name:'Hypotheses'}).getByRole('listitem');
 await expect(card).toHaveCount(1);
 await expect(card.first()).toContainText('Blocking IL-21 reduces Tfh expansion');
 await expect(card.first()).toContainText('Model proposal');
 await expect(card.first()).toContainText('Unvalidated hypothesis');
});
