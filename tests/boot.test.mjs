import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
const source = readFileSync(new URL("../src/boot.js", import.meta.url), "utf8");
function boot(saved = {}, reduced = false, blocked = false) {
  const root = { dataset: {}, classList: { add() {} } };
  const accessed = [];
  let color;
  const context = {
    document: {
      documentElement: root,
      querySelector: () => ({ setAttribute: (_, value) => (color = value) }),
    },
    matchMedia: () => ({ matches: reduced }),
  };
  Object.defineProperty(context, "localStorage", {
    get() {
      if (blocked) throw new Error("Storage unavailable");
      return {
        getItem(key) {
          accessed.push(key);
          return saved[key] ?? null;
        },
      };
    },
  });
  // No body, window, timers or event handlers are provided: bootstrap must only
  // restore preferences, even for the old visits that used to lock interaction.
  runInNewContext(source, context);
  return { root, accessed, color };
}
test("bootstrap restores palette and explicit motion without a waiting state", () => {
  const result = boot(
    { "intent-portfolio-theme": "light", "intent-portfolio-motion": "full" },
    true,
  );
  assert.equal(result.root.dataset.theme, "light");
  assert.equal(result.root.dataset.motion, "full");
  assert.equal(result.root.dataset.intro, undefined);
  assert.equal(result.color, "#f2f0e9");
});
test("blocked storage retains the system preference and never requires a release timer", () => {
  const result = boot({}, true, true);
  assert.equal(result.root.dataset.theme, "dark");
  assert.equal(result.root.dataset.motion, "reduced");
  assert.equal(result.root.dataset.intro, undefined);
});
test("old visit values are neither read nor updated", () => {
  for (const visit of ["0", "1", "5", "10", "100", "invalid"]) {
    const result = boot({ "intent-portfolio-visits": visit });
    assert.deepEqual(result.accessed, [
      "intent-portfolio-theme",
      "intent-portfolio-motion",
    ]);
    assert.equal(result.root.dataset.intro, undefined);
  }
});
