/* DATA — trainer truth. Declared owner per OBSCURA_PROJECT_MAP_V2.
   Nothing here may be invented.

   Status is tracked per field, not once for the whole record: the name and the
   registry-backed Berufsfeuerwehr-Erfahrung are CONFIRMED, while additional
   qualifications remain REAL_DATA_REQUIRED. A single record-level status would
   have flattened that distinction and made the page unable to tell them apart.

   Confirming the name confirms nothing else — no years of service, no rank, no
   Gruppenführer course, no teaching certification, no accreditation, and no
   legal form, address or service radius for BrandschutzWerk. */

export const trainer = Object.freeze({
  name: "Michael Gruber",
  nameStatus: "CONFIRMED",

  role: "Trainer & fachlicher Ansprechpartner",
  roleLong: "Berufsfeuerwehr · Trainer · Fachlicher Ansprechpartner",
  roleStatus: "FACHLICHE_FREIGABE_REQUIRED",

  /* CONFIRMED as context only. It says he works in the fire service — not for
     how long, at what rank, or at which station. */
  experienceType: "Berufsfeuerwehr",
  experienceTypeStatus: "CONFIRMED",
  yearsExperience: null,
  yearsExperienceStatus: "REAL_DATA_REQUIRED",

  fireServiceQualification: Object.freeze({
    id: "TRAINER_QUALIFICATION_FIRE_SERVICE",
    label: "Berufsfeuerwehr-Erfahrung",
    status: "CONFIRMED"
  }),
  qualifications: Object.freeze([]),
  qualificationsStatus: "REAL_DATA_REQUIRED",

  assetId: "ASSET_PHOTO_02_TRAINER_PORTRAIT",
  image: null,

  networkExists: false,
  networkExistsStatus: "CONFIRMED",
  additionalTrainerCount: 0,
  additionalTrainerCountStatus: "CONFIRMED",
  networkFutureModel: "qualified regional trainers",
  networkFutureModelStatus: "DEMO_STRATEGY"
});
