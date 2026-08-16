import { $, $$ } from "../core/dom.js";
import { assessBedarf, HAZARD, OUTCOME } from "../data/bedarf-model.js";



const RESULT_SLOT = {
  [OUTCOME.INFORMATION_INCOMPLETE]: "incomplete",
  [OUTCOME.REVIEW_RECOMMENDED]: "review",
  [OUTCOME.ORIENTATION_AVAILABLE]: "orientation",
};

const labelsFor = (root) => {
  const node = $("[data-bedarf-labels]", root);
  if (!node) return {};
  try { return JSON.parse(node.textContent); } catch { return {}; }
};

const toPositiveInt = (raw) => {
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = Number(raw);
  return Number.isInteger(n) ? n : NaN;
};

function readForm(form) {
  const hazardEl = $("input[name='hazard']:checked", form);
  const hazard = hazardEl && Object.values(HAZARD).includes(hazardEl.value)
    ? hazardEl.value
    : undefined;

  const conditions = {};
  for (const box of $$("input[name='condition']", form)) {
    if (box.checked) conditions[box.value] = true;
  }

  return {
    presentPerShift: toPositiveInt($("[data-bedarf-input='presentPerShift']", form)?.value),
    shifts: toPositiveInt($("[data-bedarf-input='shifts']", form)?.value),
    hazard,
    conditions,
  };
}

/* A result is only shown once the visitor has actually supplied something.
   Announcing "Angaben unvollständig" into a live region while someone is still
   typing the first digit is noise, not feedback. */
const hasInput = (form) =>
  Boolean($("[data-bedarf-input='presentPerShift']", form)?.value.trim())
  || Boolean($("input[name='hazard']:checked", form));

function project(root, form, labels) {
  const result = $("[data-bedarf-result]", root);
  if (!result) return;

  const idle = !hasInput(form);
  const assessment = idle ? null : assessBedarf(readForm(form));
  const active = idle ? "idle" : RESULT_SLOT[assessment.outcome];

  for (const block of $$("[data-bedarf-slot]", result)) {
    const name = block.dataset.bedarfSlot;
    if (name === "idle" || Object.values(RESULT_SLOT).includes(name)) {
      block.hidden = name !== active;
    }
  }
  result.dataset.state = idle ? "IDLE" : assessment.outcome;
  if (idle) return;

  const put = (slot, text) => {
    const el = $(`[data-bedarf-slot='${slot}']`, result);
    /* textContent only: never write visitor input as markup. */
    if (el) el.textContent = text;
  };
  /* SCHICHTEN_3 carries its number in the key, so it resolves through an
     authored template rather than a lookup. Everything else is a plain map. */
  const phrase = (group, key) => {
    const m = /^SCHICHTEN_(\d+)$/.exec(key);
    if (m && labels?.[group]?.SCHICHTEN) return labels[group].SCHICHTEN.replace("{n}", m[1]);
    return labels?.[group]?.[key] ?? key;
  };
  const list = (group, keys) => keys.map((k) => phrase(group, k)).join(", ");

  /* Clear the figure slots on every pass. A hidden block holding the last
     number is a leak waiting for a future change to un-hide it, and "no figure
     was produced" should be true in the DOM, not merely invisible. */
  put("figure", "");
  put("assumptions", "");
  put("total", "");

  if (assessment.outcome === OUTCOME.INFORMATION_INCOMPLETE) {
    put("missing", list("missing", assessment.missing));
    return;
  }

  if (assessment.outcome === OUTCOME.REVIEW_RECOMMENDED) {
    put("review-reason", list("reasons", assessment.reasons));
    return;
  }

  put("figure", String(assessment.orientationPerShift));
  put("assumptions", list("assumptions", assessment.assumptions));

  /* Only meaningful once more than one shift has to be covered: repeating the
     same number as a "total" for a single shift reads like a second finding. */
  const template = labels?.total;
  put("total", template && assessment.orientationTotal !== assessment.orientationPerShift
    ? template
        .split("{shifts}").join(String(assessment.orientationTotal / assessment.orientationPerShift))
        .split("{total}").join(String(assessment.orientationTotal))
    : "");
}

export function initBedarfscheck(scope = document) {
  const forms = $$("[data-component='Bedarfscheck']", scope);
  if (!forms.length) return { mounted: 0 };

  for (const form of forms) {
    const root = form.closest("[data-section-id]") || form;
    const labels = labelsFor(root);

    /* The form never submits: there is no endpoint and nothing is transmitted,
       which is the same promise the request flow makes. */
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("input", () => project(root, form, labels));
    form.addEventListener("change", () => project(root, form, labels));

    project(root, form, labels);
  }
  return { mounted: forms.length };
}
