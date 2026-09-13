// Animation timings are in seconds. Keep these restrained for readable motion.
// Colors, spacing, type, and breakpoints live at the top of src/styles.css.
export const motion = Object.freeze({
  ease: "power3.out",
  intro: 0.95,
  loaderDuration: 5,
  loaderEvery: 5, // Show on visits 1, 6, 11…; this setting is a visit count.
  loaderExit: 0.65,
  menuOpen: 0.65,
  menuClose: 0.3,
  menuStagger: 0.055,
  preview: 0.4,
  disclosure: 0.42,
  panel: 0.35,
  reveal: 0.85,
  assembly: 1.1,
  layout: 0.4,
  press: 0.45,
  themeReveal: 1.05,
  themeRevealMobile: 0.88,
  themeFade: 0.36,
  signatureReturn: 0.8,
  svgTrace: 4,
  sculptureEntry: 1.15,
  sculptureScrollScreens: 1.5,
  maxPixelRatio: 1.5,
});
