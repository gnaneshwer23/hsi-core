import {handleAsk} from "../../src/server/askHandler";
export default {fetch:(request:Request)=>handleAsk(request,process.env)};
