import { $ } from "../core/dom.js";

/* COMPONENT — SiteHeader + MobileNavigation behaviour.
   States: DEFAULT / SCROLLED / MENU_OPEN. */

export function initNavigation() {
  const header = $("[data-component='SiteHeader']");
  const toggle = $("[data-menu-toggle]");
  const drawer = $("[data-component='MobileNavigation']");

  if (header) {
    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }
  if (!toggle || !drawer) return { drawer: false };

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("mobile-menu-open", open);
  };

  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"));

  drawer.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
  });

  window.addEventListener("resize", () => { if (window.innerWidth >= 1024) setOpen(false); });
  return { drawer: true };
}
