import { activeModes } from "./modes.js";



export function initFounderHook() {
  if (!activeModes().founder) return { active: false, implemented: false };
  document.body.dataset.mode = "MODE_FOUNDER";

  const loaded = import("../founder-mode.js")
    .then((m) => (typeof m.init === "function" ? (m.init(), true) : false))
    .catch(() => false);

  return { active: true, implemented: loaded };
}
