import {handleTargetEvidence} from "../../../src/server/targetEvidenceHandler";
export default {fetch:(request:Request)=>handleTargetEvidence(request,process.env)};
