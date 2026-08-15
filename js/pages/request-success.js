import { $, $$ } from "../core/dom.js";
import { sessionState } from "../core/storage.js";

const STORAGE_SCHEMA_VERSION = 1;
const COMPLETION_STATE = Object.freeze({ INCOMPLETE: "NOT_COMPLETED", COMPLETE: "DEMO_COMPLETED" });
const NOT_OCCURRED = "NOT_OCCURRED";

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
const TIMING_LABELS = {
  asap: "So schnell wie möglich", "4-wochen": "Innerhalb der nächsten 4 Wochen",
  "1-3-monate": "In 1–3 Monaten", offen: "Noch offen"
};

function isPlausibleEmail(raw) {
  const value = String(raw).trim();
  if (/\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!domain || domain.length > 255 || !domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  const tld = domain.split(".").pop();
  return tld.length >= 2 && /^[A-Za-z]+$/.test(tld);
}

function isCompletePayload(stored) {
  if (!stored || typeof stored !== "object") return false;
  if (stored.schemaVersion !== STORAGE_SCHEMA_VERSION || stored.step !== 5) return false;
  if (stored.completionState !== COMPLETION_STATE.COMPLETE) return false;
  const values = stored.values;
  if (!values || typeof values !== "object") return false;

  return !!SERVICE_LABELS[values.FIELD_SERVICE] &&
    !!PARTICIPANT_LABELS[values.FIELD_PARTICIPANTS] &&
    /^\d{5}$/.test(String(values.FIELD_POSTAL_CODE || "").trim()) &&
    !!String(values.FIELD_CITY || "").trim() &&
    !!TIMING_LABELS[values.FIELD_TIMING] &&
    !!String(values.FIELD_COMPANY || "").trim() &&
    !!String(values.FIELD_CONTACT_NAME || "").trim() &&
    isPlausibleEmail(values.FIELD_EMAIL || "");
}

function readCompletedState() {
  let stored = null;
  try { stored = sessionState.read(); } catch { return null; }
  return isCompletePayload(stored) ? stored.values : null;
}

/* Deliberately narrow: the recap shows what was configured, not who configured
   it. Personal contact fields remain stored locally but are never displayed. */
function recapRows(values) {
  const place = [values.FIELD_POSTAL_CODE, values.FIELD_CITY].filter(Boolean).join(" ");
  return [
    ["Schulung", SERVICE_LABELS[values.FIELD_SERVICE]],
    ["Teilnehmer", PARTICIPANT_LABELS[values.FIELD_PARTICIPANTS]],
    ["Ort", place],
    ["Zeitraum", TIMING_LABELS[values.FIELD_TIMING]]
  ];
}

function renderRecap(rows, completed) {
  const list = $("[data-success-recap]");
  const empty = $("[data-success-recap-empty]");
  if (!list || !empty) return 0;
  list.replaceChildren();

  if (!completed) {
    list.hidden = true;
    empty.hidden = true;
    return 0;
  }

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "success-recap__row";
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    row.append(dt, dd);
    list.append(row);
  });
  list.hidden = false;
  empty.hidden = true;
  return rows.length;
}

function renderCompletionState(completed) {
  const completionState = completed ? COMPLETION_STATE.COMPLETE : COMPLETION_STATE.INCOMPLETE;
  document.body.dataset.uiEvent = completed ? "COMPLETED" : "NOT_COMPLETED";
  document.body.dataset.transportEvent = NOT_OCCURRED;
  document.body.dataset.businessEvent = NOT_OCCURRED;

  $$('[data-success-completed-only]').forEach((element) => { element.hidden = !completed; });
  const empty = $("[data-success-empty-state]");
  if (empty) empty.hidden = completed;

  const heading = $("[data-success-heading]");
  if (heading) heading.textContent = completed ? "Demo abgeschlossen" : "Keine abgeschlossene Demo-Anfrage";
  document.title = completed
    ? "Demo abgeschlossen | BrandschutzWerk"
    : "Demo nicht abgeschlossen | BrandschutzWerk";

  return completionState;
}

export function init() {
  const values = readCompletedState();
  const completed = !!values;
  const rows = completed ? recapRows(values) : [];
  const rendered = renderRecap(rows, completed);
  const completionState = renderCompletionState(completed);

  const restart = $("[data-success-restart]");
  if (restart) restart.addEventListener("click", () => { sessionState.clear(); });

  const heading = $("[data-success-heading]");
  if (heading) heading.focus();

  return {
    page: "PAGE_REQUEST_SUCCESS",
    implemented: true,
    completionState,
    transportState: NOT_OCCURRED,
    businessState: NOT_OCCURRED,
    recapRows: rendered,
    transmitted: false
  };
}
