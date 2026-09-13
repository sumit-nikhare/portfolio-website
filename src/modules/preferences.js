const KEY = "intent-portfolio-motion";
export function initialMode(storage, systemReduced) {
  try {
    const value = storage.getItem(KEY);
    if (["full", "reduced"].includes(value)) return value;
  } catch {}
  return systemReduced ? "reduced" : "full";
}
export function initPreferences() {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let storage;
  try {
    storage = window.localStorage;
  } catch {}
  let explicit = false;
  try {
    explicit = ["full", "reduced"].includes(storage?.getItem(KEY));
  } catch {}
  let mode = initialMode(storage, media.matches);
  const apply = () => {
    document.documentElement.dataset.motion = mode;
    document.querySelectorAll("[data-motion-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(mode === "reduced"));
      button.querySelector("[data-motion-label]").textContent =
        mode === "reduced" ? "Reduced motion" : "Full motion";
      button.setAttribute(
        "aria-label",
        `${mode === "reduced" ? "Reduced" : "Full"} motion enabled. Switch to ${mode === "reduced" ? "full" : "reduced"} motion.`,
      );
    });
    document.dispatchEvent(
      new CustomEvent("portfolio:motion", { detail: { mode } }),
    );
  };
  document.querySelectorAll("[data-motion-toggle]").forEach((button) =>
    button.addEventListener("click", () => {
      mode = mode === "full" ? "reduced" : "full";
      explicit = true;
      try {
        localStorage.setItem(KEY, mode);
      } catch {}
      apply();
    }),
  );
  media.addEventListener("change", () => {
    if (!explicit) {
      mode = media.matches ? "reduced" : "full";
      apply();
    }
  });
  apply();
  return () => mode;
}
