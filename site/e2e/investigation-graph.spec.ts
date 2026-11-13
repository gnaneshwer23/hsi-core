import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
const bundle = JSON.parse(
  await readFile(new URL('../public/research/domain-graph/graph.v1.json', import.meta.url), 'utf8'),
);
const title = 'Investigate a biological connection.';
async function ready(page: any, search = '') {
  const state = new URLSearchParams(search);
  if (!state.has('lens')) state.set('lens','path');
  await page.goto('/research/knowledge-graph?' + state);
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
}

test('one snapshot, question and selected assertion survive home to Science to research and reload', async ({
  page,
}) => {
  const posts: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') posts.push(r.url());
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Open this selection in the research workspace ↗', exact: true }).click();
  const graph = page.locator('.ig-experience');
  await expect(graph).toBeVisible();
  await graph.getByText("Question and filters", {exact:true}).click();
  await graph
    .getByRole('button', {
      name: 'Gut metabolites → islet autoimmunity → type 1 diabetes',
      exact: true,
    })
    .click();
  await graph.getByRole('button', {name:'Evidence path',exact:true}).click();
  await graph.locator('.ig-steps button').first().click();
  await expect(graph.getByRole('region', { name: 'Selected assertion evidence' })).toBeVisible();
  const handoff = await graph
    .getByRole('link', { name: 'Continue in Science', exact: true })
    .getAttribute('href');
  const state = new URL(handoff!, 'https://example.test').searchParams;
  expect(state.get('domainVersion')).toBe(bundle.version);
  expect(state.get('edge')).toBeTruthy();
  expect(state.get('path')).toBeTruthy();
  await graph.getByRole('link', { name: 'Continue in Science', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('edge')).toBe(state.get('edge'));
  await page.getByRole('link', { name: 'Open research workspace', exact: true }).click();
  await expect(page).toHaveURL(/\/research\/knowledge-graph\?/);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Selected assertion evidence' })).toBeVisible();
  for (const key of ['domainVersion', 'investigation', 'from', 'target', 'node', 'edge', 'path'])
    expect(new URL(page.url()).searchParams.get(key)).toBe(state.get(key));
  expect(posts).toEqual([]);
});

test('path step exposes actual source, context, missingness and exports a pinned no-approval inspection', async ({
  page,
}) => {
  await ready(page, '?token=must-not-export&unrelated=not-retained');
  await page.locator('.ig-steps button').first().click();
  const id = new URL(page.url()).searchParams.get('edge');
  const edge = bundle.edges.find((e: any) => e.id === id);
  const inspector = page.getByRole('complementary', { name: 'Investigation evidence inspector' });
  await expect(inspector).toContainText(edge.assertion);
  await expect(inspector).toContainText('Not extracted in this snapshot');
  await expect(inspector).toContainText('Unreviewed');
  await expect(inspector).toContainText('No current clearance receipt');
  const source = bundle.sources.find((s: any) => s.id === edge.sourceId);
  await expect(inspector.getByRole('link', { name: source.title, exact: true })).toHaveAttribute(
    'href',
    source.url,
  );
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export inspected evidence JSON', exact: true }).click();
  const exported = JSON.parse(await readFile((await (await event).path())!, 'utf8'));
  expect(exported.graphVersion).toBe(bundle.version);
  expect(exported.selection.token).toBeUndefined();
  expect(exported.selection.unrelated).toBeUndefined();
  expect(exported.assertions.find((e: any) => e.id === id)).toEqual(edge);
  expect(exported.scientificApproval).toBe(false);
  expect(exported.graphPromotable).toBe(false);
  expect(exported.sourceClearanceVerified).toBe(false);
  expect(exported.liveProviderExecution).toBe(false);
  expect(exported.path.edgeIds).toContain(id);
  expect(exported.handoff).toContain('domainVersion=' + bundle.version);
});

test('mismatched entity findings stay separate and comparison/export preserve exact selected assertions', async ({
  page,
}) => {
  const a = bundle.edges.find((e: any) => e.kind === 'source_candidate');
  const b = bundle.edges.find(
    (e: any) =>
      e.kind === 'source_candidate' && e.subjectId !== a.subjectId && e.objectId !== a.objectId,
  );
  await ready(page, '?' + new URLSearchParams({ compare: a.id + '|' + b.id }));
  await expect(
    page.getByRole('heading', {
      name: 'Different entity pairs: not directly comparable',
      exact: true,
    }),
  ).toBeVisible();
  const comparison = page.getByRole('region', { name: 'Compare inspected findings' });
  await expect(comparison.getByRole('table')).toContainText(a.id);
  await expect(comparison.getByRole('table')).toContainText(b.id);
  await expect(comparison).toContainText(
    'No confirmed contradiction, pooled effect, causal bridge or scientific approval',
  );
  await page.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  await expect(comparison.getByRole('table')).toHaveCount(0);
});

test('empty paths, lexical search misses and structural overlap never become scientific absence or mediation', async ({
  page,
}) => {
  await ready(page, '?investigation=gut-t2d');
  await expect(page.getByRole('status')).toContainText('No directed source-candidate path');
  await page
    .getByRole('searchbox', { name: 'Find a concept', exact: true })
    .fill('no-such-entity-in-this-snapshot');
  await expect(page.getByLabel('Concept search results')).toContainText(
    'not evidence of scientific absence',
  );
  await page.getByRole('button', { name: 'Shared connections', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Shared structural connections' })).toContainText(
    'not evidence that a biological effect is mediated',
  );
});

test('unmatched snapshot, path, entity, comparison and model parameters reject without substitution', async ({
  page,
}) => {
  for (const search of [
    '?node=missing',
    '?path=forged',
    '?model=not-a-model',
    '?compare=forged|other',
    '?hops=100',
  ]) {
    await page.goto('/science/graph' + search);
    await expect(page.getByRole('alert')).toContainText('does not match');
    await expect(page.locator('.ig-steps')).toHaveCount(0);
  }
  await page.goto('/science/graph?domainVersion=invalid');
  await expect(page.getByRole('alert')).toContainText('could not be verified');
  await expect(page.locator('.ig-steps')).toHaveCount(0);
  await page.goto('/science/graph?domainVersion=invalid&dataset=educational&node=pancreas');
  await expect(page.getByRole('alert')).toContainText('could not be verified');
  await expect(page.locator('.kg-honesty-banner')).toHaveCount(0);
});

test('tampered snapshot cannot present reviewed relationships or fall back to educational data', async ({
  page,
}) => {
  await page.route('**/api/research/graph-snapshot?*', (r) =>
    r.fulfill({ json: { ...bundle, scientificApproval: true } }),
  );
  await page.goto('/science/graph');
  await expect(page.getByRole('alert')).toContainText('could not be verified');
  await expect(page.getByRole('group', { name: 'Selected evidence path' })).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Living health knowledge graph', exact: true }),
  ).toHaveCount(0);
});

test('all three views preserve mobile/desktop accessibility, keyboard path inspection and responsive screenshots', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    if (width < 701) {
      await page.getByText('Question and filters', { exact: true }).click();
      await expect(page.getByLabel('Starting concept', { exact: true })).toBeVisible();
      await page.getByText('Question and filters', { exact: true }).click();
    }
    for (const lens of ['Network explorer', 'Evidence path', 'Neighbourhood', 'Shared connections']) {
      await page.getByRole('button', { name: lens, exact: true }).click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
        })),
      ).toEqual([]);
      await page.evaluate(() => {
        (document.activeElement as HTMLElement)?.blur();
        window.scrollTo(0, 0);
      });
      if (width !== 320)
        await page.screenshot({
          path: info.outputPath(
            'investigation-' + lens.toLowerCase().replaceAll(' ', '-') + '-' + width + '.png',
          ),
          fullPage: true,
        });
    }
  }
  await page.getByRole('button', { name: 'Evidence path', exact: true }).click();
  const step = page
    .getByRole('group', { name: 'Selected evidence path' })
    .getByRole('button', { name: /^Inspect path step 1:/ });
  await step.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Selected assertion evidence' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('legacy educational bookmarks and advanced domain tools remain explicitly accessible', async ({
  page,
}) => {
  await page.goto('/science/graph?node=pancreas');
  await expect(
    page.getByRole('heading', { name: 'Living health knowledge graph', exact: true }),
  ).toBeVisible();
  await page.goto('/research/knowledge-graph?scope=all&condition=Type+2+diabetes');
  await expect(
    page.getByRole('heading', { name: 'Connected research network', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Disease context', { exact: true })).toHaveValue('Type 2 diabetes');
  await page.goto('/science/graph?dataset=educational');
  await expect(page.locator('.kg-honesty-banner')).toContainText('educational topic map');
  await ready(page);
  await page.getByRole('link', { name: 'Open advanced domain tools', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Connected research network', exact: true }),
  ).toBeVisible();
});
