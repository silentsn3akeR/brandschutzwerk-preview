import { $, $$ } from "../core/dom.js";
import { sessionState } from "../core/storage.js";
import { siteUrl, ROUTES } from "../core/config.js";



const STORAGE_SCHEMA_VERSION = 1;
const STEP_COUNT = 5;
const STEP_LABELS = ["Leistung", "Teilnehmer", "Standort", "Zeitraum", "Kontakt"];

/* Copy Deck error strings. The three selection prompts have no Copy Deck record
   and the source specification could not be consulted (SOURCE_SPEC_MISMATCH),
   so one shared, plain-language prompt is used and disclosed in the report. */
const MSG = Object.freeze({
  SELECT: "Bitte wählen Sie eine Option aus.",
  POSTAL: "Bitte geben Sie eine gültige fünfstellige PLZ ein.",
  CITY: "Bitte geben Sie einen Ort ein.",
  COMPANY: "Bitte geben Sie Ihr Unternehmen an.",
  CONTACT: "Bitte geben Sie einen Ansprechpartner an.",
  EMAIL_EMPTY: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
  EMAIL_INVALID: "Bitte prüfen Sie die eingegebene E-Mail-Adresse.",
  GLOBAL: "Etwas hat nicht funktioniert. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.",
  SUBMIT_LOADING: "Anfrage wird vorbereitet …"
});

/* Structured rather than one large regex: each condition is a real failure mode
   and can be reasoned about. A naive /\S+@\S+/ would accept "a@b" and reject
   nothing that matters. */
