import {handleVercelResearch} from "../../../../src/server/vercelResearch";
export default {fetch:(request:Request)=>handleVercelResearch(request,process.env)};
