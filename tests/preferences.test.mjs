import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../src/modules/preferences.js", import.meta.url),
  "utf8",
).replaceAll("export function", "function");
const KEY = "intent-portfolio-motion";

function setup({ saved = null, systemReduced = false, blocked = false } = {}) {
  const state = { saved, blocked, changes: 0 };
  const storage = {
    getItem() {
      if (state.blocked) throw Error("Storage unavailable");
      return state.saved;
    },
    setItem(_key, value) {
      if (state.blocked) throw Error("Storage unavailable");
      state.saved = value;
    },
  };
  const media = Object.assign(new EventTarget(), { matches: systemReduced });
  const label = { textContent: "" };
  const button = Object.assign(new EventTarget(), {
    attributes: {},
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    querySelector() {
      return label;
    },
  });
  const document = Object.assign(new EventTarget(), {
    documentElement: { dataset: {} },
    querySelectorAll() {
      return [button];
    },
  });
  document.addEventListener("portfolio:motion", () => state.changes++);
  const window = Object.assign(new EventTarget(), {
    matchMedia: () => media,
    localStorage: storage,
  });
  const context = { window, document, Event, CustomEvent };
  runInNewContext(`${source}\nglobalThis.mode = initPreferences();`, context);
  const dispatch = (type, properties = {}) =>
    window.dispatchEvent(Object.assign(new Event(type), properties));
  return {
    state,
    window,
    document,
    label,
    button,
    media,
    dispatch,
    mode: context.mode,
  };
}

test("cached pages restore a newer motion preference and update accessible controls once", () => {
  const s = setup({ saved: "full" });
  s.state.saved = "reduced";
  s.dispatch("pageshow", { persisted: true });
  assert.equal(s.mode(), "reduced");
  assert.equal(s.document.documentElement.dataset.motion, "reduced");
  assert.equal(s.button.attributes["aria-pressed"], "true");
  assert.equal(s.label.textContent, "Reduced motion");
  assert.equal(s.state.changes, 2);
  s.dispatch("pageshow", { persisted: true });
  assert.equal(s.state.changes, 2);
});

test("motion synchronizes across tabs and returns to system behavior when saved preference clears", () => {
  const s = setup({ saved: "full", systemReduced: true });
  s.state.saved = "reduced";
  s.dispatch("storage", { key: "unrelated" });
  assert.equal(s.mode(), "full");
  s.dispatch("storage", { key: KEY });
  assert.equal(s.mode(), "reduced");
  s.state.saved = null;
  s.dispatch("storage", { key: null });
  s.media.matches = false;
  s.media.dispatchEvent(new Event("change"));
  assert.equal(s.mode(), "full");
  s.button.dispatchEvent(new Event("click"));
  assert.equal(s.state.saved, "reduced");
  s.media.dispatchEvent(new Event("change"));
  assert.equal(s.mode(), "reduced");
});

test("blocked storage does not break switching or overwrite the current in-memory preference", () => {
  const s = setup({ blocked: true });
  s.button.dispatchEvent(new Event("click"));
  assert.equal(s.mode(), "reduced");
  s.dispatch("pageshow", { persisted: true });
  s.dispatch("storage", { key: KEY });
  assert.equal(s.mode(), "reduced");
  assert.equal(s.label.textContent, "Reduced motion");
});
