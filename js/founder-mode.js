

const CSS_HREF = new URL("../css/components/founder-mode.css", import.meta.url).href;
const REGISTRY_URL = new URL("../project/v2/machine/data-registry.json", import.meta.url).href;

/* Registry entries the readiness board may surface. The board is a launch
   checklist, so it deliberately mixes states: what is already true, what is only
   demo scaffolding, and what has no real answer yet. LABEL is human copy; the
   value and status always come from the registry. */
const READINESS_FIELDS = [
  { id: "TRAINER_PRIMARY_NAME", label: "Trainer" },
  { id: "TRAINER_QUALIFICATION_GROUP_LEADER", label: "Qualifikationen & Nachweise" },
  { id: "TRAINING_PARTICIPANT_LIMIT", label: "Gruppengröße" },
  { id: "TRAINING_DURATION_DISPLAY", label: "Dauer je Schulung" },
  { id: "PRICE_BRANDSCHUTZHELFER_11_15", label: "Preise" },
  { id: "SERVICE_REGION_PRIMARY", label: "Einsatzregion" },
  { id: "BUSINESS_LEGAL_FORM", label: "Unternehmensform" },
  { id: "TRAINING_INSURANCE_CONFIRMED", label: "Versicherung & Sicherheitsprozess" },
  { id: "NEBENTAETIGKEIT_CLEARANCE", label: "Nebentätigkeit" },
];


const STATE_COPY = {
  CONFIRMED: { text: "Steht fest", tone: "ready" },
  DEMO_DATA: { text: "Nur Demo-Annahme", tone: "demo" },
  DEMO_STRATEGY: { text: "Strategische Annahme", tone: "demo" },
  REAL_DATA_REQUIRED: { text: "Braucht eine echte Antwort", tone: "open" },
  FACHLICHE_FREIGABE_REQUIRED: { text: "Braucht fachliche Freigabe", tone: "open" },
  LEGAL_REVIEW_REQUIRED: { text: "Braucht rechtliche Prüfung", tone: "open" },
  TECHNICAL_CONFIRMATION_REQUIRED: { text: "Technisch zu bestätigen", tone: "open" },
};

const el = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
};

function section(id, eyebrow, headline, opts = {}) {
  const s = el("section", `founder-section${opts.surface ? ` ${opts.surface}` : ""}`);
  s.dataset.sectionId = id;
  const c = el("div", "container");
  const head = el("div", "section-heading stack");
  head.append(el("p", "eyebrow", eyebrow), el("h2", null, headline));
  if (opts.lead) head.append(el("p", "lead", opts.lead));
  c.append(head);
  s.append(c);
  return { section: s, container: c };
}

/* PERSPEKTIVE is a required label wherever a future state is described. It is the
   single mechanism that keeps this layer from reading as a claim about today. */
const perspective = (text) => {
  const p = el("p", "founder-perspective");
  p.append(el("span", "founder-perspective__tag", "Perspektive"), el("span", null, text));
  return p;
};

const flow = (items, className = "founder-flow") => {
  const ol = el("ol", className);
  items.forEach((t, i) => {
    const li = el("li");
    li.append(el("span", "founder-flow__index", String(i + 1).padStart(2, "0")),
      el("span", "founder-flow__label", t));
    ol.append(li);
  });
  return ol;
};

const cards = (items, className = "founder-cards") => {
  const grid = el("div", className);
  items.forEach(({ title, body, note }, i) => {
    const card = el("article", "founder-card");
    card.dataset.delay = String(Math.min(i + 1, 5));
    card.append(el("h3", null, title), el("p", null, body));
    if (note) card.append(el("p", "founder-card__note", note));
    grid.append(card);
  });
  return grid;
};

/* ------------------------------------------------------------------ SECTIONS */

function founder00() {
  const { section: s, container } = section(
    "FOUNDER_00_INTRO", "DIE IDEE HINTER DER WEBSITE",
    "Was, wenn daraus nicht nur ein Nebenjob wird?",
    { lead: "Die Schulung ist das Produkt. Aber das eigentliche Unternehmen entsteht aus Marke, Kundenzugang, Prozessen, Qualität und einem Modell, das nicht dauerhaft an eine einzige Person gebunden sein muss." }
  );
  const chain = el("ol", "founder-chain");
  const steps = ["Trainer", "Schulung", "Kundenprozess", "Marke + System", "Trainer-Netzwerk"];
  steps.forEach((t, i) => {
    const li = el("li");
    /* the last link is the destination, not another step */
    if (i === steps.length - 1) li.classList.add("is-target");
    li.append(el("span", "founder-chain__label", t));
    if (i < steps.length - 1) li.append(el("span", "founder-chain__arrow", "→"));
    chain.append(li);
  });
  container.append(chain);
  return s;
}

