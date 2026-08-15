import { $, $$ } from "../core/dom.js";
import { trainer } from "../data/trainer.js";

const EXPECTED_VALUE_ROUTES = Object.freeze(["VALUE_01", "VALUE_02", "VALUE_03", "VALUE_04"]);
const UNSUPPORTED_CLAIM = /\bmehrjährig\w*|\b(?:seit|über)\s+mehrer\w*\s+Jahr\w*|\bzukünftig\w*\s+Gründer\w*/iu;

function verifyTrainerFields() {
  const mismatches = [];
  const fields = $$('[data-trainer-field]');

  fields.forEach((el) => {
    const field = el.dataset.trainerField;
    const rendered = el.textContent.trim();

    if (field === "name") {
      if (trainer.nameStatus !== "CONFIRMED") mismatches.push(`NAME_NOT_CONFIRMED:${trainer.nameStatus}`);
      if (rendered !== trainer.name) mismatches.push(`NAME_MISMATCH:${rendered}`);
      if (el.dataset.status !== trainer.nameStatus) mismatches.push(`NAME_STATUS:${el.dataset.status}`);
      return;
    }

    if (field === "role") {
      if (rendered !== trainer.role && rendered !== trainer.roleLong) mismatches.push(`ROLE_MISMATCH:${rendered}`);
      if (el.dataset.status !== trainer.roleStatus) mismatches.push(`ROLE_STATUS:${el.dataset.status}`);
      return;
    }

    if (field === "experienceType") {
      if (trainer.experienceTypeStatus !== "CONFIRMED") {
        mismatches.push(`EXPERIENCE_NOT_CONFIRMED:${trainer.experienceTypeStatus}`);
      }
      if (!rendered.includes(trainer.experienceType)) mismatches.push(`EXPERIENCE_MISMATCH:${rendered}`);
      if (el.dataset.status !== trainer.experienceTypeStatus) {
        mismatches.push(`EXPERIENCE_STATUS:${el.dataset.status}`);
      }
      return;
    }

    mismatches.push(`UNKNOWN_TRAINER_FIELD:${field}`);
  });

  return { checked: fields.length, mismatches };
}

function verifyCredentials() {
  const cards = $$('[data-credential-id]');
  const confirmedExperience = cards.filter((card) =>
    card.dataset.credentialState === "CLAIMABLE" &&
    card.dataset.credentialTruth === trainer.fireServiceQualification.id &&
    card.dataset.status === trainer.fireServiceQualification.status &&
    card.querySelector("h3")?.textContent.trim() === trainer.fireServiceQualification.label
  );
  const openQualifications = cards.filter((card) =>
    card.dataset.credentialState === "OPEN" &&
    card.dataset.credentialTruth === "qualifications" &&
    card.dataset.status === trainer.qualificationsStatus
  );
  const mismatches = [];

  if (confirmedExperience.length !== 1) mismatches.push(`CONFIRMED_EXPERIENCE:${confirmedExperience.length}`);
  if (openQualifications.length !== 1) mismatches.push(`OPEN_QUALIFICATIONS:${openQualifications.length}`);
  if (cards.length !== confirmedExperience.length + openQualifications.length) {
    mismatches.push("UNAUTHORISED_CREDENTIAL");
  }
  if (trainer.yearsExperience !== null || trainer.yearsExperienceStatus !== "REAL_DATA_REQUIRED") {
    mismatches.push(`YEARS_TRUTH:${trainer.yearsExperience}/${trainer.yearsExperienceStatus}`);
  }

  return { confirmedExperience: confirmedExperience.length, openQualifications: openQualifications.length, mismatches };
}

