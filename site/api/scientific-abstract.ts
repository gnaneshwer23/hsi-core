import {retrieveAbstractContext} from "../../src/scientificAbstractContext";
async function handler(request:Request):Promise<Response>{
 const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
 if(request.method!=="GET")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...headers,Allow:"GET"}});
 const pmid=new URL(request.url).searchParams.get("pmid")??"";
 if(!/^\d{1,12}$/.test(pmid))return new Response(JSON.stringify({error:"Invalid PubMed identifier"}),{status:400,headers});
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 try{return new Response(JSON.stringify(await retrieveAbstractContext(pmid,fetch,controller.signal)),{status:200,headers});}
 catch{return new Response(JSON.stringify({error:"Abstract retrieval unavailable. No scientific claims were generated."}),{status:502,headers});}
 finally{clearTimeout(timeout);}
}
export default {fetch:handler};
