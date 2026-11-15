import {handleCooccurrence} from "../../../src/server/cooccurrenceHandler";
export default {fetch:(request:Request)=>handleCooccurrence(request,process.env)};
