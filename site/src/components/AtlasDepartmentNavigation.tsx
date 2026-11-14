import {atlasDepartmentCoverage} from '../../../src/knowledgeGraph/atlasDepartments';
import type {DomainBundle} from '../../../src/knowledgeGraph/domainGraph';
import '../styles/atlas-departments.css';

/** Six entry points into the same candidate snapshot, not separate datasets. */
export function AtlasDepartmentNavigation({bundle,value,onChange,compact=false}:{bundle:DomainBundle;value:string;onChange:(id:string)=>void;compact?:boolean}){
 return <nav className={'atlas-departments'+(compact?' atlas-departments-compact':'')} aria-label="Scientific departments">
  <button aria-pressed={!value} onClick={()=>onChange('')}><span>Connected biology</span><small>All recorded domains</small></button>
  {atlasDepartmentCoverage(bundle).map(d=><button key={d.id} aria-pressed={value===d.id} onClick={()=>onChange(d.id)} title={d.description}><span>{d.label}</span><small>{d.relationships?`${d.relationships} recorded connections`:'Coverage pending'}</small></button>)}
 </nav>
}
