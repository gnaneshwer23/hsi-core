import {handleBiomedicalMetadata} from "../../../src/server/biomedicalMetadataHandler";
export default {fetch:(request:Request)=>handleBiomedicalMetadata(request,process.env)};
