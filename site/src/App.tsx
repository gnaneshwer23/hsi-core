import {lazy,Suspense} from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import {Solutions,EvidenceSafety,Pricing,Contact,Community} from "./pages/ExperiencePages";
const GovernanceDashboard=lazy(()=>import("./pages/GovernanceDashboard").then(m=>({default:m.GovernanceDashboard})));
const ResearchDashboard=lazy(()=>import("./pages/ResearchDashboard").then(m=>({default:m.ResearchDashboard})));
import {ContextConflictAuditPage,EvidenceIntelligencePage,ResearchBriefsPage} from "./pages/PublicResearchPages";
import {PlatformPublicPage,ResearchPublicPage,SciencePublicPage,ApplicationsPublicPage,TrustPublicPage,AboutPublicPage} from "./pages/PublicFoundationPages";
import { Home } from "./pages/Home";
import { IntelligenceCollectiveLanding, IntelligenceCapabilityLanding } from "./pages/IntelligenceCollective";
import {PasswordRecovery} from "./pages/PasswordRecovery";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ResearchAccount } from "./pages/ResearchAccount";
import { Technology } from "./pages/Technology";
const Explore=lazy(()=>import("./pages/Explore").then(m=>({default:m.Explore})));
const DiscoveryEngine=lazy(()=>import("./pages/DiscoveryEngine").then(m=>({default:m.DiscoveryEngine})));
const Systems=lazy(()=>import("./pages/Systems").then(m=>({default:m.Systems})));
const Evidence=lazy(()=>import("./pages/Evidence").then(m=>({default:m.Evidence})));
import { ForIsi } from "./pages/ForIsi";
import { ForAksh } from "./pages/ForAksh";
import { ForTrials } from "./pages/ForTrials";
import { HowItWorks } from "./pages/HowItWorks";
const Roadmap=lazy(()=>import("./pages/Roadmap").then(m=>({default:m.Roadmap})));
const Alignment=lazy(()=>import("./pages/Alignment").then(m=>({default:m.Alignment})));
const Docs=lazy(()=>import("./pages/Docs").then(m=>({default:m.Docs})));
const DiscoveryCentre=lazy(()=>import("./pages/DiscoveryCentre").then(m=>({default:m.DiscoveryCentre})));
const Curator=lazy(()=>import("./pages/Curator").then(m=>({default:m.Curator})));
import { Products } from "./pages/Products";
import { ClinicalModule } from "./pages/ClinicalModule";
import { DemoWalkthrough } from "./pages/DemoWalkthrough";
const Status=lazy(()=>import("./pages/Status").then(m=>({default:m.Status})));
const ClinicalTimeline=lazy(()=>import("./pages/ClinicalTimeline").then(m=>({default:m.ClinicalTimeline})));
const TrialsCriteria=lazy(()=>import("./pages/TrialsCriteria").then(m=>({default:m.TrialsCriteria})));
const GatewayDemo=lazy(()=>import("./pages/GatewayDemo").then(m=>({default:m.GatewayDemo})));
const Sources=lazy(()=>import("./pages/Sources").then(m=>({default:m.Sources})));
import { ScienceBody } from "./pages/ScienceBody";
const ScienceLiterature=lazy(()=>import("./pages/ScienceLiterature").then(m=>({default:m.ScienceLiterature})));
const ResearchCoverage=lazy(()=>import("./pages/ResearchCoverage").then(m=>({default:m.ResearchCoverage})));
const ResearchEvidenceCatalogue=lazy(()=>import("./pages/ResearchEvidenceCatalogue").then(m=>({default:m.ResearchEvidenceCatalogue})));
const ScientificResearchWorkbench=lazy(()=>import("./pages/ScientificResearchWorkbench").then(m=>({default:m.ScientificResearchWorkbench})));
const ScienceStudyComparison=lazy(()=>import("./pages/ScienceStudyComparison").then(m=>({default:m.ScienceStudyComparison})));
const ScienceReviewPreparation=lazy(()=>import("./pages/ScienceReviewPreparation").then(m=>({default:m.ScienceReviewPreparation})));
const ScientificReviewerDecision=lazy(()=>import("./pages/ScientificReviewerDecision").then(m=>({default:m.ScientificReviewerDecision})));
const ScienceDisease=lazy(()=>import("./pages/ScienceDisease").then(m=>({default:m.ScienceDisease})));
const ScienceGraph=lazy(()=>import("./pages/ScienceGraph").then(m=>({default:m.ScienceGraph})));
const SciencePaths=lazy(()=>import("./pages/SciencePaths").then(m=>({default:m.SciencePaths})));
const ScienceContradictions=lazy(()=>import("./pages/ScienceContradictions").then(m=>({default:m.ScienceContradictions})));
const ScienceClinicalTrials=lazy(()=>import("./pages/ScienceClinicalTrials").then(m=>({default:m.ScienceClinicalTrials})));
const ScienceResearchAgents=lazy(()=>import("./pages/ScienceResearchAgents").then(m=>({default:m.ScienceResearchAgents})));
const ScienceZoom=lazy(()=>import("./pages/ScienceExplorer").then(m=>({default:m.ScienceZoom})));
const ScienceConnections=lazy(()=>import("./pages/ScienceExplorer").then(m=>({default:m.ScienceConnections})));
import { NotFound } from "./pages/NotFound";
const AuthenticatedInterrogativeWorkbench=lazy(()=>import("./pages/AuthenticatedInterrogativeWorkbench").then(m=>({default:m.AuthenticatedInterrogativeWorkbench})));
const ResearchMechanismWorkflowPage=lazy(()=>import("./pages/ResearchMechanismWorkflow").then(m=>({default:m.ResearchMechanismWorkflowPage})));
const ScientificDiscoveryExperience=lazy(()=>import("./pages/ScientificDiscoveryExperience").then(m=>({default:m.ScientificDiscoveryExperience})));
const ScientificInvestigationPage=lazy(()=>import("./pages/ScientificInvestigation").then(m=>({default:m.ScientificInvestigationPage})));
const ResearcherHomePage=lazy(()=>import("./pages/ResearcherHome").then(m=>({default:m.ResearcherHome})));
const ResearchCommunityFeedPage=lazy(()=>import("./pages/ResearchCommunityFeed").then(m=>({default:m.ResearchCommunityFeed})));