function founder01() {
  const { section: s, container } = section(
    "FOUNDER_01_TODAY", "STARTPUNKT", "Am Anfang braucht es erstaunlich wenig.",
  );
  container.append(cards([
    { title: "Fachwissen", body: "Jemand, der den Stoff wirklich beherrscht und im Ernstfall weiß, wovon er spricht." },
    { title: "Angebot", body: "Eine Schulung, die ein Unternehmen konkret buchen kann — nicht eine Liste von Möglichkeiten." },
    { title: "Kundenzugang", body: "Ein Weg, wie Unternehmen überhaupt von dem Angebot erfahren und anfragen können." },
    { title: "Organisation", body: "Termin, Ort, Teilnehmer, Nachweis. Verlässlich, auch wenn es nur eine Person macht." },
  ]));
  const note = el("p", "founder-note");
  note.textContent = "Kein Schulungszentrum. Kein großes Team. Keine komplexe Software zum Start.";
  container.append(note);
  return s;
}

function founder02() {
  const { section: s, container } = section(
    "FOUNDER_02_CUSTOMER_ENGINE", "DAS SYSTEM", "Aus einer Anfrage wird ein wiederholbarer Ablauf.",
  );
  container.append(flow([
    "entdecken", "anfragen", "abstimmen", "durchführen",
    "dokumentieren", "Wiedervorlage", "nächster Standort",
  ]));
  container.append(el("p", "founder-note",
    "Die Website ist der Einstieg in einen Kundenlebenszyklus, nicht nur ein Schulungsverkauf."));
  return s;
}

function founder03() {
  const { section: s, container } = section(
    "FOUNDER_03_ONE_TRAINER_LIMIT", "DIE GRENZE",
    "Eine Person kann nur eine bestimmte Anzahl Schulungen selbst durchführen.",
    { surface: "surface-authority" }
  );
  container.append(el("p", "founder-body",
    "Wenn das Modell funktioniert, ist persönliche Zeit der Engpass. Genau dort entscheidet sich, ob daraus ein gut bezahlter Nebenjob wird — oder ein Unternehmen, das auch ohne die Anwesenheit einer einzigen Person funktioniert."));
  container.append(perspective("Es gibt heute kein bestehendes Trainer-Netzwerk. Dieser Abschnitt beschreibt eine mögliche Entwicklung, keinen aktuellen Zustand."));
  return s;
}

function founder04() {
  const { section: s, container } = section(
    "FOUNDER_04_NETWORK_MODEL", "SKALIERUNG", "Der Trainer muss nicht das Unternehmen sein.",
  );
  container.append(cards([
    { title: "Fachlicher Kopf", body: "Definiert Inhalt, Qualität und Sicherheitsanspruch der Schulung." },
    { title: "Trainer-Netzwerk", body: "Führt Schulungen regional durch — nach demselben Standard.", note: "Perspektive" },
    { title: "Operating System", body: "Marke, Anfrage, Abstimmung, Dokumentation und Nachbetreuung bleiben zentral." },
  ]));
  const key = el("blockquote", "founder-keyline");
  key.append(el("p", null, "Die Durchführung kann dezentral werden. Die Kundenerfahrung bleibt zentral."));
  container.append(key);
  container.append(perspective("Modellbeschreibung. Es existiert derzeit kein Netzwerk und keine zweite durchführende Person."));
  return s;
}

function founder05() {
  const { section: s, container } = section(
    "FOUNDER_05_ROLE_SPLIT", "ZUSAMMENARBEIT", "Zwei unterschiedliche Stärken. Ein gemeinsames System.",
  );
  const split = el("div", "founder-split");
  const left = el("div", "founder-split__side");
  left.append(el("p", "eyebrow", "FACHLICHER BEREICH"),
    el("ul", null));
  ["Schulungsinhalt", "Praxis und Sicherheit", "Qualitätsanspruch", "Fachliche Freigabe"]
    .forEach((t) => left.querySelector("ul").append(el("li", null, t)));
  const right = el("div", "founder-split__side");
  right.append(el("p", "eyebrow", "OPERATING SYSTEM"), el("ul", null));
  ["Marke und Auftritt", "Kundenzugang", "Anfrage- und Ablaufprozess", "Dokumentation und Wiedervorlage"]
    .forEach((t) => right.querySelector("ul").append(el("li", null, t)));
  split.append(left, el("span", "founder-split__seam", ""), right);
  container.append(split);
  container.append(el("p", "founder-note",
    "Das Unternehmen entsteht dort, wo beide Seiten zusammenkommen."));
  return s;
}

