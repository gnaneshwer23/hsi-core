import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Systems } from "./pages/Systems";
import { Evidence } from "./pages/Evidence";
import { ForIsi } from "./pages/ForIsi";
import { ForAksh } from "./pages/ForAksh";
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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="status" element={<Status />} />
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
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="alignment" element={<Alignment />} />
        <Route path="docs" element={<Docs />} />
      </Route>
    </Routes>
  );
}
