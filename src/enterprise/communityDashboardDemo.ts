/**
 * Research Community Dashboard — demonstration fixtures (Stage 4 shell E).
 *
 * Collaboration chrome over shared evidence reviews — not a second graph.
 * Research Circles durable store is held. No automatic IP bleed.
 * Shared ≠ public by default. Expert discussions are proposed, not a vanity feed.
 * Human Gate C only for collaborative evidence reviews. Not CDS; no PHI.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
  type EnterpriseOpportunity,
} from "./enterpriseDashboardDemo";

export const COMMUNITY_DASHBOARD_DEMO_SCHEMA =
  "hsi-community-dashboard-demo-1" as const;

export type CommunityCircle = {
  id: string;
  name: string;
  membership: "permission_aware_demo";
  durableStore: "held";
  autoIpBleed: false;
  note: string;
};

export type CommunityEvidenceReview = {
  id: string;
  title: string;
  path: "dual_reviewer_or_curator";
  gateC: "human_only";
  nextSurface: string;
};

export type CommunityDiscussion = {
  id: string;
  topic: string;
  status: "proposed_not_enabled";
  vanityFeed: false;
  note: string;
};

export type CommunityChallenge = {
  id: string;
  question: string;
  sharedDefault: "not_public";
  reviewStatus: "candidate_unreviewed";
  nextSurface: string;
};

export type CommunityResearcher = {
  id: string;
  displayName: string;
  discovery: "opt_in_demo";
  grantScoped: true;
  note: string;
};

export type CommunityPinnedResource = {
  id: string;
  label: string;
  href: string;
  note: string;
};

export type CommunityDashboardDemo = {
  schemaVersion: typeof COMMUNITY_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    circleCount: number;
    reviewPathCount: number;
    challengeCount: number;
    researcherCount: number;
    labelsAreDemonstration: true;
    circlesDurableStore: "held";
    autoIpBleed: false;
  };
  circles: readonly CommunityCircle[];
  evidenceReviews: readonly CommunityEvidenceReview[];
  discussions: readonly CommunityDiscussion[];
  challenges: readonly CommunityChallenge[];
  researchers: readonly CommunityResearcher[];
  pinned: readonly CommunityPinnedResource[];
  opportunities: readonly EnterpriseOpportunity[];
  governanceNote: string;
};

export function communityDashboardDemo(): CommunityDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: COMMUNITY_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "Research community (demonstration)",
    summary: {
      circleCount: 2,
      reviewPathCount: 2,
      challengeCount: 3,
      researcherCount: 3,
      labelsAreDemonstration: true,
      circlesDurableStore: "held",
      autoIpBleed: false,
    },
    circles: [
      {
        id: "circle-1",
        name: "Consortium sketch Alpha",
        membership: "permission_aware_demo",
        durableStore: "held",
        autoIpBleed: false,
        note: "Private group space — not auto-public; durable Circles store not applied.",
      },
      {
        id: "circle-2",
        name: "Society network sketch",
        membership: "permission_aware_demo",
        durableStore: "held",
        autoIpBleed: false,
        note: "Permission-aware only. No automatic IP bleed across orgs.",
      },
    ],
    evidenceReviews: [
      {
        id: "rev-1",
        title: "Collaborative evidence review (dual-reviewer path)",
        path: "dual_reviewer_or_curator",
        gateC: "human_only",
        nextSurface: "/research/governance",
      },
      {
        id: "rev-2",
        title: "Curated disagreement pack hand-off",
        path: "dual_reviewer_or_curator",
        gateC: "human_only",
        nextSurface: "/research/workspace",
      },
    ],
    discussions: [
      {
        id: "disc-1",
        topic: "Expert discussion thread (proposed)",
        status: "proposed_not_enabled",
        vanityFeed: false,
        note: "Not a social vanity feed. Live posting stays closed.",
      },
      {
        id: "disc-2",
        topic: "Interdisciplinary forum (proposed)",
        status: "proposed_not_enabled",
        vanityFeed: false,
        note: "Draft themes only — see community feed examples for local samples.",
      },
    ],
    challenges: [
      {
        id: "chal-1",
        question: "Shared scientific challenge: where is cross-domain evidence under-specified?",
        sharedDefault: "not_public",
        reviewStatus: "candidate_unreviewed",
        nextSurface: "/research/gaps",
      },
      {
        id: "chal-2",
        question: "Which next questions should a consortium tackle first?",
        sharedDefault: "not_public",
        reviewStatus: "candidate_unreviewed",
        nextSurface: "/research/gaps",
      },
      {
        id: "chal-3",
        question: "Can a disagreement pack be reviewed without publishing the brief?",
        sharedDefault: "not_public",
        reviewStatus: "candidate_unreviewed",
        nextSurface: "/research/workspace",
      },
    ],
    researchers: [
      {
        id: "res-1",
        displayName: "Demo researcher A",
        discovery: "opt_in_demo",
        grantScoped: true,
        note: "Opt-in / grant-scoped discovery — not a public directory dump.",
      },
      {
        id: "res-2",
        displayName: "Demo researcher B",
        discovery: "opt_in_demo",
        grantScoped: true,
        note: "Profile handoff stays device-local until org grants exist.",
      },
      {
        id: "res-3",
        displayName: "Demo network contact",
        discovery: "opt_in_demo",
        grantScoped: true,
        note: "Network pages are illustrative only.",
      },
    ],
    pinned: [
      {
        id: "pin-1",
        label: "Community feed examples",
        href: "/research/community-feed",
        note: "Local samples · sharing opt-in · no outbound messages.",
      },
      {
        id: "pin-2",
        label: "Gap register",
        href: "/research/gaps",
        note: "Shared challenges deep-link here.",
      },
      {
        id: "pin-3",
        label: "Live investigation",
        href: "/research/workspace",
        note: "Evidence reviews stay on the shared engine.",
      },
    ],
    opportunities: [
      {
        id: "com-gap-1",
        question: "Which Circles membership rules must stay fail-closed before any durable store?",
        entities: ["Research Circles", "Grants"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Durable store held.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "High — org models not production.",
        nextInvestigation: "/research/home",
        reviewStatus: "candidate_unreviewed",
      },
      {
        id: "com-gap-2",
        question: "How should shared challenges stay not-public-by-default while still discoverable to members?",
        entities: ["Shared challenges", "Gaps"],
        supportingEvidence: "Open gap register for candidate questions.",
        experimentalContext: "Shared ≠ public.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Permission model incomplete.",
        nextInvestigation: "/research/gaps",
        reviewStatus: "candidate_unreviewed",
      },
    ],
    governanceNote:
      "Collaboration shell over shared evidence reviews — not a second graph. Circles durable store held. No automatic IP bleed. Shared challenges are not public by default. Expert discussions proposed only. Human Gate C for collaborative reviews. Not CDS; no PHI.",
  };
}
