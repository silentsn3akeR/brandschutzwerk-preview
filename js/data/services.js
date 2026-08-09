/* DATA — service registry. */

export const services = Object.freeze([
  Object.freeze({ id: "brandschutzhelfer", title: "Brandschutzhelfer-Ausbildung",
    icon: "shield-check", featured: true, status: "CONFIRMED", href: "brandschutzhelfer/" }),
  Object.freeze({ id: "extinguisher", title: "Feuerlöschertraining",
    icon: "fire-extinguisher", featured: false, status: "FACHLICHE_FREIGABE_REQUIRED", href: null }),
  Object.freeze({ id: "evacuation", title: "Evakuierung & Räumung",
    icon: "users", featured: false, status: "FACHLICHE_FREIGABE_REQUIRED", href: null })
]);
