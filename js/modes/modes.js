/* MODES — detection only. A query parameter is convenience, never access
   control, so no mode may expose anything confidential. */

export const MODES = Object.freeze({
  PUBLIC: "MODE_PUBLIC_DEMO",
  PRESENT: "MODE_PRESENTATION",
  INSPECT: "MODE_INSPECTOR",
  FOUNDER: "MODE_FOUNDER"
});

const flag = (name) => new URLSearchParams(window.location.search).get(name) === "1";

export const activeModes = () => ({
  present: flag("present"),
  inspect: flag("inspect"),
  founder: flag("founder")
});

export function primaryMode() {
  const m = activeModes();
  if (m.founder) return MODES.FOUNDER;
  if (m.inspect) return MODES.INSPECT;
  if (m.present) return MODES.PRESENT;
  return MODES.PUBLIC;
}
