/**
 * LEA-04B: maps the published graph's own domain tags onto the six HSI scientific domains.
 * The mapping is a stated, versioned table. A tag with no honest home stays unmapped and is reported,
 * and coverage is a count, never a claim that a domain has been studied.
 */
export const DOMAIN_MAP_VERSION="1.1.0" as const;

export type HsiDomain="immunology"|"neuroscience"|"microbiome"|"genomics"|"organ"|"disease";
export const HSI_DOMAINS:readonly {key:HsiDomain;label:string}[]=[
 {key:"immunology",label:"Immunology & Inflammation"},{key:"neuroscience",label:"Neuroscience"},{key:"microbiome",label:"Microbiome & Metabolism"},
 {key:"genomics",label:"Genomics & Multi-omics"},{key:"organ",label:"Organ & Tissue Biology"},{key:"disease",label:"Disease Mechanisms"},
];
export const domainLabel=(d:HsiDomain)=>HSI_DOMAINS.find(x=>x.key===d)!.label;

/** Published tag to HSI domain. Several tags may share a domain; a tag may map to none. */
export const TAG_TO_DOMAIN:Readonly<Record<string,HsiDomain|null>>={
 immune:"immunology",autoimmune:"immunology",
 brain:"neuroscience",neuro:"neuroscience",neuroimmune:"neuroscience",gut_brain:"neuroscience",
 gut:"microbiome",metabolic:"microbiome",
 liver:"organ",skin:"organ",lung:"organ",kidney:"organ",joint:"organ",
 genomic:"genomics",
 post_viral:"disease",
 lifestyle:null,trials:null,
};
/** Concept kinds that imply a domain even when no tag does. */
export const KIND_TO_DOMAIN:Readonly<Record<string,HsiDomain>>={disease:"disease",tissue:"organ",organ:"organ",gene:"genomics",protein:"genomics","molecular signature":"genomics"};

export function domainsOf(tags:readonly string[],kind?:string):{domains:HsiDomain[];unmappedTags:string[]}{
 const set=new Set<HsiDomain>(),unmapped:string[]=[];
 for(const t of tags){const d=TAG_TO_DOMAIN[t];if(d)set.add(d);else if(!(t in TAG_TO_DOMAIN)||d===null)unmapped.push(t)}
 if(kind&&KIND_TO_DOMAIN[kind])set.add(KIND_TO_DOMAIN[kind]!);
 return {domains:[...set],unmappedTags:unmapped};
}

export type CoverageLevel="none"|"minimal"|"partial"|"substantial";
/** Reported from counts alone. The thresholds are descriptive, not a judgement of scientific completeness. */
export const coverageLevel=(relationships:number):CoverageLevel=>relationships===0?"none":relationships<5?"minimal":relationships<30?"partial":"substantial";
