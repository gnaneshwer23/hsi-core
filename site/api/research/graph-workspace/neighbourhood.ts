/** LEA-04K bounded-neighbourhood endpoint over the packaged published snapshot. Read-only; no database or session. */
import {createGraphNeighbourhoodHandler} from "../../../../src/server/graphNeighbourhoodService";
import publishedSnapshot from "../../../public/research/domain-graph/graph.v1.json";
import {DOMAIN_GRAPH_VERSION} from "../../../src/features/science/generatedDomainGraphVersion";
const handler=createGraphNeighbourhoodHandler({currentVersion:DOMAIN_GRAPH_VERSION,readPublishedSnapshot:async version=>{if(version!==publishedSnapshot.version)throw Error("Snapshot not packaged");return publishedSnapshot;}});
export default {fetch:handler};
