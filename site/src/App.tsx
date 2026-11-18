import {IdentityStudy} from "./pages/IdentityStudy";
import {lazy,Suspense} from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import {ContactPublicPage as Contact} from "./pages/ContactPublic";
const GovernanceDashboard=lazy(()=>import("./pages/GovernanceDashboard").then(m=>({default:m.GovernanceDashboard})));
const ResearchDashboard=lazy(()=>import("./pages/ResearchDashboard").then(m=>({default:m.ResearchDashboard})));
import {ContextConflictAuditPage} from "./pages/PublicResearchPages";
import {TrustPublicPage,AboutPublicPage} from "./pages/PublicFoundationPages";
import {HomeLanding as Home} from "./pages/HomeLanding";
import {HowItWorksPage as HowItWorks} from "./pages/HowItWorksPage";
import {ScientificEvidence as EvidenceIntelligencePage} from "./pages/ScientificPublic";
import {KnowledgeGraphPublicPage} from "./pages/KnowledgeGraphPublic";
import {PasswordRecovery} from "./pages/PasswordRecovery";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ResearchAccount } from "./pages/ResearchAccount";
const Explore=lazy(()=>import("./pages/Explore").then(m=>({default:m.Explore})));
const DiscoveryEngine=lazy(()=>import("./pages/DiscoveryEngine").then(m=>({default:m.DiscoveryEngine})));
const Systems=lazy(()=>import("./pages/Systems").then(m=>({default:m.Systems})));
const Evidence=lazy(()=>import("./pages/Evidence").then(m=>({default:m.Evidence})));

const Roadmap=lazy(()=>import("./pages/Roadmap").then(m=>({default:m.Roadmap})));
const Alignment=lazy(()=>import("./pages/Alignment").then(m=>({default:m.Alignment})));
const Docs=lazy(()=>import("./pages/Docs").then(m=>({default:m.Docs})));
const DiscoveryCentre=lazy(()=>import("./pages/DiscoveryCentre").then(m=>({default:m.DiscoveryCentre})));
const Curator=lazy(()=>import("./pages/Curator").then(m=>({default:m.Curator})));
const Status=lazy(()=>import("./pages/Status").then(m=>({default:m.Status})));
const ClinicalTimeline=lazy(()=>import("./pages/ClinicalTimeline").then(m=>({default:m.ClinicalTimeline})));
const TrialsCriteria=lazy(()=>import("./pages/TrialsCriteria").then(m=>({default:m.TrialsCriteria})));
const GatewayDemo=lazy(()=>import("./pages/GatewayDemo").then(m=>({default:m.GatewayDemo})));
const Sources=lazy(()=>import("./pages/Sources").then(m=>({default:m.Sources})));
const ScienceLiterature=lazy(()=>import("./pages/ScienceLiterature").then(m=>({default:m.ScienceLiterature})));
const ResearchCoverage=lazy(()=>import("./pages/ResearchCoverage").then(m=>({default:m.ResearchCoverage})));
const ResearchEvidenceCatalogue=lazy(()=>import("./pages/ResearchEvidenceCatalogue").then(m=>({default:m.ResearchEvidenceCatalogue})));
const ContextCompletionStatusRoute=lazy(()=>import("./pages/ContextCompletionStatus").then(m=>({default:m.ContextCompletionStatusPage})));
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
const InvestigationWorkspaceRoute=lazy(()=>import("./pages/InvestigationWorkspace").then(m=>({default:m.InvestigationWorkspacePage})));
const WelcomeRoute=lazy(()=>import("./pages/Welcome").then(m=>({default:m.WelcomePage})));
const GapRegisterRoute=lazy(()=>import("./pages/GapRegister").then(m=>({default:m.GapRegisterPage})));
const HypothesisLedgerRoute=lazy(()=>import("./pages/HypothesisLedger").then(m=>({default:m.HypothesisLedgerPage})));
const CohortPlaneRoute=lazy(()=>import("./pages/CohortPlane").then(m=>({default:m.CohortPlanePage})));
const TargetWorkflowRoute=lazy(()=>import("./pages/TargetWorkflow").then(m=>({default:m.TargetWorkflowPage})));
const TrialPrescreenRoute=lazy(()=>import("./pages/TrialPrescreen").then(m=>({default:m.TrialPrescreenPage})));
const ResearchJourneyRoute=lazy(()=>import("./pages/ResearchJourney").then(m=>({default:m.ResearchJourneyPage})));
const MethodsSharingRoute=lazy(()=>import("./pages/MethodsSharing").then(m=>({default:m.MethodsSharingPage})));
const EvaluationSetRoute=lazy(()=>import("./pages/EvaluationSet").then(m=>({default:m.EvaluationSetPage})));
const ResearcherHomePage=lazy(()=>import("./pages/ResearchHome").then(m=>({default:m.ResearchHome})));
const ResearchCommunityFeedPage=lazy(()=>import("./pages/ResearchCommunityFeed").then(m=>({default:m.ResearchCommunityFeed})));

