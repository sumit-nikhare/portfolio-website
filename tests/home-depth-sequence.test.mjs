import test from "node:test";
import assert from "node:assert/strict";
import { factHighlights } from "../src/modules/home-depth-sequence.js";

test("profile highlight enters and exits completely, including fast scroll jumps", () => {
  for (const progress of [-1, 0, 1, 2, NaN, Infinity])
    assert.deepEqual(factHighlights(progress, 3), [0, 0, 0]);
  assert.deepEqual(factHighlights(0.25, 3), [1, 0, 0]);
  assert.deepEqual(factHighlights(0.5, 3), [0, 1, 0]);
  assert.deepEqual(factHighlights(0.75, 3), [0, 0, 1]);
});

test("highlight weights preserve total intensity during handoffs", () => {
  for (let step = 250; step <= 750; step++) {
    const values = factHighlights(step / 1000, 3);
    const sum = values.reduce((total, value) => total + value, 0);
    assert.ok(Math.abs(sum - 1) < 1e-12);
    assert.ok(values.every((value) => value >= 0 && value <= 1));
    const lit = values.flatMap((value, index) => (value > 0 ? [index] : []));
    assert.ok(lit.length <= 2);
    if (lit.length === 2) assert.equal(lit[1] - lit[0], 1);
  }
});

test("highlight curves remain continuous with matching velocity at phase boundaries", () => {
  const epsilon = 1e-4;
  for (const boundary of [0, 0.25, 0.5, 0.75, 1]) {
    const before = factHighlights(boundary - epsilon, 3);
    const at = factHighlights(boundary, 3);
    const after = factHighlights(boundary + epsilon, 3);
    at.forEach((value, index) => {
      assert.ok(Math.abs(before[index] - value) < 1e-8);
      assert.ok(Math.abs(after[index] - value) < 1e-8);
      const incoming = (value - before[index]) / epsilon;
      const outgoing = (after[index] - value) / epsilon;
      assert.ok(Math.abs(incoming - outgoing) < 1e-4);
    });
  }
});

test("reverse scrolling revisits the same state and adapts to the content count", () => {
  for (const count of [1, 2, 3, 5]) {
    const forward = Array.from({ length: 101 }, (_, index) =>
      factHighlights(index / 100, count),
    );
    for (let index = 100; index >= 0; index--) {
      const values = factHighlights(index / 100, count);
      assert.deepEqual(values, forward[index]);
      assert.equal(values.length, count);
      assert.ok(values.every((value) => value >= 0 && value <= 1));
      assert.ok(values.reduce((sum, value) => sum + value, 0) <= 1 + 1e-12);
    }
  }
  assert.deepEqual(factHighlights(0.5, 0), []);
});
