import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('selecting a concept shows entity intelligence with gaps from the gap index; a gap opens evidence-linked detail',async({page})=>{
 await page.goto('/research/knowledge-graph?netScope=global&node='+encodeURIComponent('concept:butyrate-ec227cb'));
 const intel=page.getByRole('region',{name:'Entity intelligence'});
 await expect(intel.getByRole('heading',{name:/What the graph holds for Butyrate/})).toBeVisible();
 await expect(intel).toContainText('did not hold');
 await expect(intel).toContainText('No relationship in this snapshot is scientifically reviewed');
 await expect(intel.getByRole('article').first()).toContainText('Graph coverage gap');
 await expect(intel.getByRole('article').first()).toContainText('Unreviewed research gap');
 await expect(intel.getByRole('link',{name:'Investigate with live sources'}).last()).toHaveAttribute('href',/\/research\/dashboard\?q=/);

 const network=page.getByRole('region',{name:'Research network explorer',exact:true});
 const gaps=network.getByRole('region',{name:'Research gaps'});
 await expect(gaps.getByRole('heading',{name:/Research gaps \(9\)/})).toBeVisible();
 await gaps.getByRole('button',{name:/Does a reproducible change in human butyrate/}).click();
 await expect(gaps.getByRole('article')).toContainText('Why it ranks here');
 await expect(gaps.getByRole('article')).toContainText('judged on those');
 await expect(gaps.getByRole('article').getByRole('button',{name:'Show on the graph'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.rn-gaps').include('.ni').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.map(n=>n.html.slice(0,90)).join(' | '))).toEqual([]);
});

test('multi-select: add concepts, route highlight, expand, brief export, keyboard-reachable',async({page})=>{
 await page.goto('/research/knowledge-graph?netScope=global&node='+encodeURIComponent('concept:butyrate-ec227cb'));
 const network=page.getByRole('region',{name:'Research network explorer',exact:true});
 const tray=network.getByRole('region',{name:'Selection'});
 await expect(tray.getByRole('heading',{name:'Selection (0)'})).toBeVisible();
 await tray.getByRole('button',{name:/^Add Butyrate/}).click();
 await expect(tray.getByRole('heading',{name:'Selection (1)'})).toBeVisible();
 await network.getByRole('button',{name:'Select Systemic sclerosis'}).dispatchEvent('click');
 await tray.getByRole('button',{name:/^Add Systemic sclerosis/}).click();
 await expect(tray.getByRole('heading',{name:'Selection (2)'})).toBeVisible();
 await expect(tray.getByRole('status')).toContainText(/Route of|No route/);
 const [download]=await Promise.all([page.waitForEvent('download'),tray.getByRole('button',{name:'Export evidence-linked brief'}).click()]);
 expect(download.suggestedFilename()).toBe('hsi-research-brief.md');
 await tray.getByRole('button',{name:'Expand neighbours'}).click();
 await expect(page).toHaveURL(/netDepth=2/);
 await expect(page.locator('section.st').getByRole('button',{name:'Clear'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.st').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id)).toEqual([]);
});
