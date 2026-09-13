import { gsap } from "gsap";
import { motion } from "../config.js";

export function initDialogs(getMode) {
  const menu = document.querySelector("#navigation-dialog");
  const opener = document.querySelector("[data-menu-open]");
  let menuTimeline,
    previewTween,
    closing = false;
  const links = [...(menu?.querySelectorAll("nav a") || [])];
  const preview = menu?.querySelector("[data-nav-preview]");
  const decorations = menu
    ? [
        menu.querySelector(".nav-preview"),
        menu.querySelector(".nav-dialog-bottom"),
      ]
    : [];
  const clearMenu = () => {
    menuTimeline?.kill();
    previewTween?.kill();
    if (!menu) return;
    gsap.set([menu, ...links, ...decorations], {
      clearProps: "transform,opacity,clipPath",
    });
    if (preview)
      gsap.set(preview, { clearProps: "transform,opacity,clipPath" });
  };
  const close = (dialog, immediate = false) => {
    if (!dialog?.open) return;
    if (dialog !== menu || immediate || getMode() === "reduced") {
      dialog.close();
      return;
    }
    if (closing) return;
    closing = true;
    menuTimeline?.kill();
    menuTimeline = gsap
      .timeline({ onComplete: () => menu.close() })
      .to([...links, ...decorations], {
        y: -14,
        opacity: 0,
        duration: motion.menuClose * 0.7,
        stagger: 0.012,
        ease: "power2.in",
      })
      .to(
        menu,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: motion.menuClose,
          ease: "power3.inOut",
        },
        0.04,
      );
  };
  if (menu && opener) {
    opener.setAttribute("aria-expanded", "false");
    opener.addEventListener("click", () => {
      clearMenu();
      closing = false;
      menu.showModal();
      opener.setAttribute("aria-expanded", "true");
      if (getMode() === "reduced") return;
      menuTimeline = gsap
        .timeline()
        .fromTo(
          menu,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: motion.menuOpen,
            ease: "power3.inOut",
            clearProps: "clipPath",
          },
        )
        .fromTo(
          links,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: motion.menuStagger,
            ease: motion.ease,
            clearProps: "transform,opacity",
          },
          0.16,
        )
        .fromTo(
          decorations,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: motion.ease,
            clearProps: "transform,opacity",
          },
          0.3,
        );
    });
    menu.addEventListener("close", () => {
      clearMenu();
      closing = false;
      opener.setAttribute("aria-expanded", "false");
    });
    menu.addEventListener("cancel", (event) => {
      event.preventDefault();
      close(menu);
    });
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Modified clicks keep the current menu and preserve native new-tab behavior.
        if (
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        )
          close(menu, true);
      });
      const showPreview = () => {
        if (!preview || closing) return;
        const src = `${import.meta.env.BASE_URL}assets/${link.dataset.preview}-cover.webp`;
        if (preview.getAttribute("src") === src) return;
        previewTween?.kill();
        preview.src = src;
        preview.alt = `${link.dataset.preview} workflow illustration`;
        menu.querySelector(".nav-preview > span").textContent =
          `${link.dataset.preview.toUpperCase()} / WORKFLOW ILLUSTRATION`;
        if (getMode() === "full")
          previewTween = gsap.fromTo(
            preview,
            {
              opacity: 0.35,
              y: 16,
              rotation: 1,
              scale: 0.97,
              clipPath: "inset(0 0 12% 0)",
            },
            {
              opacity: 1,
              y: 0,
              rotation: 5,
              scale: 1,
              clipPath: "inset(0 0 0% 0)",
              duration: motion.preview,
              ease: motion.ease,
              clearProps: "transform,opacity,clipPath",
            },
          );
      };
      link.addEventListener("pointerenter", showPreview);
      link.addEventListener("focus", showPreview);
    });
    document.addEventListener("portfolio:motion", () => {
      if (getMode() !== "reduced") return;
      if (closing) menu.close();
      clearMenu();
    });
    window.addEventListener("pagehide", () => close(menu, true));
  }
  document
    .querySelectorAll("[data-close-dialog]")
    .forEach((button) =>
      button.addEventListener("click", () => close(button.closest("dialog"))),
    );
  document.querySelectorAll("dialog").forEach((dialog) =>
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        close(dialog);
    }),
  );
}
