/** Public demonstration catalogue. Original summaries, no reproduced source passages or scientific approval. */
export type DemoEvidence={id:string;from:string;to:string;predicate:string;disease:string;species:'Human'|'Mouse';tissue:string;polarity:'supports'|'limits';summary:string;sourceId:string;system:string;missing:string[]};
export const DEMO_VERSION='investor-scenarios-1';
export const DEMO_SOURCES=[
 {id:'ra-receptor',title:'Expression of interleukin-21 receptor, but not interleukin-21, in synovial fibroblasts and synovial macrophages of patients with rheumatoid arthritis',pmid:'15146416',year:2004},
 {id:'sle-cells',title:'IL-21 drives expansion and plasma cell differentiation of autoreactive CD11chiT-bet+ B cells in SLE',pmid:'29717110',year:2018},
 {id:'ssc-fibrosis',title:'T follicular helper-like cells contribute to skin fibrosis',pmid:'29514998',year:2018},
] as const;
export const DEMO_NODES=[
 {id:'il21',label:'IL-21',kind:'cytokine'}, {id:'il21r',label:'IL-21 receptor',kind:'protein'},
 {id:'tfh',label:'Tfh-like cells',kind:'cell'}, {id:'synovium',label:'Synovial cells',kind:'cell'},
 {id:'bcells',label:'Autoreactive B cells',kind:'cell'}, {id:'plasma',label:'Plasma-cell differentiation',kind:'outcome'},
 {id:'fibrosis',label:'Skin fibrosis',kind:'phenotype'}, {id:'ra',label:'Rheumatoid arthritis',kind:'disease'},
 {id:'sle',label:'Systemic lupus erythematosus',kind:'disease'}, {id:'ssc',label:'Systemic sclerosis',kind:'disease'},
] as const;
export const DEMO_EVIDENCE:readonly DemoEvidence[]=[
 {id:'ra-receptor-expression',from:'il21r',to:'synovium',predicate:'expression reported in',disease:'RA',species:'Human',tissue:'Synovium',polarity:'supports',sourceId:'ra-receptor',system:'Synovial biopsy; expression analysis',summary:'The study examined receptor expression in RA synovial fibroblasts and macrophages.',missing:['Dose','Timing','Sample size']},
 {id:'ra-ligand-limit',from:'il21',to:'synovium',predicate:'local expression not established',disease:'RA',species:'Human',tissue:'Synovium',polarity:'limits',sourceId:'ra-receptor',system:'Synovial biopsy; expression analysis',summary:'Receptor expression does not establish local ligand expression. The publication distinguishes IL-21 receptor from IL-21.',missing:['Dose','Timing','Sample size']},
 {id:'sle-bcell',from:'il21',to:'bcells',predicate:'investigated in',disease:'SLE',species:'Human',tissue:'Blood / cell culture',polarity:'supports',sourceId:'sle-cells',system:'Human SLE B-cell investigation',summary:'The publication investigates IL-21 and autoreactive B-cell expansion and plasma-cell differentiation in human SLE.',missing:['Dose','Timing','Sample size']},
 {id:'sle-plasma',from:'bcells',to:'plasma',predicate:'differentiation investigated',disease:'SLE',species:'Human',tissue:'Blood / cell culture',polarity:'supports',sourceId:'sle-cells',system:'Human SLE B-cell investigation',summary:'The B-cell population and differentiation readout are distinct from synovial receptor expression or skin fibrosis.',missing:['Dose','Timing','Sample size']},
 {id:'ssc-human',from:'tfh',to:'fibrosis',predicate:'correlation reported',disease:'SSc',species:'Human',tissue:'Skin',polarity:'supports',sourceId:'ssc-fibrosis',system:'Patient skin; observational association',summary:'Tfh-like cells in patient skin were correlated with dermal fibrosis. This observational component does not establish treatment benefit.',missing:['Sample size','Disease stage']},
 {id:'ssc-mouse',from:'il21',to:'fibrosis',predicate:'neutralisation investigated',disease:'SSc',species:'Mouse',tissue:'Skin',polarity:'supports',sourceId:'ssc-fibrosis',system:'GVHD-SSc mouse model; perturbation',summary:'IL-21 neutralisation reduced skin fibrosis in the reported mouse model. This is not evidence of human therapeutic efficacy.',missing:['Dose','Timing','Sample size']},
];
export const DEMO_SCENARIOS=[
 {id:'il21-cross-disease',title:'One pathway. Different contexts.',short:'Cross-disease context',question:'What changes when we follow IL-21 across RA, SLE and systemic sclerosis?',description:'Separate receptor expression, B-cell behaviour and fibrosis before comparing conclusions.',evidenceIds:DEMO_EVIDENCE.map(e=>e.id),focus:'il21'},
 {id:'species-boundary',title:'Where translation stops.',short:'Animal to human',question:'Does a mouse fibrosis finding establish a treatment effect in people?',description:'Follow one publication across its human association and mouse intervention components.',evidenceIds:['ssc-human','ssc-mouse'],focus:'fibrosis'},
 {id:'source-change',title:'When the evidence changes.',short:'Source correction',question:'What happens to an investigation when a supporting source needs reassessment?',description:'Simulate a source notice and follow its impact through the graph, review and saved brief.',evidenceIds:['ssc-human','ssc-mouse','sle-bcell'],focus:'il21'},
] as const;
export type DemoScenarioId=typeof DEMO_SCENARIOS[number]['id'];
export function demoScenario(id:string){const s=DEMO_SCENARIOS.find(s=>s.id===id);if(!s)throw Error('Unknown demonstration scenario');return s;}
export type DemoFilters={query:string;disease:string;species:string};
export function selectDemoEvidence(id:string,filters:DemoFilters){
 const s=demoScenario(id),q=filters.query.trim().toLowerCase();
 return DEMO_EVIDENCE.filter(e=>(s.evidenceIds as readonly string[]).includes(e.id)&&(!filters.disease||e.disease===filters.disease)&&(!filters.species||e.species===filters.species)&&(!q||[e.summary,e.disease,e.tissue,DEMO_NODES.find(n=>n.id===e.from)?.label,DEMO_NODES.find(n=>n.id===e.to)?.label].join(' ').toLowerCase().includes(q)));
}
