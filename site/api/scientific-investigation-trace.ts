import {createLiveInvestigationTrace} from "../../src/liveInvestigationTrace";
async function handler(request:Request):Promise<Response>{
 const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
 if(request.method!=="GET")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...headers,Allow:"GET"}});
 const q=new URL(request.url).searchParams.get("q")??"";
 if(q.trim().length<5||q.length>400||/[<>\u0000-\u001f]/.test(q))return new Response(JSON.stringify({error:"Invalid research question"}),{status:400,headers});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{return new Response(JSON.stringify(await createLiveInvestigationTrace(q,fetch,controller.signal)),{status:200,headers});}
 catch{return new Response(JSON.stringify({error:"Live retrieval unavailable. No investigation findings were generated."}),{status:502,headers});}
 finally{clearTimeout(timer);}
}
export default {fetch:handler};
