export const clampZoom = (value) =>
  Math.max(1, Math.min(3, Math.round(value * 100) / 100));
export function initGallery() {
  const dialog = document.querySelector("#media-dialog");
  if (!dialog) return;
  const image = dialog.querySelector("[data-media-image]");
  const viewport = dialog.querySelector(".media-viewport");
  const caption = dialog.querySelector("#media-caption");
  const previous = dialog.querySelector("[data-media-prev]");
  const next = dialog.querySelector("[data-media-next]");
  const reset = dialog.querySelector("[data-zoom-reset]");
  let items = [],
    index = 0,
    zoom = 1;
  function setZoom(value) {
    zoom = clampZoom(value);
    image.style.width = `${zoom * 100}%`;
    image.style.height = `${zoom * 100}%`;
    reset.textContent = `${Math.round(zoom * 100)}%`;
    dialog.querySelector("[data-zoom-out]").disabled = zoom === 1;
    dialog.querySelector("[data-zoom-in]").disabled = zoom === 3;
    if (zoom === 1) viewport.scrollTo(0, 0);
  }
  function show(position) {
    index = Math.max(0, Math.min(items.length - 1, position));
    const item = items[index];
    image.src = item.href;
    image.alt =
      item.querySelector("img")?.alt || item.dataset.caption || "Project image";
    caption.textContent = item.dataset.caption || image.alt;
    dialog.querySelector("[data-media-count]").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
    setZoom(1);
  }
  document.querySelectorAll("[data-gallery]").forEach((link) =>
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      items = [...document.querySelectorAll("[data-gallery]")].filter(
        (item) => item.dataset.gallery === link.dataset.gallery,
      );
      show(items.indexOf(link));
      dialog.showModal();
    }),
  );
  previous.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  reset.addEventListener("click", () => setZoom(1));
  dialog
    .querySelector("[data-zoom-in]")
    .addEventListener("click", () => setZoom(zoom + 0.5));
  dialog
    .querySelector("[data-zoom-out]")
    .addEventListener("click", () => setZoom(zoom - 0.5));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && zoom === 1) {
      event.preventDefault();
      show(index + 1);
    }
    if (event.key === "ArrowLeft" && zoom === 1) {
      event.preventDefault();
      show(index - 1);
    }
    if (["+", "="].includes(event.key)) {
      event.preventDefault();
      setZoom(zoom + 0.5);
    }
    if (event.key === "-") {
      event.preventDefault();
      setZoom(zoom - 0.5);
    }
    if (event.key === "0") {
      event.preventDefault();
      setZoom(1);
    }
  });
}
