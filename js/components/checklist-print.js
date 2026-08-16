import { $$ } from "../core/dom.js";

/* COMPONENT — checklist print control. Behaviour only, and deliberately almost
   nothing.

   The checklists are plain markup with native checkboxes, so they work, print
   and stay accessible with no script at all. The one thing a page cannot do
   without JavaScript is open the print dialogue, so that button is authored
   `hidden` and revealed here. A visitor without JavaScript therefore sees no
   dead control, and still has Ctrl+P and a print stylesheet.

   No state is kept. Ticks live in the DOM until the page is reloaded and are
   never written to storage, a cookie or a server: a checklist that quietly
   remembers what a company has not yet done is a record nobody asked us to
   keep. That is also why there is no progress count and no readiness badge —
   "87 % vorbereitet" would be a compliance claim wearing a progress bar. */

export function initChecklistPrint(scope = document) {
  const buttons = $$("[data-checklist-print]", scope);
  for (const button of buttons) {
    button.hidden = false;
    button.addEventListener("click", () => window.print());
  }
  return { mounted: buttons.length };
}
