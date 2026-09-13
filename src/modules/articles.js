export function initArticles() {
  document
    .querySelector("[data-print-resume]")
    ?.addEventListener("click", () => window.print());
  const copy = document.querySelector("[data-copy-link]");
  copy?.addEventListener("click", async () => {
    const status = document.querySelector("[data-share-status]");
    const url = new URL(location.href);
    url.hash = "";
    try {
      await navigator.clipboard.writeText(url.href);
      status.textContent = "Article link copied.";
    } catch {
      status.textContent = `Copy this link: ${url.href}`;
    }
  });
  const body = document.querySelector("[data-reading-body]");
  const bar = document.querySelector("[data-reading-progress]");
  if (!body || !bar) return;
  let frame;
  const update = () => {
    frame = null;
    const rect = body.getBoundingClientRect();
    const progress = Math.max(
      0,
      Math.min(1, (innerHeight - rect.top) / (rect.height + innerHeight)),
    );
    bar.style.transform = `scaleX(${progress})`;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}
