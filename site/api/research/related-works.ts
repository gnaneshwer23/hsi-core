import {handleRelatedWorks} from "../../../src/server/relatedWorksHandler";
export default {fetch:(request:Request)=>handleRelatedWorks(request,process.env)};
