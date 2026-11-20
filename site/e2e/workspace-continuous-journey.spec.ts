import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const domainBundle=JSON.parse(await readFile(new URL('../public/research/domain-graph/graph.v1.json',import.meta.url),'utf8'));
const cand=(o:Record<string,unknown>)=>({id:'c1',relationId:'il21-tfh',subject:'IL-21',object:'T follicular helper cells',contexts:['ssc'],species:'human',sourceId:'s1',sourceUrl:'https://europepmc.org/article/MED/1',sentence:'IL-21 was increased and Tfh cells expanded in patients with systemic sclerosis.',state:'extracted_candidate',lexicalPolarity:'supporting',polarityBasis:'not_assessed',direction:'not_assessed',polarity:'uncertain',priority:{score:7,reasons:['States an effect or direction']},verification:'not_run',verdicts:[],retraction:'not_flagged_by_provider',...o});
const emptyComparison={schemaVersion:'hsi-live-structured-comparison-1',method:'hsi.structured_evidence_comparison.v1',version:'0.3.0',pairCount:0,summary:{consistent:0,potentialContradiction:0,contextDependent:0,methodologicalDifference:0,insufficientComparability:0,insufficientEvidence:0},items:[],honesty:{metadataOrDeclaredContextOnly:true,associationScoreIsNotCausation:true,potentialContradictionIsNotProvenContradiction:true,verificationBoundBeforeContradictionLanguage:true,scientificApproval:false,graphPromotable:false,claimSupport:'not_assessed',gateCAutoApprove:false,cdsPhi:false,neonContradictionLedger:false}};
const base={schemaVersion:'hsi-live-investigation-1',mode:'live',scenarioId:'il21-autoimmune',question:'Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?',version:1,briefHash:'a'.repeat(64),
 entities:['IL-21','T follicular helper cells','B-cell responses'],
 searches:[{provider:'europe-pmc',context:'ssc',status:'ok',count:1,error:null,query:'q'},{provider:'openalex',context:'ssc',status:'failed',count:0,error:'HTTP 500',query:'q'}],
 records:[{provider:'europe-pmc',sourceId:'s1',title:'IL-21 in SSc',doi:'10.1/x',pmid:'1',publicationDate:'2020-01-01',sourceUrl:'https://europepmc.org/article/MED/1',retrievedAt:'2026-11-15T00:00:00Z',licenceStatus:'not_assessed',retraction:'not_flagged_by_provider',studyTypes:[],verificationState:'metadata_retrieved_not_claim_verified',reviewState:'unreviewed',hasAbstract:true}],
 targets:[],byContext:{ssc:{label:'Systemic sclerosis',records:1,supporting:['c1'],opposing:[],uncertain:[]}},
 verification:{status:'completed',reason:null,checked:1,independence:'independent_execution_only'},
 hypotheses:{status:'generated',reason:null,dropped:0,basis:{findings:2},items:[{id:'h1',statement:'Blocking IL-21 reduces Tfh expansion in systemic sclerosis cells.',rationale:'The cited finding links IL-21 to Tfh expansion.',citedClaimIds:['c1'],prediction:'Fewer Tfh cells with blockade.',experiment:'Culture cells with an IL-21 blocking antibody.',falsifier:'No change in Tfh numbers.',limits:'Human systemic sclerosis, association only.',state:'unvalidated_hypothesis',generatedBy:{verifier:'openai-a',model:'m1'},challenge:{verifier:'openai-b',model:'m2',verdict:'overreach',reason:'Blockade is not in the findings.'},challengeNote:null}]},
 structuredComparison:{...emptyComparison,pairCount:2,summary:{...emptyComparison.summary,contextDependent:1,insufficientComparability:1},items:[
  {leftId:'c1',rightId:'c2b',leftLabel:'IL-21 ~ T follicular helper cells',rightLabel:'IL-21 ~ T follicular helper cells',leftContexts:['Systemic sclerosis'],rightContexts:['Rheumatoid arthritis'],engineOutcome:'context_dependent',outcome:'context_dependent',rationale:'Disease context differs; not treated as proven contradiction.',verificationBindNote:null,verificationLeft:'both checks agree on direction',verificationRight:'both checks agree on direction',sharedSubjectObject:true,contextDepth:'coarse_metadata_only',needsHumanReview:true,potentialContradictionIsNotProven:true},
  {leftId:'c1',rightId:'c3',leftLabel:'IL-21 ~ T follicular helper cells',rightLabel:'IL-21 ~ B-cell responses',leftContexts:['Systemic sclerosis'],rightContexts:['Systemic lupus erythematosus'],engineOutcome:'insufficient_comparability',outcome:'insufficient_comparability',rationale:'Different objects and incomplete shared experimental axes — not treated as contradiction.',verificationBindNote:null,verificationLeft:'both checks agree on direction',verificationRight:'not checked',sharedSubjectObject:false,contextDepth:'coarse_metadata_only',needsHumanReview:true,potentialContradictionIsNotProven:true},
 ]},
 gaps:['Search failed: openalex for ssc (HTTP 500). Absence of results there is not evidence of absence.'],budget:null,
 flags:{scientificApproval:false,graphPromotable:false,consensusEstablished:false,humanReview:'required',clinicalAdvice:false,containsPhi:false},
 events:[{stage:'scoped',at:'t',status:'ok',detail:'scoped'},{stage:'searched',at:'t',status:'partial',detail:'1 of 2 searches returned; 1 failed.'},{stage:'retrieved',at:'t',status:'ok',detail:'1 record'},{stage:'mapped',at:'t',status:'ok',detail:'mapped'},{stage:'compared',at:'t',status:'ok',detail:'1 candidate'},{stage:'challenged',at:'t',status:'ok',detail:'checked'},{stage:'brief',at:'t',status:'ok',detail:'brief'}]};
