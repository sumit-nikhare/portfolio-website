import test from "node:test";
import assert from "node:assert/strict";
import { Object3D, PerspectiveCamera, Vector3 } from "three";
import {
  sampleSculpture,
  settleValue,
  sculptureCameraDistance,
} from "../src/modules/sculpture-sequence.js";

test("scroll sequence resolves three specialties into separate front-facing cards", () => {
  const scenes = [0, 0.5, 1].map(sampleSculpture);
  assert.deepEqual(
    scenes.map((scene) => scene.stage),
    [0, 1, 2],
  );
  const final = scenes[2];
  assert.deepEqual(final.rotation, [0, 0, 0]);
  assert.equal(final.panels.length, 3);
  for (const panel of final.panels) {
    assert.equal(panel.opacity, 1);
    assert.deepEqual(panel.rotation, [0, 0, 0]);
    assert.equal(panel.position[2], 0);
  }
  assert.equal(final.panels[0].position[1], final.panels[1].position[1]);
  assert.equal(final.panels[2].position[0], 0);
  assert.ok(final.panels[0].position[1] > final.panels[2].position[1]);
  for (let i = 0; i < final.panels.length; i++) {
    for (const other of final.panels.slice(i + 1)) {
      const panel = final.panels[i];
      const spacing = (panel.scale + other.scale) / 2;
      assert.ok(
        Math.abs(panel.position[0] - other.position[0]) > 3.7 * spacing ||
          Math.abs(panel.position[1] - other.position[1]) > 2.48 * spacing,
        "Resolved cards must not overlap",
      );
    }
  }
});

test("reverse scrolling and repeated visits to a position produce identical poses", () => {
  const positions = [0, 0.12, 0.33, 0.58, 0.82, 1];
  const forward = positions.map(sampleSculpture);
  assert.deepEqual(
    [...positions].reverse().map(sampleSculpture).reverse(),
    forward,
  );
  const pose = sampleSculpture(0.58);
  pose.panels[0].position[0] = 100;
  assert.deepEqual(sampleSculpture(0.58), forward[3]);
});

test("pose transitions stay continuous on both sides of each stage boundary", () => {
  for (const boundary of [0.5]) {
    const before = sampleSculpture(boundary - 0.00001);
    const after = sampleSculpture(boundary + 0.00001);
    before.panels.forEach((panel, i) => {
      for (const key of ["position", "rotation"]) {
        panel[key].forEach((value, axis) =>
          assert.ok(Math.abs(value - after.panels[i][key][axis]) < 0.00001),
        );
      }
    });
  }
  assert.deepEqual(sampleSculpture(-1), sampleSculpture(0));
  assert.deepEqual(sampleSculpture(2), sampleSculpture(1));
  assert.deepEqual(sampleSculpture(NaN), sampleSculpture(0));
});

test("scroll smoothing reaches an exact rest without overshoot in either direction", () => {
  let value = 0;
  for (let frame = 0; frame < 180; frame++) {
    value = settleValue(value, 1, 1 / 60);
    assert.ok(value >= 0 && value <= 1);
  }
  assert.equal(value, 1);
  for (let frame = 0; frame < 180; frame++) {
    value = settleValue(value, 0, 1 / 60);
    assert.ok(value >= 0 && value <= 1);
  }
  assert.equal(value, 0);
});

test("smoothing feels the same at 30, 60 and 120 Hz and bounds a resumed frame", () => {
  const values = [30, 60, 120].map((rate) => {
    let value = 0;
    for (let frame = 0; frame < rate / 2; frame++)
      value = settleValue(value, 1, 1 / rate);
    return value;
  });
  assert.ok(Math.max(...values) - Math.min(...values) < 0.00001);
  assert.ok(settleValue(0, 1, 60) < 0.5);
});

test("all visible panel corners stay inside the camera throughout the sequence", () => {
  // Real Three.js projection math, without a GPU/browser, catches clipped poses.
  for (const aspect of [0.7, 1, 1.5, 2]) {
    const camera = new PerspectiveCamera(35, aspect, 0.1, 100);
    camera.position.z = sculptureCameraDistance(aspect);
    camera.updateMatrixWorld();
    for (let step = 0; step <= 100; step++) {
      const scene = sampleSculpture(step / 100);
      for (const pointer of [-1, 0, 1]) {
        const group = new Object3D();
        group.position.set(0.15, 0.15, 0);
        group.rotation.set(
          scene.rotation[0] - pointer * 0.09 * (1 - scene.progress),
          scene.rotation[1] + pointer * 0.14 * (1 - scene.progress),
          scene.rotation[2],
        );
        for (const [i, pose] of scene.panels.entries()) {
          if (pose.opacity < 0.001) continue;
          const panel = new Object3D();
          panel.position.fromArray(pose.position);
          panel.rotation.fromArray(pose.rotation);
          panel.scale.setScalar(pose.scale);
          group.add(panel);
          group.updateMatrixWorld(true);
          for (const x of [-1.85, 1.85])
            for (const y of [-1.24, 1.24]) {
              const corner = new Vector3(x, y, 0.05)
                .applyMatrix4(panel.matrixWorld)
                .project(camera);
              assert.ok(
                Math.abs(corner.x) <= 1 && Math.abs(corner.y) <= 1,
                `Clipped panel ${i}, scroll ${step}%, aspect ${aspect}, pointer ${pointer}: ${corner.x}, ${corner.y}`,
              );
            }
          group.remove(panel);
        }
      }
    }
  }
});
