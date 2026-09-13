import { gsap } from "gsap";
import { motion } from "../config.js";

export function initPageMotion(getMode) {
  const intro = window.portfolioIntro;
  let entrance, loader;
  const loaderElements = document.querySelectorAll(
    ".loader-mark, .loader-composition, .loader-shutters span",
  );
  const resetLoader = () => {
    loader?.kill();
    gsap.set(loaderElements, { clearProps: "transform,opacity" });
  };
  const animateLoader = () => {
    resetLoader();
    if (!intro?.active || intro.startedAt === null || getMode() === "reduced")
      return;
    const remaining = intro.remaining() / 1000;
    if (remaining < 0.1) return;
    const exit = Math.min(motion.loaderExit, remaining * 0.75);
    const stagger = Math.min(0.04, remaining * 0.05);
    const exitAt = Math.max(0, remaining - exit - stagger * 4);
    loader = gsap
      .timeline()
      .fromTo(
        ".loader-mark",
        { rotation: -60, scale: 0.85 },
        { rotation: 300, scale: 1, duration: remaining, ease: "power1.inOut" },
        0,
      )
      .to(
        ".loader-composition",
        {
          y: -30,
          opacity: 0,
          duration: Math.min(0.3, exit),
          ease: "power2.in",
        },
        Math.max(0, exitAt - 0.12),
      )
      .to(
        ".loader-shutters span",
        { yPercent: -102, duration: exit, stagger, ease: "power3.inOut" },
        exitAt,
      );
    // The bootstrap owns the deadline; animation completion never unlocks early.
  };
  const enterPage = () => {
    if (getMode() === "reduced") return;
    const heading = document.querySelector("#main h1");
    const titles = heading?.querySelectorAll(".hero-line");
    const lead = document.querySelectorAll(
      ".hero-lead, .case-intro > *, .hero-bottom > *, .article-deck",
    );
    entrance = gsap.context(() => {
      if (heading)
        gsap.from(titles?.length ? titles : heading, {
          y: 32,
          opacity: 0.15,
          duration: motion.intro,
          stagger: 0.07,
          ease: motion.ease,
          clearProps: "transform,opacity",
        });
      if (lead.length)
        gsap.from(lead, {
          y: 18,
          opacity: 0.25,
          duration: 0.7,
          stagger: 0.06,
          delay: 0.12,
          ease: motion.ease,
          clearProps: "transform,opacity",
        });
    });
  };
  if (intro?.active) {
    animateLoader();
    document.addEventListener("portfolio:intro-start", animateLoader, {
      once: true,
    });
    document.addEventListener(
      "portfolio:intro-end",
      () => {
        resetLoader();
        enterPage();
      },
      { once: true },
    );
  } else enterPage();
  document.addEventListener("portfolio:motion", () => {
    if (intro?.active) animateLoader();
    if (getMode() === "reduced") entrance?.revert();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      if (!intro?.active) resetLoader();
      entrance?.revert();
    }
  });
}