function founder06() {
  const { section: s, container } = section(
    "FOUNDER_06_EVOLUTION", "MÖGLICHE ENTWICKLUNG", "Nicht alles am ersten Tag.",
  );
  const phases = [
    ["Angebot testen", "Mit echten Unternehmen sprechen und herausfinden, was wirklich gebraucht wird."],
    ["Ablauf standardisieren", "Aus jedem Termin denselben verlässlichen Ablauf machen."],
    ["Wiederkehrende Kunden", "Aus einem Auftrag eine laufende Betreuung entwickeln."],
    ["Trainer ergänzen", "Weitere Durchführende nach demselben Standard einarbeiten."],
    ["Regionen erweitern", "Das Modell auf weitere Einsatzgebiete übertragen."],
    ["Digitale Plattform", "Erst dann lohnt sich die nächste Automatisierungsstufe."],
  ];
  const ol = el("ol", "founder-phases");
  phases.forEach(([t, b], i) => {
    const li = el("li");
    li.dataset.delay = String(Math.min(i + 1, 5));
    li.append(el("span", "founder-phases__num", `Phase ${i + 1}`),
      el("h3", null, t), el("p", null, b));
    ol.append(li);
  });
  container.append(ol);
  container.append(perspective("Strategische Perspektive. Keine Umsatz-, Wachstums- oder Zeitgarantie."));
  return s;
}

function founder07() {
  const { section: s, container } = section(
    "FOUNDER_07_THE_MOAT", "WAS LANGFRISTIG WERTVOLL WIRD", "Nicht der Feuerlöscher. Das System drumherum.",
  );
  container.append(cards([
    { title: "Marke", body: "Ein Name, dem ein Sicherheitsbeauftragter ohne Rückfrage vertraut." },
    { title: "Kundenbeziehungen", body: "Unternehmen, die von sich aus wiederkommen, wenn etwas ansteht." },
    { title: "Prozesse", body: "Ein Ablauf, der unabhängig von Tagesform und Person gleich gut funktioniert." },
    { title: "Netzwerk", body: "Menschen, die den Standard tragen können.", note: "Perspektive" },
  ]));
  return s;
}

function founder08() {
  const { section: s, container } = section(
    "FOUNDER_08_RECURRING_LAYER", "DER INTERESSANTE TEIL",
    "Der erste Auftrag kann der Anfang einer jahrelangen Kundenbeziehung sein.",
  );
  const tree = el("ol", "founder-lifecycle");
  [
    ["Erste Schulung", "Ein Standort, eine Gruppe, ein konkreter Anlass."],
    ["Auffrischung", "Brandschutzhelfer werden regelmäßig nachgeschult."],
    ["Neue Mitarbeitende", "Personal wechselt — der Bedarf entsteht neu."],
    ["Weitere Standorte", "Was an einem Standort funktioniert, wird übertragen."],
  ].forEach(([t, b], i) => {
    const li = el("li");
    li.dataset.delay = String(Math.min(i + 1, 5));
    li.append(el("h3", null, t), el("p", null, b));
    tree.append(li);
  });
  container.append(tree);
  container.append(perspective("Beschreibt einen möglichen Kundenlebenszyklus. Keine zugesicherten wiederkehrenden Umsätze."));
  return s;
}

function founder09(entries) {
  const { section: s, container } = section(
    "FOUNDER_09_LIVE_READINESS", "WAS NOCH ECHT WERDEN MUSS",
    "Die Website ist weit. Das Unternehmen braucht noch Antworten.",
    { lead: "Bewusstes Launch-Readiness-Board: was bereits feststeht, was nur Demo-Annahme ist und was vor einem echten Start beantwortet werden muss." }
  );
  const board = el("ul", "founder-board");
  entries.forEach((e, i) => {
    const li = el("li", `founder-board__item is-${e.tone}`);
    li.dataset.delay = String(Math.min(i + 1, 5));
    li.dataset.dataId = e.id;
    li.dataset.status = e.status;
    li.append(el("span", "founder-board__label", e.label));
    li.append(el("span", "founder-board__value", e.display));
    li.append(el("span", "founder-board__state", e.stateText));
    
    const token = el("span", null, e.status);
    token.setAttribute("data-inspect-only", "");
    li.append(token);
    board.append(li);
  });
  container.append(board);

  const legend = el("p", "founder-note");
  legend.textContent = "Diese Übersicht liest ihre Werte direkt aus der Datenregistrierung des Projekts. Sie kann deshalb nicht veralten, ohne dass es auffällt.";
  container.append(legend);
  return s;
}

