export function advanceDemo(step, preference) {
  if (step === 1 && !preference)
    return { step, error: "Choose a focus to continue." };
  return { step: Math.min(step + 1, 2), error: "" };
}
export function initDemo() {
  const root = document.querySelector("[data-demo]");
  if (!root) return;
  root.querySelector("[data-demo-interactive]").hidden = false;
  root.querySelector("[data-demo-static]").hidden = true;
  const panels = [...root.querySelectorAll("[data-demo-panel]")];
  const next = root.querySelector("[data-demo-next]");
  const back = root.querySelector("[data-demo-back]");
  const error = root.querySelector("[data-demo-error]");
  let step = 0,
    preference = "";
  function render(focus = true) {
    panels.forEach((panel, i) => (panel.hidden = i !== step));
    root
      .querySelectorAll(".demo-progress span")
      .forEach((segment, i) => segment.classList.toggle("active", i <= step));
    root
      .querySelector(".demo-progress")
      .setAttribute("aria-label", `Step ${step + 1} of 3`);
    next.textContent = ["Let’s begin →", "Create my space →", "Start again ↺"][
      step
    ];
    back.hidden = step === 0 || step === 2;
    root.querySelector("[data-demo-summary]").textContent =
      `Your focus: ${preference || "A fresh start"}`;
    if (focus) panels[step].querySelector("h3").focus({ preventScroll: true });
  }
  root.querySelectorAll('input[name="focus"]').forEach((input) =>
    input.addEventListener("change", () => {
      preference = input.value;
      error.textContent = "";
    }),
  );
  next.addEventListener("click", () => {
    if (step === 2) {
      step = 0;
      preference = "";
      root
        .querySelectorAll("input")
        .forEach((input) => (input.checked = false));
      error.textContent = "";
      render();
      return;
    }
    const result = advanceDemo(step, preference);
    error.textContent = result.error;
    if (result.error) {
      root.querySelector('input[name="focus"]').focus();
      return;
    }
    step = result.step;
    render();
  });
  back.addEventListener("click", () => {
    step = Math.max(0, step - 1);
    error.textContent = "";
    render();
  });
  render(false);
}
