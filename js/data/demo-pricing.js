/* DATA — demo pricing. Every value is DEMO_DATA and may not be presented as a
   real price. */

export const demoPricing = Object.freeze({
  currency: "EUR",
  vatMode: "net",
  status: "DEMO_DATA",
  bands: Object.freeze({
    "1-10": 690,
    "11-15": 790,
    "16-20": 890,
    "20+": null
  })
});
