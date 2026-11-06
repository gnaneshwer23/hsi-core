/** One public metadata policy for generated HTML and client navigation. No scientific endorsement implied. */
export const SITE_ORIGIN='https://www.humansuperintelligence.tech';
export const SOCIAL_IMAGE=SITE_ORIGIN+'/social/hsi-research.png';
export const SEO_PAGES:Record<string,{title:string;description:string;name:string}>={
 '/':{name:'Home',title:'Human Super Intelligence | Evidence-Linked Health Research',description:'Connect biological context, scientific evidence and human review. Explore HSI research tools for transparent, evidence-linked health and immunology investigations.'},
 '/platform':{name:'Platform',title:'Research Intelligence Platform | Human Super Intelligence',description:'Explore HSI’s shared research foundation: source-linked evidence, biological context, inspectable investigations and independent human review across separate products.'},
 '/technology':{name:'Technology',title:'Knowledge Graph & Research Technology | Human Super Intelligence',description:'See how HSI connects source context, biological knowledge graphs, research workflows and accountable review while preserving product-owned data and permissions.'},
 '/products':{name:'Products',title:'Health & Immunology Research Products | HSI',description:'Explore Aksh Health, Immune Super Intelligence, HSI Clinical and HSI Trials. Compare their intended users, current scope and separately governed product experiences.'},
 '/solutions':{name:'Solutions',title:'Translational Research & Discovery Workflows | HSI',description:'Explore HSI workflows for translational researchers, biotech discovery teams and product partners, with traceable evidence and explicit research boundaries.'},
 '/research':{name:'Research',title:'Evidence-Linked Research Workbench | Human Super Intelligence',description:'Follow a bounded research question through evidence inspection, biological context, independent review and reproducible briefs. Explore HSI’s current research experience.'},
 '/evidence-safety':{name:'Evidence & safety',title:'Evidence, Provenance & Human Review | Human Super Intelligence',description:'Understand HSI evidence states, source provenance, uncertainty and independent review. Inspect the working source catalogue and its scientific clearance limitations.'},
 '/pricing':{name:'Access & pilots',title:'Research Access & Team Pilots | Human Super Intelligence',description:'Find a starting point for HSI public exploration, authorised research access or a scoped team pilot. Understand account permissions and current access options.'},
 '/contact':{name:'Contact',title:'Request Research Access | Human Super Intelligence',description:'Create an HSI account, verify your email and understand research access. Governed sources and scientific-review tools require independent permission approval.'},
 '/how-it-works':{name:'How it works',title:'How HSI Works: Question to Research Brief | HSI',description:'Explore the HSI research journey: frame a question, inspect context and evidence, compare explanations, obtain independent review and export a traceable brief.'},
 '/science':{name:'Science',title:'Human Biology & Scientific Evidence Explorer | HSI',description:'Explore educational organs, tissues and biological relationships. Connect human biology context with inspectable research evidence and clearly labelled draft knowledge.'},
 '/for-aksh':{name:'Aksh Health',title:'Aksh Health & HSI | Personal Health Context',description:'Explore Aksh Health’s role in the HSI ecosystem: personal health context and separately governed clinical workflows, with its own interface, data and access boundaries.'},
 '/for-isi':{name:'Immune Super Intelligence',title:'Immune Super Intelligence | Immunology Research in HSI',description:'Explore Immune Super Intelligence’s role in evidence-led immune and biological research, connected through shared HSI technology while retaining its own interface and data.'},
 '/for-trials':{name:'HSI Trials',title:'HSI Trials | Transparent Clinical Research',description:'Explore the HSI Trials programme for study context, transparent criteria and investigator-led review. A planned product; no live matching or enrolment.'}
};
const NOINDEX_PAGES:Record<string,{name:string;title:string;description:string}>={
 '/community':{name:'Community preview',title:'Research Community Preview | Human Super Intelligence',description:'Explore research discussion themes and prepare local source-linked drafts. Public posting and participant identity verification are not enabled.'},
 '/sign-in':{name:'Sign in',title:'Sign In | Human Super Intelligence',description:'Sign in to your HSI account. Authorised research access and scientific-review permissions are provisioned and checked separately.'},
 '/sign-up':{name:'Create account',title:'Create an Account | Human Super Intelligence',description:'Register an HSI account and complete email verification. Creating an account does not grant research or reviewer permissions.'},
 '/research/account':{name:'Research account',title:'Research Account | Human Super Intelligence',description:'Check your HSI account and independently verified research permissions.'},
 '/research/dashboard':{name:'Research dashboard',title:'Research Dashboard | Human Super Intelligence',description:'Create and reopen authorised source-bound investigations, inspect evidence and access independent review.'},
 '/science/graph':{name:'Knowledge graph',title:'Knowledge Graph Explorer | Human Super Intelligence',description:'Explore HSI draft biological topic connections with filters, neighbourhood navigation and inspectable evidence states. Not a validated causal graph.'}
};
export type SeoMetadata={title:string;description:string;canonical:string;indexable:boolean;name:string;structuredData:Record<string,unknown>|null};
export function getSeoMetadata(pathname:string,noindex=false):SeoMetadata{
 const page=Object.hasOwn(SEO_PAGES,pathname)?SEO_PAGES[pathname]:undefined;
 const safePath=/^\/[a-z0-9/-]*$/.test(pathname)?pathname:'/';
 const canonical=SITE_ORIGIN+(safePath==='/'?'/':safePath.replace(/\/+$/,''));
 const displayPage=page??(Object.hasOwn(NOINDEX_PAGES,pathname)?NOINDEX_PAGES[pathname]:undefined);
 const name=displayPage?.name??'Research tools';
 const title=displayPage?.title??'Research Tools & Account Access | Human Super Intelligence';
 const description=displayPage?.description??'Access HSI research tools with the required permissions. Research outputs retain source context, uncertainty and independent human-review requirements.';
 const indexable=!!page&&!noindex;
 const structuredData=indexable?{'@context':'https://schema.org','@graph':[
  {'@type':'Organization','@id':SITE_ORIGIN+'/#organization',name:'Human Super Intelligence',url:SITE_ORIGIN+'/',logo:{'@type':'ImageObject',url:SITE_ORIGIN+'/icon.svg'}},
  {'@type':'WebSite','@id':SITE_ORIGIN+'/#website',name:'Human Super Intelligence',url:SITE_ORIGIN+'/',publisher:{'@id':SITE_ORIGIN+'/#organization'},inLanguage:'en-GB'},
  {'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:title,description,isPartOf:{'@id':SITE_ORIGIN+'/#website'},inLanguage:'en-GB'},
  ...(pathname==='/'?[]:[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_ORIGIN+'/'},{'@type':'ListItem',position:2,name,item:canonical}]}])
 ]}:null;
 return {name,title,description,canonical,indexable,structuredData};
}
export function safeJsonLd(value:unknown){return JSON.stringify(value).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026')}
export function seoRobots(indexable:boolean){return indexable?'index, follow, max-image-preview:large':'noindex, follow'}
export function renderSeoHead(pathname:string,noindex=false){
 const m=getSeoMetadata(pathname,noindex),escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const tags:Record<string,string>={'description':m.description,'robots':seoRobots(m.indexable),'og:type':'website','og:site_name':'Human Super Intelligence','og:title':m.title,'og:description':m.description,'og:url':m.canonical,'og:locale':'en_GB','og:image':SOCIAL_IMAGE,'og:image:width':'1200','og:image:height':'630','og:image:alt':'Human Super Intelligence — connected context, traceable evidence, human review','twitter:card':'summary_large_image','twitter:title':m.title,'twitter:description':m.description,'twitter:image':SOCIAL_IMAGE,'twitter:image:alt':'Human Super Intelligence research platform'};
 return '<title>'+escape(m.title)+'</title>\n'+Object.entries(tags).map(([key,value])=>'<meta '+(key.startsWith('og:')?'property':'name')+'="'+key+'" content="'+escape(value)+'" />').join('\n')+'\n<link rel="canonical" href="'+escape(m.canonical)+'" />\n'+(m.structuredData?'<script id="hsi-seo-schema" type="application/ld+json">'+safeJsonLd(m.structuredData)+'</script>':'');
}
