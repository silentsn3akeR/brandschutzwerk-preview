import { $, $$ } from "./dom.js";

/* CORE — plane context for cross-context elements.

   The plane system resolves --ctx-* from the plane an element is DECLARED in.
   That is correct for everything that lives inside one section, and wrong for
   the one element that crosses all of them: the sticky header travels over ink
   heroes, paper sections and the ember scene, and a single material cannot
   serve all three. Declaring it ink made it legible over the heroes and left
   the navigation at 1.36:1 over a paper section — a real contrast failure that
   no test caught, because the island only exists while scrolled.

   This module answers one question — which plane is directly beneath the
   header right now — and writes the answer to a data attribute. Every visual
   consequence is CSS. It is deliberately not a runtime design engine: no
   styles are written here, nothing is measured on scroll, and if the module
   never runs the header keeps its authored default.

   The probe is a 1px band pinned just under the header, expressed as a
   rootMargin rather than as a scroll calculation. Whatever plane intersects
   that band is what the header is currently sitting on. */

const CONTEXT_BY_PLANE = [
  ["plane-deep", "dark"],
  ["plane-ink", "dark"],
  ["surface-authority", "dark"],
  ["request-scene", "ember"],
  ["plane-raised", "light"],
  ["plane-paper", "light"],
  ["surface-functional", "light"],
  ["surface-editorial", "light"],
];

function contextOf(el) {
  for (const [className, context] of CONTEXT_BY_PLANE) {
    if (el.classList.contains(className)) return context;
  }
  return null;
}

export function initPlaneContext() {
  const header = $(".site-header") || $(".request-header");
  if (!header) return { mounted: false };

  /* Every element that declares a plane is a candidate surface. Ordering
     matters only for elements carrying more than one plane class, which the
     table above resolves deterministically. */
  const planes = $$(".plane, [class*='surface-'], .request-scene")
    .filter((el) => contextOf(el) !== null);

  if (!planes.length || !("IntersectionObserver" in window)) {
    return { mounted: false, planes: planes.length };
  }

  const headerHeight = () =>
    header.getBoundingClientRect().height ||
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) * 16;

  let observer = null;
  const active = new Set();

  const apply = () => {
    /* When two planes touch inside the band, the later one in document order
       is the one scrolling in, so it wins. */
    let chosen = null;
    planes.forEach((el) => { if (active.has(el)) chosen = el; });
    const context = chosen ? contextOf(chosen) : null;
    if (context) header.dataset.context = context;
    else delete header.dataset.context;
  };

  const build = () => {
    if (observer) observer.disconnect();
    const h = Math.round(headerHeight());
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      });
      apply();
    }, {
      /* A band one pixel tall, sitting just below the header's lower edge. */
      rootMargin: `-${h}px 0px -${Math.max(0, window.innerHeight - h - 1)}px 0px`,
      threshold: 0,
    });
    active.clear();
    planes.forEach((el) => observer.observe(el));
  };

  build();

  /* The band depends on viewport height and on the header's own height, which
     changes at the mobile breakpoint and when the island contracts. Rebuilding
     on resize is cheap and keeps the probe honest. */
  let resizeQueued = false;
  window.addEventListener("resize", () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; build(); });
  }, { passive: true });

  return { mounted: true, planes: planes.length };
}
