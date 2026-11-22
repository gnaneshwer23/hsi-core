/** Explicit nested entrypoint: the deployed catch-all did not route this path. */
import {handleVercelResearch} from "../../../../src/server/vercelResearch";
export default {fetch:(request:Request)=>handleVercelResearch(request,process.env)};
