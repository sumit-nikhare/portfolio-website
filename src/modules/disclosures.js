import { gsap } from "gsap";
import { motion } from "../config.js";

export function initDisclosures(getMode) {
  document
    .querySelectorAll("details:not(.static-menu):not([data-guide-note])")
    .forEach((details) => {
      const summary = details.querySelector(":scope > summary");
      if (!summary) return;
      const content = document.createElement("div");
      content.className = "disclosure-content";
      while (summary.nextSibling) content.append(summary.nextSibling);
      details.append(content);
      let target = details.open;
      let tween;
      const finish = () => {
        tween?.kill();
        tween = null;
        gsap.killTweensOf(content);
        details.open = target;
        details.style.height = "";
        details.style.overflow = "";
        gsap.set(content, { clearProps: "transform,opacity" });
        summary.removeAttribute("data-expanded");
        window.dispatchEvent(new Event("resize"));
      };
      const animate = () => {
        const start = details.getBoundingClientRect().height;
        tween?.kill();
        gsap.killTweensOf(content);
        details.open = true;
        details.style.height = "auto";
        const styles = getComputedStyle(details);
        const border =
          parseFloat(styles.borderTopWidth) +
          parseFloat(styles.borderBottomWidth);
        const padding =
          parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        const end = target
          ? details.getBoundingClientRect().height
          : summary.getBoundingClientRect().height + border + padding;
        details.style.height = `${start}px`;
        details.style.overflow = "clip";
        summary.dataset.expanded = String(target);
        tween = gsap.to(details, {
          height: end,
          duration: motion.disclosure,
          ease: "power3.inOut",
          onComplete: finish,
        });
        gsap.to(content, {
          opacity: target ? 1 : 0,
          y: target ? 0 : -8,
          duration: motion.disclosure * 0.75,
          overwrite: true,
        });
      };
      summary.addEventListener("click", (event) => {
        // Native details remains the fallback, including Enter and Space activation.
        event.preventDefault();
        target = tween ? !target : !details.open;
        if (!target && content.contains(document.activeElement))
          summary.focus({ preventScroll: true });
        if (getMode() === "reduced") finish();
        else animate();
      });
      new ResizeObserver(() => {
        if (tween) animate();
      }).observe(content);
      document.addEventListener("portfolio:motion", () => {
        if (getMode() === "reduced") finish();
      });
      window.addEventListener("pagehide", () => {
        if (tween) finish();
      });
    });
}