function isPlausibleEmail(raw) {
  const value = String(raw).trim();
  if (/\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!domain || domain.length > 255) return false;
  if (!domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  const tld = domain.split(".").pop();
  return tld.length >= 2 && /^[A-Za-z]+$/.test(tld);
}

/* FIELD_* ids come from DATA_REGISTRY_V2. `required` follows GATE_07_REQUEST:
   service, participants, postal code, city, timing, company, contact name and
   email are required; location count, location note, preferred date, phone and
   message are optional. */
const RULES = Object.freeze({
  FIELD_SERVICE:        { step: 1, kind: "choice", required: true,  validate: (v) => (v ? null : MSG.SELECT) },
  FIELD_PARTICIPANTS:   { step: 2, kind: "choice", required: true,  validate: (v) => (v ? null : MSG.SELECT) },
  FIELD_LOCATION_COUNT: { step: 2, kind: "choice", required: false, validate: () => null },
  FIELD_POSTAL_CODE:    { step: 3, kind: "input",  required: true,  validate: (v) => (/^\d{5}$/.test(String(v).trim()) ? null : MSG.POSTAL) },
  FIELD_CITY:           { step: 3, kind: "input",  required: true,  validate: (v) => (String(v).trim() ? null : MSG.CITY) },
  FIELD_LOCATION_NOTE:  { step: 3, kind: "input",  required: false, validate: () => null },
  FIELD_TIMING:         { step: 4, kind: "choice", required: true,  validate: (v) => (v ? null : MSG.SELECT) },
  FIELD_PREFERRED_DATE: { step: 4, kind: "input",  required: false, validate: () => null },
  FIELD_COMPANY:        { step: 5, kind: "input",  required: true,  validate: (v) => (String(v).trim() ? null : MSG.COMPANY) },
  FIELD_CONTACT_NAME:   { step: 5, kind: "input",  required: true,  validate: (v) => (String(v).trim() ? null : MSG.CONTACT) },
  FIELD_EMAIL:          { step: 5, kind: "input",  required: true,
    validate: (v) => (!String(v).trim() ? MSG.EMAIL_EMPTY : (isPlausibleEmail(v) ? null : MSG.EMAIL_INVALID)) },
  FIELD_PHONE:          { step: 5, kind: "input",  required: false, validate: () => null },
  FIELD_MESSAGE:        { step: 5, kind: "input",  required: false, validate: () => null }
});

const FIELD_IDS = Object.keys(RULES);

/* Per-field state, not one status for the whole form: a field can be untouched
   and invalid at the same time, and only touched fields may show an error. */
function blankField(id) {
  return { value: "", validationStatus: "PRISTINE", touched: false, dirty: false,
           required: RULES[id].required, error: null };
}

const state = {
  machine: "INITIAL",
  step: 1,
  direction: "forward",
  submitting: false,
  fields: Object.fromEntries(FIELD_IDS.map((id) => [id, blankField(id)]))
};

/* Storage is optional. If sessionStorage is unavailable — private mode, a
   blocked origin, a full quota — the flow continues from memory and the user
   never sees a failure. */
let storageAvailable = true;

function persist() {
  const payload = {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    step: state.step,
    values: Object.fromEntries(FIELD_IDS.map((id) => [id, state.fields[id].value]))
  };
  const okWrite = sessionState.write(payload);
  if (!okWrite) storageAvailable = false;
  return okWrite;
}

function restore() {
  let stored = null;
  try { stored = sessionState.read(); }
  catch { storageAvailable = false; return false; }

  if (!stored || typeof stored !== "object") return false;
  if (stored.schemaVersion !== STORAGE_SCHEMA_VERSION) return false;
  if (!stored.values || typeof stored.values !== "object") return false;

  FIELD_IDS.forEach((id) => {
    const v = stored.values[id];
    if (typeof v === "string") { state.fields[id].value = v; state.fields[id].dirty = !!v; }
  });

  const step = Number(stored.step);
  state.step = Number.isInteger(step) && step >= 1 && step <= STEP_COUNT ? step : 1;
  return true;
}

/* ------------------------------------------------------------------ RENDER */

function fieldError(id) { return $(`[data-error-for="${id}"]`); }

function renderFieldError(id) {
  const el = fieldError(id);
  if (!el) return;
  const f = state.fields[id];
  const show = f.touched && f.error;
  el.textContent = show ? f.error : "";
  el.hidden = !show;

  const control = $(`[data-field-id="${id}"] .field__control`);
  if (control) control.setAttribute("aria-invalid", String(!!show));
  const group = $(`[data-field-id="${id}"]`);
  if (group) group.dataset.status = show ? "INVALID" : (f.validationStatus === "VALID" ? "VALID" : "PRISTINE");
}

function renderStepper() {
  const stepper = $("[data-component='RequestStepper']");
  if (stepper) {
    stepper.dataset.currentStep = String(state.step);
    $$(".stepper__step", stepper).forEach((li) => {
      const i = Number(li.dataset.stepperIndex);
      if (i < state.step) li.dataset.stepperState = "done";
      else delete li.dataset.stepperState;
      if (i === state.step) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
  }
  const status = $("[data-stepper-status]");
  if (status) status.textContent = `Schritt ${state.step} von ${STEP_COUNT} · ${STEP_LABELS[state.step - 1]}`;
}

const SERVICE_LABELS = {
  brandschutzhelfer: "Brandschutzhelfer-Ausbildung",
  feuerloeschertraining: "Feuerlöschertraining",
  evakuierung: "Evakuierung & Räumung",
  unsicher: "Noch unsicher"
};
const PARTICIPANT_LABELS = {
  "1-10": "1–10 Personen", "11-15": "11–15 Personen",
  "16-20": "16–20 Personen", "20+": "Mehr als 20 Personen"
};
const LOCATION_COUNT_LABELS = { "1": "1 Standort", "2-3": "2–3 Standorte", "4+": "4 oder mehr Standorte" };
const TIMING_LABELS = {
  asap: "So schnell wie möglich", "4-wochen": "Innerhalb der nächsten 4 Wochen",
  "1-3-monate": "In 1–3 Monaten", offen: "Noch offen"
};

function summaryValues() {
  const v = (id) => state.fields[id].value;
  const place = [v("FIELD_POSTAL_CODE"), v("FIELD_CITY")].filter(Boolean).join(" ");
  return {
    service: SERVICE_LABELS[v("FIELD_SERVICE")] || null,
    participants: PARTICIPANT_LABELS[v("FIELD_PARTICIPANTS")] || null,
    locationCount: LOCATION_COUNT_LABELS[v("FIELD_LOCATION_COUNT")] || null,
    location: place || null,
    timing: TIMING_LABELS[v("FIELD_TIMING")] || null
  };
}

const EMPTY_LABEL = { service: "Noch keine Schulung gewählt" };

function renderSummary() {
  const values = summaryValues();
  Object.entries(values).forEach(([key, value]) => {
    const el = $(`[data-summary-value="${key}"]`);
    if (!el) return;
    /* textContent only — user input is never written as markup. */
    el.textContent = value || EMPTY_LABEL[key] || "—";
    el.dataset.empty = String(!value);
  });
}

function renderStep() {
  $$("[data-step-index]").forEach((section) => {
    section.hidden = Number(section.dataset.stepIndex) !== state.step;
  });
  const form = $("[data-request-form]");
  if (form) form.dataset.direction = state.direction;
  renderStepper();
}

function render() {
  renderStep();
  renderSummary();
  FIELD_IDS.forEach(renderFieldError);
}

/* -------------------------------------------------------------- VALIDATION */

function validateField(id) {
  const f = state.fields[id];
  const error = RULES[id].validate(f.value);
  f.error = error;
  f.validationStatus = error ? "INVALID" : "VALID";
  return !error;
}

function validateStep(stepIndex, { markTouched = true } = {}) {
  const ids = FIELD_IDS.filter((id) => RULES[id].step === stepIndex && RULES[id].required);
  let firstInvalid = null;
  ids.forEach((id) => {
    if (markTouched) state.fields[id].touched = true;
    if (!validateField(id) && !firstInvalid) firstInvalid = id;
  });
  ids.forEach(renderFieldError);
  return { valid: !firstInvalid, firstInvalid };
}

function focusInvalid(id) {
  const control = $(`[data-field-id="${id}"] .field__control`);
  if (control) { control.focus(); return; }
  const option = $(`[data-field-id="${id}"] .selectable-card`);
  if (option) option.focus();
}

/* -------------------------------------------------------------- NAVIGATION */

function goToStep(next, direction) {
  state.direction = direction;
  state.step = Math.min(Math.max(next, 1), STEP_COUNT);
  state.machine = "STEP_ACTIVE";
  render();
  persist();
  /* Focus the new step's question so keyboard and screen-reader users land at
     the top of the new task rather than wherever the previous button was. */
  const heading = $(`[data-step-index="${state.step}"] .request-step__question`);
  if (heading) heading.focus();
}

function handleNext() {
  state.machine = "VALIDATING";
  const { valid, firstInvalid } = validateStep(state.step);
  if (!valid) {
    state.machine = "STEP_INVALID";
    focusInvalid(firstInvalid);
    return;
  }
  state.machine = "STEP_VALID";
  if (state.step < STEP_COUNT) goToStep(state.step + 1, "forward");
}

function handleBack() {
  if (state.step <= 1) return;          /* defined behaviour: step 1 has no back control */
  goToStep(state.step - 1, "back");
}

/* ------------------------------------------------------------------ SUBMIT */

function handleSubmit(button) {
  if (state.submitting) return;         /* duplicate submit guard */

  const { valid, firstInvalid } = validateStep(STEP_COUNT);
  const globalError = $('[data-error-for="FORM_GLOBAL"]');
  if (!valid) {
    state.machine = "STEP_INVALID";
    if (globalError) { globalError.textContent = MSG.GLOBAL; globalError.hidden = false; }
    focusInvalid(firstInvalid);
    return;
  }
  if (globalError) { globalError.textContent = ""; globalError.hidden = true; }

  state.submitting = true;
  state.machine = "SUBMITTING_DEMO";
  button.setAttribute("aria-busy", "true");
  button.disabled = true;
  /* Replace only the label text node so the arrow icon element survives. */
  const labelNode = [...button.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  if (labelNode) labelNode.textContent = MSG.SUBMIT_LOADING;

  /* The recap on the success route reads this state, so it is written, not
     cleared, here. Nothing is transmitted: this is a local route change. */
  persist();
  state.machine = "SUCCESS_REDIRECT";
  window.location.assign(siteUrl(ROUTES.PAGE_REQUEST_SUCCESS));
}

/* ------------------------------------------------------------------- BIND */

function bindChoice(group) {
  const id = group.dataset.fieldId;
  const options = $$(".selectable-card", group);
  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((o) => o.setAttribute("aria-pressed", String(o === option)));
      const f = state.fields[id];
      f.value = option.dataset.value;
      f.touched = true;
      f.dirty = true;
      validateField(id);
      renderFieldError(id);
      renderSummary();
      persist();
    });
  });
  /* Reflect restored state onto the controls. */
  const current = state.fields[id].value;
  if (current) options.forEach((o) => o.setAttribute("aria-pressed", String(o.dataset.value === current)));
}

