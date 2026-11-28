import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('network canvas: filters narrow it, display controls and group legend work, keyboard pans, axe clean',async({page})=>{
 await page.goto('/research/knowledge-graph?netScope=global');
 const network=page.getByRole('region',{name:'Research network explorer',exact:true});await expect(network).toBeVisible();
 await expect(network.locator('canvas')).toBeVisible();
 const header=network.locator('.rn-network>header');await expect(header).toContainText('of 179 concepts');
 await network.getByRole('button',{name:/^Filters/}).click();
 await network.getByRole('button',{name:/^disease \d+/}).click();
 await expect(page).toHaveURL(/netKind=disease/);
 await expect(network.getByRole('button',{name:/^Filters \(/})).toBeVisible();
 await network.getByRole('button',{name:'Reset',exact:true}).click();
 await expect(page).not.toHaveURL(/netKind=/);
 await network.getByRole('button',{name:'Display',exact:true}).click();
 await network.getByLabel('Colour concepts by').selectOption('model');
 await expect(network.getByRole('list',{name:/^Groups/}).getByRole('button').first()).toBeVisible();
 const first=network.getByRole('list',{name:/^Groups/}).getByRole('button').first();
 await first.click();await expect(first).toHaveAttribute('aria-pressed','false');
 await network.getByRole('button',{name:'Restore defaults'}).click();
 const canvas=network.getByRole('group',{name:'Interactive graph of biological entities',exact:true});
 await canvas.focus();await canvas.press('ArrowRight');
 await expect(network.getByRole('status').filter({hasText:'View offset'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.rn-network').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.map(n=>n.html.slice(0,110)+' '+JSON.stringify((n.any[0]?.data as any)?.fgColor)+JSON.stringify((n.any[0]?.data as any)?.bgColor)).join(' | '))).toEqual([]);
});
