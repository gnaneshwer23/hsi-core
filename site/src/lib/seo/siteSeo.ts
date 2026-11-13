import {intelligenceCapabilities} from "../intelligenceCollective";
/** One public metadata policy for generated HTML and client navigation. No scientific endorsement implied. */
export const SITE_ORIGIN='https://www.humansuperintelligence.tech';
export const SOCIAL_IMAGE=SITE_ORIGIN+'/social/hsi-research.png';
export const SEO_PAGES:Record<string,{title:string;description:string;name:string}>={
 '/':{name:'Home',title:'Connected Evidence and Biological Context | Human Super Intelligence',description:'Investigate complex disease mechanisms with traceable evidence, inspectable biological context and explicit uncertainty. Explore the illustrative Context-Conflict Audit and independent research governance.'},
 '/platform':{name:'Platform',title:'Connected Biomedical Research Platform | HSI',description:'The intelligence behind connected biomedical research: governed evidence, biological knowledge, contextual investigation and independent scientific review.'},
 '/how-it-works':{name:'How it works',title:'How HSI Works: Question to Research Brief | HSI',description:'HSI investigation journey: understand the question, retrieve evidence, connect mechanisms, evaluate conflict and gaps, label hypotheses, obtain independent review and export a traceable brief.'},
 '/technology':{name:'Technology',title:'Knowledge Graph & Research Technology | Human Super Intelligence',description:'How HSI links source provenance, biological knowledge graphs, research workflows and accountable review while each product keeps its own data, permissions and interfaces.'},
 '/solutions':{name:'Solutions',title:'Translational Research & Discovery Workflows | HSI',description:'HSI workflows for translational researchers, biotech discovery teams and product partners — traceable evidence, explicit research boundaries and no invented clinical readiness claims.'},
 '/research':{name:'Research',title:'Evidence-Linked Scientific Investigation | HSI',description:'Follow a bounded research question through evidence inspection, biological context, independent review and reproducible briefs. Authorised tools require separately granted permissions.'},
 '/evidence-safety':{name:'Evidence & safety',title:'Evidence, Provenance & Human Review | Human Super Intelligence',description:'HSI evidence states, source provenance, uncertainty labelling and independent review. Working source catalogues and scientific clearance limits stay visible — no Gate C auto-approve.'},
 '/pricing':{name:'Access options',title:'Access Options | Human Super Intelligence',description:'Public ways to explore science, create an account, or read how research access is provisioned. Creating an account does not grant research write, source access or reviewer permissions.'},
 '/contact':{name:'Contact',title:'Research Access | Human Super Intelligence',description:'Create an HSI account or save a browser-only draft of a research question. This page does not submit an access request. An administrator provisions permissions separately; registration does not grant research writes.'},
 '/science':{name:'Science',title:'Biological Context and Disease Mechanisms | HSI',description:'Educational organs, tissues and biological relationships with inspectable research evidence and clearly labelled draft knowledge — not a validated causal clinical graph.'},
 '/science/body':{name:'Human body',title:'Human Body Explorer | Human Super Intelligence',description:'Educational explorer of organs, tissues and systems. Positions are illustrative, not anatomically precise. Draft relationships are not independently evidence-graded and this is not a clinical assessment.'},
 '/context-conflict-audit':{name:'Context-Conflict Audit',title:'Context-Conflict Audit | Human Super Intelligence',description:'Compare biological context and inspect why findings differ in a clearly illustrative public demonstration. No live scientific execution or approval.'},
 '/evidence-intelligence':{name:'Evidence Intelligence',title:'Evidence Intelligence | Human Super Intelligence',description:'Inspect source provenance, passage-level context, permissions and missing evidence before interpreting a research claim.'},
 '/research-briefs':{name:'Research Briefs',title:'Research Briefs | Human Super Intelligence',description:'Explore an illustrative research brief with evidence, biological context, uncertainty, proposed experiments and independent review status.'},
 '/applications':{name:'Applications',title:'Research Applications | Human Super Intelligence',description:'Biomedical discovery, clinical research and translational intelligence with explicit maturity boundaries. No patient-level integration or trial eligibility decisions.'},
 '/trust':{name:'Trust',title:'Scientific Trust and Governance | Human Super Intelligence',description:'Evidence, inference, independent human review and graph publication remain separate. Read source, privacy, security and research-use boundaries.'},
 '/about':{name:'About',title:'About HSI | Connected Human Biology',description:'The mission behind evidence-grounded, cross-domain biomedical research. Learn about scientific collaboration and the current research boundaries.'}
};
const NOINDEX_PAGES:Record<string,{name:string;title:string;description:string}>={
 '/research/capabilities':{name:'Capability rehearsals',title:'Governed Capability Rehearsals | Human Super Intelligence',description:'Local longitudinal scenarios, sample community moderation and shadow graph assessment. No live patient workflow or scientific publication.'},
 '/research/knowledge-graph':{name:'Claim-linked knowledge graph',title:'Claim-Linked Knowledge Graph | Human Super Intelligence',description:'Inspect source-linked candidate claims, local entity mentions, context, evidence gaps and versioned research paths. No scientific approval is inferred.'},
 '/forgot-password':{name:'Password recovery',title:'Password Recovery | Human Super Intelligence',description:'Request an email to reset your HSI account password.'},
 '/reset-password':{name:'Reset password',title:'Reset Password | Human Super Intelligence',description:'Set a new password using your provider-issued recovery link.'},
 '/community':{name:'Community preview',title:'Research Community Preview | Human Super Intelligence',description:'Explore research discussion themes and prepare local source-linked drafts. Public posting and participant identity verification are not enabled.'},
 '/sign-in':{name:'Sign in',title:'Sign In | Human Super Intelligence',description:'Sign in to your HSI account. Authorised research access and scientific-review permissions are provisioned and checked separately.'},
 '/sign-up':{name:'Create account',title:'Create an Account | Human Super Intelligence',description:'Register an HSI account and complete email verification. Creating an account does not grant research or reviewer permissions.'},
 '/research/account':{name:'Research account',title:'Research Account | Human Super Intelligence',description:'Check your HSI account and independently verified research permissions.'},
 '/research/dashboard':{name:'Research dashboard',title:'Research Dashboard | Human Super Intelligence',description:'Create and reopen authorised source-bound investigations, inspect evidence and access independent review.'},
 '/research/mechanism-workflow':{name:'Connected research workbench',title:'Connected Research Workbench | Human Super Intelligence',description:'Ask → retrieve → investigate → verify → review → export on real research APIs with inspectable passages. Fixture data only — not scientific gold or Gate C approval.'},
 '/science/graph':{name:'Knowledge graph',title:'Knowledge Graph Explorer | Human Super Intelligence',description:'Explore HSI draft biological topic connections with filters, neighbourhood navigation and inspectable evidence states. Not a validated causal graph.'},
 '/research/investigate':{name:'Curated investigation',title:'Curated Investigation Demonstration | Human Super Intelligence',description:'Demo investigation from a research question through evidence, contradictions, gaps, hypotheses, human review and export. Curated examples only — not clinical validation or a live research write.'},
 '/research/home':{name:'Research workspace',title:'Your Research Workspace | Human Super Intelligence',description:'Example researcher workspace for saved investigations, interests and in-app notifications. Not a live deployment.'},
 '/research/community-feed':{name:'Research community',title:'Research Community Examples | Human Super Intelligence',description:'Example community posts with evidence tiers and provenance. Sharing is opt-in. No outbound messages.'},
 '/demo':{name:'Illustrative walkthrough',title:'Illustrative Research Walkthrough | Human Super Intelligence',description:'Guided walkthrough of one research record. Not a diagnosis, a prescription, or confirmed trial eligibility.'}
};
SEO_PAGES['/intelligence']={name:'Intelligence Collective',title:'The HSI Intelligence Collective | Evidence, Context and Review',description:'Explore the proposed HSI capabilities for source integrity, biological investigation and accountable review. A capability architecture, not a claim of live scientific validation.'};
for(const a of intelligenceCapabilities)SEO_PAGES['/intelligence/'+a.slug]={name:a.name,title:a.name+' — '+a.role+' | HSI',description:a.purpose+' Proposed capability architecture; live execution and independent scientific acceptance remain gated.'};
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
  {'@type':'Organization','@id':SITE_ORIGIN+'/#organization',name:'Human Super Intelligence',alternateName:['HSI'],url:SITE_ORIGIN+'/',logo:{'@type':'ImageObject',url:SITE_ORIGIN+'/icon.svg'},description:'Evidence-linked health and immunology research technology with biological context, source provenance and independent human review. Research and education use only.'},
  {'@type':'WebSite','@id':SITE_ORIGIN+'/#website',name:'Human Super Intelligence',url:SITE_ORIGIN+'/',publisher:{'@id':SITE_ORIGIN+'/#organization'},inLanguage:'en-GB'},
  {'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:title,description,isPartOf:{'@id':SITE_ORIGIN+'/#website'},inLanguage:'en-GB'},
  ...(pathname==='/'?[]:[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_ORIGIN+'/'},{'@type':'ListItem',position:2,name,item:canonical}]}])
 ]}:null;
 return {name,title,description,canonical,indexable,structuredData};
}
export function safeJsonLd(value:unknown){return JSON.stringify(value).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026')}
export function seoRobots(indexable:boolean){return indexable?'index, follow, max-image-preview:large':'noindex, follow'}
/** Build-time Search Console HTML-tag token only. Prefer DNS TXT verification; never invent a token. */
export function sanitizeGoogleSiteVerification(token:string|undefined|null){
 const value=(token??'').trim();
 return /^[A-Za-z0-9_-]{8,200}$/.test(value)?value:'';
}
export function renderSeoHead(pathname:string,noindex=false,opts?:{googleSiteVerification?:string}){
 const m=getSeoMetadata(pathname,noindex),escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const tags:Record<string,string>={'description':m.description,'robots':seoRobots(m.indexable),'og:type':'website','og:site_name':'Human Super Intelligence','og:title':m.title,'og:description':m.description,'og:url':m.canonical,'og:locale':'en_GB','og:image':SOCIAL_IMAGE,'og:image:width':'1200','og:image:height':'630','og:image:alt':'Human Super Intelligence — connected context, traceable evidence, human review','twitter:card':'summary_large_image','twitter:title':m.title,'twitter:description':m.description,'twitter:image':SOCIAL_IMAGE,'twitter:image:alt':'Human Super Intelligence research platform'};
 const verification=sanitizeGoogleSiteVerification(opts?.googleSiteVerification);
 return '<title>'+escape(m.title)+'</title>\n'+Object.entries(tags).map(([key,value])=>'<meta '+(key.startsWith('og:')?'property':'name')+'="'+key+'" content="'+escape(value)+'" />').join('\n')+'\n'+(verification?'<meta name="google-site-verification" content="'+escape(verification)+'" />\n':'')+'<link rel="canonical" href="'+escape(m.canonical)+'" />\n'+(m.structuredData?'<script id="hsi-seo-schema" type="application/ld+json">'+safeJsonLd(m.structuredData)+'</script>':'');
}
