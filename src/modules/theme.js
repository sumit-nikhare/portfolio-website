import { createThemeMotion } from "./theme-motion.js";

const KEY = "intent-portfolio-theme";

export function initTheme() {
  const root = document.documentElement;
  let theme = root.dataset.theme === "light" ? "light" : "dark";
  const transition = createThemeMotion();

  const apply = () => {
    root.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f2f0e9" : "#101010");
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const label = theme === "light" ? "Light theme" : "Dark theme";
      const next = theme === "light" ? "dark" : "light";
      button.setAttribute("aria-pressed", String(theme === "light"));
      button.setAttribute(
        "aria-label",
        `${label} enabled. Switch to ${next} theme.`,
      );
      button.setAttribute("title", `Switch to ${next} theme`);
      button.querySelector("[data-theme-label]").textContent = label;
    });
    document.dispatchEvent(new Event("portfolio:theme"));
  };
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem(KEY, theme);
      } catch {}
      transition.run(apply, button);
    });
  });
  // Keep existing tabs and restored history pages in sync with the saved choice.
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY && event.key !== null) return;
    try {
      theme = localStorage.getItem(KEY) === "light" ? "light" : "dark";
      transition.cancel();
      apply();
    } catch {}
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    try {
      theme = localStorage.getItem(KEY) === "light" ? "light" : "dark";
      transition.cancel();
      apply();
    } catch {}
  });
  apply();
}
