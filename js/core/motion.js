import { $$, prefersReducedMotion } from "./dom.js";

/* CORE — reveal engine. IntersectionObserver only, no animation library.
   Stagger is declarative via data-delay; this module never writes inline styles. */

export function initMotion() {
  const nodes = $$(".reveal, .reveal-image");
  const reduced = prefersReducedMotion();

  if (!nodes.length) return { revealed: 0, mode: "none", ...initAmbient(reduced) };

  if (reduced || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return { revealed: nodes.length, mode: "immediate", ...initAmbient(reduced) };
  }

  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      self.unobserve(entry.target);
    });
  }, {
    /* threshold 0, not a fraction of the element. A fractional threshold asks
       how much of the ELEMENT is on screen, which gets harder to satisfy the
       taller the element is — and the story columns in this design are narrow,
       so blocks are tall. Combined with fast scrolling that made reveals a race
       a long page eventually loses, and it lost differently on each run.
       The bottom margin is positive, which extends the band BELOW the viewport
       so an element reveals just before it is scrolled to. A negative bottom
       margin shrinks the band instead, which leaves less room for error the
       nearer an element sits to the end of a long document. */
    threshold: 0,
    rootMargin: "0px 0px 8% 0px",
  });

  /* Anything already in the viewport is revealed synchronously rather than
     waiting for the observer's first callback. That callback is asynchronous,
     so a page that scrolls immediately after load — a harness, a restored
     scroll position, an anchor jump — can move an above-the-fold element out of
     view before the callback is computed, and it then stays hidden forever
     because the observer never sees it intersect again. The hero heading is the
     tallest and most exposed case. */
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  nodes.forEach((n) => {
    const rect = n.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < viewportHeight) n.classList.add("is-visible");
    else observer.observe(n);
  });
  return { revealed: nodes.length, mode: "observed", ...initAmbient(reduced) };
}

/* M4 — scroll-linked ambient movement.

   The rule the previous system had no need for: never read layout inside a
   scroll handler. Each layer's offset is measured once by the
   IntersectionObserver that also decides whether it is on screen at all, the
   scroll listener only records a number, and a single rAF pass writes one
   custom property per active layer. Nothing reads the DOM during the write.

   The property is a unitless number; motion.css multiplies it by the per-depth
   factor, so the parallax strength lives with the rest of the motion grammar
   rather than in this file. */
function initParallax(reduced) {
  const layers = $$(".parallax-layer");
  if (reduced || !layers.length || !("IntersectionObserver" in window)) {
    return { parallax: 0 };
  }

  const active = new Set();
  const anchors = new WeakMap();

  const measure = (el) => {
    const rect = el.getBoundingClientRect();
    anchors.set(el, rect.top + window.scrollY + rect.height / 2);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { measure(entry.target); active.add(entry.target); }
      else { active.delete(entry.target); entry.target.style.removeProperty("--parallax"); }
    });
  }, { rootMargin: "20% 0px 20% 0px" });

  layers.forEach((l) => io.observe(l));

  let scrollY = window.scrollY;
  let queued = false;

  const write = () => {
    queued = false;
    const mid = scrollY + window.innerHeight / 2;
    active.forEach((el) => {
      const anchor = anchors.get(el);
      if (anchor === undefined) return;
      /* Clamped so a tall layer near the top of a long page cannot accumulate a
         large offset and drift out of its own composition. */
      const offset = Math.max(-60, Math.min(60, (mid - anchor) * 0.06));
      el.style.setProperty("--parallax", offset.toFixed(2));
    });
  };

  const onScroll = () => {
    scrollY = window.scrollY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(write);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { active.forEach(measure); onScroll(); }, { passive: true });
  onScroll();

  return { parallax: layers.length };
}

/* M1 — magnetic response on the primary action.

   Fine pointers only, and only a few pixels: enough that the control feels like
   it acknowledges the cursor, not so much that the hit target moves out from
   under it. The values are written as unitless numbers and multiplied in CSS,
   which keeps the magnitude in the stylesheet with the rest of the motion. */
function initMagnetic(reduced) {
  const controls = $$(".btn--magnetic");
  if (reduced || !controls.length) return { magnetic: 0 };
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return { magnetic: 0 };

  controls.forEach((el) => {
    let queued = false;
    let point = null;

    const write = () => {
      queued = false;
      if (!point) { el.style.removeProperty("--btn-mx"); el.style.removeProperty("--btn-my"); return; }
      el.style.setProperty("--btn-mx", point.x.toFixed(2));
      el.style.setProperty("--btn-my", point.y.toFixed(2));
    };

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      point = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 8,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 5,
      };
      if (queued) return;
      queued = true;
      requestAnimationFrame(write);
    });

    el.addEventListener("pointerleave", () => {
      point = null;
      if (queued) return;
      queued = true;
      requestAnimationFrame(write);
    });
  });

  return { magnetic: controls.length };
}

function initAmbient(reduced) {
  return { ...initParallax(reduced), ...initMagnetic(reduced) };
}