const OntologyMappingReview=lazy(()=>import("./pages/OntologyMappingReview").then(m=>({default:m.OntologyMappingReview})));
const D01EdgeReviewRoute=lazy(()=>import("./pages/D01EdgeReview").then(m=>({default:m.D01EdgeReviewPage})));
const SyntheticValidationWorkbench=lazy(()=>import("./pages/SyntheticValidationWorkbench").then(m=>({default:m.SyntheticValidationWorkbench})));

const ClaimKnowledgeGraph=lazy(()=>import("./pages/ClaimKnowledgeGraph").then(m=>({default:m.ClaimKnowledgeGraph})));

const CapabilityLab=lazy(()=>import("./pages/CapabilityLab").then(m=>({default:m.CapabilityLab})));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={<Navigate to="/how-it-works" replace />} />
        <Route path="solutions" element={<Navigate to="/how-it-works" replace />} />
        <Route path="evidence-safety" element={<Navigate to="/trust" replace />} />
        <Route path="community" element={<Navigate to="/research/home" replace />} />
        <Route path="pricing" element={<Navigate to="/contact" replace />} />
        <Route path="contact" element={<Contact/>}/>
        <Route path="research/dashboard" element={<ResearchDashboard/>}/>
        <Route path="research/governance" element={<GovernanceDashboard/>}/>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="forgot-password" element={<PasswordRecovery key="request" mode="request" />} />
        <Route path="reset-password" element={<PasswordRecovery key="reset" mode="reset" />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="research/account" element={<ResearchAccount />} />
        <Route path="platform" element={<Navigate to="/how-it-works" replace />} />
        {import.meta.env.DEV && <Route path={"design/identity"} element={<IdentityStudy/>}/> }
        <Route path="intelligence" element={<Navigate to="/how-it-works" replace />} />
        <Route path="connected-intelligence" element={<Navigate to="/how-it-works" replace />} />
        <Route path="departments" element={<Navigate to="/knowledge-graph" replace />} />
        <Route path="departments/immunology" element={<Navigate to="/research/knowledge-graph?netDepartment=immunology" replace />} />
        <Route path="departments/neuroscience" element={<Navigate to="/research/knowledge-graph?netDepartment=neuroscience" replace />} />
        <Route path="departments/microbiome" element={<Navigate to="/research/knowledge-graph?netDepartment=microbiome" replace />} />
        <Route path="departments/metabolism" element={<Navigate to="/research/knowledge-graph?netDepartment=metabolism" replace />} />
        <Route path="departments/genomics-multi-omics" element={<Navigate to="/research/knowledge-graph?netDepartment=genomics-multi-omics" replace />} />
        <Route path="departments/human-physiology" element={<Navigate to="/research/knowledge-graph?netDepartment=human-physiology" replace />} />
        <Route path="intelligence/nexus" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/aegis" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/scout" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/lantern" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/prism" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/atlas" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/helix" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/parallax" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/vantage" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/horizon" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/veritas" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/arbiter" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/sentinel" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/caliber" element={<Navigate to="/how-it-works" replace />} />
        <Route path="intelligence/warden" element={<Navigate to="/how-it-works" replace />} />
        <Route path="context-conflict-audit" element={<ContextConflictAuditPage />} />
        <Route path="evidence-intelligence" element={<EvidenceIntelligencePage />} />
        <Route path="research-briefs" element={<Navigate to="/how-it-works" replace />} />
        <Route path="applications" element={<Navigate to="/how-it-works" replace />} />
        <Route path="knowledge-graph" element={<KnowledgeGraphPublicPage />} />
        <Route path="trust" element={<TrustPublicPage />} />
        <Route path="about" element={<AboutPublicPage />} />
        <Route path="technology" element={<Navigate to="/how-it-works" replace />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="explore" element={<Explore />} />
        <Route path="science" element={<Navigate to="/knowledge-graph" replace />} />
        <Route path="science/literature" element={<ScienceLiterature />} />
        <Route path="research/scientific-workbench" element={<ScientificResearchWorkbench />} />
        <Route path="research/ontology-review" element={<Suspense fallback={<p role="status">Loading mapping review…</p>}><OntologyMappingReview/></Suspense>} />
        <Route path="research/d01-edge-review" element={<Suspense fallback={<p role="status">Loading D-01 edge review…</p>}><D01EdgeReviewRoute/></Suspense>} />
        <Route path="research/validation" element={<Suspense fallback={<p role="status">Loading validation workspace…</p>}><SyntheticValidationWorkbench/></Suspense>} />
        <Route path="research/coverage" element={<ResearchCoverage />} />
        <Route path="research/evidence-readiness" element={<ResearchEvidenceCatalogue />} />
        <Route path="research/context-completion" element={<Suspense fallback={<p role="status">Loading context completion sheet…</p>}><ContextCompletionStatusRoute/></Suspense>} />
        <Route path="science/study-comparison" element={<ScienceStudyComparison />} />
        <Route path="science/review-preparation" element={<ScienceReviewPreparation />} />
        <Route path="research/scientific-review" element={<ScientificReviewerDecision />} />
        <Route path="science/body" element={<Navigate to="/knowledge-graph" replace />} />
        <Route path="research/capabilities" element={<CapabilityLab/>} />
        <Route path="research/knowledge-graph" element={<Suspense fallback={<p role="status" style={{padding:"3rem 1.5rem"}}>Loading knowledge graph…</p>}><ClaimKnowledgeGraph /></Suspense>} />
        <Route path="science/graph" element={<ScienceGraph />} />
        <Route path="science/paths" element={<SciencePaths />} />
        <Route path="science/contradictions" element={<ScienceContradictions />} />
        <Route path="research/decision-workbench" element={<AuthenticatedInterrogativeWorkbench />} />
        <Route path="research/mechanism-workflow" element={<Suspense fallback={<p role="status">Loading mechanism workflow…</p>}><ResearchMechanismWorkflowPage/></Suspense>} />
        <Route path="research/discovery-experience" element={<ScientificDiscoveryExperience/>} />
        <Route path="research/investigate" element={<Suspense fallback={<p role="status">Loading investigation…</p>}><ScientificInvestigationPage/></Suspense>} />
        <Route path="research/workspace" element={<Suspense fallback={<p role="status">Loading workspace…</p>}><InvestigationWorkspaceRoute/></Suspense>} />
        <Route path="welcome" element={<Suspense fallback={<p role="status">Loading…</p>}><WelcomeRoute/></Suspense>} />
        <Route path="research/gaps" element={<Suspense fallback={<p role="status">Loading gap register…</p>}><GapRegisterRoute/></Suspense>} />
        <Route path="research/ledger" element={<Suspense fallback={<p role="status">Loading ledger…</p>}><HypothesisLedgerRoute/></Suspense>} />
        <Route path="research/cohort" element={<Suspense fallback={<p role="status">Loading cohort…</p>}><CohortPlaneRoute/></Suspense>} />
        <Route path="research/targets" element={<Suspense fallback={<p role="status">Loading targets…</p>}><TargetWorkflowRoute/></Suspense>} />
        <Route path="research/prescreen" element={<Suspense fallback={<p role="status">Loading pre-screening…</p>}><TrialPrescreenRoute/></Suspense>} />
        <Route path="research/journey" element={<Suspense fallback={<p role="status">Loading walkthrough…</p>}><ResearchJourneyRoute/></Suspense>} />
        <Route path="research/methods" element={<Suspense fallback={<p role="status">Loading methods…</p>}><MethodsSharingRoute/></Suspense>} />
        <Route path="research/evaluation" element={<Suspense fallback={<p role="status">Loading evaluation…</p>}><EvaluationSetRoute/></Suspense>} />
        <Route path="research/home" element={<Suspense fallback={<p role="status">Loading workspace…</p>}><ResearcherHomePage/></Suspense>} />
        <Route path="research/community-feed" element={<Suspense fallback={<p role="status">Loading community…</p>}><ResearchCommunityFeedPage/></Suspense>} />
        <Route path="science/clinical-trials" element={<ScienceClinicalTrials />} />
        <Route path="science/research-agents" element={<ScienceResearchAgents />} />
        <Route path="science/zoom" element={<ScienceZoom />} />
        <Route path="science/connections" element={<ScienceConnections />} />
        <Route path="science/disease" element={<ScienceDisease />} />
        <Route path="discovery-engine" element={<DiscoveryEngine />} />
        <Route path="demo" element={<Navigate to="/research/journey" replace />} />
        <Route path="modules" element={<Navigate to="/how-it-works" replace />} />
        <Route path="modules/aksh-health" element={<Navigate to="/how-it-works" replace />} />
        <Route path="modules/clinical" element={<Navigate to="/how-it-works" replace />} />
        <Route path="modules/isi" element={<Navigate to="/how-it-works" replace />} />
        <Route path="modules/trials" element={<Navigate to="/how-it-works" replace />} />
        <Route path="products" element={<Navigate to="/how-it-works" replace />} />
        <Route path="status" element={<Status />} />
        <Route path="sources" element={<Sources />} />
        <Route path="clinical-timeline" element={<ClinicalTimeline />} />
        <Route path="trials-criteria" element={<TrialsCriteria />} />
        <Route path="gateway" element={<GatewayDemo />} />
        <Route path="systems" element={<Systems />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="discovery" element={<DiscoveryCentre />} />
        <Route path="curator" element={<Curator />} />
        <Route path="akeno" element={<Navigate to="/how-it-works" replace />} />
        <Route path="aksh-agents" element={<Navigate to="/how-it-works" replace />} />
        <Route path="for-isi" element={<Navigate to="/how-it-works" replace />} />
        <Route path="for-aksh" element={<Navigate to="/how-it-works" replace />} />
        <Route path="for-trials" element={<Navigate to="/how-it-works" replace />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="alignment" element={<Alignment />} />
        <Route path="docs" element={<Docs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
