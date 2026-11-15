import {handleHealth} from "../../src/server/healthHandler";
export default {fetch:(request:Request)=>handleHealth(request)};
