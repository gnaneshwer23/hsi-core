import {useId, useState} from "react";
import {Link} from "react-router-dom";
import {INVESTIGATION_SECTIONS} from "../lib/investigationSections";
import {
  DATA_TO_DISCOVERY_LAYERS,
  DATA_TO_DISCOVERY_NODES,
  DATA_TO_DISCOVERY_STATUS_LABEL,
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
      return "d2d-status d2d-status-fixture";
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

function LayerRail({
  layers,
  selectedId,
  onSelect,
}: {
  layers: readonly DataToDiscoveryLayer[];
  selectedId: string;
  onSelect: (id: DataToDiscoveryLayer["id"]) => void;
}) {
  return (
    <div className="d2d-rail" role="tablist" aria-label="Data-to-Discovery architecture layers">
      {layers.map((layer, index) => (
        <button
          key={layer.id}
          type="button"
          role="tab"
          id={`d2d-tab-${layer.id}`}
          aria-selected={selectedId === layer.id}
          aria-controls={`d2d-panel-${layer.id}`}
          className={selectedId === layer.id ? "d2d-rail-item active" : "d2d-rail-item"}
          onClick={() => onSelect(layer.id)}
        >
          <span className="d2d-rail-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="d2d-rail-copy">
            <strong>{layer.title}</strong>
            <small>{layer.subtitle}</small>
          </span>
          <span className={statusClass(layer.status)}>{DATA_TO_DISCOVERY_STATUS_LABEL[layer.status]}</span>
        </button>
      ))}
    </div>
  );
}

function ArchitectureDiagram({
  selectedLayerId,
  selectedNodeId,
  onSelectNode,
  titleId,
}: {
  selectedLayerId: DataToDiscoveryLayer["id"];
  selectedNodeId: string | null;
  onSelectNode: (node: DataToDiscoveryNode) => void;
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
                tabIndex={0}
                role="button"
                aria-label={`${node.label}: ${DATA_TO_DISCOVERY_STATUS_LABEL[node.status]}`}
                onClick={() => onSelectNode(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectNode(node);
                  }
                }}
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
        {section ? (
          <Link className="d2d-link" to={workbenchHref(section.id)}>
            Open workbench {section.id} · {section.short} <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
        {node.route ? (
          <Link className="d2d-link d2d-link-secondary" to={node.route}>
            Related surface <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function DataToDiscoveryArchitecture() {
  const titleId = useId();
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
          Select a layer to inspect what is integrated, partially implemented, fixture-only, blocked, or not connected.
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
        <LayerRail layers={DATA_TO_DISCOVERY_LAYERS} selectedId={layerId} onSelect={selectLayer} />
        <div
          className="d2d-panel"
          role="tabpanel"
          id={`d2d-panel-${layerId}`}
          aria-labelledby={`d2d-tab-${layerId}`}
        >
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
            onSelectNode={(node) => setNodeId(node.id)}
            titleId={titleId}
          />
          <div className="d2d-node-list" role="group" aria-label={`${selectedLayer.title} components`}>
            {layerNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={selectedNode.id === node.id ? "d2d-node-chip active" : "d2d-node-chip"}
                aria-pressed={selectedNode.id === node.id}
                onClick={() => setNodeId(node.id)}
              >
                <strong>{node.label}</strong>
                <span className={statusClass(node.status)}>{DATA_TO_DISCOVERY_STATUS_LABEL[node.status]}</span>
              </button>
            ))}
          </div>
          <NodeDetail node={selectedNode} />
        </div>
      </div>

      <div className="d2d-workbench" aria-label="Research workbench sections 01 to 06">
        <p className="d2d-eyebrow">RESEARCH WORKBENCH · SECTIONS 01–06</p>
        <div className="d2d-workbench-links">
          {INVESTIGATION_SECTIONS.map((section) => (
            <Link key={section.id} className="d2d-workbench-link" to={workbenchHref(section.id)}>
              <span>{section.id}</span>
              <strong>{section.short}</strong>
              <small>{section.title}</small>
            </Link>
          ))}
        </div>
      </div>

      <p className="d2d-disclaimer">
        Eng connection map only. Human queue #2 rights, #4 SME gold and #5 live authenticated journey remain
        PARKED. CI green is not scientific validity. No Gate C auto-approve, MoU invention, live CDS/PHI or
        fabricated SSc Tfh/IL-21 live E2E success.
      </p>
    </div>
  );
}
