import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  compareDomainEvidence,
  DOMAIN_MODELS,
  type DomainBundle,
  type DomainEdge,
  type DomainPath,
} from '../../../src/knowledgeGraph/domainGraph';
import {
  investigationHandoff,
  investigationNeighbourhood,
  investigationPathKey,
  investigationPaths,
  sharedInvestigationConnections,
} from '../../../src/knowledgeGraph/investigationProjection';
import { loadDomainGraph } from '../lib/claimGraphClient';
import { GraphVisual, type CanvasGraph } from '../features/science/GraphVisual';
import '../styles/investigation-graph.css';
import {ResearchNetworkExplorer} from './ResearchNetworkExplorer';

const pretty = (value: string) => value.replaceAll('_', ' ');
const models: Record<string, string> = {
  human_in_vivo: 'Human participants',
  human_ex_vivo: 'Human cells / ex vivo',
  human_cell_line: 'Human cell line',
  mouse: 'Mouse',
  rodent: 'Rodent',
  mixed: 'Mixed models',
  unspecified: 'Not extracted',
};
const missing = (value: string | null) => value || 'Not extracted';
function save(value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hsi-inspected-investigation.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PathDiagram({
  bundle,
  path,
  selected,
  onNode,
  onEdge,
}: {
  bundle: DomainBundle;
  path: DomainPath;
  selected: string;
  onNode: (id: string) => void;
  onEdge: (id: string) => void;
}) {
  const name = (id: string) => bundle.nodes.find((n) => n.id === id)!.name;
  const width = Math.max(700, path.nodeIds.length * 180);
  return (
    <div
      className="ig-path-scroll"
      tabIndex={0}
      aria-label="Selected directed path diagram; full text follows below"
    >
      <svg
        viewBox={`0 0 ${width} 220`}
        style={{ minWidth: Math.min(width, 900) }}
        role="group"
        aria-label="Selected evidence path"
      >
        {path.edgeIds.map((id, i) => {
          const e = bundle.edges.find((e) => e.id === id)!;
          const x = 90 + (i * (width - 180)) / (path.nodeIds.length - 1),
            next = 90 + ((i + 1) * (width - 180)) / (path.nodeIds.length - 1);
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={'Inspect path step ' + (i + 1) + ': ' + pretty(e.predicate)}
              onClick={() => onEdge(id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onEdge(id);
                }
              }}
            >
              <path
                d={`M${x + 20} 88 H${next - 24} l-7 -5 m7 5 l-7 5`}
                fill="none"
                stroke={e.negated ? '#f0b7a2' : '#9ed2c8'}
                strokeWidth="2"
                strokeDasharray={e.negated ? '5 4' : undefined}
              />
              <path
                d={`M${x + 20} 88 H${next - 24}`}
                fill="none"
                stroke="transparent"
                strokeWidth="28"
              />
              <text x={(x + next) / 2} y="65" textAnchor="middle">
                Step {i + 1}
                {e.negated ? ' · negative' : ''}
              </text>
              <title>
                {pretty(e.predicate)} · {models[e.model]} · {id}
              </title>
            </g>
          );
        })}
        {path.nodeIds.map((id, i) => {
          const x = 90 + (i * (width - 180)) / (path.nodeIds.length - 1),
            node = bundle.nodes.find((n) => n.id === id)!;
          const words = name(id).split(' ');
          const lines: string[] = [];
          let line = '';
          for (const word of words) {
            if ((line + ' ' + word).length > 22 && line) {
              lines.push(line);
              line = word;
            } else line = line ? line + ' ' + word : word;
          }
          if (line) lines.push(line);
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-pressed={selected === id}
              aria-label={'Inspect concept ' + name(id)}
              onClick={() => onNode(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNode(id);
                }
              }}
            >
              <circle
                cx={x}
                cy="88"
                r={selected === id ? 19 : 13}
                fill={selected === id ? '#b5d8ce' : '#2e6268'}
                stroke="#c1ded6"
                strokeWidth="2"
              />
              {lines.slice(0, 3).map((text, j) => (
                <text key={j} x={x} y={125 + j * 17} textAnchor="middle">
                  {text}
                  {j === 2 && lines.length > 3 ? '…' : ''}
                </text>
              ))}
              <text className="ig-node-kind" x={x} y="198" textAnchor="middle">
                {pretty(node.kind)}
              </text>
              <title>
                {name(id)} · {id}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Shared read-only view. URL state and snapshot identity survive public/research handoffs. */
export function InvestigationGraphExperience({ embedded = false }: { embedded?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [controlsOpen, setControlsOpen] = useState(false);
  useEffect(() => {
    setControlsOpen(params.get('lens') === 'path' && window.matchMedia('(min-width: 701px)').matches);
  }, []);
  const version = params.get('domainVersion');
  const [bundle, setBundle] = useState<DomainBundle | null>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(''),
    [allNeighbours, setAllNeighbours] = useState(false),
    [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 12000);
    setBundle(null);
    setError('');
    loadDomainGraph(version, controller.signal)
      .then((g) => {
        if (active) setBundle(g);
      })
      .catch(() => {
        if (active)
          setError(
            'The research snapshot could not be verified. No substitute graph or evidence is displayed.',
          );
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [version, retry]);
  const questionId = params.get('investigation') ?? 'gut-immune';
  const question = bundle?.questions.find((q) => q.id === questionId);
  const from = params.get('from') ?? question?.fromId ?? '',
    target = params.get('target') ?? question?.toId ?? '';
  const model = params.get('model') ?? '',
    hops = params.has('hops') ? Number(params.get('hops')) : 4;
  const depth = params.has('depth') ? Number(params.get('depth')) : 1;
  const lens = params.get('lens') ?? 'network';
  const selectionValid =
    !!bundle &&
    !!question &&
    bundle.nodes.some((n) => n.id === from) &&
    bundle.nodes.some((n) => n.id === target) &&
    (!model || (DOMAIN_MODELS as readonly string[]).includes(model)) &&
    [1, 2, 3, 4, 5, 6].includes(hops) &&
    [1, 2].includes(depth) &&
    ['network', 'path', 'neighbourhood', 'shared'].includes(lens);
  const paths = useMemo(
    () => (selectionValid ? investigationPaths(bundle!, from, target, model, hops) : []),
    [bundle, selectionValid, from, target, model, hops],
  );
  const requestedPath = params.get('path');
  const path = requestedPath
    ? paths.find((p) => investigationPathKey(p) === requestedPath)
    : paths[0];
  const selectedId = params.get('node') ?? from;
  const selected = bundle?.nodes.find((n) => n.id === selectedId);
  const neighbourhood = useMemo(
    () =>
      selectionValid && selected
        ? investigationNeighbourhood(bundle!, selected.id, model, depth)
        : { nodes: [], edges: [] },
    [bundle, selectionValid, selected, model, depth],
  );
  const shared = useMemo(
    () => (selectionValid ? sharedInvestigationConnections(bundle!, from, target, model) : []),
    [bundle, selectionValid, from, target, model],
  );
  const initialEdge = !params.has('node') && lens === 'path' ? path?.edgeIds[0] : null;
  const edge = bundle?.edges.find((e) => e.id === (params.get('edge') ?? initialEdge));
  const source = bundle?.sources.find((s) => s.id === edge?.sourceId);
  const comparisonIds = (params.get('compare') ?? '').split('|').filter(Boolean);
  const comparison =
    bundle && comparisonIds.length === 2
      ? compareDomainEvidence(bundle, comparisonIds[0]!, comparisonIds[1]!)
      : null;
  const badComparison =
    comparisonIds.length > 2 ||
    comparisonIds.some(
      (id) =>
        !bundle?.edges.some(
          (e) => e.id === id && e.kind === 'source_candidate' && (!model || e.model === model),
        ),
    ) ||
    (comparisonIds.length === 2 && !comparison);
  const badEdge = params.has('edge') && (!edge || (model && edge.model !== model));
  const searchResults =
    bundle?.nodes
      .filter((n) =>
        [n.name, n.id, ...n.aliases].some((v) =>
          v.normalize('NFKC').toLowerCase().includes(query.normalize('NFKC').trim().toLowerCase()),
        ),
      )
      .slice(0, 8) ?? [];
  function update(values: Record<string, string>, resetPath = false) {
    setNotice('');
    setAllNeighbours(false);
    setParams((old) => {
      const next = new URLSearchParams(old);
      if (resetPath) {
        next.delete('path');
        next.delete('edge');
      }
      for (const [k, v] of Object.entries(values)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      return next;
    });
  }
  function chooseQuestion(id: string) {
    const q = bundle!.questions.find((q) => q.id === id)!;
    setQuery('');
    setParams(
      new URLSearchParams({
        domainVersion: bundle!.version,
        investigation: id,
        from: q.fromId,
        target: q.toId,
        node: q.fromId,
      }),
    );
  }
  const inspectEdge = (id: string) => {
    const e = bundle!.edges.find((e) => e.id === id)!;
    update({ edge: id, node: e.subjectId });
  };
  const compareEdge = (id: string) =>
    update({ compare: [...comparisonIds.filter((x) => x !== id).slice(-1), id].join('|') });
  const edgeLabel = (e: DomainEdge) =>
    `${bundle!.nodes.find((n) => n.id === e.subjectId)!.name} → ${pretty(e.predicate)} → ${bundle!.nodes.find((n) => n.id === e.objectId)!.name}`;
  if (error)
    return (
      <section className="ig-experience ig-unavailable">
        <h2>Research graph unavailable</h2>
        <p role="alert">{error}</p>
        <button onClick={() => setRetry((n) => n + 1)}>Retry research snapshot</button>
        <Link to="/science/graph?dataset=educational">Open the separate educational topic map</Link>
      </section>
    );
  if (!bundle)
    return (
      <section className="ig-experience ig-loading" aria-busy="true">
        <h2>Opening the investigation graph</h2>
        <p role="status">
          Verifying the versioned candidate snapshot before displaying any relationships…
        </p>
      </section>
    );
  if (!selectionValid || !selected || badEdge || badComparison || (requestedPath && !path))
    return (
      <section className="ig-experience ig-unavailable">
        <h2>Investigation selection unavailable</h2>
        <p role="alert">
          This question, concept, relationship, comparison, filter or path does not match the
          selected snapshot and scope. No name-based substitution is made.
        </p>
        <button onClick={() => setParams(new URLSearchParams({ domainVersion: bundle.version }))}>
          Reset selection within this snapshot
        </button>
      </section>
    );
  const pin = new URL(
    investigationHandoff('/research/knowledge-graph', params, bundle.version),
    'https://example.invalid',
  ).searchParams;
  for (const [k, v] of Object.entries({
    investigation: question!.id,
    from,
    target,
    node: selectedId,
    lens,
  }))
    pin.set(k, v);
  if (path && lens === 'path') pin.set('path', investigationPathKey(path));
  if (edge) pin.set('edge', edge.id);
  const related = neighbourhood.edges.filter(
    (e) => e.subjectId === selected.id || e.objectId === selected.id,
  );
  const canvas: CanvasGraph = {
    version: bundle.version,
    generatedFrom: 'Verified research candidate snapshot',
    reviewed: false,
    nodes: neighbourhood.nodes.map((n) => ({
      id: n.id,
      label: n.name,
      kind: n.kind,
      system: n.domains[0],
      description: n.aliases.join(', '),
      reviewState: 'draft',
      sourceRefs: [],
    })),
    edges: neighbourhood.edges.map((e) => ({
      id: e.id,
      subjectId: e.subjectId,
      objectId: e.objectId,
      predicate: e.predicate,
      assertionType: e.kind,
      evidenceRefs: e.sourceId ? [e.sourceId] : [],
      reviewState: 'draft',
    })),
  };
  const Heading = embedded ? 'h3' : 'h1';
  return (
    <section
      className={'ig-experience' + (embedded ? ' ig-embedded' : '')}
      aria-label="Versioned investigation graph"
    >
      <header className="ig-heading">
        <div>
          <p className="ig-eyebrow">Living Health Knowledge Graph / research candidates</p>
          <Heading>Investigate a biological connection.</Heading>
          <p>
            Explore the network. Focus a concept or follow a directed path. Inspect what each study actually
            contributes—and where the connection stops.
          </p>
        </div>
        <details className="ig-snapshot">
          <summary>Snapshot and evidence scope</summary>
          <p>
            {bundle.nodes.length} concepts · {bundle.edges.length} relationships ·{' '}
            {bundle.sources.length} source records.
          </p>
          <p>
            0 independently approved relationships. Candidate mapping, not a live evidence feed or
            model-generated answer.
          </p>
          <code>{bundle.version}</code>
          <p>
            Source identity, rights and review remain unresolved where recorded. Graph structure and
            proximity do not establish causality.
          </p>
        </details>
      </header>
      <nav className="ig-handoff" aria-label="Continue this investigation">
        <Link to={investigationHandoff('/science/graph', pin, bundle.version)}>
          Continue in Science
        </Link>
        <Link to={investigationHandoff('/research/knowledge-graph', pin, bundle.version)}>
          Open research workspace
        </Link>
        <Link to="/science/graph?dataset=educational">Educational topic map</Link>
        <Link to="/research/knowledge-graph?dataset=source-corpus">RA/SSc source corpus</Link>
      </nav>
      <p className="ig-note">
        Science and research workspace links preserve this snapshot and selection. The educational
        map and RA/SSc corpus are separate datasets, not additional evidence for this path.
      </p>
      <div className={"ig-workspace" + (lens === "network" ? " ig-network-mode" : "")}>
        <aside className="ig-rail" aria-label="Investigation selection">
          <details
            className="ig-controls"
            open={controlsOpen}
            onToggle={(e) => setControlsOpen(e.currentTarget.open)}
          >
            <summary>Question and filters</summary>

            <h2>Choose the question</h2>
            <div className="ig-questions">
              {bundle.questions.map((q) => (
                <button
                  key={q.id}
                  aria-pressed={questionId === q.id}
                  onClick={() => chooseQuestion(q.id)}
                >
                  {q.title}
                </button>
              ))}
            </div>
            <label>
              Find a concept
              <input
                type="search"
                maxLength={200}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, alias or identifier"
              />
            </label>
            {query && (
              <div className="ig-search-results" aria-label="Concept search results">
                {searchResults.length ? (
                  searchResults.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        update({ from: n.id, node: n.id }, true);
                        setQuery('');
                      }}
                    >
                      {n.name}
                      <small>{pretty(n.kind)} · use as starting concept</small>
                    </button>
                  ))
                ) : (
                  <p role="status">
                    No matching concept in this snapshot. This is not evidence of scientific
                    absence.
                  </p>
                )}
              </div>
            )}
            <label>
              Starting concept
              <select
                aria-label="Starting concept"
                value={from}
                onChange={(e) => update({ from: e.target.value, node: e.target.value }, true)}
              >
                {bundle.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Destination concept
              <select value={target} onChange={(e) => update({ target: e.target.value }, true)}>
                {bundle.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Study model filter
              <select
                value={model}
                onChange={(e) => update({ model: e.target.value, compare: '' }, true)}
              >
                <option value="">All represented models</option>
                {DOMAIN_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {models[m]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Maximum path steps
              <select value={hops} onChange={(e) => update({ hops: e.target.value }, true)}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <p>
              Paths follow outgoing source-candidate assertions only. Gaps and study-membership
              links cannot complete a mechanism.
            </p>
            <Link
              to={
                '/research/knowledge-graph?' +
                new URLSearchParams({
                  domainVersion: bundle.version,
                  investigation: questionId,
                  node: selected.id,
                  experience: 'advanced',
                })
              }
            >
              Open advanced domain tools
            </Link>
          </details>
        </aside>
        <div className="ig-stage">
          <div className="ig-lenses" role="group" aria-label="Investigation graph view">
            {[
              ['network', 'Network explorer'],
              ['path', 'Evidence path'],
              ['neighbourhood', 'Neighbourhood'],
              ['shared', 'Shared connections'],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={lens === value}
                onClick={() => update({ lens: value! })}
              >
                {label}
              </button>
            ))}
          </div>
          {lens === 'network' && <ResearchNetworkExplorer bundle={bundle} selected={selectedId} params={params} update={update} inspectEdge={inspectEdge}/>}
          {lens === 'path' && (
            <section aria-label="Directed evidence paths">
              <h2>Examine the path, step by step.</h2>
              <p>
                At most 8 paths, {hops} steps and 2,500 search expansions. Results are bounded;
                missing paths do not establish missing literature.
              </p>
              {paths.length ? (
                <>
                  <label>
                    Candidate path
                    <select
                      value={path ? investigationPathKey(path) : ''}
                      onChange={(e) => {
                        const p = paths.find((p) => investigationPathKey(p) === e.target.value)!;
                        update({ path: e.target.value, node: p.nodeIds[0]!, edge: '' });
                      }}
                    >
                      {paths.map((p, i) => (
                        <option key={investigationPathKey(p)} value={investigationPathKey(p)}>
                          Path {i + 1} · {p.edgeIds.length} steps ·{' '}
                          {p.nodeIds
                            .map((id) => bundle.nodes.find((n) => n.id === id)!.name)
                            .join(' → ')}
                        </option>
                      ))}
                    </select>
                  </label>
                  {path && (
                    <>
                      <PathDiagram
                        bundle={bundle}
                        path={path}
                        selected={selectedId}
                        onNode={(id) => update({ node: id, edge: '' })}
                        onEdge={inspectEdge}
                      />
                      <ol className="ig-steps">
                        {path.edgeIds.map((id, i) => {
                          const e = bundle.edges.find((e) => e.id === id)!;
                          return (
                            <li key={id}>
                              <button
                                aria-pressed={edge?.id === id}
                                onClick={() => inspectEdge(id)}
                              >
                                <span className="ig-step-number">{i + 1}</span>
                                <span>
                                  {edgeLabel(e)}
                                  <small>
                                    {models[e.model]} · {e.negated ? 'Negative finding · ' : ''}
                                    unreviewed · {e.id}
                                  </small>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                      <div className="ig-warnings" aria-label="Path interpretation limits">
                        {path.warnings.map((w) => (
                          <p key={w}>{w}</p>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="ig-empty" role="status">
                  <h3>No directed source-candidate path in this bounded view.</h3>
                  <p>
                    Do not bridge this gap with a hypothesis. Inspect a neighbourhood or shared
                    connections to see which assertions are represented.
                  </p>
                </div>
              )}
            </section>
          )}
          {lens === 'neighbourhood' && (
            <section aria-label="Local research neighbourhood">
              <h2>{selected.name}: nearby assertions</h2>
              <label>
                Expansion depth
                <select value={depth} onChange={(e) => update({ depth: e.target.value })}>
                  <option value="1">One hop</option>
                  <option value="2">Two hops</option>
                </select>
              </label>
              <p>
                {neighbourhood.nodes.length} concepts · {neighbourhood.edges.length} relationships.
                Source candidates, negative findings and evidence gaps retain separate meanings.
              </p>
              <GraphVisual
                graph={canvas}
                selected={selectedId}
                onSelect={(id) => update({ node: id, edge: '' })}
                onSelectEdge={inspectEdge}
                edgeDetails={Object.fromEntries(
                  neighbourhood.edges.map((e) => [
                    e.id,
                    {
                      negated: e.negated,
                      contextual: e.kind === 'research_gap' || e.predicate === 'studied_in',
                      label:
                        pretty(e.predicate) +
                        ' · ' +
                        (e.kind === 'research_gap' ? 'Evidence gap' : models[e.model]),
                    },
                  ]),
                )}
                caption="Candidate snapshot · unreviewed · layout is not biology"
                exportMetadata={{
                  scope: 'research_candidate_neighbourhood',
                  graphVersion: bundle.version,
                }}
              />
              <p>
                Solid: source candidates. Dashed: negative findings. Dotted: gaps or study context.
                Every relationship can be inspected in the list as well as the canvas.
              </p>
              <ul className="ig-relationships">
                {neighbourhood.edges.slice(0, allNeighbours ? undefined : 12).map((e) => (
                  <li key={e.id}>
                    <button onClick={() => inspectEdge(e.id)}>
                      {edgeLabel(e)}
                      <small>
                        {e.kind === 'research_gap' ? 'Unresolved gap' : models[e.model]} ·{' '}
                        {e.negated ? 'negative finding · ' : ''}unreviewed
                      </small>
                    </button>
                  </li>
                ))}
              </ul>
              {neighbourhood.edges.length > 12 && (
                <button onClick={() => setAllNeighbours((v) => !v)}>
                  {allNeighbours
                    ? 'Show fewer relationships'
                    : 'Show all neighbourhood relationships'}
                </button>
              )}
            </section>
          )}
          {lens === 'shared' && (
            <section aria-label="Shared structural connections">
              <h2>Where do these concepts meet?</h2>
              <p>
                Shared neighbours may connect incoming or outgoing assertions. They are structural
                overlaps, not evidence that a biological effect is mediated through the shared
                concept.
              </p>
              {shared.length ? (
                shared.map((row) => (
                  <article className="ig-shared" key={row.node.id}>
                    <h3>{row.node.name}</h3>
                    {[...row.left, ...row.right].map((e) => (
                      <button key={e.id} onClick={() => inspectEdge(e.id)}>
                        {edgeLabel(e)}
                        <small>
                          {models[e.model]} · {e.id}
                        </small>
                      </button>
                    ))}
                  </article>
                ))
              ) : (
                <p role="status">
                  No shared source-candidate neighbour in this filtered snapshot. Nothing is
                  inferred about unrepresented studies.
                </p>
              )}
            </section>
          )}
          <section className="ig-comparison" aria-label="Compare inspected findings">
            <h2>Compare before concluding.</h2>
            <p>
              Select two source candidates using “Add this finding to comparison” in the inspector.
              Different entities or study systems cannot be silently pooled.
            </p>
            {comparisonIds.length > 0 && (
              <>
                <p>
                  {comparisonIds.length}/2 findings selected: {comparisonIds.join(' / ')}
                </p>
                <button onClick={() => update({ compare: '' })}>Clear comparison</button>
              </>
            )}
            {comparison && (
              <>
                <h3>
                  {comparison.sameEntityPair
                    ? 'Context comparison required'
                    : 'Different entity pairs: not directly comparable'}
                </h3>
                <div className="ig-table-scroll" tabIndex={0}>
                  <table>
                    <caption>Original context and explicit missingness</caption>
                    <thead>
                      <tr>
                        <th>Context</th>
                        <th>{comparison.left.id}</th>
                        <th>{comparison.right.id}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          'subjectId',
                          'objectId',
                          'predicate',
                          'model',
                          'design',
                          'tissue',
                          'population',
                          'assay',
                          'timepoint',
                          'intervention',
                          'outcome',
                        ] as const
                      ).map((k) => (
                        <tr key={k}>
                          <th>{pretty(k)}</th>
                          <td>{missing(comparison.left[k])}</td>
                          <td>{missing(comparison.right[k])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Missing context:{' '}
                  {comparison.missingContext.join(', ') || 'None of these recorded fields'}. Dose is
                  not recorded in this schema. No confirmed contradiction, pooled effect, causal
                  bridge or scientific approval is produced.
                </p>
                <p>
                  Cell state, phenotype/stage, sample size, controls and quantitative uncertainty
                  are not extracted as structured fields in this snapshot. Absence of a recorded
                  difference is not context equivalence.
                </p>
              </>
            )}
          </section>
        </div>
        <aside className="ig-inspector" aria-label="Investigation evidence inspector">
          <p className="ig-eyebrow">Inspect the assertion</p>
          <h2>{selected.name}</h2>
          <p>
            {pretty(selected.kind)} · {selected.domains.map(pretty).join(', ')}
          </p>
          <code>{selected.id}</code>
          <p>
            Aliases: {selected.aliases.join(', ') || 'Not recorded'}. Identifier shown is
            snapshot-local; no ontology equivalence is inferred.
          </p>
          {edge ? (
            <section aria-label="Selected assertion evidence">
              <h3>
                {edge.kind === 'research_gap'
                  ? 'Unresolved research connection'
                  : 'Source-candidate finding'}
              </h3>
              <p className="ig-assertion">{edge.assertion}</p>
              <code>{edge.id}</code>
              <p>
                {edge.negated
                  ? 'Negative finding. Do not turn it into positive support.'
                  : 'Candidate assertion; not an approved mechanism.'}
              </p>
              <dl>
                <dt>Direction and meaning</dt>
                <dd>{edgeLabel(edge)}</dd>
                <dt>Study model</dt>
                <dd>{models[edge.model]}</dd>
                <dt>Study design</dt>
                <dd>{edge.design}</dd>
                {(
                  ['tissue', 'population', 'assay', 'timepoint', 'intervention', 'outcome'] as const
                ).map((k) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{missing(edge[k])}</dd>
                  </div>
                ))}
                <dt>Dose / units</dt>
                <dd>Not extracted in this snapshot</dd>
                <dt>Cell type / state context</dt>
                <dd>
                  Not extracted as structured study context; graph entity labels do not supply it.
                </dd>
                <dt>Phenotype / disease stage</dt>
                <dd>Not extracted in this snapshot</dd>
                <dt>Sample size / cohort size</dt>
                <dd>Not extracted in this snapshot</dd>
                <dt>Controls</dt>
                <dd>Not extracted in this snapshot</dd>
                <dt>Quantitative uncertainty</dt>
                <dd>
                  Not extracted; no effect estimate, interval or calibrated confidence is inferred.
                </dd>
                <dt>Annotation basis</dt>
                <dd>{pretty(edge.contextStatus)}</dd>
                <dt>Limits</dt>
                <dd>{edge.limitations}</dd>
                <dt>Review</dt>
                <dd>Unreviewed · confidence not calibrated</dd>
              </dl>
              {edge.scopeWarnings.map((w) => (
                <p className="ig-warning" key={w}>
                  {w}
                </p>
              ))}
              {source ? (
                <section className="ig-source" aria-label="Selected source record">
                  <h3>Follow the source record</h3>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                  </a>
                  <p>
                    {source.pmid
                      ? 'PMID ' + source.pmid
                      : source.doi
                        ? 'DOI ' + source.doi
                        : 'Publication identifier not recorded'}
                  </p>
                  <code>{source.id}</code>
                  <p>
                    Identity: {pretty(source.identityStatus)}. Rights: {pretty(source.rights)}.
                    Retrieved: {source.retrievedAt ?? 'Not recorded'}.
                  </p>
                  {source.passages.map((p, i) => (
                    <p key={i}>
                      Locator: {p.locator || 'Not recorded'} ·{' '}
                      {p.text
                        ? 'Text exists in the snapshot; permission and exact claim grounding still require verification.'
                        : 'Exact passage text is not available.'}
                    </p>
                  ))}
                  <p>
                    No current clearance receipt or retraction check is established by this source
                    pointer. No external source text is fetched here.
                  </p>
                </section>
              ) : (
                <p>No supporting source is attached. This gap cannot complete an evidence path.</p>
              )}
              {edge.kind === 'source_candidate' && (
                <button onClick={() => compareEdge(edge.id)}>Add this finding to comparison</button>
              )}
            </section>
          ) : (
            <p>
              Select a path step or relationship to inspect its source, context, uncertainty and
              missing fields.
            </p>
          )}
          <details>
            <summary>Incoming and outgoing connections ({related.length})</summary>
            {related.map((e) => (
              <button key={e.id} onClick={() => inspectEdge(e.id)}>
                {e.subjectId === selectedId ? 'Outgoing: ' : 'Incoming: '}
                {edgeLabel(e)}
              </button>
            ))}
          </details>
        </aside>
      </div>
      <section className="ig-gaps" aria-label="Investigation gaps">
        <h2>What would we need to learn next?</h2>
        <p>
          Recorded gaps for the selected question template, not a fresh literature search. Changing
          endpoints does not create new gap findings.
        </p>
        {bundle.gaps
          .filter((g) => question!.gapIds.includes(g.id))
          .map((g) => (
            <article key={g.id}>
              <h3>{g.question}</h3>
              <p>{g.missing}</p>
              <p>
                <strong>Proposed next study:</strong> {g.nextStudy}
              </p>
            </article>
          ))}
      </section>
      <footer className="ig-footer">
        <button
          onClick={() => {
            const ids = new Set([
              ...(lens === 'path' ? path?.edgeIds ?? [] : []),
              ...(edge ? [edge.id] : []),
              ...comparisonIds,
            ]);
            const edges = bundle.edges.filter((e) => ids.has(e.id));
            const sourceIds = new Set(edges.flatMap((e) => (e.sourceId ? [e.sourceId] : [])));
            save({
              schemaVersion: 'hsi-inspected-investigation-1',
              graphVersion: bundle.version,
              questionTemplateId: questionId,
              selection: Object.fromEntries(pin),
              handoff: investigationHandoff('/research/knowledge-graph', pin, bundle.version),
              path: lens === 'path' ? path ?? null : null,
              assertions: edges,
              sources: bundle.sources.filter((s) => sourceIds.has(s.id)),
              gaps: bundle.gaps.filter((g) => question!.gapIds.includes(g.id)),
              sourceClearanceVerified: false,
              scientificApproval: false,
              graphPromotable: false,
              liveProviderExecution: false,
            });
            setNotice(
              'Inspection exported with snapshot identity, candidate assertions and no-approval status.',
            );
          }}
        >
          Export inspected evidence JSON
        </button>
        <Link to={investigationHandoff('/research/knowledge-graph', pin, bundle.version)}>
          Reopen this pinned investigation
        </Link>
        <p>No account save, new research run, scientific review or graph promotion occurs here.</p>
        {notice && <p role="status">{notice}</p>}
      </footer>
    </section>
  );
}
