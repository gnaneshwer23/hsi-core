/** One public metadata policy for generated HTML and client navigation. No scientific endorsement implied. */
export const SITE_ORIGIN='https://www.humansuperintelligence.tech';
export const SOCIAL_IMAGE=SITE_ORIGIN+'/social/hsi-research.png';
export const SEO_PAGES:Record<string,{title:string;description:string;name:string}>={
 '/':{name:'Home',title:'Human Super Intelligence | Connected Biomedical Research Intelligence',description:'HSI connects biological knowledge and scientific evidence to investigate unresolved questions and inform the next research decision. Research intelligence under development — not clinical decision support.'},
 '/platform':{name:'Platform',title:'Research Platform | Human Super Intelligence',description:'One HSI research environment for investigate, connect, evaluate, translate and decide — built around evidence, provenance and human review, not just answers.'},
 '/technology':{name:'Technology',title:'Knowledge Graph & Research Technology | Human Super Intelligence',description:'How HSI connects a living biomedical knowledge graph, research agent orchestration, scientific governance and the research experience — with honest validation boundaries.'},
 '/biology':{name:'Explore Biology',title:'Explore Biology | Multi-Scale Biological Intelligence | HSI',description:'Explore disease as an interconnected biological system across molecular, cellular, tissue, systemic and disease scales. Educational draft graph — not a validated causal clinical model.'},
 '/drug-discovery':{name:'Drug Discovery',title:'Drug Discovery Intelligence | Human Super Intelligence',description:'Mechanism-to-target investigation, translational evidence and therapeutic landscapes. HSI is not a validated de novo molecular design engine or autonomous drug development system.'},
 '/solutions':{name:'Applications',title:'Research Applications | Human Super Intelligence',description:'Cross-domain research applications across autoimmunity, fibrosis, cancer immunology, gut–immune–metabolic biology, neuroimmune research and biomarkers.'},
 '/research':{name:'Research Intelligence',title:'Research Intelligence | Beyond Literature Search | HSI',description:'Move from evidence retrieval toward contextual biological interpretation: investigate what is known, challenge established claims, identify uncertainty and plan next experiments.'},
 '/evidence-safety':{name:'Science & Trust',title:'Science & Trust | Scientific Integrity | Human Super Intelligence',description:'HSI scientific principles: traceability, context, uncertainty, reproducibility, human oversight and responsible data use. Engineering readiness is distinguished from scientific performance.'},
 '/pricing':{name:'Access & pilots',title:'Research Access & Team Pilots | Human Super Intelligence',description:'Starting points for public exploration, authorised research access or collaboration. Account creation does not grant research write or reviewer permissions.'},
 '/contact':{name:'Collaborate',title:'Collaborate with HSI | Research Access',description:'Discuss a research collaboration or create an HSI account. Governed sources and scientific-review tools require independent permission approval.'},
 '/about':{name:'About',title:'About Human Super Intelligence',description:'HSI is building connections that move science forward — an intelligence platform for immunology, systems biology and translational research investigation.'},
 '/how-it-works':{name:'Research Outcomes',title:'Research Outcomes | Dossiers, Assessments & Briefs | HSI',description:'Intended HSI investigation outputs: mechanism dossiers, contradiction and research-gap assessments, translational assessments, experiment proposals and traceable research briefs.'},
 '/science':{name:'Science',title:'Human Biology & Scientific Evidence Explorer | HSI',description:'Educational organs, tissues and biological relationships with inspectable research evidence and clearly labelled draft knowledge — not a validated causal clinical graph.'}
};
const NOINDEX_PAGES:Record<string,{name:string;title:string;description:string}>={
 '/research/capabilities':{name:'Capability rehearsals',title:'Governed Capability Rehearsals | Human Super Intelligence',description:'Local synthetic longitudinal scenarios, sample community moderation and shadow graph assessment. No live patient workflow or scientific publication.'},
 '/research/knowledge-graph':{name:'Claim-linked knowledge graph',title:'Claim-Linked Knowledge Graph | Human Super Intelligence',description:'Inspect source-linked candidate claims, local entity mentions, context, evidence gaps and versioned research paths. No scientific approval is inferred.'},
 '/forgot-password':{name:'Password recovery',title:'Password Recovery | Human Super Intelligence',description:'Request an email to reset your HSI account password.'},
 '/reset-password':{name:'Reset password',title:'Reset Password | Human Super Intelligence',description:'Set a new password using your provider-issued recovery link.'},
 '/community':{name:'Community preview',title:'Research Community Preview | Human Super Intelligence',description:'Explore research discussion themes and prepare local source-linked drafts. Public posting and participant identity verification are not enabled.'},
 '/sign-in':{name:'Sign in',title:'Sign In | Human Super Intelligence',description:'Sign in to your HSI account. Authorised research access and scientific-review permissions are provisioned and checked separately.'},
 '/sign-up':{name:'Create account',title:'Create an Account | Human Super Intelligence',description:'Register an HSI account and complete email verification. Creating an account does not grant research or reviewer permissions.'},
 '/research/account':{name:'Research account',title:'Research Account | Human Super Intelligence',description:'Check your HSI account and independently verified research permissions.'},
 '/research/dashboard':{name:'Research dashboard',title:'Research Dashboard | Human Super Intelligence',description:'Create and reopen authorised source-bound investigations, inspect evidence and access independent review.'},
 '/research/mechanism-workflow':{name:'Connected research workbench',title:'Connected Research Workbench | Human Super Intelligence',description:'Ask → retrieve → investigate → verify → review → export on real research APIs with inspectable passages. Synthetic fixture only — not scientific gold or Gate C approval.'},
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
  {'@type':'Organization','@id':SITE_ORIGIN+'/#organization',name:'Human Super Intelligence',alternateName:['HSI'],url:SITE_ORIGIN+'/',logo:{'@type':'ImageObject',url:SITE_ORIGIN+'/icon.svg'},description:'Evidence-linked biomedical research intelligence connecting biological context, source provenance and independent human review. Research and education use only.'},
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
 const tags:Record<string,string>={'description':m.description,'robots':seoRobots(m.indexable),'og:type':'website','og:site_name':'Human Super Intelligence','og:title':m.title,'og:description':m.description,'og:url':m.canonical,'og:locale':'en_GB','og:image':SOCIAL_IMAGE,'og:image:width':'1200','og:image:height':'630','og:image:alt':'Human Super Intelligence — connected biology, evidence and scientific discovery','twitter:card':'summary_large_image','twitter:title':m.title,'twitter:description':m.description,'twitter:image':SOCIAL_IMAGE,'twitter:image:alt':'Human Super Intelligence research platform'};
 return '<title>'+escape(m.title)+'</title>\n'+Object.entries(tags).map(([key,value])=>'<meta '+(key.startsWith('og:')?'property':'name')+'="'+key+'" content="'+escape(value)+'" />').join('\n')+'\n<link rel="canonical" href="'+escape(m.canonical)+'" />\n'+(m.structuredData?'<script id="hsi-seo-schema" type="application/ld+json">'+safeJsonLd(m.structuredData)+'</script>':'');
}
