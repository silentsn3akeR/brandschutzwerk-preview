import { $, $$ } from "../core/dom.js";
import { faq } from "../data/faq.js";



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

  return { page: "PAGE_TRAINING", implemented: true, faq: faqCheck };
}
