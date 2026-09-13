import { initCollections } from "./modules/collection.js";
import { initContact } from "./modules/contact.js";
import { initArticles } from "./modules/articles.js";
import { initPageMotion } from "./modules/page-motion.js";
import { initDisclosures } from "./modules/disclosures.js";
import {
  createIcons,
  X,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Check,
  ArrowUpRight,
  Sun,
  Moon,
} from "lucide";
import { initTheme } from "./modules/theme.js";
import { initPreferences } from "./modules/preferences.js";
import { initDialogs } from "./modules/dialogs.js";
import { initGallery } from "./modules/gallery.js";
import { initExplorers } from "./modules/explorer.js";
import { initDemo } from "./modules/demo.js";
import { initPlayground } from "./modules/playground.js";
import { initMotion } from "./modules/motion.js";

document.documentElement.classList.add("js");
document
  .querySelectorAll(".js-only")
  .forEach((element) => (element.hidden = false));
createIcons({
  icons: {
    X,
    Plus,
    Minus,
    ArrowLeft,
    ArrowRight,
    Maximize2,
    Check,
    ArrowUpRight,
    Sun,
    Moon,
  },
  attrs: { "stroke-width": 1.5 },
});
initTheme();
const getMode = initPreferences();
initPageMotion(getMode);
initDialogs(getMode);
initDisclosures(getMode);
initGallery();
initExplorers(getMode);
initDemo();
initPlayground(getMode);
initMotion(getMode);
initCollections(getMode);
initContact();
initArticles();

const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
let cleanScene,
  graphicsGeneration = 0;
async function configureGraphics() {
  const generation = ++graphicsGeneration;
  cleanScene?.();
  cleanScene = null;
  if (
    !desktop.matches ||
    getMode() !== "full" ||
    document.body.dataset.page !== "home"
  )
    return;
  try {
    const { initSculpture } = await import("./modules/sculpture.js");
    if (generation !== graphicsGeneration) return;
    cleanScene = await initSculpture(
      getMode,
      () => generation === graphicsGeneration,
    );
  } catch (error) {
    console.info(
      "The static artwork is active. Interactive graphics were unavailable.",
      error.message,
    );
  }
}
document.addEventListener("portfolio:motion", configureGraphics);
desktop.addEventListener("change", configureGraphics);
if ("requestIdleCallback" in window)
  requestIdleCallback(configureGraphics, { timeout: 1800 });
else setTimeout(configureGraphics, 400);
// Keep ordinary links, direct URLs and browser history intact.
document.querySelectorAll("[data-project-link]").forEach((link) =>
  link.addEventListener("click", (event) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      getMode() === "reduced"
    )
      return;
    document
      .querySelectorAll("[data-project-link]")
      .forEach((item) => (item.style.viewTransitionName = "none"));
    link.style.viewTransitionName = "project-cover";
    const title = link.closest("[data-project]")?.querySelector("h3");
    if (title) title.style.viewTransitionName = "project-title";
  }),
);
window.addEventListener("pageshow", (event) => {
  document
    .querySelectorAll("[data-project-link]")
    .forEach((item) => (item.style.viewTransitionName = "none"));
  document
    .querySelectorAll("[data-project] h3")
    .forEach((item) => (item.style.viewTransitionName = "none"));
  if (event.persisted) {
    configureGraphics();
    window.dispatchEvent(new Event("resize"));
  }
});
document.addEventListener("visibilitychange", () =>
  document
    .querySelectorAll(".ticker-track")
    .forEach(
      (track) =>
        (track.style.animationPlayState = document.hidden
          ? "paused"
          : "running"),
    ),
);
