import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "../config.js";
import { factHighlights } from "./home-depth-sequence.js";
gsap.registerPlugin(ScrollTrigger);

function initProfileFactHighlights(facts) {
  const rows = Array.from(facts?.children || []);
  if (!rows.length) return () => {};
  const state = { progress: 0 };
  const oldStyles = rows.map((row) =>
    row.style.getPropertyValue("--fact-focus"),
  );
  const oldPriorities = rows.map((row) =>
    row.style.getPropertyPriority("--fact-focus"),
  );
  const render = () => {
    factHighlights(state.progress, rows.length).forEach((value, index) => {
      rows[index].style.setProperty("--fact-focus", value.toFixed(6));
    });
  };
  rows.forEach((row) => {
    row.dataset.factDepth = "";
    gsap.set(row, {
      "--fact-depth": `${motion.profileFactDepth}px`,
      "--fact-tilt": `${motion.profileFactTilt}deg`,
      "--fact-lift": `${-motion.profileFactLift}px`,
    });
  });
  render();
  gsap.fromTo(
    state,
    { progress: 0 },
    {
      progress: 1,
      ease: "none",
      onUpdate: render,
      scrollTrigger: {
        // A single scrub drives all rows; independent catch-up tweens cannot
        // drift or create a dark gap between neighboring highlights.
        trigger: facts,
        start: "top 84%",
        end: "bottom 36%",
        scrub: motion.sectionScrub,
        invalidateOnRefresh: true,
      },
    },
  );
  return () => {
    rows.forEach((row, index) => {
      delete row.dataset.factDepth;
      if (oldStyles[index])
        row.style.setProperty(
          "--fact-focus",
          oldStyles[index],
          oldPriorities[index],
        );
      else row.style.removeProperty("--fact-focus");
    });
  };
}

function initPrincipleDepth() {
  const grid = document.querySelector(".home-principle-grid");
  const cards = Array.from(grid?.children || []);
  if (!cards.length) return () => {};
  cards.forEach((card) => (card.dataset.principleDepth = ""));
  gsap.fromTo(
    cards,
    {
      "--principle-z": `${-motion.principleDepth}px`,
      "--principle-y": `${motion.principleLift}px`,
      "--principle-pitch": `${motion.principleTilt}deg`,
      "--principle-yaw": (index) =>
        `${(index - (cards.length - 1) / 2) * 1.5}deg`,
      "--principle-light": 0,
    },
    {
      "--principle-z": "0px",
      "--principle-y": "0px",
      "--principle-pitch": "0deg",
      "--principle-yaw": "0deg",
      "--principle-light": 1,
      duration: 1,
      stagger: motion.principleStagger,
      ease: "sine.inOut",
      scrollTrigger: {
        trigger: grid,
        start: "top 92%",
        end: "top 36%",
        scrub: motion.sectionScrub,
        invalidateOnRefresh: true,
      },
    },
  );
  return () => cards.forEach((card) => delete card.dataset.principleDepth);
}

