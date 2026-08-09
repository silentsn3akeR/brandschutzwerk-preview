

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
