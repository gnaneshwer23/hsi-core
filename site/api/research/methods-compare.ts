import {handleMethodsCompare} from "../../../src/server/methodsCompareHandler";
export default {fetch:(request:Request)=>handleMethodsCompare(request,process.env)};
