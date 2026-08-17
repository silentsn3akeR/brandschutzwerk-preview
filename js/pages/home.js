import { initStageSet } from "../components/stage-set.js";
import { $, $$ } from "../core/dom.js";
import { demoPricing } from "../data/demo-pricing.js";
import { faq } from "../data/faq.js";

/* ------------------------------------------------------- HOME_08_QUOTE_PREVIEW
   COMP_QUOTE_PREVIEW: DEFAULT / SELECTED / POSTAL_INVALID / CUSTOM_INQUIRY.
   Prices come from js/data/demo-pricing.js — the single demo price source.
   A band without a price (20+) must never render an invented number. */

const CUSTOM_INQUIRY_LABEL = "Individuell anfragen";
const POSTAL_LENGTH = 5;

function formatDemoPrice(value) {
  return `${new Intl.NumberFormat("de-DE").format(value)} €`;
}

function initQuotePreview() {
  const widget = $("[data-component='QuotePreview']");
  if (!widget) return { mounted: false };

  const options = $$("[data-quote-options] .selectable-card", widget);
  const result = $("[data-quote-result]", widget);
  const price = $("[data-quote-price]", widget);
  const suffix = $("[data-quote-suffix]", widget);
  const plz = $("[data-quote-plz]", widget);
  const plzError = $("[data-quote-plz-error]", widget);
  if (!options.length || !result || !price) return { mounted: false };

  const applyBand = (band) => {
    const amount = demoPricing.bands[band];
    const isCustom = amount === null || amount === undefined;
    result.dataset.state = isCustom ? "custom" : "default";
    price.textContent = isCustom ? CUSTOM_INQUIRY_LABEL : formatDemoPrice(amount);
    if (suffix) suffix.hidden = isCustom;
  };

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((o) => o.setAttribute("aria-pressed", String(o === option)));
      applyBand(option.dataset.band);
    });
  });

  /* Reflect the band that ships pressed in the markup, so the rendered price
     and the selected card can never disagree on first paint. */
  const preselected = options.find((o) => o.getAttribute("aria-pressed") === "true");
  if (preselected) applyBand(preselected.dataset.band);

  if (plz && plzError) {
    const validate = () => {
      const digits = plz.value.replace(/\D/g, "").slice(0, POSTAL_LENGTH);
      if (digits !== plz.value) plz.value = digits;
      const invalid = digits.length > 0 && digits.length < POSTAL_LENGTH;
      plzError.hidden = !invalid;
      plz.setAttribute("aria-invalid", String(invalid));
      return !invalid;
    };
    plz.addEventListener("input", validate);
    plz.addEventListener("blur", validate);
  }

  return { mounted: true, bands: options.length };
}

/* HOME_GLOBAL_MOBILE_STICKY_CTA is no longer implemented here. The shared
   js/components/mobile-sticky-cta.js owns the behaviour and the bootstrap
   initialises it; this page only configures it declaratively in index.html
   through data-after-section and data-hide-near. */

/* ------------------------------------------------------------- HOME_10_FAQ
   The FAQ is authored as static HTML so it works without JavaScript. This
   check keeps that markup and js/data/faq.js from drifting apart; it reports,
   it never rewrites the page. */

function verifyFaqMirror() {
  const items = $$("[data-component='FAQAccordion'] .accordion__item");
  const expected = faq.home;
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
  /* HOME_05_PROCESS. Marks the current step of the pinned stage set; the
     section is a complete linear composition without it. */
  const stageSet = initStageSet();

  const quote = initQuotePreview();
  const faqCheck = verifyFaqMirror();

  if (faqCheck.mismatches.length) {
    console.warn("PAGE_HOME FAQ mirror mismatch", faqCheck.mismatches);
  }

  return { stageSet, page: "PAGE_HOME", implemented: true, quote, faq: faqCheck };
}
