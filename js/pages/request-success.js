import { $ } from "../core/dom.js";
import { sessionState } from "../core/storage.js";



const STORAGE_SCHEMA_VERSION = 1;

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

/* Deliberately narrow: the recap shows what was configured, not who configured
   it. Company, contact name, e-mail, phone and the free-text note are stored
   for the flow but are never re-displayed here. */
function recapRows(values) {
  const place = [values.FIELD_POSTAL_CODE, values.FIELD_CITY].filter(Boolean).join(" ");
  return [
    ["Schulung", SERVICE_LABELS[values.FIELD_SERVICE]],
    ["Teilnehmer", PARTICIPANT_LABELS[values.FIELD_PARTICIPANTS]],
    ["Ort", place],
    ["Zeitraum", TIMING_LABELS[values.FIELD_TIMING]]
  ].filter(([, value]) => !!value);
}

function readState() {
  let stored = null;
  try { stored = sessionState.read(); } catch { return null; }
  if (!stored || typeof stored !== "object") return null;
  if (stored.schemaVersion !== STORAGE_SCHEMA_VERSION) return null;
  if (!stored.values || typeof stored.values !== "object") return null;
  return stored.values;
}

function renderRecap(rows) {
  const list = $("[data-success-recap]");
  const empty = $("[data-success-recap-empty]");
  if (!list || !empty) return 0;

  if (!rows.length) {
    list.hidden = true;
    empty.hidden = false;
    return 0;
  }

  /* Built with createElement/textContent — stored user input is never written
     as markup. */
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

export function init() {
  const values = readState();
  const rows = values ? recapRows(values) : [];
  const rendered = renderRecap(rows);

  /* Starting a new demo enquiry clears the session so the next run begins from
     a clean state rather than inheriting the previous one. */
  const restart = $("[data-success-restart]");
  if (restart) {
    restart.addEventListener("click", () => { sessionState.clear(); });
  }

  const heading = $("[data-success-heading]");
  if (heading) heading.focus();

  return {
    page: "PAGE_REQUEST_SUCCESS",
    implemented: true,
    hasStoredState: !!values,
    recapRows: rendered,
    transmitted: false
  };
}
