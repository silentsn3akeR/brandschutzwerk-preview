import { $, $$ } from "./../core/dom.js";

/* COMPONENT — Live Dossier reaction (SP-04).

   One choice, four visible consequences: the chosen option, the sheet it sits
   on, the dossier row that just learned something, and the progress rail.

   This module knows nothing about the request's business rules and deliberately
   cannot. It watches the summary values the flow already writes and reacts to
   whatever changed — so it stays correct if a field is added, renamed or
   reordered, and it can never invent a value of its own. Everything it does is
   transient decoration: a data attribute for the length of one transition.

   js/pages/request.js remains the single writer of request state. */

const REACTION_MS = 700;

export function initDossier() {
  const summary = $("[data-component='RequestSummary']");
  if (!summary || !("MutationObserver" in window)) return { mounted: false };

  const values = $$("[data-summary-value]", summary);
  if (!values.length) return { mounted: false };

  const sheet = $(".request-sheet");
  const stepper = $("[data-component='RequestStepper']");
  const timers = new WeakMap();

  const react = (el) => {
    const row = el.closest("[data-summary-row]") || el;
    clearTimeout(timers.get(row));
    row.dataset.reacting = "true";
    timers.set(row, setTimeout(() => { delete row.dataset.reacting; }, REACTION_MS));
  };

  let ambientTimer = null;
  const ambient = () => {
    /* The surrounding planes acknowledge that something landed, once per
       change rather than once per element. */
    clearTimeout(ambientTimer);
    [sheet, stepper].forEach((el) => { if (el) el.dataset.reacting = "true"; });
    ambientTimer = setTimeout(() => {
      [sheet, stepper].forEach((el) => { if (el) delete el.dataset.reacting; });
    }, REACTION_MS);
  };

  const observer = new MutationObserver((records) => {
    let changed = false;
    records.forEach((record) => {
      const target = record.type === "characterData" ? record.target.parentElement : record.target;
      if (!target || !target.closest("[data-summary-value]")) return;
      react(target.closest("[data-summary-value]"));
      changed = true;
    });
    if (changed) ambient();
  });

  values.forEach((el) => observer.observe(el, {
    characterData: true, childList: true, subtree: true, attributes: true, attributeFilter: ["data-empty"],
  }));

  return { mounted: true, watched: values.length };
}
