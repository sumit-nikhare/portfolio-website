// Inlined before first paint by Vite; the five-second release is independent
// of the app bundle, so a failed animation import cannot leave the site locked.
(() => {
  const { duration, every } = __PORTFOLIO_LOADER__;
  const root = document.documentElement;
  root.classList.add("js");
  // Restore the chosen palette before content or the loader can paint.
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
  let visit = 1;
  try {
    const saved = Number(localStorage.getItem("intent-portfolio-visits"));
    if (
      Number.isSafeInteger(saved) &&
      saved >= 0 &&
      saved < Number.MAX_SAFE_INTEGER
    )
      visit = saved + 1;
    localStorage.setItem("intent-portfolio-visits", String(visit));
  } catch {}
  // Count full page openings and refreshes across tabs/sessions. History-cache
  // restores do not execute this script and therefore do not add a visit.
  if ((visit - 1) % every !== 0) return;
  root.dataset.intro = "loading";
  const intro = (window.portfolioIntro = {
    active: true,
    startedAt: null,
    remaining: () =>
      intro.startedAt === null
        ? duration
        : Math.max(0, duration - (performance.now() - intro.startedAt)),
  });
  const held = new Map();
  let observer, loader, previousFocus, deadline;
  const holdContent = () => {
    for (const element of document.body.children) {
      if (element === loader || held.has(element)) continue;
      held.set(element, element.inert);
      element.inert = true;
    }
  };
  const blockInteraction = (event) => {
    // Browser shortcuts remain available; page clicks and keys cannot skip the hold.
    if (
      event.type === "keydown" &&
      (event.metaKey || event.ctrlKey || event.altKey)
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const release = () => {
    if (!intro.active) return;
    if (intro.remaining() > 0) {
      deadline = setTimeout(release, intro.remaining());
      return;
    }
    clearTimeout(deadline);
    observer?.disconnect();
    intro.active = false;
    root.dataset.intro = "ready";
    held.forEach((inert, element) => {
      element.inert = inert;
    });
    held.clear();
    ["pointerdown", "click", "keydown"].forEach((type) =>
      document.removeEventListener(type, blockInteraction, true),
    );
    if (document.activeElement === loader && previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
    document.dispatchEvent(new Event("portfolio:intro-end"));
  };
  const start = () => {
    loader = document.querySelector(".site-loader");
    if (!loader) {
      requestAnimationFrame(start);
      return;
    }
    // Begin once the loader exists and can paint, rather than on the network request.
    intro.startedAt = performance.now();
    previousFocus = document.activeElement;
    holdContent();
    observer = new MutationObserver(holdContent);
    observer.observe(document.body, { childList: true });
    loader.focus({ preventScroll: true });
    deadline = setTimeout(release, duration);
    document.dispatchEvent(new Event("portfolio:intro-start"));
  };
  ["pointerdown", "click", "keydown"].forEach((type) =>
    document.addEventListener(type, blockInteraction, true),
  );
  requestAnimationFrame(start);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && intro.active) release();
  });
})();