const SyntheticValidationWorkbench=lazy(()=>import("./pages/SyntheticValidationWorkbench").then(m=>({default:m.SyntheticValidationWorkbench})));

const ClaimKnowledgeGraph=lazy(()=>import("./pages/ClaimKnowledgeGraph").then(m=>({default:m.ClaimKnowledgeGraph})));

const CapabilityLab=lazy(()=>import("./pages/CapabilityLab").then(m=>({default:m.CapabilityLab})));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={<ResearchPublicPage/>}/>
        <Route path="solutions" element={<Solutions/>}/>
        <Route path="evidence-safety" element={<EvidenceSafety/>}/>
        <Route path="community" element={<Community/>}/>
        <Route path="pricing" element={<Pricing/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="research/dashboard" element={<ResearchDashboard/>}/>
        <Route path="research/governance" element={<GovernanceDashboard/>}/>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="forgot-password" element={<PasswordRecovery key="request" mode="request" />} />
        <Route path="reset-password" element={<PasswordRecovery key="reset" mode="reset" />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="research/account" element={<ResearchAccount />} />
        <Route path="platform" element={<PlatformPublicPage />} />
        <Route path="intelligence" element={<IntelligenceCollectiveLanding />} />
        <Route path="intelligence/nexus" element={<IntelligenceCapabilityLanding slug="nexus" />} />
        <Route path="intelligence/aegis" element={<IntelligenceCapabilityLanding slug="aegis" />} />
        <Route path="intelligence/scout" element={<IntelligenceCapabilityLanding slug="scout" />} />
        <Route path="intelligence/prism" element={<IntelligenceCapabilityLanding slug="prism" />} />
        <Route path="intelligence/atlas" element={<IntelligenceCapabilityLanding slug="atlas" />} />
        <Route path="intelligence/helix" element={<IntelligenceCapabilityLanding slug="helix" />} />
        <Route path="intelligence/parallax" element={<IntelligenceCapabilityLanding slug="parallax" />} />
        <Route path="intelligence/horizon" element={<IntelligenceCapabilityLanding slug="horizon" />} />
        <Route path="intelligence/veritas" element={<IntelligenceCapabilityLanding slug="veritas" />} />
        <Route path="intelligence/arbiter" element={<IntelligenceCapabilityLanding slug="arbiter" />} />
        <Route path="intelligence/sentinel" element={<IntelligenceCapabilityLanding slug="sentinel" />} />
        <Route path="intelligence/caliber" element={<IntelligenceCapabilityLanding slug="caliber" />} />
        <Route path="intelligence/warden" element={<IntelligenceCapabilityLanding slug="warden" />} />
        <Route path="context-conflict-audit" element={<ContextConflictAuditPage />} />
        <Route path="evidence-intelligence" element={<EvidenceIntelligencePage />} />
        <Route path="research-briefs" element={<ResearchBriefsPage />} />
        <Route path="applications" element={<ApplicationsPublicPage />} />
        <Route path="trust" element={<TrustPublicPage />} />
        <Route path="about" element={<AboutPublicPage />} />
        <Route path="technology" element={<Technology />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="explore" element={<Explore />} />
        <Route path="science" element={<SciencePublicPage />} />
        <Route path="science/literature" element={<ScienceLiterature />} />
        <Route path="research/scientific-workbench" element={<ScientificResearchWorkbench />} />
        <Route path="research/validation" element={<Suspense fallback={<p role="status">Loading validation workspace…</p>}><SyntheticValidationWorkbench/></Suspense>} />
        <Route path="research/coverage" element={<ResearchCoverage />} />
        <Route path="research/evidence-readiness" element={<ResearchEvidenceCatalogue />} />
        <Route path="science/study-comparison" element={<ScienceStudyComparison />} />
        <Route path="science/review-preparation" element={<ScienceReviewPreparation />} />
        <Route path="research/scientific-review" element={<ScientificReviewerDecision />} />
        <Route path="science/body" element={<ScienceBody />} />
        <Route path="research/capabilities" element={<CapabilityLab/>} />
        <Route path="research/knowledge-graph" element={<Suspense fallback={<p role="status" style={{padding:"3rem 1.5rem"}}>Loading knowledge graph…</p>}><ClaimKnowledgeGraph /></Suspense>} />
        <Route path="science/graph" element={<ScienceGraph />} />
        <Route path="science/paths" element={<SciencePaths />} />
        <Route path="science/contradictions" element={<ScienceContradictions />} />
        <Route path="research/decision-workbench" element={<AuthenticatedInterrogativeWorkbench />} />
        <Route path="research/mechanism-workflow" element={<Suspense fallback={<p role="status">Loading mechanism workflow…</p>}><ResearchMechanismWorkflowPage/></Suspense>} />
        <Route path="research/discovery-experience" element={<ScientificDiscoveryExperience/>} />
        <Route path="research/investigate" element={<Suspense fallback={<p role="status">Loading investigation…</p>}><ScientificInvestigationPage/></Suspense>} />
        <Route path="research/home" element={<Suspense fallback={<p role="status">Loading workspace…</p>}><ResearcherHomePage/></Suspense>} />
        <Route path="research/community-feed" element={<Suspense fallback={<p role="status">Loading community…</p>}><ResearchCommunityFeedPage/></Suspense>} />
        <Route path="science/clinical-trials" element={<ScienceClinicalTrials />} />
        <Route path="science/research-agents" element={<ScienceResearchAgents />} />
        <Route path="science/zoom" element={<ScienceZoom />} />
        <Route path="science/connections" element={<ScienceConnections />} />
        <Route path="science/disease" element={<ScienceDisease />} />
        <Route path="discovery-engine" element={<DiscoveryEngine />} />
        <Route path="demo" element={<DemoWalkthrough />} />
        <Route path="modules" element={<Products />} />
        <Route path="modules/aksh-health" element={<ForAksh />} />
        <Route path="modules/clinical" element={<ClinicalModule />} />
        <Route path="modules/isi" element={<ForIsi />} />
        <Route path="modules/trials" element={<ForTrials />} />
        <Route path="products" element={<Navigate to="/modules" replace />} />
        <Route path="status" element={<Status />} />
        <Route path="sources" element={<Sources />} />
        <Route path="clinical-timeline" element={<ClinicalTimeline />} />
        <Route path="trials-criteria" element={<TrialsCriteria />} />
        <Route path="gateway" element={<GatewayDemo />} />
        <Route path="systems" element={<Systems />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="discovery" element={<DiscoveryCentre />} />
        <Route path="curator" element={<Curator />} />
        <Route path="akeno" element={<Navigate to="/modules/clinical" replace />} />
        <Route path="aksh-agents" element={<Navigate to="/modules/aksh-health" replace />} />
        <Route path="for-isi" element={<Navigate to="/modules/isi" replace />} />
        <Route path="for-aksh" element={<Navigate to="/modules/aksh-health" replace />} />
        <Route path="for-trials" element={<Navigate to="/modules/trials" replace />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="alignment" element={<Alignment />} />
        <Route path="docs" element={<Docs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
