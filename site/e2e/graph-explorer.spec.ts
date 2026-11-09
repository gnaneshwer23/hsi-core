import {test,expect} from '@playwright/test';
test('graph-first workspace filters, navigates neighbours and restores URL state',async({page})=>{
 await page.goto('/science/graph?node=pancreas');
 const workspace=page.getByRole('region',{name:'Knowledge graph workspace'});await expect(workspace).toBeVisible();
 await expect(page.getByRole('button',{name:'Global graph',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByLabel('Entity type',{exact:true}).selectOption('organ');await expect(page).toHaveURL(/type=organ/);
 await page.reload();await expect(page.getByLabel('Entity type',{exact:true})).toHaveValue('organ');
 await page.getByRole('button',{name:'Local graph',exact:true}).click();await page.getByLabel('Depth',{exact:true}).selectOption('2');
 await expect(page).toHaveURL(/depth=2/);
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search',exact:true}).fill('no-such-concept');await expect(page.getByRole('status').filter({hasText:'No concepts match'})).toBeVisible();
 await page.getByRole('button',{name:'Clear filters and explore',exact:true}).click();
 const inspector=page.getByRole('complementary',{name:'Concept and evidence inspector'});await inspector.locator('.kg-connections button').first().click();await expect(page).not.toHaveURL(/node=pancreas(?:&|$)/);
 await expect(inspector).toContainText('not_curated');await expect(page.getByRole('heading',{name:'Scientific knowledge graph',exact:true})).toBeVisible();
});
test('canvas supports dragging, wheel zoom and keyboard evidence inspection without losing draft scope',async({page})=>{
 await page.goto('/science/graph?node=pancreas');const svg=page.getByRole('group',{name:'Interactive graph of biological entities'}),node=svg.locator('[data-graph-node="pancreas"] circle').first();
 await node.scrollIntoViewIfNeeded();const initial=await node.getAttribute('cx'),box=(await node.boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+45,box.y+box.height/2+25,{steps:6});await page.mouse.up();
 expect(await node.getAttribute('cx')).not.toBe(initial);await expect(page).toHaveURL(/node=pancreas/);
 const zoomPct=page.locator('.kg-canvas .xp-graph-toolbar').first().getByTestId('graph-zoom-pct');
 const beforeZoom=Number((await zoomPct.textContent())?.replace('%','')??'100');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.wheel(0,-100);
 await expect.poll(async()=>Number((await zoomPct.textContent())?.replace('%','')??'0')).toBeGreaterThan(beforeZoom);
 const edge=svg.locator('[data-graph-edge]').first();await edge.focus();await page.keyboard.press('Enter');await expect(page.getByRole('region',{name:'Relationship evidence dossier'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Relationship evidence dossier'})).toContainText('Independent scientific review');
});
test('graph explorer fits narrow screens and keeps source-linked SSc graph separately navigable',async({page})=>{
 await page.setViewportSize({width:320,height:800});await page.goto('/science/graph');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByText('Systemic sclerosis · separate source-linked research dataset',{exact:true}).click();await expect(page.getByRole('heading',{name:'Systemic sclerosis · Tfh–IL-21–B-cell evidence map',exact:true})).toBeVisible();
});