function founder10() {
  const { section: s, container } = section(
    "FOUNDER_10_FIRST_REAL_TEST", "DER NÄCHSTE SCHRITT", "Nicht weiter theoretisieren. Mit echten Unternehmen sprechen.",
    { surface: "surface-authority" }
  );
  container.append(cards([
    { title: "Interesse", body: "Gibt es überhaupt Bedarf — und wie oft kommt er vor?" },
    { title: "Zahlungsbereitschaft", body: "Was ist ein Unternehmen bereit, dafür zu zahlen?" },
    { title: "Wiederholbarkeit", body: "Lässt sich derselbe Ablauf beim nächsten Kunden wiederholen?" },
  ], "founder-cards founder-cards--3"));
  container.append(el("p", "founder-note",
    "Erst danach lohnt sich die nächste Automatisierungsstufe."));

  const outro = el("div", "founder-outro");
  outro.append(el("p", "founder-outro__line", "Die Website war nur der sichtbare Teil."));
  outro.append(el("p", "founder-outro__line", "Eigentlich habe ich versucht, einmal durchzudenken, wie daraus ein Unternehmen werden könnte."));
  const back = el("a", "btn btn--primary", "Zurück zur Kundenansicht");
  back.href = "./";
  outro.append(back);
  container.append(outro);
  return s;
}

/* -------------------------------------------------------------- READINESS */

async function readinessEntries() {
  let registry = [];
  try {
    const res = await fetch(REGISTRY_URL, { cache: "no-cache" });
    if (res.ok) registry = await res.json();
  } catch {
    /* The board degrades to "not readable" rather than to invented values. */
  }
  const byId = new Map(registry.map((r) => [r.DATA_ID, r]));

  return READINESS_FIELDS.map(({ id, label }) => {
    const rec = byId.get(id);
    /* Defensive: INTERNAL_ONLY must never surface in a URL-discoverable mode. */
    if (rec && rec.PUBLIC_VISIBILITY === "INTERNAL_ONLY") {
      return { id, label, status: "INTERNAL_ONLY", tone: "open", display: "—", stateText: "Nicht öffentlich" };
    }
    if (!rec) {
      return { id, label, status: "UNREADABLE", tone: "open", display: "—", stateText: "Registry nicht lesbar" };
    }
    const state = STATE_COPY[rec.STATUS] || { text: "Offen", tone: "open" };
    const raw = rec.VALUE;
    const empty = raw == null || raw === "null" || raw === "" || raw === "UNSPECIFIED"
      || raw === "unknown" || raw === "false / unknown";
    return {
      id, label,
      status: rec.STATUS,
      tone: state.tone,
      display: empty ? "Noch offen" : String(raw),
      stateText: state.text,
    };
  });
}

/* ------------------------------------------------------------------- MOUNT */

function loadStyles() {
  if (document.querySelector('link[data-founder-mode]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_HREF;
  link.dataset.founderMode = "";
  document.head.append(link);
}

export async function init() {
  const main = document.getElementById("main-content");
  if (!main) return { implemented: false, reason: "no main" };

  loadStyles();
  document.body.classList.add("is-founder");
  document.body.dataset.mode = "MODE_FOUNDER";

  /* The strategic layer replaces the customer page rather than sitting on top of
     it: this is a second act, not an overlay. Header and footer stay so the
     recipient never loses the site — and so the legal links remain reachable. */
  main.replaceChildren();

  const intro = el("section", "founder-section founder-hero");
  intro.dataset.sectionId = "FOUNDER_HERO";
  const ic = el("div", "container stack");
  ic.append(el("p", "eyebrow", "GRÜNDERANSICHT"));
  const h1 = el("h1", null, "Die Website war nur der sichtbare Teil.");
  ic.append(h1);
  ic.append(el("p", "lead", "Dieselbe Idee, eine Ebene tiefer: wie aus einer Schulung ein Unternehmen werden könnte — und was dafür noch echt werden muss."));
  const backTop = el("a", "founder-hero__back", "← Zurück zur Kundenansicht");
  backTop.href = "./";
  ic.append(backTop);
  intro.append(ic);
  main.append(intro);

  const entries = await readinessEntries();

  [
    founder00(), founder01(), founder02(), founder03(), founder04(),
    founder05(), founder06(), founder07(), founder08(),
    founder09(entries), founder10(),
  ].forEach((s) => main.append(s));

  return {
    implemented: true,
    sections: main.querySelectorAll("[data-section-id]").length,
    readiness: entries.length,
  };
}