const checked={...base,candidates:[
 cand({direction:'positive',polarity:'supporting',polarityBasis:'two_model_challenge',verification:'agree_directional',verdicts:[{verifier:'openai-a',model:'m1',direction:'positive',evidenceSpan:'IL-21 was increased',reason:'States an increase.'},{verifier:'openai-b',model:'m2',direction:'positive',evidenceSpan:'IL-21 was increased',reason:'States an increase.'}]}),
 cand({id:'c2',object:'B-cell responses',relationId:'il21-bcell',sentence:'IL-21 is linked to B cells in lupus.',contexts:['sle']}),
 cand({id:'c2b',relationId:'il21-tfh',contexts:['ra'],species:'mouse',sourceId:'s2',sourceUrl:'https://europepmc.org/article/MED/2',sentence:'In murine arthritis IL-21 signalling reduced Tfh expansion.',direction:'negative',polarity:'opposing',polarityBasis:'two_model_challenge',verification:'agree_directional',verdicts:[]}),
 cand({id:'c3',object:'B-cell responses',relationId:'il21-bcell',contexts:['sle'],sourceId:'s3',sourceUrl:'https://europepmc.org/article/MED/3',sentence:'IL-21 was associated with B-cell responses in lupus abstracts.',direction:'not_assessed',polarity:'uncertain',verification:'not_run',verdicts:[]}),
]};

const mockGraph=(page:import('@playwright/test').Page)=>page.route('**/api/research/graph-snapshot?*',(r)=>r.fulfill({json:domainBundle}));
const mock=(page:import('@playwright/test').Page,body:unknown,status=200)=>{mockGraph(page);return page.route('**/api/research/live-investigation',async(r)=>{
  const post=r.request().postDataJSON() as {scenarioId?:string}|null;
  expect(post?.scenarioId).toBe('il21-autoimmune');
  await r.fulfill({status,json:body});
})};

