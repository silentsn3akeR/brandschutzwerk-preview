import { $$, pageId } from "../core/dom.js";
import { activeModes } from "./modes.js";
import { runDemoSafetyChecks } from "../core/demo-safety.js";
import { SITE } from "../core/config.js";

/* MODE — ?inspect=1. Internal QA/spec inspection. Never mounted by default. */

export function initInspector() {
  if (!activeModes().inspect) return { mounted: false };

  const safety = runDemoSafetyChecks();
  document.body.classList.add("is-inspecting");

  const panel = document.createElement("aside");
  panel.className = "demo-inspector";
  panel.dataset.component = "DemoInspector";
  panel.setAttribute("aria-label", "Demo Inspector");

  const rows = [
    ["Spec", SITE.specVersion],
    ["Page", pageId()],
    ["Section", "—"],
    ["Viewport", `${window.innerWidth} × ${window.innerHeight}`],
    ["Components", String($$("[data-component]").length)],
    ["Assets", String($$("[data-asset-id]").length)],
    ["Demo", String(safety.counts.demoData)],
    ["Required", String(safety.counts.realDataRequired)],
    ["QA", safety.issues.length ? `${safety.issues.length} issue(s)` : "PASS"]
  ];

  panel.innerHTML = '<p class="demo-inspector__title">Demo Inspector</p>';
  const map = {};
  rows.forEach(([k, v]) => {
    const row = document.createElement("div");
    row.className = "demo-inspector__row";
    const dt = document.createElement("span"); dt.textContent = k;
    const dd = document.createElement("strong"); dd.textContent = v;
    row.append(dt, dd); panel.append(row); map[k] = dd;
  });
  document.body.append(panel);

  window.addEventListener("resize", () => {
    map.Viewport.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  });

  const sections = $$("[data-section-id]");
  if (sections.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) map.Section.textContent = visible.target.dataset.sectionId;
    }, { threshold: [0.15, 0.35, 0.55] });
    sections.forEach((s) => obs.observe(s));
  }

  if (safety.issues.length) {
    console.groupCollapsed("BrandschutzWerk demo safety");
    safety.issues.forEach((i) => console.warn(i));
    console.groupEnd();
  }
  return { mounted: true, issues: safety.issues.length };
}
