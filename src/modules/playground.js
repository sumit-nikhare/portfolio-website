import { motion } from "../config.js";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);
export function initPlayground(getMode) {
  const output = document.querySelector("[data-type-output]");
  if (output) {
    document
      .querySelector("[data-type-text]")
      .addEventListener(
        "input",
        (event) => (output.textContent = event.target.value || "What if?"),
      );
    document
      .querySelector("[data-type-weight]")
      .addEventListener("input", (event) => {
        output.style.fontWeight = event.target.value;
        document.querySelector("[data-weight-value]").textContent =
          event.target.value;
      });
    document
      .querySelector("[data-type-tracking]")
      .addEventListener("input", (event) => {
        output.style.letterSpacing = `${event.target.value}em`;
        document.querySelector("[data-tracking-value]").textContent =
          `${event.target.value}em`;
      });
  }
  const card = document.querySelector("[data-component-card]");
  if (card) {
    document
      .querySelector("[data-radius]")
      .addEventListener("input", (event) => {
        card.style.borderRadius = `${event.target.value}px`;
        document.querySelector("[data-radius-value]").textContent =
          `${event.target.value}px`;
      });
    const density = document.querySelector("[data-density]");
    density.addEventListener("change", () => {
      const state = Flip.getState(card);
      card.style.padding = density.checked ? "36px" : "25px";
      if (getMode() === "full")
        Flip.from(state, { duration: motion.layout, ease: "power3.out" });
    });
    const save = document.querySelector("[data-save-component]");
    save.addEventListener("click", () => {
      const active = save.getAttribute("aria-pressed") !== "true";
      save.setAttribute("aria-pressed", String(active));
      save.classList.toggle("saved", active);
      save.textContent = active
        ? "Saved to your collection ✓"
        : "Save something good ↗";
      if (getMode() === "full")
        gsap.fromTo(
          save,
          { scale: 0.97 },
          { scale: 1, duration: motion.press, ease: "back.out(2)" },
        );
    });
  }
  const path = document.querySelector("[data-svg-path]");
  if (path) {
    const dot = document.querySelector("[data-svg-dot]");
    const length = path.getTotalLength();
    const state = { progress: 0 };
    let tween;
    const replay = document.querySelector("[data-svg-replay]");
    const pause = document.querySelector("[data-svg-pause]");
    function update() {
      const point = path.getPointAtLength(length * state.progress);
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length * (1 - state.progress)}`;
    }
    function play() {
      tween?.kill();
      state.progress = getMode() === "reduced" ? 1 : 0;
      update();
      pause.textContent = "Pause";
      pause.setAttribute("aria-pressed", "false");
      pause.disabled = getMode() === "reduced";
      if (getMode() === "full")
        tween = gsap.to(state, {
          progress: 1,
          duration: motion.svgTrace,
          ease: "power1.inOut",
          onUpdate: update,
          onComplete: () => (pause.disabled = true),
        });
    }
    replay.addEventListener("click", play);
    pause.addEventListener("click", () => {
      if (!tween) return;
      tween.paused(!tween.paused());
      pause.textContent = tween.paused() ? "Resume" : "Pause";
      pause.setAttribute("aria-pressed", String(tween.paused()));
    });
    document.addEventListener("portfolio:motion", play);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && tween?.isActive()) {
        tween.pause();
        pause.textContent = "Resume";
        pause.setAttribute("aria-pressed", "true");
      }
    });
    state.progress = 1;
    update();
  }
}
