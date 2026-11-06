import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@fontsource-variable/host-grotesk/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./styles/global.css";
import "./styles/marketing-v2.css";
import "./styles/experience.css";
import "./styles/site-chrome.css";
import "./styles/editorial-site.css";

const root=document.getElementById("root")!;
const app=<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>;
// Query-driven screens render afresh; public static pages hydrate only their exact route.
if(root.dataset.prerendered===window.location.pathname&&!window.location.search){hydrateRoot(root,app)}else{createRoot(root).render(app)}
