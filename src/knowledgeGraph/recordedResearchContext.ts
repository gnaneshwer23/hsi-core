import type {DomainBundle,DomainEdge} from './domainGraph';
export const MISSING_CONTEXT='__not_recorded__';
export type RecordedResearchFilters={conditions?:string[];tissue?:string;assay?:string;evidenceKind?:string};
const unique=(values:string[])=>[...new Set(values)].sort();
/** Facets come only from recorded annotations, never inferred ontology identities. */
export function recordedContextOptions(bundle:DomainBundle){return {
 conditions:unique(bundle.edges.flatMap(e=>e.conditions)),
 tissues:unique(bundle.edges.flatMap(e=>e.tissue?[e.tissue]:[])),
 assays:unique(bundle.edges.flatMap(e=>e.assay?[e.assay]:[])),
};}
export function validRecordedContext(bundle:DomainBundle,f:RecordedResearchFilters){const o=recordedContextOptions(bundle),c=f.conditions??[];return Array.isArray(c)&&c.length<=2&&new Set(c).size===c.length&&c.every(x=>o.conditions.includes(x))&&(!f.tissue||f.tissue===MISSING_CONTEXT||o.tissues.includes(f.tissue))&&(!f.assay||f.assay===MISSING_CONTEXT||o.assays.includes(f.assay))&&(!f.evidenceKind||['source_candidate','research_gap'].includes(f.evidenceKind));}
export function matchesRecordedContext(edge:DomainEdge,f:RecordedResearchFilters){return (!(f.conditions?.length)||f.conditions.some(c=>edge.conditions.includes(c)))&&(!f.tissue||(f.tissue===MISSING_CONTEXT?edge.tissue===null:edge.tissue===f.tissue))&&(!f.assay||(f.assay===MISSING_CONTEXT?edge.assay===null:edge.assay===f.assay))&&(!f.evidenceKind||edge.kind===f.evidenceKind);}
export function recordedContextCoverage(edges:readonly DomainEdge[]){return {records:edges.length,missingTissue:edges.filter(e=>e.tissue===null).length,missingAssay:edges.filter(e=>e.assay===null).length,unassignedCondition:edges.filter(e=>e.conditions.length===0).length,independentlyReviewed:0,comparison:'recorded_annotations_only' as const,pooledEffectAllowed:false as const};}
