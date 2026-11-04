import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Platform } from "./pages/Platform";
import { Technology } from "./pages/Technology";
import { Explore } from "./pages/Explore";
import { DiscoveryEngine } from "./pages/DiscoveryEngine";
import { Systems } from "./pages/Systems";
import { Evidence } from "./pages/Evidence";
import { ForIsi } from "./pages/ForIsi";
import { ForAksh } from "./pages/ForAksh";
import { ForTrials } from "./pages/ForTrials";
import { HowItWorks } from "./pages/HowItWorks";
import { Roadmap } from "./pages/Roadmap";
import { Alignment } from "./pages/Alignment";
import { Docs } from "./pages/Docs";
import { DiscoveryCentre } from "./pages/DiscoveryCentre";
import { AkenoConsumer } from "./pages/AkenoConsumer";
import { AkshAgents } from "./pages/AkshAgents";
import { Curator } from "./pages/Curator";
import { Products } from "./pages/Products";
import { Status } from "./pages/Status";
import { ClinicalTimeline } from "./pages/ClinicalTimeline";
import { TrialsCriteria } from "./pages/TrialsCriteria";
import { GatewayDemo } from "./pages/GatewayDemo";
import { Sources } from "./pages/Sources";
import { Science } from "./pages/Science";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="platform" element={<Platform />} />
        <Route path="technology" element={<Technology />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="explore" element={<Explore />} />
        <Route path="science" element={<Science />} />
        <Route path="discovery-engine" element={<DiscoveryEngine />} />
        <Route path="products" element={<Products />} />
        <Route path="status" element={<Status />} />
        <Route path="sources" element={<Sources />} />
        <Route path="clinical-timeline" element={<ClinicalTimeline />} />
        <Route path="trials-criteria" element={<TrialsCriteria />} />
        <Route path="gateway" element={<GatewayDemo />} />
        <Route path="systems" element={<Systems />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="discovery" element={<DiscoveryCentre />} />
        <Route path="curator" element={<Curator />} />
        <Route path="akeno" element={<AkenoConsumer />} />
        <Route path="aksh-agents" element={<AkshAgents />} />
        <Route path="for-isi" element={<ForIsi />} />
        <Route path="for-aksh" element={<ForAksh />} />
        <Route path="for-trials" element={<ForTrials />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="alignment" element={<Alignment />} />
        <Route path="docs" element={<Docs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
