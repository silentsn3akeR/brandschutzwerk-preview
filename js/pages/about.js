import { $$ } from "../core/dom.js";
import { trainer } from "../data/trainer.js";



function verifyTrainerFields() {
  const mismatches = [];

  $$("[data-trainer-field]").forEach((el) => {
    const field = el.dataset.trainerField;
    const rendered = el.textContent.trim();

    if (field === "name") {
      /* A name may only be rendered while it is CONFIRMED. If the registry ever
         reverts it to REAL_DATA_REQUIRED this page must stop asserting it. */
      if (trainer.nameStatus !== "CONFIRMED") mismatches.push(`NAME_NOT_CONFIRMED:${trainer.nameStatus}`);
      if (rendered !== trainer.name) mismatches.push(`NAME_MISMATCH:${rendered}`);
      if (el.dataset.status !== trainer.nameStatus) mismatches.push(`NAME_STATUS:${el.dataset.status}`);
    }

    if (field === "role") {
      if (rendered !== trainer.role && rendered !== trainer.roleLong) mismatches.push(`ROLE_MISMATCH:${rendered}`);
      if (el.dataset.status !== trainer.roleStatus) mismatches.push(`ROLE_STATUS:${el.dataset.status}`);
    }
  });

  return { checked: $$("[data-trainer-field]").length, mismatches };
}

/* TRAINER_NETWORK_EXISTS is false. Every card beyond the founder must therefore
   carry FUTURE_STATE, and the section must say so. */
function verifyNetworkState() {
  const cards = $$("[data-component='TrainerNetworkCard']");
  const current = cards.filter((c) => c.dataset.networkState === "CURRENT");
  const future = cards.filter((c) => c.dataset.networkState === "FUTURE_STATE");
  const mismatches = [];

  if (trainer.networkExists === false && current.length !== 1) {
    mismatches.push(`CURRENT_CARDS:${current.length}`);
  }
  if (current.length + future.length !== cards.length) mismatches.push("UNCLASSIFIED_CARD");
  if (trainer.additionalTrainerCount !== future.length - 1 && trainer.additionalTrainerCount !== 0) {
    mismatches.push(`ADDITIONAL_COUNT:${trainer.additionalTrainerCount}`);
  }

  return { cards: cards.length, current: current.length, future: future.length, mismatches };
}

export function init() {
  const fields = verifyTrainerFields();
  const network = verifyNetworkState();

  if (fields.mismatches.length) console.warn("PAGE_ABOUT trainer field mismatch", fields.mismatches);
  if (network.mismatches.length) console.warn("PAGE_ABOUT network state mismatch", network.mismatches);

  return { page: "PAGE_ABOUT", implemented: true, fields, network };
}
