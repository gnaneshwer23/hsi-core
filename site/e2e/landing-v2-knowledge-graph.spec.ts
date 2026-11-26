import {test,expect} from '@playwright/test';

/** The Knowledge graph page: the live published graph, the recorded gaps, and the old URLs that now lead here or to the page that covers them. */
test('the knowledge graph page shows the published graph and the recorded gaps from the snapshot',async({page})=>{
 await page.goto('/knowledge-graph');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Every connection, with the study behind it.');
 await expect(page.locator('main').getByText('Every line is a candidate; none is an approved finding.')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Where the evidence is thin.'})).toBeVisible();
 await expect(page.getByText(/recorded gaps across/)).toBeVisible();
 await expect(page.getByText(/relationships have been scientifically reviewed/)).toBeVisible();
 await expect(page.getByRole('link',{name:/Open the recorded gap register/})).toHaveAttribute('href','/research/gaps');
});

test('the gaps list states the failure and shows no figures when the snapshot cannot load',async({page})=>{
 await page.route(/\/research\/claim-graph\/|graph-snapshot/,r=>r.abort());
 await page.goto('/knowledge-graph');
 await expect(page.getByText(/could not be loaded, so no figures are shown/)).toBeVisible();
 await expect(page.getByText(/recorded gaps across/)).toHaveCount(0);
});

for(const [from,to] of [['/research-gaps','/knowledge-graph#gaps'],['/validation','/trust#validation'],['/intelligence','/platform/agents'],['/scientific-companion','/platform/companion'],['/context-conflict-audit','/platform/contradiction-analysis'],['/landing-v2/platform/knowledge-graph','/knowledge-graph'],['/landing-v2/platform/companion','/platform/companion']] as const){
 test(`${from} leads to ${to}`,async({page})=>{
  await page.goto(from);
  await expect(page).toHaveURL(new RegExp(to.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
 });
}
