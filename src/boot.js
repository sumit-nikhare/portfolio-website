// Restore display preferences before first paint; never gate page access.
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  // Restore the chosen palette before content can paint.
  let theme = "dark";
  try {
    if (localStorage.getItem("intent-portfolio-theme") === "light")
      theme = "light";
  } catch {}
  root.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f2f0e9" : "#101010");
  let mode = matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "reduced"
    : "full";
  try {
    const saved = localStorage.getItem("intent-portfolio-motion");
    if (["full", "reduced"].includes(saved)) mode = saved;
  } catch {}
  root.dataset.motion = mode;
})();
