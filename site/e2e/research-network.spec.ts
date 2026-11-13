import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
const bundle = JSON.parse(
  await readFile(new URL('../public/research/domain-graph/graph.v1.json', import.meta.url), 'utf8'),
);
async function ready(page: any, query = '') {
  await page.goto('/research/knowledge-graph' + query);
  await expect(
    page.getByRole('region', { name: 'Research network explorer', exact: true }),
  ).toBeVisible();
  return page.getByRole('region', { name: 'Research network explorer', exact: true });
}
test('global/local exploration, connection navigation and back/forward retain exact node identity', async ({
  page,
}) => {
  const network = await ready(page);
  const origin =
    new URL(page.url()).searchParams.get('node') ??
    bundle.questions.find((q: any) => q.id === 'gut-immune').fromId;
  await network.getByRole('button', { name: 'Focus local graph', exact: true }).click();
  await expect(network.getByLabel('Local depth')).toHaveValue('1');
  const link = network.locator('.rn-link button').first();
  await expect(link).toBeVisible();
  const destination = await link.textContent();
  await link.click();
  await expect(network.locator('.rn-navigation')).toContainText(destination!);
  const selected = new URL(page.url()).searchParams.get('node');
  expect(selected).not.toBe(origin);
  await network.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('node=' + encodeURIComponent(origin)));
  await network.getByRole('button', { name: 'Forward', exact: true }).click();
  expect(new URL(page.url()).searchParams.get('node')).toBe(selected);
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Research network explorer', exact: true }),
  ).toContainText(destination!);
});
test('facets, empty states and handoff preserve pinned snapshot without adding approval', async ({
  page,
}) => {
  const network = await ready(page);
  await network.getByLabel('Finding direction').selectOption('negative');
  await network.getByRole('button', { name: 'Show relationship list', exact: true }).click();
  const rows = network.getByRole('list', { name: 'Visible network relationships' });
  await expect(rows).toContainText('Negative finding');
  expect(await rows.locator('li').count()).toBe(
    bundle.edges.filter((e: any) => e.kind === 'source_candidate' && e.negated).length,
  );
  await network.getByRole('searchbox', { name: 'Search network' }).fill('nonexistent-in-snapshot');
  await expect(network).toContainText('not evidence of biological absence');
  await network.getByRole('button', { name: 'Reset network filters', exact: true }).first().click();
  await network.getByLabel('Entity type', { exact: true }).selectOption('cell');
  await page.getByRole('link', { name: 'Continue in Science', exact: true }).click();
  await expect(page).toHaveURL(/domainVersion=/);
  await expect(page.getByLabel('Entity type', { exact: true })).toHaveValue('cell');
  await page.reload();
  await expect(page.getByLabel('Entity type', { exact: true })).toHaveValue('cell');
  await expect(
    page.getByText('0 independently approved relationships.', { exact: false }),
  ).toHaveCount(1);
});
test('invalid filters fail closed and relationship inspection keeps original source/context', async ({
  page,
}) => {
  let network = await ready(page, '?netKind=forged');
  await expect(network.getByRole('alert')).toContainText('does not match');
  await expect(network.locator('svg')).toHaveCount(0);
  await network.getByRole('button', { name: 'Reset network filters', exact: true }).first().click();
  await network.getByRole('button', { name: 'Show relationship list', exact: true }).click();
  await network.locator('.rn-edge-list button').first().click();
  const edge = bundle.edges.find((e: any) => e.id === new URL(page.url()).searchParams.get('edge'));
  const inspector = page.getByRole('complementary', { name: 'Investigation evidence inspector' });
  await expect(inspector).toContainText(edge.assertion);
  await expect(inspector).toContainText('No current clearance receipt');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export inspected evidence JSON', exact: true }).click();
  const out = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(out.assertions).toContainEqual(edge);
  expect(out.scientificApproval).toBe(false);
  expect(out.graphPromotable).toBe(false);
});
test('network is keyboard accessible and fits mobile and desktop', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const network = await ready(page);
    await network.getByRole('button', { name: 'Show relationship list', exact: true }).click();
    await network.locator('.rn-edge-list button').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('region', { name: 'Selected assertion evidence' })).toBeVisible();
    await network.getByRole('button', { name: 'Show graph', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    const a = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(a.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
      [],
    );
    await network.screenshot({ path: info.outputPath('research-network-' + width + '.png') });
  }
  expect(errors).toEqual([]);
});
