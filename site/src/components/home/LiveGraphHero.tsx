import {useMemo} from "react";
import {useSharedBundle} from "../../lib/useSharedBundle";
import {buildGraphModel} from "../../../../src/graphWorkspace";
import {GraphTree} from "../../graph/GraphTree";

/**
 * The published graph on public pages, as a tree: six domains, concept types, concepts and their relationships,
 * with search and filters. Read-only: nothing is saved and nothing is preselected. Replaces the network drawing,
 * whose labels overlapped on small screens.
 */
export function LiveGraphHero(){
 const {bundle,failed}=useSharedBundle();
 const model=useMemo(()=>bundle?buildGraphModel(bundle):null,[bundle]);
 const head=(
  <p className="gt-head">
   <span className="gt-head-t">Published knowledge graph</span>
   <span className="gt-head-b">Live snapshot · candidate-only · unreviewed</span>
  </p>
 );
 if(failed)return <section className="gt-shell" aria-label="Published knowledge graph">{head}<p className="gt-empty" role="status">Snapshot unavailable. No substitute graph is shown.</p></section>;
 if(!model)return <section className="gt-shell" aria-label="Published knowledge graph">{head}<p className="gt-empty" role="status">Verifying the published snapshot…</p></section>;
 return (
  <section className="gt-shell" aria-label="Published knowledge graph">
   {head}
   <p className="gt-sum">Live from the published snapshot (version {model.version.slice(0,7)}). Open a domain, then a group, then a concept to read its relationships and the study behind each.</p>
   <GraphTree model={model} level={3}/>
  </section>
 );
}
