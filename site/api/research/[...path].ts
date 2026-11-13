import {handleVercelResearch} from "../../../src/server/vercelResearch";
import {createPublicGraphSnapshotHandler} from '../../../src/server/publicGraphSnapshotService';
import publishedSnapshot from '../../public/research/domain-graph/graph.v1.json';
import {DOMAIN_GRAPH_VERSION} from '../../src/features/science/generatedDomainGraphVersion';
const publicGraph=createPublicGraphSnapshotHandler({currentVersion:DOMAIN_GRAPH_VERSION,readPublishedSnapshot:async version=>{if(version!==publishedSnapshot.version)throw Error('Snapshot not packaged');return new TextEncoder().encode(JSON.stringify(publishedSnapshot));}});
export default {fetch:(request:Request)=>new URL(request.url).pathname==='/api/research/graph-snapshot'?publicGraph(request):handleVercelResearch(request,process.env)};
