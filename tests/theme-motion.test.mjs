import test from "node:test";
import assert from "node:assert/strict";
import { createThemeMotion } from "../src/modules/theme-motion.js";

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

// Exercise lifecycle races without launching a browser. Visual CSS is checked
// separately in the browser suite; these doubles model delayed API callbacks.
function setup(t) {
  const properties = new Map();
  const root = {
    dataset: { motion: "full", theme: "dark" },
    style: {
      setProperty: (name, value) => properties.set(name, value),
      removeProperty: (name) => properties.delete(name),
    },
  };
  const captures = [];
  const document = Object.assign(new EventTarget(), {
    documentElement: root,
    hidden: false,
    startViewTransition(update) {
      const ready = deferred();
      const finished = deferred();
      const capture = { update, ready, finished, skipped: false };
      captures.push(capture);
      return {
        ready: ready.promise,
        finished: finished.promise,
        skipTransition: () => (capture.skipped = true),
      };
    },
  });
  const window = Object.assign(new EventTarget(), {
    innerWidth: 1440,
    innerHeight: 1000,
    CSS: { registerProperty() {}, supports: () => true },
    getComputedStyle: () => ({ backgroundColor: "rgb(16, 16, 16)" }),
  });
  const timers = new Map();
  let timerId = 0;
  for (const [name, value] of Object.entries({
    window,
    document,
    setTimeout: (callback) => {
      timers.set(++timerId, callback);
      return timerId;
    },
    clearTimeout: (id) => timers.delete(id),
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else delete globalThis[name];
    });
  }
  const controller = createThemeMotion();
  const button = {
    getBoundingClientRect: () => ({ x: 1240, y: 900, width: 140, height: 40 }),
  };
  return {
    root,
    document,
    window,
    captures,
    controller,
    run: (theme) => controller.run(() => (root.dataset.theme = theme), button),
    expire: () => [...timers.values()].forEach((callback) => callback()),
    assertSettled(theme) {
      assert.equal(root.dataset.theme, theme);
      assert.equal(root.dataset.themeTransition, undefined);
      assert.equal(properties.size, 0);
      assert.equal(timers.size, 0);
    },
  };
}

test("theme reveal applies the palette and clears its state after finishing", async (t) => {
  const scene = setup(t);
  scene.run("light");
  assert.equal(scene.root.dataset.theme, "dark");
  assert.equal(scene.root.dataset.themeTransition, "reveal");
  scene.captures[0].update();
  scene.captures[0].ready.resolve();
  scene.captures[0].finished.resolve();
  await Promise.resolve();
  scene.assertSettled("light");
});

test("rapid clicks keep the latest choice despite late snapshot callbacks", async (t) => {
  const scene = setup(t);
  scene.run("light");
  const previous = scene.captures[0];
  scene.run("dark");
  assert.equal(previous.skipped, true);
  scene.assertSettled("dark");
  scene.run("light");
  previous.update();
  previous.ready.reject(new Error("Skipped"));
  previous.finished.resolve();
  await Promise.resolve();
  assert.equal(scene.root.dataset.theme, "dark");
  assert.equal(scene.root.dataset.themeTransition, "reveal");
  scene.captures[1].update();
  scene.captures[1].ready.resolve();
  scene.captures[1].finished.resolve();
  await Promise.resolve();
  scene.assertSettled("light");
});

for (const unsupported of ["snapshot", "CSS", "registration", "mask"]) {
  test(`theme fades safely without ${unsupported} support`, (t) => {
    const scene = setup(t);
    if (unsupported === "snapshot") delete scene.document.startViewTransition;
    if (unsupported === "CSS") delete scene.window.CSS;
    if (unsupported === "registration")
      delete scene.window.CSS.registerProperty;
    if (unsupported === "mask") scene.window.CSS.supports = () => false;
    scene.run("light");
    assert.equal(scene.root.dataset.theme, "light");
    assert.equal(scene.root.dataset.themeTransition, "fade");
    scene.expire();
    scene.assertSettled("light");
  });
}

test("a throwing snapshot API still applies the theme with a fade", (t) => {
  const scene = setup(t);
  scene.document.startViewTransition = () => {
    throw new Error("Snapshot unavailable");
  };
  scene.run("light");
  assert.equal(scene.root.dataset.themeTransition, "fade");
  scene.expire();
  scene.assertSettled("light");
});

test("a rejected snapshot applies the theme and releases animation state", async (t) => {
  const scene = setup(t);
  scene.run("light");
  scene.captures[0].ready.reject(new Error("Snapshot unavailable"));
  await Promise.resolve();
  scene.assertSettled("light");
});

test("reduced motion and hidden pages switch immediately", (t) => {
  const scene = setup(t);
  scene.root.dataset.motion = "reduced";
  scene.run("light");
  scene.assertSettled("light");
  scene.root.dataset.motion = "full";
  scene.document.hidden = true;
  scene.run("dark");
  scene.assertSettled("dark");
  assert.equal(scene.captures.length, 0);
});

test("scroll, resize, page exit and printing settle an unfinished reveal", (t) => {
  const scene = setup(t);
  for (const name of ["scroll", "resize", "pagehide", "beforeprint"]) {
    scene.run("light");
    scene.window.dispatchEvent(new Event(name));
    assert.equal(scene.captures.at(-1).skipped, true);
    scene.assertSettled("light");
  }
});

test("Escape, visibility and motion changes stop a reveal without losing the choice", (t) => {
  const scene = setup(t);
  scene.run("light");
  scene.document.dispatchEvent(
    Object.assign(new Event("keydown"), { key: "Escape" }),
  );
  scene.assertSettled("light");
  scene.run("dark");
  scene.document.hidden = true;
  scene.document.dispatchEvent(new Event("visibilitychange"));
  scene.assertSettled("dark");
  scene.document.hidden = false;
  scene.run("light");
  scene.root.dataset.motion = "reduced";
  scene.document.dispatchEvent(new Event("portfolio:motion"));
  scene.assertSettled("light");
});

test("an unresponsive snapshot API cannot leave the page in transition", (t) => {
  const scene = setup(t);
  scene.run("light");
  scene.expire();
  assert.equal(scene.captures[0].skipped, true);
  scene.captures[0].update();
  scene.assertSettled("light");
});
