/* CORE — site configuration and path helper.
   Every internal link and asset path goes through siteUrl() so the demo works
   from the GitHub Pages project subpath as well as from a custom domain. */

export const SITE = Object.freeze({
  /* Project identifier, not a spec version — the trailing V1 is part of the
     name. OBSCURA_PROJECT_MAP_V2 declares `Project: BRANDSCHUTZWERK_DEMO_V1`,
     so this is registry-conformant and must not be "corrected" to V2. The
     specification generation is tracked separately by specVersion below. */
  id: "BRANDSCHUTZWERK_DEMO_V1",
  specVersion: "V2",
  mode: "demo",
  basePath: "/brandschutzwerk-preview/",
  requestStorageKey: "brandschutzwerk-demo-request"
});

export function siteUrl(path = "") {
  return `${SITE.basePath}${String(path).replace(/^\/+/, "")}`.replace(/\/{2,}/g, "/");
}

export const ROUTES = Object.freeze({
  PAGE_HOME: "",
  PAGE_TRAINING: "brandschutzhelfer/",
  PAGE_ABOUT: "ueber-uns/",
  PAGE_REQUEST: "anfrage/",
  PAGE_REQUEST_SUCCESS: "anfrage/erhalten/",
  PAGE_IMPRINT: "impressum/",
  PAGE_PRIVACY: "datenschutz/"
});
