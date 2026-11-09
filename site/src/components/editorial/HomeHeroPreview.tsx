import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {HOME_DEMO} from "./HomeProductDemo";

/** Static hero product surface — interactive IDs live in HomeProductDemo below. */
export function HomeHeroPreview(){
  return <aside className="ed-hero-product" aria-label="Research workbench preview">
    <div className="ed-demo-shell ed-product-demo-compact ed-hero-desk">
      <div className="ed-desk-chrome">
        <span>Research workbench</span>
        <span className="ed-desk-chrome-note">Illustrative · Not a live investigation</span>
      </div>
      <div className="ed-question-bar">
        <span>Research question</span>
        <p className="ed-question-bar-value ed-hero-preview-title">{HOME_DEMO.question}</p>
      </div>
      <div className="ed-hero-desk-body">
        <ol className="ed-mechanism-path ed-mechanism-path-compact" aria-label="Preview mechanism path">
          {HOME_DEMO.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
        </ol>
        <div className="ed-hero-side-rail">
          <div className="ed-evidence-badges" aria-label="Illustrative evidence status">
            <span data-kind="support"><strong>{HOME_DEMO.supporting}</strong> supporting</span>
            <span data-kind="conflict"><strong>{HOME_DEMO.conflicting}</strong> conflicting</span>
            <span data-kind="gap">Gap named</span>
          </div>
          <p className="ed-scope-line">Status: research hypothesis · {HOME_DEMO.review_status.replaceAll("_"," ")}</p>
          <a className="ed-text-link ed-hero-open-evidence" href="#product-demo">Open evidence <span aria-hidden="true"><ArrowIcon direction="right"/></span></a>
          <Link className="ed-text-link" to="/evidence-safety">Evidence approach <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
        </div>
      </div>
    </div>
  </aside>;
}
