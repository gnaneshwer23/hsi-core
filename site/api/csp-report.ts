import {handleCspReport} from "../../src/server/cspReportHandler";
export default {fetch:(request:Request)=>handleCspReport(request)};
