import {retrievePubmedBibliography} from "../../src/scientificPubmedRetrieval";
async function handler(request:Request):Promise<Response>{
 const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
 if(request.method!=="GET")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...headers,Allow:"GET"}});
 const url=new URL(request.url);const query=url.searchParams.get("q")??"";
 if(query.length<5||query.length>400||/[<>\u0000-\u001f]/.test(query))return new Response(JSON.stringify({error:"Research query must be 5–400 characters of plain text."}),{status:400,headers});
 try{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
  try{return new Response(JSON.stringify(await retrievePubmedBibliography(query,fetch,controller.signal)),{status:200,headers});}
  finally{clearTimeout(timeout);}
 }catch(e){return new Response(JSON.stringify({error:"PubMed retrieval unavailable. No findings were generated."}),{status:502,headers});}
}
export default {fetch:handler};
