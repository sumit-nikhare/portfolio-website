import test from "node:test";
import assert from "node:assert/strict";
import { advanceDemo } from "../src/modules/demo.js";
import { clampZoom } from "../src/modules/gallery.js";
import { initialMode } from "../src/modules/preferences.js";
test("onboarding prevents completion until a preference is chosen", () => {
  assert.deepEqual(advanceDemo(0, ""), { step: 1, error: "" });
  assert.equal(advanceDemo(1, "").step, 1);
  assert.ok(advanceDemo(1, "").error);
  assert.deepEqual(advanceDemo(1, "Deep work"), { step: 2, error: "" });
});
test("media zoom stays within useful limits", () => {
  assert.equal(clampZoom(0.5), 1);
  assert.equal(clampZoom(4), 3);
  assert.equal(clampZoom(1.5), 1.5);
});
test("motion respects saved visitor preference and survives unavailable storage", () => {
  assert.equal(initialMode({ getItem: () => "reduced" }, false), "reduced");
  assert.equal(initialMode({ getItem: () => "full" }, true), "full");
  assert.equal(initialMode({ getItem: () => "invalid" }, true), "reduced");
  assert.equal(
    initialMode(
      {
        getItem: () => {
          throw Error("unavailable");
        },
      },
      true,
    ),
    "reduced",
  );
});
