import {useId, useState} from "react";
import {Link} from "react-router-dom";
import {INVESTIGATION_SECTIONS} from "../lib/investigationSections";
import {
  DATA_TO_DISCOVERY_LAYERS,
  DATA_TO_DISCOVERY_NODES,
  DATA_TO_DISCOVERY_STATUS_LABEL,
  WORKBENCH_PUBLIC_LINKS,
  countByStatus,
  nodesForLayer,
  workbenchHref,
  type DataToDiscoveryLayer,
  type DataToDiscoveryNode,
  type DataToDiscoveryStatus,
} from "../lib/dataToDiscoveryArchitecture";
import "./DataToDiscoveryArchitecture.css";

function statusClass(status: DataToDiscoveryStatus): string {
  switch (status) {
    case "integrated":
      return "d2d-status d2d-status-integrated";
    case "partially_implemented":
      return "d2d-status d2d-status-partial";
    case "fixture_only":
      return "d2d-status d2d-status-seed";
    case "blocked":
      return "d2d-status d2d-status-blocked";
    case "missing":
      return "d2d-status d2d-status-missing";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function ArchitectureDiagram({
  selectedLayerId,
  selectedNodeId,
  titleId,
}: {
  selectedLayerId: DataToDiscoveryLayer["id"];
  selectedNodeId: string | null;
  titleId: string;
}) {
  const nodes = nodesForLayer(selectedLayerId);
  const layerIndex = DATA_TO_DISCOVERY_LAYERS.findIndex((layer) => layer.id === selectedLayerId);
  const width = 640;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 96;

  return (
    <div className="d2d-diagram" aria-labelledby={titleId}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Architecture layer connection diagram">
        <defs>
          <radialGradient id="d2d-glow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#3dd6f533" />
            <stop offset="55%" stopColor="#8b7cff22" />
            <stop offset="100%" stopColor="#0b1c3d00" />
          </radialGradient>
          <linearGradient id="d2d-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3dd6f5" />
            <stop offset="100%" stopColor="#8b7cff" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} rx="18" fill="#0b1c3d" />
        <circle cx={cx} cy={cy} r="120" fill="url(#d2d-glow)" />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="url(#d2d-ring)" strokeWidth="1.5" opacity="0.7" />
        <circle cx={cx} cy={cy} r="46" fill="#122a56" stroke="#3dd6f566" strokeWidth="1.25" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="d2d-svg-center">
          HSI
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="d2d-svg-center-sub">
          LAYER {String(layerIndex + 1).padStart(2, "0")}
        </text>
        {nodes.map((node, index) => {
          const angle = ((index / Math.max(nodes.length, 1)) * 2 * Math.PI) - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const active = selectedNodeId === node.id;
          return (
            <g key={node.id} className={active ? "d2d-svg-node active" : "d2d-svg-node"}>
              <line x1={cx} y1={cy} x2={x} y2={y} className="d2d-svg-link" />
              <circle
                cx={x}
                cy={y}
                r={active ? 18 : 14}
                className={`d2d-svg-point d2d-svg-point-${node.status}`}
              />
              <text x={x} y={y + 32} textAnchor="middle" className="d2d-svg-label">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="d2d-diagram-caption">
        Contained navy / cyan / violet diagram · statuses describe eng wiring, not scientific validity
      </p>
    </div>
  );
}

function NodeDetail({node}: {node: DataToDiscoveryNode}) {
  const section = node.workbenchSectionId
    ? INVESTIGATION_SECTIONS.find((item) => item.id === node.workbenchSectionId)
    : undefined;
  const publicLink = node.workbenchSectionId
    ? WORKBENCH_PUBLIC_LINKS.find((item) => item.id === node.workbenchSectionId)
    : undefined;
  return (
    <article className="d2d-detail" aria-live="polite">
      <div className="d2d-detail-top">
        <span className={statusClass(node.status)}>{DATA_TO_DISCOVERY_STATUS_LABEL[node.status]}</span>
        <span className="d2d-detail-layer">{node.layer.replaceAll("_", " ")}</span>
      </div>
      <h3>{node.label}</h3>
      <p>{node.detail}</p>
      <p className="d2d-evidence">
        <span>Evidence path</span>
        <code>{node.evidence}</code>
      </p>
      <div className="d2d-detail-links">
        {section && publicLink ? (
          <Link className="d2d-link" to={publicLink.href}>
            Related workbench surface {section.id} · {section.short} <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
        {node.route ? (
          <Link className="d2d-link d2d-link-secondary" to={node.route}>
            Related surface <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
        <Link className="d2d-link d2d-link-secondary" to={workbenchHref()}>
          Decision workbench <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

export function DataToDiscoveryArchitecture() {
  const titleId = useId();
  const layerSelectId = useId();
  const nodeSelectId = useId();
  const [layerId, setLayerId] = useState<DataToDiscoveryLayer["id"]>("sources");
  const layerNodes = nodesForLayer(layerId);
  const [nodeId, setNodeId] = useState<string>(layerNodes[0]?.id ?? DATA_TO_DISCOVERY_NODES[0].id);
  const selectedLayer = DATA_TO_DISCOVERY_LAYERS.find((layer) => layer.id === layerId)!;
  const selectedNode =
    DATA_TO_DISCOVERY_NODES.find((node) => node.id === nodeId && node.layer === layerId) ??
    layerNodes[0] ??
    DATA_TO_DISCOVERY_NODES[0];
  const counts = countByStatus();

  const selectLayer = (id: DataToDiscoveryLayer["id"]) => {
    setLayerId(id);
    const next = nodesForLayer(id)[0];
    if (next) setNodeId(next.id);
  };

  return (
    <div className="d2d">
      <div className="d2d-heading">
        <p className="d2d-eyebrow">DATA-TO-DISCOVERY · LIVE CONNECTION STATUS</p>
        <h2 id={titleId}>
          Architecture with <em>honest wiring.</em>
        </h2>
        <p>
          Select a layer to inspect what is integrated, partially implemented, seed-pack only, blocked, or not connected.
          Missing biology adapters (UniProt, Reactome, GO, ChEMBL, HGNC, HCA/CELLxGENE, omics) stay explicitly
          labelled — this is not a claim of end-to-end live discovery.
        </p>
      </div>

      <div className="d2d-legend" aria-label="Status legend">
        {(Object.keys(DATA_TO_DISCOVERY_STATUS_LABEL) as DataToDiscoveryStatus[]).map((status) => (
          <span key={status} className={statusClass(status)}>
            {DATA_TO_DISCOVERY_STATUS_LABEL[status]}
            <strong>{counts[status]}</strong>
          </span>
        ))}
      </div>

      <div className="d2d-layout">
        <div className="d2d-controls">
          <label className="d2d-select-label" htmlFor={layerSelectId}>
            Architecture layer
            <select
              id={layerSelectId}
              className="d2d-select"
              value={layerId}
              onChange={(event) => selectLayer(event.target.value as DataToDiscoveryLayer["id"])}
            >
              {DATA_TO_DISCOVERY_LAYERS.map((layer, index) => (
                <option key={layer.id} value={layer.id}>
                  {String(index + 1).padStart(2, "0")} · {layer.title} · {DATA_TO_DISCOVERY_STATUS_LABEL[layer.status]}
                </option>
              ))}
            </select>
          </label>
          <ol className="d2d-rail-summary" aria-label="Layer status overview">
            {DATA_TO_DISCOVERY_LAYERS.map((layer, index) => (
              <li key={layer.id} className={layer.id === layerId ? "active" : undefined}>
                <span className="d2d-rail-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="d2d-rail-copy">
                  <strong>{layer.title}</strong>
                  <small>{layer.subtitle}</small>
                </span>
                <span className={statusClass(layer.status)}>{DATA_TO_DISCOVERY_STATUS_LABEL[layer.status]}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="d2d-panel" id={`d2d-panel-${layerId}`}>
          <div className="d2d-panel-head">
            <div>
              <p className="d2d-eyebrow">{selectedLayer.subtitle}</p>
              <h3>{selectedLayer.title}</h3>
            </div>
            <span className={statusClass(selectedLayer.status)}>
              {DATA_TO_DISCOVERY_STATUS_LABEL[selectedLayer.status]}
            </span>
          </div>
          <p className="d2d-panel-summary">{selectedLayer.summary}</p>
          <ArchitectureDiagram
            selectedLayerId={layerId}
            selectedNodeId={selectedNode.id}
            titleId={titleId}
          />
          <label className="d2d-select-label" htmlFor={nodeSelectId}>
            Component in this layer
            <select
              id={nodeSelectId}
              className="d2d-select"
              value={selectedNode.id}
              onChange={(event) => setNodeId(event.target.value)}
            >
              {layerNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label} · {DATA_TO_DISCOVERY_STATUS_LABEL[node.status]}
                </option>
              ))}
            </select>
          </label>
          <NodeDetail node={selectedNode} />
        </div>
      </div>

      <div className="d2d-workbench" aria-label="Research workbench sections 01 to 06">
        <p className="d2d-eyebrow">RESEARCH WORKBENCH · SECTIONS 01–06</p>
        <p className="d2d-workbench-note">
          Public routes map each investigation section to an existing science surface. Signed-in decision-workbench
          section anchors remain behind researcher access and are not claimed as public landing targets.
        </p>
        <div className="d2d-workbench-links">
          {WORKBENCH_PUBLIC_LINKS.map((link) => {
            const section = INVESTIGATION_SECTIONS.find((item) => item.id === link.id)!;
            return (
              <Link key={link.id} className="d2d-workbench-link" to={link.href}>
                <span>{section.id}</span>
                <strong>{section.short}</strong>
                <small>{section.title}</small>
              </Link>
            );
          })}
        </div>
        <p className="d2d-workbench-cta">
          <Link className="d2d-link" to={workbenchHref()}>
            Open decision workbench <span aria-hidden="true">↗</span>
          </Link>
        </p>
      </div>

      <p className="d2d-disclaimer">
        Eng connection map only. Human queue #2 rights, #4 SME gold and #5 live authenticated journey remain
        PARKED. CI green is not scientific validity. No Gate C auto-approve, MoU invention, live CDS/PHI or
        fabricated SSc Tfh/IL-21 live E2E success.
      </p>
    </div>
  );
}
