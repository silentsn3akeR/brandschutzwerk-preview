/* CORE — tiny DOM helpers. No framework, no HTML generation from data. */

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const pageId = () => document.body.dataset.page || "UNKNOWN";
export const section = (id) => document.querySelector(`[data-section-id="${id}"]`);
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