test('continuous unified journey: Ask → … → Save without gaps/ledger hops',async({page})=>{
 await mock(page,checked);
 await page.goto('/research/workspace?scenario=il21-autoimmune');
 await expect(page.getByTestId('ws-scenario-handoff')).toContainText('il21-autoimmune');
 await expect(page.getByTestId('ws-scenario-handoff')).toContainText('from Home/URL handoff');
 await expect(page.getByTestId('ws-scenario-handoff')).toContainText('production writes: false');

 const journey=page.getByRole('navigation',{name:/Scientific investigation journey/i});
 await expect(journey).toContainText('journey complete claimed: false');
 await expect(journey).toContainText('production writes: false');

 const step=(label:RegExp)=>journey.getByRole('button',{name:label});
 await step(/^Ask\b/).click();
 await expect(page.locator('#ws-ask-strip')).toBeVisible();

 await page.getByRole('button',{name:'Run live investigation'}).click();
 await expect(page.getByLabel('Run totals')).toContainText('Key findings');

 await step(/^Evidence\b/).click();
 await expect(page.locator('#ws-ev-h')).toBeVisible();
 await page.getByRole('button',{name:/View all sources/i}).click();
 const allSources=page.locator('ul.ws-sources');
 await expect(allSources).toBeVisible();
 await expect(allSources).toContainText('sourceClearanceVerified: false');
 await expect(allSources).toContainText('licenceStatus: not assessed');
 await expect(allSources).toContainText('rights: unverified');
 await expect(allSources).toContainText('verificationState: metadata retrieved not claim verified');

 await step(/^Passport\b/).click();
 await expect(page.getByRole('heading',{name:'Evidence context passport'})).toBeVisible();
 await expect(page.getByText('EVIDENCE CONTEXT PASSPORT · NOT SCIENTIFICALLY APPROVED')).toBeVisible();
 const inspect=page.getByLabel('Selected claim');
 await expect(inspect).toContainText('sourceClearanceVerified: false');
 await expect(inspect).toContainText('licenceStatus: not assessed');
 await expect(inspect).toContainText('rights: unverified');

 const uspPanels=page.locator('#ws-usp-panels');
 expect(await uspPanels.getAttribute('open')).toBeNull();
 await step(/^Why differ\b/).click();
 await expect.poll(async()=>uspPanels.getAttribute('open')).not.toBeNull();
 const disagree=page.getByRole('region',{name:/Why findings may differ/i});
 await expect(disagree).toContainText('Potential contradiction is not');
 await expect(disagree.getByTestId('ws-comparability-honesty')).toContainText(
  'Insufficient comparability is not Potential contradiction',
 );
 await expect(disagree.getByTestId('ws-comparability-honesty')).toContainText(
  'not proven conflict',
 );
 await expect(disagree).toContainText('Context-dependent difference');
 await expect(disagree).toContainText('Insufficient comparability');
 // Unified trail auto-selects first comparison pair (cmpKey) — dual passports appear.
 await expect(page.getByRole('heading',{name:/Left claim · Evidence Context Passport/})).toBeVisible();
 await expect(page.getByRole('heading',{name:/Right claim · Evidence Context Passport/})).toBeVisible();
 await disagree.getByRole('button',{name:/Insufficient comparability/}).click();
 await expect(disagree.getByRole('button',{name:/Insufficient comparability/})).toHaveAttribute('aria-pressed','true');
 await expect(disagree.getByTestId('ws-comparability-honesty')).toBeVisible();

 const gapsFold=page.locator('#ws-gaps-testable');
 expect(await gapsFold.getAttribute('open')).toBeNull();
 const vf=page.getByRole('region',{name:'Scientific verification'});
 await expect(vf.getByTestId('ws-provisional-hyp-honesty')).toContainText('provisional and unvalidated');
 await expect(vf).toContainText('Provisional · unvalidated hypothesis');
 await vf.getByText('Rationale, prediction, experiment, falsifier').click();
 await expect(vf.getByText('Experiment (provisional, unvalidated)',{exact:true})).toBeVisible();

 await step(/^Gaps\b/).click();
 await expect.poll(async()=>gapsFold.getAttribute('open')).not.toBeNull();
 await expect(page.locator('#ws-gp-h')).toBeVisible();
 await expect(gapsFold.getByText('Proposed experiment (provisional, unvalidated)').first()).toBeVisible();

 await step(/^Brief\b/).click();
 const briefPanel=page.getByRole('region',{name:/Research decision brief/i});
 await expect(briefPanel).toContainText('briefAccepted: false');
 await expect(briefPanel.getByRole('heading',{name:/Limitations \(always visible\)/i})).toBeVisible();
 await expect(briefPanel).toContainText('Hypotheses and experiment proposals are provisional and unvalidated');
 await expect(briefPanel).toContainText('sourceClearanceVerified: false');
 await expect(briefPanel.getByRole('region',{name:'Passport evidence table'})).toContainText('rights: unverified');
 await expect(briefPanel.getByRole('region',{name:'Passport evidence table'})).toContainText('sourceClearanceVerified: false');
 if(await briefPanel.getByRole('button',{name:'Open markdown preview'}).count()){
  await briefPanel.getByRole('button',{name:'Open markdown preview'}).click();
 }
 await expect(page.getByLabel('Research brief text')).toContainText('Hypotheses (provisional, unvalidated model proposals)');
 await expect(page.getByLabel('Research brief text')).toContainText('Experiment (provisional, unvalidated)');

 await step(/^Save\b/).click();
 const connected=page.getByRole('region',{name:/Connected research \(personal\)/i});
 await expect(connected).toContainText('Production writes: false');
 await connected.getByRole('button',{name:'Save to browser library',exact:true}).click();
 await expect(connected).toContainText(/Saved to browser library|Saved in this browser library/i);
 await connected.getByRole('button',{name:'Reopen'}).first().click();
 await expect(connected).toContainText(/Reopened the same version|Reopened/i);

 // Continuous path must not require Gap Register or Hypothesis Ledger navigation.
 expect(page.url()).toContain('/research/workspace');
 expect(page.url()).not.toContain('/research/gaps');
 expect(page.url()).not.toContain('/research/ledger');
});

test('Home curated question hands scenario into workspace Ask strip',async({page})=>{
 await page.route('**/api/research/investigations',(r)=>r.fulfill({status:401,json:{}}));
 await mockGraph(page);
 await page.goto('/research/home');
 const skip=page.getByRole('button',{name:'Skip for now'});
 if(await skip.count())await skip.click();
 await page.locator('#rh-q').fill('Why might IL-21 signalling differ across autoimmune disease contexts?');
 await expect(page.getByRole('link',{name:/Deep Investigate: run live/i})).toHaveAttribute(
  'href',
  '/research/workspace?scenario=il21-autoimmune',
 );
 await page.getByRole('link',{name:/Deep Investigate: run live/i}).click();
 await expect(page).toHaveURL(/\/research\/workspace\?scenario=il21-autoimmune/);
 await expect(page.getByTestId('ws-scenario-handoff')).toContainText('il21-autoimmune');
 await expect(page.getByTestId('ws-scenario-handoff')).toContainText('from Home/URL handoff');
});