// Small perspective entrances for the 60-second version. Static parents own the
// scroll measurements, so transformed text cannot move its own trigger bounds.
function initProfileDepth() {
  const profile = document.querySelector(".home-profile");
  if (!profile) return () => {};
  const grid = profile.querySelector(".home-profile-grid");
  const facts = profile.querySelector(".home-profile-facts");
  const planes = [
    {
      element: profile.querySelector(".home-section-heading"),
      trigger: profile,
      start: "top 84%",
      end: "top 48%",
      yaw: 0,
    },
    {
      element: profile.querySelector(".home-profile-copy"),
      trigger: grid,
      start: "top 92%",
      end: "top 62%",
      yaw: 1.5,
    },
  ].filter(({ element, trigger }) => element && trigger);

  planes.forEach(({ element, trigger, start, end, yaw }) => {
    element.dataset.profilePlane = "entering";
    gsap.fromTo(
      element,
      {
        "--profile-z": `${-motion.profileDepth}px`,
        "--profile-pitch": `${motion.profileTilt}deg`,
        "--profile-yaw": `${yaw}deg`,
        "--profile-y": `${motion.profileLift}px`,
      },
      {
        "--profile-z": "0px",
        "--profile-pitch": "0deg",
        "--profile-yaw": "0deg",
        "--profile-y": "0px",
        ease: "power1.out",
        onUpdate() {
          // Remove the transform at rest for crisp text. Reversing the scroll
          // restores it at the matching pose, without a second entrance tween.
          const state = this.progress() >= 1 ? "settled" : "entering";
          if (element.dataset.profilePlane !== state)
            element.dataset.profilePlane = state;
        },
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: motion.profileScrub,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  const clearFacts = initProfileFactHighlights(facts);
  // GSAP's media context reverts the tweens and their inline properties.
  return () => {
    clearFacts();
    planes.forEach(({ element }) => delete element.dataset.profilePlane);
  };
}

export function initHomeDepth(getMode) {
  if (document.body.dataset.page !== "home") return;
  let media;
  function setup() {
    media?.revert();
    if (getMode() !== "full") return;
    media = gsap.matchMedia();
    media.add("(min-width: 1024px) and (pointer: fine)", () => {
      const cleanups = [initProfileDepth(), initPrincipleDepth()];
      document.querySelectorAll(".project-depth").forEach((surface) => {
        const trigger =
          surface.closest(".project-card") || surface.parentElement;
        surface.dataset.depthSurface = "";
        // Scroll and pointer motion own separate properties. The image's reveal
        // remains on its child, so one animation never overwrites another.
        gsap.fromTo(
          surface,
          {
            "--depth-enter": "9deg",
            "--depth-z": `${-motion.cardDepth}px`,
          },
          {
            "--depth-enter": "0deg",
            "--depth-z": "0px",
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top 94%",
              end: "top 55%",
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
          },
        );
        let tilt,
          tilted = false;
        const rest = () => {
          if (!tilted) return;
          tilt?.kill();
          tilted = false;
          gsap.set(surface, {
            "--depth-pitch": "0deg",
            "--depth-yaw": "0deg",
          });
        };
        const move = (event) => {
          if (event.pointerType === "touch" || document.hidden) return;
          const box = trigger.getBoundingClientRect();
          if (!box.width || !box.height) return;
          const x = gsap.utils.clamp(
            -1,
            1,
            ((event.clientX - box.left) / box.width) * 2 - 1,
          );
          const y = gsap.utils.clamp(
            -1,
            1,
            ((event.clientY - box.top) / box.height) * 2 - 1,
          );
          tilted = true;
          tilt?.kill();
          tilt = gsap.to(surface, {
            "--depth-pitch": `${-y * motion.cardTilt}deg`,
            "--depth-yaw": `${x * motion.cardTilt}deg`,
            duration: 0.45,
            ease: "power3.out",
          });
        };
        const leave = () => {
          if (!tilted) return;
          tilt?.kill();
          tilt = gsap.to(surface, {
            "--depth-pitch": "0deg",
            "--depth-yaw": "0deg",
            duration: 0.55,
            ease: "power3.out",
            onComplete: () => {
              tilted = false;
            },
          });
        };
        trigger.addEventListener("pointermove", move);
        trigger.addEventListener("pointerleave", leave);
        trigger.addEventListener("focusin", rest);
        window.addEventListener("scroll", rest, { passive: true });
        window.addEventListener("blur", rest);
        document.addEventListener("visibilitychange", rest);
        cleanups.push(() => {
          tilt?.kill();
          trigger.removeEventListener("pointermove", move);
          trigger.removeEventListener("pointerleave", leave);
          trigger.removeEventListener("focusin", rest);
          window.removeEventListener("scroll", rest);
          window.removeEventListener("blur", rest);
          document.removeEventListener("visibilitychange", rest);
          delete surface.dataset.depthSurface;
          [
            "--depth-enter",
            "--depth-z",
            "--depth-pitch",
            "--depth-yaw",
          ].forEach((name) => surface.style.removeProperty(name));
        });
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });
  }
  setup();
  document.addEventListener("portfolio:motion", setup);
  window.addEventListener("pagehide", () => media?.revert());
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) setup();
  });
}
