import {handleAccessRequest} from "../../src/server/accessRequestHandler";
export default {fetch:(request:Request)=>handleAccessRequest(request,process.env)};
