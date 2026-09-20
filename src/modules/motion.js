import { motion } from "../config.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function initMotion(getMode) {
  let context;
  let revealObserver;
  let media;
  const revealed = new WeakSet();
  function setup() {
    revealObserver?.disconnect();
    media?.revert();
    context?.revert();
    if (getMode() === "reduced") return;
    context = gsap.context(() => {
      document
        .querySelectorAll(
          ".section-heading h2, .about-grid h2, .case-chapter>h2, .experiment-heading, [data-reveal], .editorial-heading h2, .page-cta h2",
        )
        .forEach((element) => {
          if (revealed.has(element)) return;
          gsap.from(element, {
            y: 38,
            opacity: 0,
            duration: motion.reveal,
            ease: motion.ease,
            clearProps: "transform,opacity",
            onStart: () => revealed.add(element),
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
          });
        });
      document.querySelectorAll(".project-card").forEach((card) => {
        if (revealed.has(card)) return;
        gsap
          .timeline({
            defaults: { duration: motion.reveal, ease: motion.ease },
            onStart: () => revealed.add(card),
            scrollTrigger: { trigger: card, start: "top 94%", once: true },
          })
          .from(card.querySelector(".project-image"), {
            clipPath: "inset(12% 0 12% 0)",
            y: 28,
            opacity: 0,
            clearProps: "transform,opacity,clipPath",
          })
          .from(
            card.querySelectorAll(".project-meta > *"),
            {
              y: 18,
              opacity: 0,
              stagger: 0.09,
              clearProps: "transform,opacity",
            },
            "-=0.5",
          );
      });
      document.querySelectorAll(".assembly").forEach((assembly) => {
        if (revealed.has(assembly)) return;
        gsap.from(assembly.querySelectorAll(".assembly-layer"), {
          y: 90,
          opacity: 0,
          rotation: (i) => (i - 1) * 25,
          duration: motion.assembly,
          stagger: 0.16,
          ease: motion.ease,
          clearProps: "transform,opacity",
          onStart: () => revealed.add(assembly),
          scrollTrigger: { trigger: assembly, start: "top 82%", once: true },
        });
      });
      media = gsap.matchMedia();
      media.add("(min-width: 1024px) and (pointer: fine)", () => {
        document
          .querySelectorAll(
            ".case-cover img, .portrait-orbits, .article-hero .art-shape",
          )
          .forEach((element) => {
            gsap.fromTo(
              element,
              {
                yPercent: -2,
                scale: element.matches(".case-cover img") ? 1.05 : 1,
              },
              {
                yPercent: 2,
                ease: "none",
                scrollTrigger: {
                  trigger: element.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.7,
                },
              },
            );
          });
      });
      if (document.querySelector(".about-star"))
        media.add("(min-width: 1024px)", () => {
          gsap.to(".about-star", {
            rotation: 90,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-art",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      // Animate children, leaving collection parents free for grid/list Flip.
      // Start at intersection so filtered items never remain invisibly staged.
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || revealed.has(entry.target)) return;
            revealed.add(entry.target);
            revealObserver.unobserve(entry.target);
            context.add(() => {
              gsap.from(entry.target.children, {
                y: 26,
                opacity: 0.2,
                duration: motion.reveal,
                stagger: 0.08,
                ease: motion.ease,
                clearProps: "transform,opacity",
              });
            });
          });
        },
        { threshold: 0.08 },
      );
      document
        .querySelectorAll(
          ".work-card, .journal-card, .case-facts, .intro-strip",
        )
        .forEach((element) => revealObserver.observe(element));
    });
  }
  setup();
  document.addEventListener("portfolio:motion", setup);
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
  // Native scrolling with an inexpensive, once-per-frame progress update.
  const progress = document.querySelector(".site-scroll-progress > span");
  // Articles already have their own progress indicator for the reading body.
  if (progress && document.querySelector("[data-reading-progress]"))
    progress.parentElement.hidden = true;
  let scrollFrame = 0;
  const updateProgress = () => {
    scrollFrame = 0;
    if (!progress || getMode() === "reduced" || document.hidden) return;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const value =
      distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0;
    progress.style.transform = `scaleX(${value})`;
  };
  const queueProgress = () => {
    if (!scrollFrame && getMode() === "full" && !document.hidden)
      scrollFrame = requestAnimationFrame(updateProgress);
  };
  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress);
  window.addEventListener("pageshow", queueProgress);
  document.addEventListener("portfolio:motion", queueProgress);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    } else queueProgress();
  });
  new ResizeObserver(queueProgress).observe(document.body);
  queueProgress();
  const signature = document.querySelector("[data-signature]");
  const words = [
    ...(signature?.querySelectorAll("[data-signature-word]") || []),
  ];
  const text = words.map((word) => word.textContent);
  let signatureTimeline;
  const resetSignature = () => {
    signatureTimeline?.kill();
    words.forEach((word, i) => {
      word.textContent = text[i];
      word.style.width = "";
    });
  };
  signature?.addEventListener("click", () => {
    if (getMode() === "reduced") return;
    resetSignature();
    words.forEach((word, i) => {
      word.style.width = `${word.getBoundingClientRect().width}px`;
      word.replaceChildren(
        ...Array.from(text[i], (letter) => {
          const span = document.createElement("span");
          span.textContent = letter;
          span.dataset.signatureLetter = "";
          span.setAttribute("aria-hidden", "true");
          return span;
        }),
      );
    });
    const letters = signature.querySelectorAll("[data-signature-letter]");
    signatureTimeline = gsap
      .timeline({ onComplete: resetSignature })
      .to(letters, {
        x: (i) => Math.sin(i * 5) * 16,
        y: (i) => Math.cos(i * 3) * 22,
        rotation: (i) => (i % 2 ? -1 : 1) * 13,
        duration: motion.press,
        stagger: 0.018,
        ease: "power2.out",
      })
      .to(
        letters,
        {
          x: 0,
          y: 0,
          rotation: 0,
          duration: motion.signatureReturn,
          stagger: 0.018,
          ease: "elastic.out(1,.6)",
        },
        "+=.25",
      );
  });
  document.addEventListener("portfolio:motion", () => {
    if (getMode() === "reduced") resetSignature();
  });
  window.addEventListener("pagehide", () => {
    resetSignature();
    revealObserver?.disconnect();
    media?.revert();
    context?.revert();
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) setup();
  });
}
