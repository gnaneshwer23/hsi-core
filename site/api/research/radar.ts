import {handleRadar} from "../../../src/server/radarHandler";
export default {fetch:(request:Request)=>handleRadar(request,process.env)};
