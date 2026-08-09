import { $, section } from "../core/dom.js";

/* COMPONENT — MobileStickyCTA (COMP_MOBILE_STICKY_CTA, REUSE_TYPE=SHARED).

   Visibility is driven by section IDs, never by a scroll-offset guess: the bar
   appears once the anchor section has been passed and hides again near the
   sections that already carry the same call to action.

   The page supplies its own section IDs declaratively, so this module stays
   page-agnostic:

     data-after-section="HOME_01_HERO"
     data-hide-near="HOME_11_FINAL_CTA,HOME_12_FOOTER"

   The <=767px restriction and all motion live in
   css/components/mobile-sticky-cta.css. This module owns behaviour only. */

export function initMobileStickyCta() {
  const cta = $("[data-component='MobileStickyCTA']");
  if (!cta) return { mounted: false };

  const anchor = section(cta.dataset.afterSection || "");
  if (!anchor) return { mounted: false, reason: "MISSING_ANCHOR_SECTION" };

  const hideNear = (cta.dataset.hideNear || "")
    .split(",")
    .map((id) => section(id.trim()))
    .filter(Boolean);

  /* Revealed only once the behaviour is attached, so the bar cannot flash
     before its visibility rule can be evaluated. */
  cta.hidden = false;

  if (!("IntersectionObserver" in window)) return { mounted: true, mode: "static" };

  const watched = [anchor, ...hideNear];
  const inView = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) inView.add(entry.target);
      else inView.delete(entry.target);
    });
    const blocked = watched.some((el) => inView.has(el));
    cta.classList.toggle("is-visible", !blocked);
  }, { threshold: 0 });

  watched.forEach((el) => observer.observe(el));
  return { mounted: true, mode: "observed", watched: watched.length };
}
