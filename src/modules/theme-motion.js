import { motion } from "../config.js";

// Native snapshots keep the actual DOM, focus, scroll position and canvas intact.
// A registered radius gives the reveal a soft edge instead of a hard circle cut.
export function createThemeMotion() {
  const root = document.documentElement;
  let active = null;
  const properties = [
    "--theme-x",
    "--theme-y",
    "--theme-end",
    "--theme-feather",
    "--theme-duration",
  ];

  const cleanup = (state) => {
    clearTimeout(state.timer);
    if (active !== state) return;
    delete root.dataset.themeTransition;
    properties.forEach((property) => root.style.removeProperty(property));
    active = null;
  };
  const cancel = () => {
    if (!active) return;
    const state = active;
    state.transition?.skipTransition();
    // A skipped View Transition still calls its update callback. Commit now and
    // guard that callback below so an old click cannot undo a newer preference.
    state.commit();
    cleanup(state);
  };
  const canAnimate = () => root.dataset.motion === "full" && !document.hidden;

  const run = (commit, button) => {
    if (active) {
      // Settle on this request even when its callback differs from the last one.
      active.commit = commit;
      cancel();
      return;
    }
    if (!canAnimate()) {
      commit();
      return;
    }

    const state = { commit, transition: null, timer: null };
    active = state;
    const { innerWidth, innerHeight } = window;
    const duration =
      (innerWidth < 768 ? motion.themeRevealMobile : motion.themeReveal) * 1000;
    const box = button.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth, box.x + box.width / 2));
    const y = Math.max(0, Math.min(innerHeight, box.y + box.height / 2));
    const feather = Math.min(140, Math.max(56, innerWidth * 0.075));
    const radius =
      Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) +
      feather;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-end", `${radius}px`);
    root.style.setProperty("--theme-feather", `${feather}px`);
    root.style.setProperty("--theme-duration", `${duration}ms`);

    const fade = () => {
      if (active !== state) return;
      root.dataset.themeTransition = "fade";
      root.style.setProperty("--theme-duration", `${motion.themeFade}s`);
      // Establish transitions on the current palette before changing its values.
      void window.getComputedStyle(root).backgroundColor;
      commit();
      state.timer = setTimeout(
        () => cleanup(state),
        motion.themeFade * 1000 + 60,
      );
    };
    if (
      typeof document.startViewTransition !== "function" ||
      typeof window.CSS?.registerProperty !== "function" ||
      !window.CSS?.supports?.(
        "mask-image",
        "radial-gradient(black, transparent)",
      )
    ) {
      fade();
      return;
    }

    // Project covers/titles normally own navigation snapshots. Capture one root
    // for a theme switch so no independently layered artwork escapes the reveal.
    root.dataset.themeTransition = "reveal";
    try {
      state.transition = document.startViewTransition(() => {
        if (active === state) commit();
      });
      state.transition.ready.catch(() => {
        if (active === state) {
          commit();
          cleanup(state);
        }
      });
      state.transition.finished.then(
        () => cleanup(state),
        () => cleanup(state),
      );
      // Also release our state if a browser never resolves an interrupted API call.
      state.timer = setTimeout(() => {
        if (active === state) cancel();
      }, duration + 1200);
    } catch {
      fade();
    }
  };

  document.addEventListener("portfolio:motion", () => {
    if (!canAnimate()) cancel();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancel();
  });
  // User navigation and scrolling always take precedence over the visual effect.
  window.addEventListener("scroll", cancel, { passive: true, capture: true });
  window.addEventListener("resize", cancel, { passive: true });
  window.addEventListener("pagehide", cancel);
  window.addEventListener("beforeprint", cancel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cancel();
  });
  document.addEventListener(
    "click",
    (event) => {
      if (event.target instanceof Element && event.target.closest("a[href]"))
        cancel();
    },
    true,
  );
  return { run, cancel };
}