function verifyNetworkState() {
  const section = $("[data-component='TrainerNetwork']");
  const cards = section ? $$('[data-component="TrainerNetworkCard"]', section) : [];
  const current = cards.filter((card) => card.dataset.networkState === "CURRENT");
  const future = cards.filter((card) => card.dataset.networkState === "FUTURE_STATE");
  const expectedCurrent = 1 + trainer.additionalTrainerCount;
  const mismatches = [];

  if (!section) return { current: 0, future: 0, mismatches: ["NETWORK_SECTION_MISSING"] };
  if (section.dataset.networkExists !== String(trainer.networkExists)) mismatches.push("NETWORK_EXISTS_ATTR");
  if (Number(section.dataset.currentTrainerCount) !== expectedCurrent) mismatches.push("CURRENT_TRUTH_ATTR");
  if (Number(section.dataset.additionalTrainerCount) !== trainer.additionalTrainerCount) mismatches.push("ADDITIONAL_TRUTH_ATTR");
  if (section.dataset.futureModelStatus !== trainer.networkFutureModelStatus) mismatches.push("FUTURE_STATUS_ATTR");
  if (section.dataset.networkPrimaryState !== "CURRENT") mismatches.push("CURRENT_NOT_PRIMARY");
  if (current.length !== expectedCurrent) mismatches.push(`CURRENT_STATE:${current.length}/${expectedCurrent}`);
  if (future.length < 1) mismatches.push("FUTURE_PERSPECTIVE_MISSING");
  if (current.length + future.length !== cards.length) mismatches.push("UNCLASSIFIED_CARD");
  if (future.some((card) => card.dataset.status !== trainer.networkFutureModelStatus)) mismatches.push("FUTURE_CARD_STATUS");
  if (future.some((card) => card.querySelector("img,[role='img'],[data-asset-id]"))) mismatches.push("FUTURE_PERSON_IMAGE");
  if (future.some((card) => card.textContent.includes(trainer.name))) mismatches.push("FUTURE_PERSON_NAME");
  if (future.some((card) => !/Perspektive|möglich|später|kein aktuelles Angebot/i.test(card.textContent))) {
    mismatches.push("FUTURE_NOT_EXPLICITLY_HYPOTHETICAL");
  }
  if (future.some((card) => !/PERSPEKTIVE/i.test(card.querySelector(".badge")?.textContent || ""))) {
    mismatches.push("FUTURE_BADGE");
  }

  return { current: current.length, future: future.length, mismatches };
}

function verifyValueRouting() {
  const standalone = $("[data-section-id='ABOUT_06_VALUES']");
  const routed = $$('[data-value-route]').flatMap((el) => el.dataset.valueRoute.split(/\s+/).filter(Boolean));
  const unique = [...new Set(routed)];
  const missing = EXPECTED_VALUE_ROUTES.filter((id) => !unique.includes(id));
  const unknown = unique.filter((id) => !EXPECTED_VALUE_ROUTES.includes(id));
  const mismatches = [];

  if (standalone) mismatches.push("STANDALONE_VALUES_PRESENT");
  if (missing.length) mismatches.push(`VALUE_ROUTES_MISSING:${missing.join(",")}`);
  if (unknown.length) mismatches.push(`VALUE_ROUTES_UNKNOWN:${unknown.join(",")}`);

  return { routed: unique, mismatches };
}

function verifyClaimLanguage() {
  const text = $("main")?.innerText || "";
  const mismatches = [];
  if (trainer.yearsExperienceStatus !== "CONFIRMED" && UNSUPPORTED_CLAIM.test(text)) {
    mismatches.push("UNSUPPORTED_DURATION_OR_FOUNDER_CLAIM");
  }
  return { mismatches };
}

export function validateAboutSemantics() {
  const checks = {
    fields: verifyTrainerFields(),
    credentials: verifyCredentials(),
    network: verifyNetworkState(),
    values: verifyValueRouting(),
    claims: verifyClaimLanguage()
  };
  const errors = Object.entries(checks).flatMap(([scope, result]) =>
    result.mismatches.map((error) => `${scope}:${error}`)
  );
  return { checks, errors };
}

export function init() {
  if (document.body.dataset.activeMode === "MODE_FOUNDER") {
    document.body.dataset.aboutSemanticStatus = "NOT_APPLICABLE";
    document.body.dataset.aboutSemanticErrors = "";
    return { page: "PAGE_ABOUT", implemented: true, semanticStatus: "NOT_APPLICABLE" };
  }

  const semantic = validateAboutSemantics();
  const status = semantic.errors.length ? "FAIL" : "PASS";
  document.body.dataset.aboutSemanticStatus = status;
  document.body.dataset.aboutSemanticErrors = semantic.errors.join("|");

  if (semantic.errors.length) console.error("PAGE_ABOUT semantic gate failed", semantic.errors);

  return { page: "PAGE_ABOUT", implemented: true, semanticStatus: status, ...semantic.checks };
}
