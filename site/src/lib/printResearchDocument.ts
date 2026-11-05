/** Browser print / Save as PDF. Render source text inertly; never interpolate it into HTML. */
export function printResearchDocument(title:string,text:string){
 if(!title.trim()||title.length>150||!text.trim()||text.length>2_100_000)throw Error("Invalid print document");
 document.getElementById("hsi-print-document")?.remove();document.getElementById("hsi-print-style")?.remove();
 const container=document.createElement("section");container.id="hsi-print-document";container.setAttribute("aria-label","Research brief print document");
 const heading=document.createElement("h1");heading.textContent=title;const pre=document.createElement("pre");pre.textContent=text;container.append(heading,pre);
 const style=document.createElement("style");style.id="hsi-print-style";style.textContent="#hsi-print-document{display:none}@media print{body>*:not(#hsi-print-document):not(#hsi-print-style){display:none!important}#hsi-print-document{display:block!important;color:#123e3a;background:white;font:11pt Arial,sans-serif}#hsi-print-document h1{font-size:20pt}#hsi-print-document pre{white-space:pre-wrap;overflow-wrap:anywhere;font:10pt/1.6 Arial,sans-serif}@page{margin:18mm}}";
 document.body.append(style,container);
 const cleanup=()=>{container.remove();style.remove();window.removeEventListener("afterprint",cleanup);clearTimeout(timer)};
 const timer=setTimeout(cleanup,90000);window.addEventListener("afterprint",cleanup,{once:true});
 try{window.print()}catch(error){cleanup();throw error}
}
