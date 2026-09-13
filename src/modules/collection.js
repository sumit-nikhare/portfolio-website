import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { motion } from "../config.js";
gsap.registerPlugin(Flip);
export function initCollections(getMode) {
  document.querySelectorAll("[data-collection]").forEach((collection) => {
    const items = [...collection.querySelectorAll("[data-collection-item]")];
    const filters = [...collection.querySelectorAll("[data-filter]")];
    const grid = collection.querySelector("[data-collection-grid]");
    const search = collection.querySelector("[data-search]");
    const params = new URLSearchParams(location.search);
    let category = filters.some((b) => b.dataset.filter === params.get("topic"))
      ? params.get("topic")
      : "all";
    let view =
      params.get("view") === "list" && collection.querySelector("[data-view]")
        ? "list"
        : "grid";
    if (search) search.value = params.get("q") || "";
    function apply(animate = true, updateUrl = true) {
      Flip.killFlipsOf(items);
      const state =
        animate && getMode() === "full"
          ? Flip.getState(items.filter((item) => !item.hidden))
          : null;
      const query = (search?.value || "").trim().toLowerCase();
      filters.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === category),
        ),
      );
      items.forEach((item) => {
        item.hidden =
          !(category === "all" || item.dataset.category === category) ||
          !item.dataset.title.toLowerCase().includes(query);
      });
      const visible = items.filter((item) => !item.hidden);
      grid.classList.toggle("is-list", view === "list");
      collection
        .querySelectorAll("[data-view]")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.view === view),
          ),
        );
      const noun = collection.dataset.itemLabel || "projects";
      collection.querySelector("[data-collection-count]").textContent =
        `Showing ${visible.length} of ${items.length} ${noun}`;
      const empty = collection.querySelector("[data-collection-empty]");
      if (empty) empty.hidden = visible.length > 0;
      if (state)
        Flip.from(state, {
          duration: motion.layout,
          ease: motion.ease,
          absolute: true,
          prune: true,
        });
      if (updateUrl) {
        const url = new URL(location.href);
        category === "all"
          ? url.searchParams.delete("topic")
          : url.searchParams.set("topic", category);
        query
          ? url.searchParams.set("q", search.value.trim())
          : url.searchParams.delete("q");
        view === "list"
          ? url.searchParams.set("view", view)
          : url.searchParams.delete("view");
        history.replaceState(null, "", url);
      }
      window.dispatchEvent(new Event("resize"));
    }
    filters.forEach((button) =>
      button.addEventListener("click", () => {
        category = button.dataset.filter;
        apply();
      }),
    );
    collection.querySelectorAll("[data-view]").forEach((button) =>
      button.addEventListener("click", () => {
        view = button.dataset.view;
        apply();
      }),
    );
    search?.addEventListener("input", () => apply(false));
    collection
      .querySelector("[data-reset-collection]")
      ?.addEventListener("click", () => {
        category = "all";
        if (search) search.value = "";
        apply();
        search?.focus();
      });
    document.addEventListener("portfolio:motion", () => {
      Flip.killFlipsOf(items);
      gsap.set(items, {
        clearProps: "transform,position,top,left,width,height",
      });
    });
    apply(false, false);
  });
}
