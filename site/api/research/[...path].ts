import {handleVercelResearch} from "../../../src/server/vercelResearch";
import {resolve} from 'node:path';
import {createPublicGraphSnapshotHandler} from '../../../src/server/publicGraphSnapshotService';
import {readPublishedGraphSnapshot} from '../../../src/server/readPublishedGraphSnapshot';
import {DOMAIN_GRAPH_VERSION} from '../../src/features/science/generatedDomainGraphVersion';
const publicGraph=createPublicGraphSnapshotHandler({currentVersion:DOMAIN_GRAPH_VERSION,readPublishedSnapshot:version=>readPublishedGraphSnapshot(resolve(process.cwd(),'public/research/domain-graph/versions'),version)});
export default {fetch:(request:Request)=>new URL(request.url).pathname==='/api/research/graph-snapshot'?publicGraph(request):handleVercelResearch(request,process.env)};
