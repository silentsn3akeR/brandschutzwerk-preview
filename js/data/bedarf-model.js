/* DATA — Bedarfscheck decision model. Pure: no DOM, no copy, no side effects.

   WHY THIS IS NOT A 5% CALCULATOR
   -------------------------------
   ASR A2.2 Abschnitt 7.3 says a share of 5 % of employees is "in der Regel
   ausreichend" — and then immediately names four situations in which a greater
   number may be required: erhöhte Brandgefährdung, die Anwesenheit vieler
   Personen, Personen mit eingeschränkter Mobilität, und große räumliche
   Ausdehnung der Arbeitsstätte. It gives a baseline. It gives no multiplier,
   no formula and no threshold for any of those four.

   That absence is the whole design. A tool that answers "12 % for elevated
   risk" has invented the one number the source deliberately does not state,
   and it would be inventing it about fire safety. So when a raising condition
   is present this model refuses to produce a figure and says which assumption
   failed. Refusing is the correct answer, not a degraded one.

   The second thing the source says is easy to miss: the share has to be
   *available*, because "Schichtbetrieb und Abwesenheit einzelner Beschäftigter,
   z. B. Fortbildung, Urlaub und Krankheit, sind zu berücksichtigen". So the
   baseline applies per shift against the people actually present, not once
   against a headcount — a 60-person company on three shifts is not the same
   problem as 60 people in one office.

   Governing instrument is the Gefährdungsbeurteilung. Everything below is
   planning orientation for a conversation, never a legal determination.

   Claim provenance: COMPLIANCE_EMPLOYEE_RATIO_GENERAL
   (SOURCE_AUTHORITY PRIMARY_REGULATION, CONFIDENCE VERBATIM_SOURCED). */

export const HAZARD = Object.freeze({
  NORMAL: "NORMAL",
  ELEVATED: "ELEVATED",
  UNCLEAR: "UNCLEAR",
});

export const OUTCOME = Object.freeze({
  ORIENTATION_AVAILABLE: "ORIENTATION_AVAILABLE",
  REVIEW_RECOMMENDED: "REVIEW_RECOMMENDED",
  INFORMATION_INCOMPLETE: "INFORMATION_INCOMPLETE",
});

/* The baseline share. Named, not inlined, so the one sourced number in this
   file is visible in one place and traceable to its registry record. */
export const BASELINE_SHARE = 0.05;

/* The three raising conditions from ASR A2.2 that are not the hazard level
   itself. Each suppresses the figure for the same reason: the source names the
   condition and states no quantity for it. */
export const RAISING_CONDITIONS = Object.freeze([
  { id: "MANY_PERSONS", reason: "ANWESENHEIT_VIELER_PERSONEN" },
  { id: "LIMITED_MOBILITY", reason: "EINGESCHRAENKTE_MOBILITAET" },
  { id: "LARGE_EXTENT", reason: "GROSSE_RAEUMLICHE_AUSDEHNUNG" },
]);

const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

/**
 * @param {object} input
 * @param {number} input.presentPerShift  employees simultaneously present, per shift
 * @param {number} input.shifts           number of shifts to cover
 * @param {string} input.hazard           HAZARD.NORMAL | ELEVATED | UNCLEAR
 * @param {object} [input.conditions]     { MANY_PERSONS, LIMITED_MOBILITY, LARGE_EXTENT }
 */
export function assessBedarf(input = {}) {
  const { presentPerShift, shifts, hazard, conditions = {} } = input;

  /* ---- 1. Do we know enough to answer at all? -------------------------- */
  const missing = [];
  if (!isPositiveInt(presentPerShift)) missing.push("presentPerShift");
  if (!isPositiveInt(shifts)) missing.push("shifts");
  if (!Object.values(HAZARD).includes(hazard)) missing.push("hazard");

  if (missing.length) {
    return {
      outcome: OUTCOME.INFORMATION_INCOMPLETE,
      missing,
      orientationPerShift: null,
      orientationTotal: null,
      assumptions: [],
      reasons: [],
      factorsThatCouldIncrease: [],
      planningNotes: [],
      nextAction: "COMPLETE_INPUT",
    };
  }

  /* ---- 2. Does the baseline apply? ------------------------------------- */
  /* Hazard first: it is the condition the source ties the baseline to
     ("bei normaler Brandgefährdung"). UNCLEAR is treated exactly like
     ELEVATED — an unverified assumption must not silently become a
     favourable one. */
  const reasons = [];
  if (hazard === HAZARD.ELEVATED) reasons.push("ERHOEHTE_BRANDGEFAEHRDUNG");
  if (hazard === HAZARD.UNCLEAR) reasons.push("BRANDGEFAEHRDUNG_UNKLAR");

  for (const c of RAISING_CONDITIONS) {
    if (conditions[c.id]) reasons.push(c.reason);
  }

  if (reasons.length) {
    return {
      outcome: OUTCOME.REVIEW_RECOMMENDED,
      missing: [],
      /* Deliberately null. The source names these conditions and states no
         quantity for them, so any number here would be invented. */
      orientationPerShift: null,
      orientationTotal: null,
      assumptions: [],
      reasons,
      factorsThatCouldIncrease: [],
      planningNotes: [],
      nextAction: "REQUEST_INDIVIDUAL_REVIEW",
    };
  }

  /* ---- 3. Baseline applies: compute transparently ---------------------- */
  const orientationPerShift = Math.ceil(presentPerShift * BASELINE_SHARE);

  const assumptions = [
    "BRANDGEFAEHRDUNG_NORMAL",
    "ANTEIL_FUENF_PROZENT",
    "BEZUG_GLEICHZEITIG_ANWESENDE",
    `SCHICHTEN_${shifts}`,
  ];

  return {
    outcome: OUTCOME.ORIENTATION_AVAILABLE,
    missing: [],
    orientationPerShift,
    orientationTotal: orientationPerShift * shifts,
    assumptions,
    reasons: [],
    /* Named so the reader learns what would change the answer, without the
       tool pretending to price those factors. */
    factorsThatCouldIncrease: [
      "ERHOEHTE_BRANDGEFAEHRDUNG",
      "ANWESENHEIT_VIELER_PERSONEN",
      "EINGESCHRAENKTE_MOBILITAET",
      "GROSSE_RAEUMLICHE_AUSDEHNUNG",
    ],
    /* Absence is a requirement, not a surcharge. ASR A2.2 says Fortbildung,
       Urlaub and Krankheit "sind zu berücksichtigen" and states no reserve
       quantity, so the model names the obligation and refuses to price it.
       An earlier draft added a flat +1 for a reserve; that was the same
       invention this model exists to prevent, one decimal place quieter. */
    planningNotes: ["ABWESENHEIT_EINPLANEN", "VERFUEGBARKEIT_JE_SCHICHT"],
    nextAction: "PREPARE_OR_REQUEST",
  };
}
