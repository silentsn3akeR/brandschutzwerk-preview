import { initNavigation } from "../components/navigation.js";
import { initAccordions } from "../components/accordion.js";
import { initMobileStickyCta } from "../components/mobile-sticky-cta.js";
import { initMotion } from "./motion.js";
import { initPlaneContext } from "./context.js";
import { initPresentationMode } from "../modes/presentation.js";
import { initInspector } from "../modes/inspector.js";
import { initFounderHook } from "../modes/founder.js";
import { primaryMode } from "../modes/modes.js";
import { pageId } from "./dom.js";

/* CORE — bootstrap. Small on purpose: detect, initialise, dispatch. */

const PAGE_MODULES = {
  PAGE_HOME: "../pages/home.js",
  PAGE_TRAINING: "../pages/training.js",
  PAGE_ABOUT: "../pages/about.js",
  PAGE_REQUEST: "../pages/request.js",
  PAGE_REQUEST_SUCCESS: "../pages/request-success.js"
};

async function dispatchPageModule() {
  const target = PAGE_MODULES[pageId()];
  if (!target) return;
  try {
    const module = await import(target);
    if (typeof module.init === "function") module.init();
  } catch {
    /* A page module is optional during foundation. Absence is not an error. */
  }
}

function init() {
  document.documentElement.dataset.specVersion = "V2";
  initNavigation();
  initPlaneContext();
  initAccordions();
  initMobileStickyCta();
  initMotion();
  initPresentationMode();
  initInspector();
  initFounderHook();
  document.body.dataset.activeMode = primaryMode();
  void dispatchPageModule();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
