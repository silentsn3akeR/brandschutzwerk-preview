import { $$, prefersReducedMotion } from "./dom.js";

/* CORE — reveal engine. IntersectionObserver only, no animation library.
   Stagger is declarative via data-delay; this module never writes inline styles. */

export function initMotion() {
  const nodes = $$(".reveal, .reveal-image");
  if (!nodes.length) return { revealed: 0, mode: "none" };

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return { revealed: nodes.length, mode: "immediate" };
  }

  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      self.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  nodes.forEach((n) => observer.observe(n));
  return { revealed: nodes.length, mode: "observed" };
}
