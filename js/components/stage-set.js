import { $, $$, prefersReducedMotion } from "./../core/dom.js";

/* COMPONENT — Stage Set (SP-02 Process Takeover).

   Marks which step the reader has reached. Nothing is pinned and nothing is
   intercepted: the section is a normal ~0.75-viewport block and the states
   simply follow the step nearest the middle of the screen as it passes.

   The earlier version drove a pinned takeover across roughly 2.5 viewports for
   three sentences. The choreography survived; the scroll cost did not.

   Below 1024px and under reduced motion every step is marked current, which is
   exactly the resting composition. */

const DESKTOP = "(min-width: 1024px)";

export function initStageSet() {
  const set = $("[data-component='ProcessTakeover']");
  if (!set) return { mounted: false };

  const stages = $$(".stage", set);
  const readout = $("[data-stage-current]", set);
  if (!stages.length) return { mounted: false };

  const linear = () => {
    stages.forEach((s) => { s.dataset.state = "current"; });
    if (readout) readout.textContent = "01";
  };

  const desktop = window.matchMedia(DESKTOP);
  const enabled = () => desktop.matches && !prefersReducedMotion() && "IntersectionObserver" in window;

  if (!enabled()) { linear(); return { mounted: true, mode: "linear", stages: stages.length }; }

  let visible = false;
  let queued = false;

  const paint = () => {
    queued = false;
    if (!visible) return;
    /* The step whose box is nearest the reading line — a little above centre —
       is the current one. One rect read per stage per frame, only while the set
       is on screen. */
    const line = window.innerHeight * 0.42;
    let index = 0;
    let best = Infinity;
    stages.forEach((stage, i) => {
      const rect = stage.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - line);
      if (distance < best) { best = distance; index = i; }
    });

    /* No tabindex management any more. Under the pinned takeover the
       non-current steps were genuinely unreadable, so removing them from the
       tab order was correct; in the compact rail every step is on screen and
       legible, and taking one out of the tab order would hide content from a
       keyboard that a mouse can reach. */
    stages.forEach((stage, i) => {
      stage.dataset.state = i === index ? "current" : (i < index ? "past" : "upcoming");
    });

    if (readout) readout.textContent = String(index + 1).padStart(2, "0");
  };

  const request = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    request();
  }, { threshold: 0 });
  io.observe(set);

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request, { passive: true });

  /* A viewport that leaves desktop — including a zoom change, which reports as
     a narrower viewport — returns the set to its linear composition. */
  desktop.addEventListener("change", () => { if (!enabled()) linear(); else request(); });

  request();
  return { mounted: true, mode: "takeover", stages: stages.length };
}
