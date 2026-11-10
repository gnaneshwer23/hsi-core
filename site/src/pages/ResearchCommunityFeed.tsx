import { useState } from "react";
import { Link } from "react-router-dom";
import { exampleResearcherWorkspace, reportCommunityPost, shareInvestigation } from "@hsi/researcherWorkspace";
import "../styles/scientific-investigation.css";

export function ResearchCommunityFeed() {
  const workspace = exampleResearcherWorkspace();
  const [posts, setPosts] = useState(workspace.posts);
  const [note, setNote] = useState("");
  return (
    <div className="inv-page">
      <div className="inv-wrap">
        <p className="inv-kicker">Community</p>
        <div className="inv-title-row">
          <h1>Shared research notes</h1>
          <span className="inv-badge">Demo environment</span>
        </div>
        <p className="inv-lead">{workspace.disclaimer} Sharing is an explicit choice. Private and clinical records are not posted.</p>
        {posts.map((post) => (
          <article key={post.id} className="inv-card">
            <h2>{post.title}</h2>
            <p>
              {post.authorLabel} · {post.evidenceTierLabel} · review {post.reviewStatus.replaceAll("_", " ")}
            </p>
            <p>{post.body}</p>
            <p>Sources: {post.provenance.sourceIds.join(", ")}. Passage text imported: no.</p>
            <p>Moderation: {post.moderationState.replaceAll("_", " ")}.</p>
            <button
              type="button"
              onClick={() => {
                setPosts((current) => current.map((item) => (item.id === post.id ? reportCommunityPost(item) : item)));
                setNote("Report recorded in this browser. No moderator has been notified.");
              }}
            >
              Report example post
            </button>
          </article>
        ))}
        <section className="inv-card">
          <h2>Share</h2>
          <button
            type="button"
            onClick={() => {
              const result = shareInvestigation(
                { optedIn: true, containsPatientData: false, containsClinicalRecord: false, body: "Example post" },
                { writesEnabled: false, schemaApplied: false },
              );
              setNote(result.ok ? "Unexpected save." : "Not shared. Research writes are closed and the community tables are not applied.");
            }}
          >
            Share to the community
          </button>
          {note ? <p role="status">{note}</p> : null}
          <p>
            <Link to="/research/home">Back to your workspace</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
