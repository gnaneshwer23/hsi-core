import { Link } from "react-router-dom";
export function NotFound() {
  return <section className="section section-ink"><div className="container">
    <h1 className="display display-md">Page not found</h1>
    <p>This destination is unavailable. Return to the research workspace or homepage.</p>
    <p><Link to="/discovery">Open research workspace →</Link></p>
    <p><Link to="/">Return home →</Link></p>
  </div></section>;
}
