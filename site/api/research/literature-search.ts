import {handleLiteratureSearch} from "../../../src/server/literatureSearchHandler";
export default {fetch:(request:Request)=>handleLiteratureSearch(request,process.env)};
