import {handleLiveInvestigation} from "../../../src/server/liveInvestigationHandler";
export default {fetch:(request:Request)=>handleLiveInvestigation(request,process.env)};
