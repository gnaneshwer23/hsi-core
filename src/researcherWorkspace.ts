/**
 * Personal researcher workspace and community model.
 * Demo content uses example labels only. No outbound delivery. No automatic sharing.
 */

export type InterestKind = "disease" | "pathway" | "cell" | "target";
export type NotificationKind = "evidence" | "contradiction" | "gap" | "hypothesis" | "review_request";
export type DigestCadence = "off" | "daily" | "weekly";

export type DigestPreference = {
  cadence: DigestCadence;
  channel: "in_app_only";
  emailEnabled: false;
  smsEnabled: false;
  externalDelivery: "disabled";
};

export type WorkspaceNotification = {
  id: string;
  kind: NotificationKind;
  body: string;
  matchesInterest: string;
  externalDelivery: "disabled";
  read: false;
};

export type CommunityPost = {
  id: string;
  authorLabel: "Example researcher";
  kind: "investigation" | "gap" | "hypothesis";
  title: "Example post";
  body: string;
  evidenceTier: "unvalidated_hypothesis" | "uncertain_association" | "computational_inference" | "verified_evidence";
  evidenceTierLabel: string;
  provenance: { sourceIds: string[]; passageTextImported: false };
  sharedByOwner: true;
  containsPatientData: false;
  reviewStatus: "not_independently_reviewed";
  moderationState: "visible_example" | "report_recorded_no_moderator";
};

export type ExampleWorkspace = {
  label: "Example researcher";
  savedInvestigationIds: string[];
  interests: Array<{ id: string; kind: InterestKind; label: string }>;
  follows: string[];
  notifications: WorkspaceNotification[];
  reviewRequests: Array<{ id: string; text: string; externalDelivery: "disabled" }>;
  digest: DigestPreference;
  posts: CommunityPost[];
  disclaimer: string;
};

export const EXAMPLE_DIGEST: DigestPreference = {
  cadence: "weekly",
  channel: "in_app_only",
  emailEnabled: false,
  smsEnabled: false,
  externalDelivery: "disabled",
};

export function exampleResearcherWorkspace(): ExampleWorkspace {
  return {
    label: "Example researcher",
    savedInvestigationIds: [],
    interests: [
      { id: "interest-pathway-scfa", kind: "pathway", label: "Short-chain fatty acids" },
      { id: "interest-cell-treg", kind: "cell", label: "Regulatory T cells" },
    ],
    follows: ["gut-immune", "neuroinflammation"],
    notifications: [
      {
        id: "note-gap-example",
        kind: "gap",
        body: "Example notification: a research gap matches the short-chain fatty acid interest. Nothing was emailed.",
        matchesInterest: "Short-chain fatty acids",
        externalDelivery: "disabled",
        read: false,
      },
      {
        id: "note-contradiction-example",
        kind: "contradiction",
        body: "Example notification: the Th17 promotion and inhibition frames still conflict.",
        matchesInterest: "Regulatory T cells",
        externalDelivery: "disabled",
        read: false,
      },
    ],
    reviewRequests: [
      {
        id: "review-request-example",
        text: "Example review request addressed to Example researcher. No message was sent outside the app.",
        externalDelivery: "disabled",
      },
    ],
    digest: EXAMPLE_DIGEST,
    posts: [exampleCommunityPost()],
    disclaimer: "Example content for the demo environment. Not a real researcher, institution, or activity count.",
  };
}

export function exampleCommunityPost(): CommunityPost {
  return {
    id: "post-example-1",
    authorLabel: "Example researcher",
    kind: "hypothesis",
    title: "Example post",
    body: "Example post: gut butyrate might change peripheral immune tone. This is an unvalidated hypothesis, not a finding.",
    evidenceTier: "unvalidated_hypothesis",
    evidenceTierLabel: "Unvalidated hypothesis",
    provenance: { sourceIds: ["src-pmid-24226770"], passageTextImported: false },
    sharedByOwner: true,
    containsPatientData: false,
    reviewStatus: "not_independently_reviewed",
    moderationState: "visible_example",
  };
}

export type ShareInput = {
  optedIn: boolean;
  containsPatientData: boolean;
  containsClinicalRecord: boolean;
  body: string;
};

export type ShareResult = {
  ok: false;
  code: "OPT_IN_REQUIRED" | "PRIVATE_CONTENT_BLOCKED" | "SCHEMA_NOT_APPLIED" | "RESEARCH_WRITES_DISABLED" | "PERSISTENCE_NOT_WIRED";
};

export function shareInvestigation(input: ShareInput, options: { writesEnabled: boolean; schemaApplied: boolean }): ShareResult {
  if (!input.optedIn) return { ok: false, code: "OPT_IN_REQUIRED" };
  if (input.containsPatientData || input.containsClinicalRecord) return { ok: false, code: "PRIVATE_CONTENT_BLOCKED" };
  if (!options.writesEnabled) return { ok: false, code: "RESEARCH_WRITES_DISABLED" };
  if (!options.schemaApplied) return { ok: false, code: "SCHEMA_NOT_APPLIED" };
  return { ok: false, code: "PERSISTENCE_NOT_WIRED" };
}

export function reportCommunityPost(post: CommunityPost): CommunityPost {
  return { ...post, moderationState: "report_recorded_no_moderator" };
}

export function setDigestCadence(current: DigestPreference, cadence: DigestCadence): DigestPreference {
  return { ...current, cadence, channel: "in_app_only", emailEnabled: false, smsEnabled: false, externalDelivery: "disabled" };
}