function bindInput(group) {
  const id = group.dataset.fieldId;
  const control = $(".field__control", group);
  if (!control) return;

  if (state.fields[id].value) control.value = state.fields[id].value;

  control.addEventListener("input", () => {
    if (id === "FIELD_POSTAL_CODE") {
      const digits = control.value.replace(/\D/g, "").slice(0, 5);
      if (digits !== control.value) control.value = digits;
    }
    const f = state.fields[id];
    f.value = control.value;
    f.dirty = true;
    /* While typing, only clear an existing error — never introduce one. */
    if (f.touched) { validateField(id); renderFieldError(id); }
    renderSummary();
    persist();
  });

  control.addEventListener("blur", () => {
    const f = state.fields[id];
    if (!f.dirty && !f.touched) return;
    f.touched = true;
    validateField(id);
    renderFieldError(id);
  });
}

export function init() {
  const form = $("[data-request-form]");
  if (!form) return { page: "PAGE_REQUEST", implemented: false };

  const restored = restore();

  $$("[data-field-id]").forEach((group) => {
    const id = group.dataset.fieldId;
    if (!RULES[id]) return;
    if (RULES[id].kind === "choice") bindChoice(group);
    else bindInput(group);
  });

  $$("[data-request-next]").forEach((b) => b.addEventListener("click", handleNext));
  $$("[data-request-back]").forEach((b) => b.addEventListener("click", handleBack));
  const submit = $("[data-request-submit]");
  if (submit) submit.addEventListener("click", () => handleSubmit(submit));

  state.machine = "STEP_ACTIVE";
  render();

  return {
    page: "PAGE_REQUEST",
    implemented: true,
    machine: state.machine,
    step: state.step,
    restored,
    storageAvailable,
    fields: FIELD_IDS.length
  };
}
