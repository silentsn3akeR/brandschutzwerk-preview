import { SITE } from "./config.js";

/* CORE — session-only storage helper.
   sessionStorage exclusively. No localStorage, no cookies, no network. */

export const sessionState = Object.freeze({
  read() {
    try { return JSON.parse(sessionStorage.getItem(SITE.requestStorageKey) || "null"); }
    catch { return null; }
  },
  write(value) {
    try { sessionStorage.setItem(SITE.requestStorageKey, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  clear() {
    try { sessionStorage.removeItem(SITE.requestStorageKey); return true; }
    catch { return false; }
  }
});
