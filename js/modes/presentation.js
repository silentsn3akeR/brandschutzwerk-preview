import { activeModes } from "./modes.js";

/* MODE — ?present=1 intro overlay.
   The headline is NOT an <h1>: the page already owns the single document-level
   heading. V1 shipped a second h1 here; this contract prevents that. */

const COPY = Object.freeze({
  eyebrow: "Konzeptdemo",
  headline: "So könnte dein Unternehmen aussehen.",
  body: "Eine digitale Grundlage für praxisnahe Brandschutzschulungen – vom ersten Kundenkontakt bis zum später skalierbaren Trainer-Netzwerk.",
  cta: "Konzept öffnen",
  note: "Interaktive Konzeptdemo · keine reale Buchungsplattform"
});

export function initPresentationMode() {
  if (!activeModes().present) return { mounted: false };

  const overlay = document.createElement("div");
  overlay.className = "presentation-intro";
  overlay.dataset.component = "PresentationIntro";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "presentation-title");

  const inner = document.createElement("div");
  inner.className = "presentation-intro__inner";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = COPY.eyebrow;

  const title = document.createElement("p");
  title.className = "type-display";
  title.id = "presentation-title";
  title.textContent = COPY.headline;

  const body = document.createElement("p");
  body.className = "presentation-intro__body";
  body.textContent = COPY.body;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn--primary";
  button.textContent = COPY.cta;

  const note = document.createElement("p");
  note.className = "presentation-intro__note";
  note.textContent = COPY.note;

  inner.append(eyebrow, title, body, button, note);
  overlay.append(inner);
  document.body.prepend(overlay);
  document.body.style.overflow = "hidden";
  button.focus();

  const dismiss = () => {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    document.body.style.overflow = "";
    const main = document.getElementById("main-content");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
  };
  const onKey = (e) => { if (e.key === "Escape") dismiss(); };

  button.addEventListener("click", dismiss);
  document.addEventListener("keydown", onKey);
  return { mounted: true };
}
