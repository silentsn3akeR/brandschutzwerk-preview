import { $$ } from "../core/dom.js";

/* COMPONENT — FAQAccordion. Behaviour only; content comes from page data. */

export function initAccordions() {
  const roots = $$("[data-component='FAQAccordion']");
  roots.forEach((root) => {
    const singleOpen = root.dataset.singleOpen !== "false";
    const triggers = $$(".accordion__trigger", root);

    const setState = (trigger, open) => {
      trigger.setAttribute("aria-expanded", String(open));
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      /* Motion contract: expansion/collapse is a CSS grid-row transition on
         `is-open`; the markup `hidden` attribute is only the no-JS fallback. */
      panel.hidden = false;
      panel.classList.toggle("is-open", open);
    };

    triggers.forEach((trigger) => {
      setState(trigger, trigger.getAttribute("aria-expanded") === "true");
      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") === "true";
        if (singleOpen) triggers.forEach((t) => setState(t, false));
        setState(trigger, !open);
      });
    });
  });
  return { accordions: roots.length };
}
