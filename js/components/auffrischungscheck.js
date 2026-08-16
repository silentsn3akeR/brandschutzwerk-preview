import { $, $$ } from "../core/dom.js";
import { assessAuffrischung, SINCE, OUTCOME } from "../data/auffrischung-model.js";



const SLOT = {
  [OUTCOME.EARLIER_REPETITION_REQUIRED]: "required",
  [OUTCOME.REFRESH_RECOMMENDED]: "recommended",
  [OUTCOME.NO_TIME_BASED_ACTION_YET]: "none",
  [OUTCOME.REVIEW_INFORMATION]: "review",
};

const labelsFor = (root) => {
  const node = $("[data-auff-labels]", root);
  if (!node) return {};
  try { return JSON.parse(node.textContent); } catch { return {}; }
};

function readForm(form) {
  const sinceEl = $("input[name='since']:checked", form);
  const since = sinceEl && Object.values(SINCE).includes(sinceEl.value) ? sinceEl.value : undefined;

  const changes = {};
  for (const box of $$("input[name='change']", form)) {
    if (box.checked) changes[box.value] = true;
  }
  const changesUnknown = Boolean($("input[name='changesUnknown']", form)?.checked);
  return { since, changes, changesUnknown };
}

/* Nothing is shown until the visitor has actually answered something. */
const answered = (form) =>
  Boolean($("input[name='since']:checked", form))
  || $$("input[name='change'], input[name='changesUnknown']", form).some((b) => b.checked);

function project(root, form, labels) {
  const result = $("[data-auff-result]", root);
  if (!result) return;

  const idle = !answered(form);
  const a = idle ? null : assessAuffrischung(readForm(form));
  const active = idle ? "idle" : SLOT[a.outcome];

  for (const block of $$("[data-auff-slot]", result)) {
    const name = block.dataset.auffSlot;
    if (name === "idle" || Object.values(SLOT).includes(name)) block.hidden = name !== active;
  }
  result.dataset.state = idle ? "IDLE" : a.outcome;
  if (idle) return;

  const put = (slot, text) => { const el = $(`[data-auff-slot='${slot}']`, result); if (el) el.textContent = text; };
  const phrase = (group, key) => labels?.[group]?.[key] ?? key;

  /* Cleared every pass: a hidden block still holding the last answer is a
     claim waiting for a future change to un-hide it. */
  put("triggers", "");
  put("override", "");
  put("missing", "");

  if (a.outcome === OUTCOME.REVIEW_INFORMATION) {
    put("missing", a.missing.map((m) => phrase("missing", m)).join(", "));
    return;
  }
  if (a.outcome === OUTCOME.EARLIER_REPETITION_REQUIRED) {
    put("triggers", a.triggers.map((t) => phrase("triggers", t)).join(", "));
    /* Only said when it is actually surprising: recent training, trigger anyway. */
    if (a.overridesTime && labels?.override) put("override", labels.override);
  }
}

export function initAuffrischungscheck(scope = document) {
  const forms = $$("[data-component='Auffrischungscheck']", scope);
  if (!forms.length) return { mounted: 0 };

  for (const form of forms) {
    const root = form.closest("[data-section-id]") || form;
    const labels = labelsFor(root);

    /* Nothing is transmitted and nothing is stored — same promise the rest of
       the site makes. */
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("change", () => project(root, form, labels));
    project(root, form, labels);
  }
  return { mounted: forms.length };
}
