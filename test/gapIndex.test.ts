import { describe, expect, test } from 'bun:test';
import { buildGapIndex } from '../src/knowledgeGraph/gapIndex';
import type { DomainBundle } from '../src/knowledgeGraph/domainGraph';

const nodes = [
  { id: 'gene:1', name: 'Gene 1', kind: 'gene', aliases: [], domains: ['genomics'] },
  { id: 'pathway:2', name: 'Pathway 2', kind: 'pathway', aliases: [], domains: ['metabolism'] },
];
const gap = { id: 'gap:1', subjectId: 'gene:1', objectId: 'pathway:2',
  question: 'What is missing?', missing: 'Human context', nextStudy: 'Measure in a human cohort',
  domains: ['genomics', 'metabolism'], conditions: [] };
const base = { nodes, edges: [], sources: [], gaps: [gap] } as unknown as Pick<DomainBundle,'nodes'|'edges'|'sources'|'gaps'>;

describe('candidate graph gap index', () => {
  test('indexes disconnected gaps without claiming a scientific conclusion', () => {
    const [item] = buildGapIndex(base);
    expect(item.id).toBe('gap:1');
    expect(item.sourceIds).toEqual([]);
    expect(item.supportingCandidateEdgeIds).toEqual([]);
    expect(item.priorityScore).toBeGreaterThan(0);
    expect(item.scientificClaimAllowed).toBe(false);
    expect(item.clinicalDecisionAllowed).toBe(false);
    expect(item.status).toBe('research_gap_unreviewed');
  });
  test('does not mutate the input', () => {
    const original = JSON.stringify(base);
    buildGapIndex(base);
    expect(JSON.stringify(base)).toBe(original);
  });
  test('rejects dangling gap references', () => {
    expect(() => buildGapIndex({ ...base, gaps: [{ ...gap, objectId: 'missing' }] })).toThrow();
  });
  test('rejects duplicate entity identifiers', () => {
    expect(() => buildGapIndex({ ...base, nodes: [nodes[0], nodes[0]] })).toThrow();
  });
  test('sorts ties by stable gap id', () => {
    const items = buildGapIndex({ ...base, gaps: [{ ...gap, id: 'gap:z' }, { ...gap, id: 'gap:a' }] });
    expect(items.map(x => x.id)).toEqual(['gap:a','gap:z']);
  });
});
