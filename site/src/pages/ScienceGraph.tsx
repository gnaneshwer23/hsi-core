import { SCIENCE_GRAPH } from "../features/science/knowledgeGraph";
export function ScienceGraph() {
 return <section><h1>Scientific knowledge graph</h1><p>{SCIENCE_GRAPH.nodes.length} entities and {SCIENCE_GRAPH.edges.length} editorial connections.</p></section>;
}
