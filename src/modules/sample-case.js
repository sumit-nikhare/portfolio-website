import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clinics, initialReferral, updateReferral } from "./referral-state.js";
gsap.registerPlugin(ScrollTrigger);

export function initSampleCase(getMode) {
  const page = document.querySelector('[data-sample-case="continuum"]');
  if (!page || page.dataset.sampleReady) return;
  page.dataset.sampleReady = "true";
  const guide = page.querySelector("[data-guide-toggle]");
  const notes = [...page.querySelectorAll("[data-guide-note]")];
  let measureFrame = 0;
  const remeasure = () => {
    if (measureFrame) return;
    measureFrame = requestAnimationFrame(() => {
      measureFrame = 0;
      window.dispatchEvent(new Event("resize"));
      ScrollTrigger.refresh();
    });
  };
  // Individual notes still behave as native disclosures while the guide is on.
  notes.forEach((note) => note.addEventListener("toggle", remeasure));
  page.classList.add("guide-ready");
  guide.hidden = false;
  guide.addEventListener("click", () => {
    const before = guide.getBoundingClientRect().top;
    const enabled = guide.getAttribute("aria-pressed") !== "true";
    guide.setAttribute("aria-pressed", String(enabled));
    page.classList.toggle("guide-on", enabled);
    notes.forEach((note) => (note.open = enabled));
    const change = guide.getBoundingClientRect().top - before;
    if (change) window.scrollBy({ top: change, behavior: "instant" });
    remeasure();
  });

  const demo = page.querySelector("[data-referral-app]");
  const panels = [...demo.querySelectorAll("[data-referral-step]")];
  const radios = [...demo.querySelectorAll('input[name="clinic"]')];
  const error = demo.querySelector("[data-referral-error]");
  const offline = demo.querySelector("[data-referral-offline]");
  const reconnect = demo.querySelector('[data-referral-action="reconnect"]');
  const announcement = demo.querySelector("[data-referral-announcement]");
  let state = initialReferral();
  function render(focus = false) {
    const step = panels.find(
      (panel) => panel.dataset.referralStep === state.step,
    );
    panels.forEach((panel) => (panel.hidden = panel !== step));
    radios.forEach((radio) => {
      radio.checked = radio.value === state.destination;
      radio.setAttribute("aria-invalid", String(Boolean(state.error)));
    });
    offline.checked = state.offline;
    offline.disabled = state.status === "sent";
    error.textContent = state.error;
    demo.querySelectorAll("[data-referral-destination]").forEach((node) => {
      node.textContent = clinics[state.destination] || "Not selected";
    });
    demo.querySelector("[data-referral-network]").textContent = state.offline
      ? "Offline simulation"
      : "Online simulation";
    demo.querySelector("[data-referral-review-status]").textContent =
      state.offline
        ? "Will be saved locally and queued"
        : "Ready to send in this simulation";
    const queued = state.status === "queued";
    demo.querySelector("[data-referral-result]").textContent = queued
      ? "Queued until connected."
      : "Sent. The next owner is clear.";
    demo.querySelector("[data-referral-result-copy]").textContent = queued
      ? `The field worker still owns this handoff. The clinic has not received it. ${state.offline ? "Reconnect" : "Send the queued handoff"} to finish the simulation.`
      : "The clinic coordinator now owns the next action. This is a simulated confirmation; nothing was transmitted.";
    reconnect.hidden = !queued;
    reconnect.textContent = state.offline
      ? "Reconnect & send →"
      : "Send queued handoff →";
    demo.querySelector("[data-referral-step-label]").textContent =
      `${panels.indexOf(step) + 1} / 3`;
    if (focus) {
      if (state.error) radios[0].focus({ preventScroll: true });
      else
        step
          .querySelector("[data-step-heading]")
          .focus({ preventScroll: true });
      announcement.textContent =
        state.error ||
        (state.step === "confirm"
          ? queued
            ? "Referral queued. No handoff has been sent."
            : "Simulated handoff sent once."
          : state.step === "review"
            ? "Step 2 of 3. Review the handoff."
            : "Step 1 of 3. Choose a receiving clinic.");
    }
    remeasure();
  }
  const dispatch = (action, focus = true) => {
    state = updateReferral(state, action);
    render(focus);
  };
  demo.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    dispatch({ type: "review" });
  });
  radios.forEach((radio) =>
    radio.addEventListener("change", () =>
      dispatch({ type: "choose", value: radio.value }, false),
    ),
  );
  offline.addEventListener("change", () =>
    dispatch({ type: "offline", value: offline.checked }, false),
  );
  demo
    .querySelectorAll("[data-referral-action]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        dispatch({ type: button.dataset.referralAction }),
      ),
    );
  render();
  demo.hidden = false;
  page.querySelector("[data-referral-fallback]").hidden = true;

  let media;
  const setupMotion = () => {
    media?.revert();
    if (getMode() !== "full") return;
    media = gsap.matchMedia();
    media.add("(min-width: 1024px) and (pointer: fine)", () => {
      page.querySelectorAll("[data-sample-depth]").forEach((surface) => {
        gsap.fromTo(
          surface,
          { rotationX: 3, y: 18, z: -20, transformPerspective: 1200 },
          {
            rotationX: 0,
            y: 0,
            z: 0,
            ease: "none",
            scrollTrigger: {
              trigger: surface.parentElement,
              start: "top 92%",
              end: "top 62%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    });
  };
  setupMotion();
  document.addEventListener("portfolio:motion", setupMotion);
  window.addEventListener("pagehide", () => {
    media?.revert();
    cancelAnimationFrame(measureFrame);
    measureFrame = 0;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) setupMotion();
  });
  ScrollTrigger.refresh();
}
