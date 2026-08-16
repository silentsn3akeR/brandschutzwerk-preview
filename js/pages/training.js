import { $, $$ } from "../core/dom.js";
import { faq } from "../data/faq.js";
import { initBedarfscheck } from "../components/bedarfscheck.js";
import { initChecklistPrint } from "../components/checklist-print.js";
import { initAuffrischungscheck } from "../components/auffrischungscheck.js";



function verifyFaqMirror() {
  const items = $$("[data-component='FAQAccordion'] .accordion__item");
  const expected = faq.training;
  const mismatches = [];

  if (items.length !== expected.length) {
    mismatches.push(`COUNT:${items.length}!=${expected.length}`);
    return { checked: items.length, mismatches };
  }

  expected.forEach((entry, i) => {
    const item = items[i];
    const question = $(".accordion__trigger", item)?.textContent.trim() ?? "";
    const answer = $(".accordion__panel-inner p", item)?.textContent.trim() ?? "";
    if (item.dataset.faqId !== entry.id) mismatches.push(`ID:${item.dataset.faqId}`);
    if (!question.startsWith(entry.question)) mismatches.push(`Q:${entry.id}`);
    if (answer !== entry.answer) mismatches.push(`A:${entry.id}`);
  });

  return { checked: items.length, mismatches };
}

export function init() {
  const faqCheck = verifyFaqMirror();

  if (faqCheck.mismatches.length) {
    console.warn("PAGE_TRAINING FAQ mirror mismatch", faqCheck.mismatches);
  }

  /* TRAINING_09_BEDARF. The page still has no logic of its own: the decision
     is the model's and the copy is the markup's, so this is a mount call. */
  const bedarf = initBedarfscheck();

  /* TRAINING_10_CHECKLISTS. Only reveals the print control — the checklists
     themselves are markup and native controls, and need no script. */
  const checklists = initChecklistPrint();

  /* TRAINING_11_AUFFRISCHUNG. Mount only: which of the two rules applies is
     the model's decision, and every sentence is authored in the markup. */
  const auffrischung = initAuffrischungscheck();

  return { page: "PAGE_TRAINING", implemented: true, faq: faqCheck, bedarf, checklists, auffrischung };
}
