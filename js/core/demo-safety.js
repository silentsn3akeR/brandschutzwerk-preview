import { $$ } from "./dom.js";

/* CORE — demo safety contract.
   Returns machine-readable issue codes. Never renders anything into the public
   page; the inspector and QA harness are its only consumers. */

export function runDemoSafetyChecks() {
  const issues = [];

  const robots = document.querySelector('meta[name="robots"]');
  if (!robots || !/noindex/i.test(robots.content || "")) issues.push("DEMO_NO_NOINDEX");

  $$("img").forEach((img, i) => {
    if (!img.hasAttribute("alt")) issues.push(`IMAGE_MISSING_ALT:${img.getAttribute("src") || i}`);
  });

  $$("form").forEach((form) => {
    const action = form.getAttribute("action");
    if (action && action !== "#" && action !== "") issues.push(`EXTERNAL_FORM_ACTION:${action}`);
  });

  ["data-fake-review", "data-fake-customer", "data-fake-certification"].forEach((attr) => {
    if (document.querySelector(`[${attr}]`)) issues.push(`FORBIDDEN_DEMO_CONTENT:[${attr}]`);
  });

  $$("[href], [src]").forEach((el) => {
    const v = el.getAttribute("href") || el.getAttribute("src") || "";
    if (/^(https?:)?\/\//i.test(v)) issues.push(`EXTERNAL_REFERENCE:${v}`);
  });

  return {
    issues,
    counts: {
      demoData: $$("[data-demo]").length,
      realDataRequired: $$('[data-status="REAL_DATA_REQUIRED"]').length,
      fachlicheFreigabe: $$('[data-status="FACHLICHE_FREIGABE_REQUIRED"]').length,
      legalReview: $$('[data-status="LEGAL_REVIEW_REQUIRED"]').length
    }
  };
}
