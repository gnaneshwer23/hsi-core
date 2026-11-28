/** Explicit nested entrypoint: the deployed catch-all does not route nested paths. */
import {handleVercelResearch} from "../../../../../../src/server/vercelResearch";
export default {fetch:(request:Request)=>handleVercelResearch(request,process.env)};
