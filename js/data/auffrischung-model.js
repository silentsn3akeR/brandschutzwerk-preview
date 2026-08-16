/* DATA — Auffrischungs-/Änderungscheck. Pure: no DOM, no copy, no side effects.

   TWO RULES, NOT ONE
   ------------------
   DGUV Information 205-023 Abschnitt 5 contains two statements with different
   normative strength, in adjacent sentences:

     "Zur Auffrischung der Kenntnisse empfiehlt es sich, die Ausbildung in
      Abständen von 3 bis 5 Jahren zu wiederholen."          -> RECOMMENDATION

     "Bei wesentlichen betrieblichen Änderungen ist in kürzeren Abständen eine
      Wiederholung der Ausbildung erforderlich"              -> REQUIRED

   Collapsing them into "alle 3 bis 5 Jahre Pflicht" is the mistake this market
   makes routinely, and it is wrong twice: it hardens a recommendation into a
   duty, and it hides the one situation that genuinely is a duty behind a clock.

   So the model runs two independent axes and the change axis wins. A company
   that trained ten months ago and has since rebuilt a production line is not
   "fine for another four years" — the trigger applies regardless of the clock.

   WHY THERE IS NO DATE ARITHMETIC
   -------------------------------
   The source gives an interval to work within, not an expiry. trainingDate + 5
   years = "fällig am" would manufacture a deadline no source states, and would
   read as a legal date on a page about fire safety. Time is therefore a coarse
   band, and the strongest thing the model will say about it is that the
   recommended window has been reached.

   Unknown never resolves favourably: not knowing whether something changed is
   not evidence that nothing did.

   Claim provenance: COMPLIANCE_REFRESH_RECOMMENDATION
   (PRIMARY_GUIDANCE, VERBATIM_SOURCED, DGUV Information 205-023 Abschnitt 5). */

export const SINCE = Object.freeze({
  UNDER_3: "UNDER_3",
  BETWEEN_3_AND_5: "BETWEEN_3_AND_5",
  OVER_5: "OVER_5",
  UNKNOWN: "UNKNOWN",
});

export const OUTCOME = Object.freeze({
  EARLIER_REPETITION_REQUIRED: "EARLIER_REPETITION_REQUIRED",
  REFRESH_RECOMMENDED: "REFRESH_RECOMMENDED",
  NO_TIME_BASED_ACTION_YET: "NO_TIME_BASED_ACTION_YET",
  REVIEW_INFORMATION: "REVIEW_INFORMATION",
});

/* Only the triggers the source actually names. No extra categories: a richer
   form would be easy and would quietly invent obligations. */
export const CHANGE_TRIGGERS = Object.freeze([
  "GEFAEHRDUNGSBEURTEILUNG_GEAENDERT",
  "NEUE_VERFAHREN_ANDERE_BRANDGEFAHREN",
  "PERSONEN_IN_ANDERE_BEREICHE",
]);

export const RECOMMENDED_WINDOW = Object.freeze({ fromYears: 3, toYears: 5 });

/**
 * @param {object} input
 * @param {string} input.since        SINCE.*
 * @param {object} [input.changes]    { <trigger>: true } for confirmed triggers
 * @param {boolean} [input.changesUnknown] visitor cannot say whether anything changed
 */
export function assessAuffrischung(input = {}) {
  const { since, changes = {}, changesUnknown = false } = input;

  const triggers = CHANGE_TRIGGERS.filter((t) => changes[t]);
  const knownSince = Object.values(SINCE).includes(since);

  /* ---- 1. Change axis first. It outranks the clock, always. ------------- */
  if (triggers.length) {
    return {
      outcome: OUTCOME.EARLIER_REPETITION_REQUIRED,
      strength: "REQUIRED",
      triggers,
      since: knownSince ? since : SINCE.UNKNOWN,
      /* Stated explicitly, because the surprising case is the useful one: a
         recent training does not switch this off. */
      overridesTime: knownSince && since === SINCE.UNDER_3,
      missing: [],
      recommendedWindow: RECOMMENDED_WINDOW,
      nextAction: "REQUEST_INDIVIDUAL_REVIEW",
    };
  }

  /* ---- 2. Anything unknown stops here. --------------------------------- */
  const missing = [];
  if (changesUnknown || (!triggers.length && changesUnknown)) missing.push("changes");
  if (!knownSince || since === SINCE.UNKNOWN) missing.push("since");

  if (missing.length) {
    return {
      outcome: OUTCOME.REVIEW_INFORMATION,
      strength: "UNRESOLVED",
      triggers: [],
      since: knownSince ? since : SINCE.UNKNOWN,
      overridesTime: false,
      missing,
      recommendedWindow: RECOMMENDED_WINDOW,
      nextAction: "CLARIFY_INTERNALLY",
    };
  }

  /* ---- 3. Time axis, and only as a recommendation. --------------------- */
  if (since === SINCE.BETWEEN_3_AND_5 || since === SINCE.OVER_5) {
    return {
      outcome: OUTCOME.REFRESH_RECOMMENDED,
      /* Never REQUIRED. Over five years is further past the recommended window,
         not a different rule — the source states no expiry. */
      strength: "RECOMMENDED",
      triggers: [],
      since,
      overridesTime: false,
      missing: [],
      recommendedWindow: RECOMMENDED_WINDOW,
      nextAction: "PLAN_REFRESH",
    };
  }

  return {
    outcome: OUTCOME.NO_TIME_BASED_ACTION_YET,
    strength: "NONE",
    triggers: [],
    since,
    overridesTime: false,
    missing: [],
    recommendedWindow: RECOMMENDED_WINDOW,
    nextAction: "REVISIT_ON_CHANGE",
  };
}
