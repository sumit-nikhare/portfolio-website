import { motion } from "../config.js";
import { gsap } from "gsap";
export function initExplorers(getMode) {
  document.querySelectorAll("[data-explorer]").forEach((explorer) => {
    const tabs = [...explorer.querySelectorAll('[role="tab"]')];
    const panels = [...explorer.querySelectorAll(".evolution-panel")];
    let transition;
    const clear = () => {
      transition?.kill();
      gsap.killTweensOf(panels);
      gsap.set(explorer, { clearProps: "height,overflow" });
      gsap.set(panels, { clearProps: "transform,opacity" });
    };
    const activate = (tab, animate = true) => {
      const height = explorer.getBoundingClientRect().height;
      clear();
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(
        (panel) =>
          (panel.hidden = panel.id !== tab.getAttribute("aria-controls")),
      );
      if (animate && getMode() === "full") {
        const nextHeight = explorer.getBoundingClientRect().height;
        const panel = panels.find((item) => !item.hidden);
        gsap.set(explorer, { height, overflow: "clip" });
        transition = gsap.to(explorer, {
          height: nextHeight,
          duration: motion.layout,
          ease: motion.ease,
          onComplete: () => {
            clear();
            window.dispatchEvent(new Event("resize"));
          },
        });
        gsap.fromTo(
          panel,
          { opacity: 0.25, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: motion.panel,
            ease: motion.ease,
            clearProps: "transform,opacity",
          },
        );
      }
    };
    explorer.querySelector('[role="tablist"]').hidden = false;
    panels.forEach((panel) => panel.setAttribute("role", "tabpanel"));
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let destination;
        if (event.key === "ArrowRight") destination = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft")
          destination = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") destination = 0;
        if (event.key === "End") destination = tabs.length - 1;
        if (destination !== undefined) {
          event.preventDefault();
          tabs[destination].focus();
          activate(tabs[destination]);
        }
      });
    });
    document.addEventListener("portfolio:motion", () => {
      if (getMode() === "reduced") clear();
    });
    activate(tabs[0], false);
  });
  const chapters = document.querySelectorAll(
    ".case-chapter[id], .article-chapter[id]",
  );
  if (chapters.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            document.querySelectorAll(".case-index a").forEach((link) => {
              if (link.hash === `#${entry.target.id}`)
                link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
          }
      },
      { rootMargin: "-10% 0px -65% 0px" },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
  }
}
