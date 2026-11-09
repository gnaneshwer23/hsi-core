import {HOME_DEMO} from "./HomeProductDemo";

/** Static hero product surface — no interactive IDs (those live in HomeProductDemo below). */
export function HomeHeroPreview(){
  return <aside className="ed-hero-product" aria-label="Research workbench preview">
    <div className="ed-demo-shell ed-product-demo-compact">
      <p className="ed-kicker">RESEARCH WORKBENCH</p>
      <article className="ed-workbench-card ed-demo-question">
        <p className="ed-kicker">Research question</p>
        <h2 className="ed-hero-preview-title">{HOME_DEMO.question}</h2>
        <p className="ed-workbench-meta">Illustrative · systemic sclerosis</p>
      </article>
      <ol className="ed-mechanism-path" aria-label="Preview mechanism path">
        {HOME_DEMO.mechanism_path.slice(0,4).map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
      </ol>
      <dl className="ed-evidence-status">
        <div><dt>Evidence</dt><dd>Context-limited</dd></div>
        <div><dt>Supporting</dt><dd>{HOME_DEMO.supporting}</dd></div>
        <div><dt>Conflicting</dt><dd>{HOME_DEMO.conflicting}</dd></div>
      </dl>
      <p className="ed-scope-line">Scroll to the demonstration for mechanism, graph and brief panels.</p>
    </div>
  </aside>;
}
