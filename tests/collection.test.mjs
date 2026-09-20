import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../src/modules/collection.js", import.meta.url),
  "utf8",
)
  .replace(/^import .+;\n/gm, "")
  .replace("export function", "function");

// Exercise the real collection event handlers. These DOM/animation doubles
// check filtering, grouping and URL state; browser rendering remains separate.
function element(dataset = {}, children = []) {
  const classes = new Set();
  return Object.assign(new EventTarget(), {
    dataset,
    hidden: false,
    textContent: "",
    value: "",
    selectors: {},
    attributes: {},
    querySelectorAll(key) {
      return this.selectors[key] || [];
    },
    querySelector(key) {
      return this.querySelectorAll(key)[0] || null;
    },
    contains(item) {
      return children.includes(item);
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    focus() {
      this.focused = true;
    },
    classList: {
      toggle(name, active) {
        active ? classes.add(name) : classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
  });
}

function setup({ url = "https://portfolio.test/work/", blog = false } = {}) {
  const categories = blog
    ? ["design", "interaction", "design"]
    : ["product", "product", "mobile", "data", "mobile", "systems", "systems"];
  const titles = blog
    ? ["Clear products", "Motion with purpose", "Design decisions"]
    : categories;
  const items = categories.map((category, i) =>
    element({ category, title: titles[i] }),
  );
  const groups = blog
    ? []
    : [
        element({}, items.slice(0, 3)),
        element({}, items.slice(3, 5)),
        element({}, items.slice(5)),
      ];
  const freelance = element({}, [element(), element(), element()]);
  const filters = ["all", ...new Set(categories)].map((filter) =>
    element({ filter }),
  );
  const views = blog ? [] : ["grid", "list"].map((view) => element({ view }));
  const grid = element({}, blog ? items : items.slice(0, 3));
  const count = element();
  const search = blog ? element() : null;
  const reset = element();
  const empty = element();
  const collection = element({
    itemLabel: blog ? "articles" : "employment projects",
  });
  collection.selectors = {
    "[data-collection-item]": items,
    "[data-collection-group]": groups,
    "[data-filter]": filters,
    "[data-view]": views,
    "[data-collection-grid]": [grid],
    "[data-collection-count]": [count],
    "[data-search]": search ? [search] : [],
    "[data-reset-collection]": [reset],
    "[data-collection-empty]": [empty],
  };
  const document = element();
  document.selectors["[data-collection]"] = [collection];
  const location = new URL(url);
  const state = { mode: "full", flips: 0, cleanups: 0 };
  const window = new EventTarget();
  runInNewContext(`${source}\ninitCollections(getMode);`, {
    document,
    location,
    URL,
    URLSearchParams,
    Event,
    window,
    history: {
      replaceState(_state, _title, next) {
        location.href = next.href;
      },
    },
    motion: { layout: 0.4, ease: "power3.out" },
    getMode: () => state.mode,
    gsap: {
      registerPlugin() {},
      set() {
        state.cleanups++;
      },
    },
    Flip: {
      killFlipsOf() {},
      getState: (targets) => targets,
      from() {
        state.flips++;
      },
    },
  });
  return {
    items,
    groups,
    freelance,
    grid,
    count,
    filters,
    views,
    search,
    reset,
    empty,
    document,
    window,
    location,
    state,
    choose: (category) =>
      filters
        .find((button) => button.dataset.filter === category)
        .dispatchEvent(new Event("click")),
    visible: () => items.filter((item) => !item.hidden).length,
  };
}

test("grouped employment filters hide empty sections without counting or hiding freelance previews", () => {
  const s = setup();
  assert.equal(s.count.textContent, "Showing 7 of 7 employment projects");
  s.choose("systems");
  assert.equal(s.visible(), 2);
  assert.deepEqual(
    s.groups.map((group) => group.hidden),
    [true, true, false],
  );
  assert.equal(s.freelance.hidden, false);
  assert.equal(s.count.textContent, "Showing 2 of 7 employment projects");
  assert.ok(s.views.every((button) => button.disabled));
  s.choose("mobile");
  assert.ok(s.views.every((button) => !button.disabled));
  assert.deepEqual(
    s.groups.map((group) => group.hidden),
    [false, false, true],
  );
  s.choose("all");
  assert.equal(s.visible(), 7);
  assert.ok(s.groups.every((group) => !group.hidden));
  assert.equal(s.location.search, "");
});

test("direct filtered URLs restore groups and list preference while preserving a freelance hash", () => {
  const s = setup({
    url: "https://portfolio.test/work/?topic=systems&view=list#freelance",
  });
  assert.equal(s.visible(), 2);
  assert.equal(s.grid.classList.contains("is-list"), true);
  assert.equal(s.views[1].attributes["aria-pressed"], "true");
  s.choose("all");
  assert.equal(s.location.searchParams.get("topic"), null);
  assert.equal(s.location.searchParams.get("view"), "list");
  assert.equal(s.location.hash, "#freelance");
});

test("repeated group changes and a reduced-motion switch retain the final visible state", () => {
  const s = setup();
  const initialCleanups = s.state.cleanups;
  for (const category of ["data", "systems", "product", "all"])
    s.choose(category);
  const fullMotionFlips = s.state.flips;
  s.state.mode = "reduced";
  s.document.dispatchEvent(new Event("portfolio:motion"));
  s.choose("data");
  assert.equal(s.state.cleanups, initialCleanups + 1);
  assert.equal(s.state.flips, fullMotionFlips);
  assert.equal(s.visible(), 1);
  assert.deepEqual(
    s.groups.map((group) => group.hidden),
    [true, false, true],
  );
  assert.equal(s.freelance.hidden, false);
});

test("history restoration resets filters, layout and search from the actual URL", () => {
  const s = setup();
  s.choose("product");
  s.location.href =
    "https://portfolio.test/work/?topic=systems&view=list#archive";
  s.window.dispatchEvent(new Event("popstate"));
  assert.equal(s.visible(), 2);
  assert.ok(s.grid.classList.contains("is-list"));
  assert.equal(s.location.hash, "#archive");
  const cleanups = s.state.cleanups;
  s.window.dispatchEvent(new Event("pagehide"));
  assert.equal(s.state.cleanups, cleanups + 1);
  s.location.href = "https://portfolio.test/work/";
  s.window.dispatchEvent(
    Object.assign(new Event("pageshow"), { persisted: true }),
  );
  assert.equal(s.visible(), 7);
  assert.ok(!s.grid.classList.contains("is-list"));

  const blog = setup({ blog: true });
  blog.location.href = "https://portfolio.test/blogs/?q=motion&topic=unknown";
  blog.window.dispatchEvent(new Event("popstate"));
  assert.equal(blog.search.value, "motion");
  assert.equal(blog.visible(), 1);
  assert.equal(blog.filters[0].attributes["aria-pressed"], "true");
});

test("the ungrouped blog still supports search, empty results, and reset", () => {
  const s = setup({
    blog: true,
    url: "https://portfolio.test/blogs/?q=motion",
  });
  assert.equal(s.count.textContent, "Showing 1 of 3 articles");
  assert.equal(s.search.value, "motion");
  s.search.value = "no matching article";
  s.search.dispatchEvent(new Event("input"));
  assert.equal(s.empty.hidden, false);
  assert.equal(s.visible(), 0);
  s.reset.dispatchEvent(new Event("click"));
  assert.equal(s.visible(), 3);
  assert.equal(s.empty.hidden, true);
  assert.equal(s.search.focused, true);
  assert.equal(s.location.search, "");
});
