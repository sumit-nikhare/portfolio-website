import { gsap } from "gsap";
import { motion } from "../config.js";

export function initPageMotion(getMode) {
  let entrance;
  const enterPage = () => {
    entrance?.revert();
    if (getMode() === "reduced") return;
    const heading = document.querySelector("#main h1");
    const titles = heading?.querySelectorAll(".hero-line");
    const lead = document.querySelectorAll(
      ".hero-lead, .case-intro > *, .hero-bottom > *, .article-deck",
    );
    entrance = gsap.context(() => {
      gsap.from(".site-header .brand-mark", {
        rotation: -35,
        scale: 0.88,
        opacity: 0.6,
        duration: motion.brandIntro,
        ease: motion.ease,
        clearProps: "transform,opacity",
      });
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
  enterPage();
  document.addEventListener("portfolio:motion", () => {
    if (getMode() === "reduced") entrance?.revert();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) entrance?.revert();
  });
  window.addEventListener("pagehide", () => entrance?.revert());
}
